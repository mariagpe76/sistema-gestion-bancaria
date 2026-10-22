// Comprobar que main.js se ha cargado correctamente
console.log("Sistema de Gestión Bancaria");

// Funciones encargadas de validar la información ingresada por el usuario
import { validarCampoObligatorio, validarMonto } from './utils/validators.js';

// Funciones encargadas de formatear la información para su correcta visualización
import { formatCurrency, formatDate, formatAccountNumber } from './utils/formatters.js';

// Función encargada de generar un ID único para cada transacción
import { generarId, generarNumeroCuenta } from './utils/helpers.js';

// Importar las clases del modelo
import { Banco } from './models/Banco.js';
import { Cuenta } from './models/Cuenta.js';
import { Movimiento } from './models/Movimientos.js';
import { Usuario } from './models/Usuario.js';

// Importar el servicio de almacenamiento para guardar y recuperar datos del localStorage
import { STORAGE_KEYS, storageService } from './services/StorageService.js';
import { authService } from './services/AuthService.js';

// Función para inicializar el almacenamiento local con las claves necesarias
function inicializarStorage() {
    const usuarios =
        storageService.obtener(
            STORAGE_KEYS.USUARIOS,
            null,
        );

    const cuentas =
        storageService.obtener(
            STORAGE_KEYS.CUENTAS,
            null,
        );

    const movimientos =
        storageService.obtener(
            STORAGE_KEYS.MOVIMIENTOS,
            null,
        );

    if (usuarios === null) {
        storageService.guardar(
            STORAGE_KEYS.USUARIOS,
            [],
        );
    }

    if (cuentas === null) {
        storageService.guardar(
            STORAGE_KEYS.CUENTAS,
            [],
        );
    }

    if (movimientos === null) {
        storageService.guardar(
            STORAGE_KEYS.MOVIMIENTOS,
            [],
        );
    }
}

// Función para manejar el registro de un nuevo usuario
function manejarRegistro(event) {
    event.preventDefault();

    const nombre = document.querySelector('#registroNombre',).value.trim();
    const email = document.querySelector('#registroEmail',).value.trim().toLowerCase();
    const telefono = document.querySelector('#registroTelefono',).value.trim();
    const password = document.querySelector('#registroPassword',).value;
    const confirmarPassword = document.querySelector('#registroConfirmPassword',).value;

    // Validar campos obligatorios
    if (!validarCampoObligatorio(nombre,) || !validarCampoObligatorio(email,) || !validarCampoObligatorio(password,)) {

        Swal.fire({
            icon: 'warning',
            title:
                'Campos incompletos',
            text:
                'Completa los campos obligatorios.',
        });

        return;
    }

    // Validar formato de correo electrónico
    if (password.length < 6) {
        Swal.fire({
            icon: 'warning',
            title:
                'Contraseña inválida',
            text:
                'La contraseña debe tener al menos 6 caracteres.',
        });

        return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
        Swal.fire({
            icon: 'warning',
            title:
                'Contraseñas diferentes',
            text:
                'Las contraseñas no coinciden.',
        });

        return;
    }

    const usuarios =
        storageService.obtener(
            STORAGE_KEYS.USUARIOS,
            [],
        );

    const emailExistente =
        usuarios.some(
            (usuario) =>
                usuario.email
                    .toLowerCase() ===
                email,
        );

    if (emailExistente) {
        Swal.fire({
            icon: 'error',
            title:
                'Correo registrado',
            text:
                'Ya existe un usuario con este correo.',
        });

        return;
    }

    const nuevoUsuario =
        new Usuario({
            nombre,
            email,
            telefono,
            password,
        });
    let numeroCuenta;

    do {
        numeroCuenta =
            generarNumeroCuenta();
    } while (
        storageService
            .obtener(
                STORAGE_KEYS.CUENTAS,
                [],
            )
            
            .some(
                (cuenta) =>
                    cuenta.numeroCuenta ===
                    numeroCuenta,
            )
    );

        const nuevaCuenta =
        new Cuenta({
            numeroCuenta,
            tipo: 'Ahorro',
            saldo: 0,
            usuarioId:
                nuevoUsuario.id,
        });

    const cuentas =
        storageService.obtener(
            STORAGE_KEYS.CUENTAS,
            [],
        );

    usuarios.push(
        nuevoUsuario,
    );
	
    cuentas.push(
        nuevaCuenta,
    );

    storageService.guardar(
        STORAGE_KEYS.USUARIOS,
        usuarios,
    );

    storageService.guardar(
        STORAGE_KEYS.CUENTAS,
        cuentas,
    );

    Swal.fire({
        icon: 'success',
        title:
            'Registro exitoso',
        text:
            'Tu usuario y cuenta bancaria fueron creados correctamente.',
        confirmButtonText:
            'Continuar',
    }).then(() => {

        document
            .querySelector(
                '#formRegistro',
            )
            .reset();

        document
            .querySelector(
                '#loginEmail',
            )
            .value = email;
    });
}

