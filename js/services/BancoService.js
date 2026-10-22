import { Banco,} from '../models/Banco.js';
import { Usuario,} from '../models/Usuario.js';
import { Cuenta,} from '../models/Cuenta.js';
import { Movimiento,} from '../models/Movimientos.js';
import { STORAGE_KEYS, storageService,} from './StorageService.js';

class BancoService {
    constructor() {
        this._banco = null;
    }

    cargarBanco() {
        const usuariosGuardados = storageService.obtener(STORAGE_KEYS.USUARIOS,[],);
        const cuentasGuardadas = storageService.obtener(STORAGE_KEYS.CUENTAS,[],);
        const movimientosGuardados = storageService.obtener(STORAGE_KEYS.MOVIMIENTOS,[],);

        // Reconstruimos los objetos almacenados
        // como instancias reales de nuestros modelos.
        const usuarios = usuariosGuardados.map((usuario) => new Usuario(usuario),);
        const cuentas = cuentasGuardadas.map((cuenta) => new Cuenta(cuenta),);
        const movimientos = movimientosGuardados.map((movimiento) => new Movimiento(movimiento,),);
        
        // Creamos nuevamente la instancia
        // completa del Banco.
        this._banco = new Banco({ usuarios, cuentas, movimientos,});
        return this._banco;
    }

    obtenerInstanciaBanco() {
        // Si todavía no tenemos el Banco
        // cargado lo reconstruimos.
        if (!this._banco) { return this.cargarBanco(); }
        return this._banco;
    }

    recargarBanco() {
        // Eliminamos la referencia actual para
        // forzar una nueva lectura de LocalStorage.
        this._banco = null;
        return this.cargarBanco();
    }

    guardarBanco() {
        const banco = this.obtenerInstanciaBanco();

        // Persistimos cada colección utilizando
        // StorageService.
        storageService.guardar(STORAGE_KEYS.USUARIOS, banco.usuarios,);

        storageService.guardar(STORAGE_KEYS.CUENTAS, banco.cuentas,);

        storageService.guardar(STORAGE_KEYS.MOVIMIENTOS, banco.movimientos,);

        return true;
    }

    // Funciones para obtener datos del usuario y sus cuentas y movimientos
    obtenerDatosUsuario(usuarioId,) {
        const banco = this.obtenerInstanciaBanco();

        // Localizamos al usuario.
        const usuario = banco.buscarUsuarioPorId(usuarioId,);

        if (!usuario) { 
            throw new Error('El usuario no existe.',); 
        }

        // Obtenemos todas las cuentas
        // pertenecientes al usuario.
        const cuentas = banco.obtenerCuentasDeUsuario(usuarioId,);

        // Obtenemos únicamente los IDs
        // de las cuentas del usuario.
        const cuentasIds = cuentas.map((cuenta) => cuenta.id,);

        // Filtramos los movimientos desde la
        // perspectiva correcta del usuario.
        const movimientos = banco.movimientos.filter((movimiento) => {

                    // Un depósito pertenece al
                    // propietario de la cuenta.
                    if (movimiento.tipo === 'DEPOSITO') { 
                        return cuentasIds.includes(movimiento.cuentaOrigen,); 
                    }

                    // Una transferencia enviada
                    // pertenece a la cuenta origen.
                    if (movimiento.tipo === 'TRANSFERENCIA_ENVIADA') { 
                        return cuentasIds.includes(movimiento.cuentaOrigen,); 
                    }

                    // Una transferencia recibida
                    // pertenece a la cuenta destino.
                    if (movimiento.tipo === 'TRANSFERENCIA_RECIBIDA') { 
                        return cuentasIds.includes(movimiento.cuentaDestino,); 
                    }

                    return false;
                },);

        return {usuario,cuentas,movimientos,};
    }

    obtenerResumenUsuario(usuarioId,) {
        const {usuario,cuentas,movimientos,} = this.obtenerDatosUsuario(usuarioId,);

        // Sumamos el saldo disponible en
        // todas las cuentas del usuario.
        const saldoTotal = cuentas.reduce((acumulado,cuenta,) => acumulado + Number(cuenta.saldo,),0,);

        return {usuario,cuentas,movimientos,saldoTotal,totalCuentas: cuentas.length,totalMovimientos: movimientos.length,};
    }

    // Función para obtener los movimientos de un usuario, con opción de filtrar por tipo
    obtenerMovimientosUsuario(usuarioId, tipo = 'TODOS',) {
        const {movimientos,} = this.obtenerDatosUsuario(usuarioId,);

        // Creamos una copia porque sort()
        // modifica directamente el array.
        let resultado = [
            ...movimientos,
        ];

        // Si existe un filtro específico
        // dejamos únicamente ese tipo.
        if (tipo !== 'TODOS') { 
            resultado = resultado.filter((movimiento) => movimiento.tipo === tipo,); 
        }

        // Ordenamos de la operación más
        // reciente a la más antigua.
        resultado.sort(
            (a, b) =>
                new Date(
                    b.fecha,
                ) -
                new Date(
                    a.fecha,
                ),
        );

        return resultado;
    }

    obtenerResumenMovimientos( usuarioId,) {
        const movimientos = this.obtenerMovimientosUsuario(usuarioId,);

        // Contamos depósitos.
        const depositos = movimientos.filter((movimiento) => movimiento.tipo === 'DEPOSITO',).length;

        // Contamos transferencias enviadas.
        const enviadas = movimientos.filter((movimiento) => movimiento.tipo === 'TRANSFERENCIA_ENVIADA',).length;

        // Contamos transferencias recibidas.
        const recibidas = movimientos.filter((movimiento) => movimiento.tipo === 'TRANSFERENCIA_RECIBIDA',).length;

        return {total: movimientos.length,depositos,enviadas,recibidas,};
    }

