// Importar la clase Movimiento para poder utilizarla dentro del modelo Banco.
import { Movimiento } from './Movimientos.js';

// Comprobar que se cree correctamente un banco con sus propiedades
export class Banco {
    constructor({
        usuarios = [],
        cuentas = [],
        movimientos = [],
    } = {}) {
        this.usuarios = usuarios;
        this.cuentas = cuentas;
        this.movimientos = movimientos;
    }

    // Método para agregar un usuario al banco
    agregarUsuario(usuario) {

        // Verificar si el usuario ya existe en el banco
        const existe = this.usuarios.some(
            (u) => u.id === usuario.id,
        );
        
        // Si el usuario ya existe, lanzamos un error
        if (existe) {
            throw new Error(
                'El usuario ya existe.',
            );
        }
        
        // Si no existe Agregamos el usuario al array
        this.usuarios.push(usuario);

        return usuario;
    }

    // Método para buscar un usuario por su ID
    buscarUsuarioPorId(usuarioId) {
        return this.usuarios.find(
            (usuario) => usuario.id === usuarioId,
        ) || null;
    }

    // Método para agregar una cuenta al banco
    agregarCuenta(cuenta) {
        // Buscamos el propietario o usuario
        const usuario = this.buscarUsuarioPorId(
            cuenta.usuarioId,
        );
        
        // Si el usuario no existe termina el metodo aqui y mandame un mensaje
        if (!usuario) {
            throw new Error(
                'El usuario propietario de la cuenta no existe.',
            );
        }
        
        // Consideramos duplicada una cuenta si coincide su ID o su número.
        const existe = this.cuentas.some(
            (c) =>
                c.id === cuenta.id ||
                c.numeroCuenta === cuenta.numeroCuenta,
        );
        
        // Si eciste la cuenta duplicada termina el metodo y mandame un mensaje
        if (existe) {
            throw new Error(
                'La cuenta ya existe.',
            );
        }
        
        // Si no existe simplemente REGISTRAR CUENTA
        this.cuentas.push(cuenta);

        return cuenta;
    }

    // Método para buscar una cuenta por su ID
    buscarCuentaPorId(cuentaId) {
        return this.cuentas.find(
            (cuenta) => cuenta.id === cuentaId,
        ) || null;
    }

    // Método para buscar una cuenta por su número
    buscarCuentaPorNumero(numeroCuenta) {
        return this.cuentas.find(
            (cuenta) =>
                cuenta.numeroCuenta === numeroCuenta,
        ) || null;
    }

    obtenerCuentasDeUsuario(usuarioId) {
        return this.cuentas.filter(
            (cuenta) =>
                cuenta.usuarioId === usuarioId,
        );
    }

    registrarMovimiento(movimiento) {
        this.movimientos.push(movimiento);

        return movimiento;
    }

    realizarDeposito({cuentaId,monto,descripcion = '',}) {

        // CONVERTIR MONTO
        const montoNumerico = Number(monto);
        
        // /* El monto debe ser un número válido y mayor que cero.
        if (
            !Number.isFinite(montoNumerico) ||
            montoNumerico <= 0
        ) {
            throw new Error(
                'Monto inválido, el monto debe ser mayor a cero.',
            );
        }
        
        // BUSCAR CUENTA Y VALIDAMOS
        const cuenta = this.buscarCuentaPorId(
            cuentaId,
        );

        if (!cuenta) {
            throw new Error(
                'La cuenta no existe.',
            );
        }
        
        // ACTUALIZAR SALDO
        cuenta.depositar(montoNumerico);
        
        // Después del depósito creamos automáticamente un registro de la operación
        const movimiento = new Movimiento({
            tipo: 'DEPOSITO',
            monto: montoNumerico,
            descripcion,
            cuentaOrigen: cuenta.id,
            saldoResultante: cuenta.saldo,
        });

        // REGISTRAR MOVIMIENTO
        this.registrarMovimiento(
            movimiento,
        );

        return movimiento;
    }

    obtenerMovimientosDeCuenta(cuentaId) {
        return this.movimientos.filter(
            (movimiento) =>
                movimiento.cuentaOrigen === cuentaId ||
                movimiento.cuentaDestino === cuentaId,
        );
    }

    realizarTransferencia({
        cuentaOrigenId,
        cuentaDestinoId,
        monto,
        descripcion = '',
    }) {
        // Convertimos el monto recibido
        // a número.
        const montoNumerico =
            Number(monto);


        // Validamos que el monto sea
        // numérico y mayor a cero.
        if (
            !Number.isFinite(
                montoNumerico,
            ) ||
            montoNumerico <= 0
        ) {
            throw new Error(
                'Monto inválido, el monto debe ser mayor a cero.',
            );
        }

        // Buscamos las dos cuentas que
        // participan en la operación.
        const origen =
            this.buscarCuentaPorId(
                cuentaOrigenId,
            );

        const destino =
            this.buscarCuentaPorId(
                cuentaDestinoId,
            );

        if (!origen) {
            throw new Error(
                'La cuenta origen no existe.',
            );
        }

        if (!destino) {
            throw new Error(
                'La cuenta destino no existe.',
            );
        }

        // Las cuentas deben encontrarse
        // activas para operar.
        if (!origen.activa) {
            throw new Error(
                'La cuenta origen no está activa.',
            );
        }

        if (!destino.activa) {
            throw new Error(
                'La cuenta destino no está activa.',
            );
        }

        // Impedimos transferencias de una
        // cuenta hacia ella misma.
        if (
            origen.id === destino.id
        ) {
            throw new Error(
                'No puedes transferir dinero a la misma cuenta',
            );
        }

        // La cuenta origen necesita saldo
        // suficiente para completar la operación.
        if (
            origen.saldo <
            montoNumerico
        ) {
            throw new Error(
                'Saldo insuficiente',
            );
        }

        // Descontamos el dinero de la cuenta
        // origen.
        origen.retirar(
            montoNumerico,
        );

        // Depositamos el mismo monto
        // en la cuenta destino.
        destino.depositar(
            montoNumerico,
        );

        // Creamos el movimiento desde la
        // perspectiva del emisor.
        const movimientoEnviado =
            new Movimiento({
                tipo:
                    'TRANSFERENCIA_ENVIADA',
                monto:
                    montoNumerico,
                descripcion,
                cuentaOrigen:
                    origen.id,
                cuentaDestino:
                    destino.id,
                saldoResultante:
                    origen.saldo,
            });

        // Creamos el movimiento desde la
        // perspectiva del receptor.
        const movimientoRecibido =
            new Movimiento({
                tipo:
                    'TRANSFERENCIA_RECIBIDA',
                monto:
                    montoNumerico,
                descripcion,
                cuentaOrigen:
                    origen.id,
                cuentaDestino:
                    destino.id,
                saldoResultante:
                    destino.saldo,
            });

        // Guardamos ambos movimientos.
        this.registrarMovimiento(
            movimientoEnviado,
        );

        this.registrarMovimiento(
            movimientoRecibido,
        );

        return {
            origen,
            destino,
            movimientoEnviado,
            movimientoRecibido,
        };
    }

}