// Función para manejar el inicio de sesión del usuario
function manejarLogin(event) {
    event.preventDefault();

    const email =
        document
            .querySelector(
                '#loginEmail',
            )
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .querySelector(
                '#loginPassword',
            )
            .value;
    if (
        !validarCampoObligatorio(
            email,
        ) ||
        !validarCampoObligatorio(
            password,
        )
    ) {
        Swal.fire({
            icon: 'warning',
            title:
                'Campos incompletos',
            text:
                'Ingresa tu correo y contraseña.',
        });

        return;
    }

    try {
    
        const usuario =
            authService.login(
                email,
                password,
            );

        Swal.fire({
            icon: 'success',
            title:
                `Bienvenido, ${usuario.nombre}`,
            text:
                'Inicio de sesión correcto.',
            timer: 1500,
            showConfirmButton:
                false,
        }).then(() => {
            window.location.href =
                'dashboard.html';
        });
    } catch (error) {

        Swal.fire({
            icon: 'error',
            title:
                'No fue posible iniciar sesión',
            text:
                error.message,
        });
    }
}

function init() {
    inicializarStorage();

    if (
        authService
            .getCurrentUser()
    ) {
        window.location.href =
            'dashboard.html';

        return;
    }

    const formLogin =
        document.querySelector(
            '#formLogin',
        );

    const formRegistro =
        document.querySelector(
            '#formRegistro',
        );

    if (formLogin) {
        formLogin.addEventListener(
            'submit',
            manejarLogin,
        );
    }

    if (formRegistro) {
        formRegistro.addEventListener(
            'submit',
            manejarRegistro,
        );
    }
}

init();