    // Función para realizar un depósito en una cuenta específica
    realizarDeposito({cuentaId,monto,descripcion = '',}) {
        const banco = this.obtenerInstanciaBanco();

        // El modelo Banco realiza la operación
        // y genera el movimiento.
        const movimiento = banco.realizarDeposito({cuentaId,monto,descripcion,});

        // Persistimos el nuevo estado.
        this.guardarBanco();

        return movimiento;
    }

    realizarTransferencia({ cuentaOrigenId, numeroCuentaDestino, monto, descripcion = '',}) {
        const banco = this.obtenerInstanciaBanco();

        // Eliminamos espacios del número de
        // cuenta ingresado por el usuario.
        const numeroDestino = String(numeroCuentaDestino,).replace(/\s/g,'',).trim();

        // Buscamos la cuenta utilizando
        // su número visible.
        const cuentaDestino = banco.buscarCuentaPorNumero(numeroDestino,);

        if (!cuentaDestino) { 
            throw new Error('La cuenta destino no existe.',); 
        }

        // Delegamos las reglas financieras
        // al modelo Banco.
        const resultado = banco.realizarTransferencia({cuentaOrigenId,cuentaDestinoId: cuentaDestino.id,monto,descripcion,});


        // Persistimos saldos y movimientos.
        this.guardarBanco();


        return resultado;
    }

    // Función para actualizar los datos de un usuario
    actualizarUsuario(
        usuarioId,
        {
            nombre,
            email,
            telefono,
        },
    ) {
        const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS,[],);
        const usuario = usuarios.find((item) => item.id === usuarioId,);

        if (!usuario) { 
            throw new Error('El usuario no existe.',); 
        }

        // Normalizamos el correo antes
        // de realizar comparaciones.
        const emailNormalizado = String(email).trim().toLowerCase();

        // Buscamos si otro usuario utiliza
        // el mismo correo.
        const emailDuplicado = usuarios.some((item) => item.email.toLowerCase() === emailNormalizado && item.id !== usuarioId,);

        if (emailDuplicado) { 
            throw new Error('Ya existe un usuario con este correo.',);
        }


        // Utilizamos map() y Spread Operator
        // para construir el nuevo array.
        const usuariosActualizados = usuarios.map((item) => item.id === usuarioId ? {...item,nombre: nombre.trim(),email: emailNormalizado,telefono: telefono.trim(),} : item,);


        storageService.guardar(
            STORAGE_KEYS.USUARIOS,
            usuariosActualizados,
        );


        this.recargarBanco();


        return usuariosActualizados.find((item) => item.id === usuarioId,) || null;
    }

    // Función para cambiar la contraseña de un usuario
    cambiarPassword(
        usuarioId,
        passwordActual,
        passwordNueva,
    ) {
        const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS,[],);
        const usuario = usuarios.find((item) => item.id === usuarioId,);

        if (!usuario) { 
            throw new Error('El usuario no existe.',); 
        }

        if (usuario.password !== passwordActual) { 
            throw new Error('La contraseña actual no es correcta.',);
        }

        if (passwordNueva === passwordActual) { 
            throw new Error('La nueva contraseña debe ser diferente.',); 
        }

        if (passwordNueva.length < 6) { 
            throw new Error('La nueva contraseña debe tener al menos 6 caracteres.',); 
        }

        const usuariosActualizados = usuarios.map((item) => item.id === usuarioId ? {...item,password: passwordNueva,} : item,);

        storageService.guardar(
            STORAGE_KEYS.USUARIOS,
            usuariosActualizados,
        );

        this.recargarBanco();

        return true;
    }

    // Función para eliminar un usuario y sus cuentas asociadas
    eliminarUsuario(
        usuarioId,
    ) {
        const usuarios = storageService.obtener(STORAGE_KEYS.USUARIOS,[],);
        const cuentas = storageService.obtener(STORAGE_KEYS.CUENTAS,[],);
        const movimientos = storageService.obtener(STORAGE_KEYS.MOVIMIENTOS,[],);
        const usuario = usuarios.find((item) => item.id === usuarioId,);

        if (!usuario) { 
            throw new Error('El usuario no existe.',); 
        }

        const cuentasUsuario = cuentas.filter((cuenta) => cuenta.usuarioId === usuarioId,);

        // Un usuario con saldo disponible
        // no puede eliminar sus cuentas.
        const tieneSaldo = cuentasUsuario.some((cuenta) => Number(cuenta.saldo,) > 0,);

        if (tieneSaldo) { 
            throw new Error('No puedes eliminar tu cuenta mientras tengas saldo disponible.',); 
        }

        const cuentasUsuarioIds = cuentasUsuario.map((cuenta) => cuenta.id,);
        // Eliminamos al usuario.
        const usuariosFiltrados = usuarios.filter((item) => item.id !== usuarioId,);
        // Eliminamos sus cuentas.
        const cuentasFiltradas = cuentas.filter((cuenta) => cuenta.usuarioId !== usuarioId,);
        // Eliminamos movimientos relacionados
        // con cualquiera de sus cuentas.
        const movimientosFiltrados = movimientos.filter((movimiento) => !cuentasUsuarioIds.includes(movimiento.cuentaOrigen,) && !cuentasUsuarioIds.includes(movimiento.cuentaDestino,),);

        storageService.guardar(
            STORAGE_KEYS.USUARIOS,
            usuariosFiltrados,
        );

        storageService.guardar(
            STORAGE_KEYS.CUENTAS,
            cuentasFiltradas,
        );

        storageService.guardar(
            STORAGE_KEYS.MOVIMIENTOS,
            movimientosFiltrados,
        );

        this.recargarBanco();

        return true;
    }
}

export const bancoService = new BancoService();