/*
function guardarBanco(banco) {
    // Guardar usuarios
    storageService.guardarDatos(
        STORAGE_KEYS.USUARIOS,
        banco.usuarios,
    );
    
    // Guardar cuentas
    storageService.guardarDatos(
        STORAGE_KEYS.CUENTAS,
        banco.cuentas,
    );

    // Guardar movimientos
    storageService.guardarDatos(
        STORAGE_KEYS.MOVIMIENTOS,
        banco.movimientos,
    );
}

function cargarBanco() {
    // RECUPERAR USUARIOS
    const usuariosGuardados =
        storageService.obtener(
            STORAGE_KEYS.USUARIOS,
            [],
        );
	
    // RECUPERAR CUENTAS
    const cuentasGuardadas =
        storageService.obtener(
            STORAGE_KEYS.CUENTAS,
            [],
        );
	
    // RECUPERAR MOVIMIENTOS
    const movimientosGuardados =
        storageService.obtener(
            STORAGE_KEYS.MOVIMIENTOS,
            [],
        );

    // RECONSTRUIR USUARIOS
    const usuarios =
        usuariosGuardados.map(
            (usuario) =>
                new Usuario(usuario),
        );

    // RECONSTRUIR CUENTAS
    const cuentas =
        cuentasGuardadas.map(
            (cuenta) =>
                new Cuenta(cuenta),
        );

    // RECONSTRUIR MOVIMIENTOS
    const movimientos =
        movimientosGuardados.map(
            (movimiento) =>
                new Movimiento(
                    movimiento,
                ),
        );

    // CREAR NUEVAMENTE EL BANCO
    return new Banco({
        usuarios,
        cuentas,
        movimientos,
    });
}


// =========================================

// Validación de campo debe mostrar true
console.log('Campo obligatorio:', validarCampoObligatorio('Banco Digital'),);

// Probar validación del monto debe regresar True
console.log('Monto válido:', validarMonto(1000),);

// Generamos un identificador dinámico
console.log('ID generado:', generarId(),);

// Convertimos 1500 a formato monetario MXN
console.log('Monto formateado:', formatCurrency(1500),);

// Formateamos la fecha actual
console.log('Fecha formateada:', formatDate(new Date()),);

// Separamos visualmente cada cuatro dígitos
console.log('Número de cuenta:', formatAccountNumber('123456789012'),);

/* ========================================= 
        VERSIÓN ACTUAL 
========================================= */

/*
console.log(
    'Sistema de Gestión Bancaria - v0.5.0',
);


// ==========================================
// PRUEBAS DE UTILIDADES
// ==========================================

console.log(
    'Campo obligatorio:',
    validarCampoObligatorio(
        'Banco Digital',
    ),
);

console.log(
    'Monto válido:',
    validarMonto(1000),
);

console.log(
    'ID generado:',
    generarId(),
);

console.log(
    'Monto formateado:',
    formatCurrency(1500),
);

console.log(
    'Fecha formateada:',
    formatDate(new Date()),
);

console.log(
    'Número de cuenta:',
    formatAccountNumber(
        '123456789012',
    ),
);

//const bancoDemo = new Banco();
const bancoDemo = cargarBanco();

if (bancoDemo.usuarios.length === 0) {
    const usuarioDemo =
    new Usuario({
        nombre: 'Sofia López',
        email: 'sofia@correo.com',
        telefono: '5568278376',
        password: 'sofia89',
    });

    // REGISTRAR USUARIO
    bancoDemo.agregarUsuario(
        usuarioDemo,
    );

    // CREAR CUENTA INICIAL
    const cuentaDemo =
        new Cuenta({
            numeroCuenta:
                '123456789012',
            usuarioId:
                usuarioDemo.id,
        });

    // REGISTRAR CUENTA
    bancoDemo.agregarCuenta(
        cuentaDemo,
    );

    // REALIZAR DEPÓSITO INICIAL
    bancoDemo.realizarDeposito({
        cuentaId: cuentaDemo.id,
        monto: 1000,
        descripcion:
            'Depósito inicial',
    });

    guardarBanco(
        bancoDemo,
    );

}

// MOSTRAR BANCO RECUPERADO
console.log(
    'Banco recuperado:',
    bancoDemo,
);

// MOSTRAR USUARIOS
console.log(
    'Usuarios almacenados:',
    bancoDemo.usuarios,
);

// MOSTRAR CUENTAS
console.log(
    'Cuentas almacenadas:',
    bancoDemo.cuentas,
);

// MOSTRAR MOVIMIENTOS
console.log(
    'Movimientos almacenados:',
    bancoDemo.movimientos,
);

const cuentaPrincipal = bancoDemo.cuentas[0] || null;

if (cuentaPrincipal) {
    console.log(
        'Saldo persistido:',
        formatCurrency(
            cuentaPrincipal.saldo,
        ),
    );
    console.log(
        '¿La cuenta recuperada sigue siendo una instancia de Cuenta?',
        cuentaPrincipal instanceof Cuenta,
    );
    console.log(
        typeof cuentaPrincipal.depositar,
    );

}

*/