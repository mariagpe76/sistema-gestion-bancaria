// Importar generarId() para asignar automáticamente un identificador interno a cada cuenta.
import { generarId } from '../utils/helpers.js';

// Comprobar que se cree correctamente una cuenta con sus propiedades
export class Cuenta {
    constructor({
        id = generarId(),
        numeroCuenta,
        tipo = 'Ahorro',
        saldo = 0,
        usuarioId,
        fechaApertura = new Date().toISOString(),
        activa = true,
    }) {
        this.id = id;
        this.numeroCuenta = numeroCuenta;
        this.tipo = tipo;
        this.saldo = Number(saldo);
        this.usuarioId = usuarioId;
        this.fechaApertura = fechaApertura;
        this.activa = activa;
    }

    // Método para depositar dinero en la cuenta
    depositar(monto) {
        this.saldo += Number(monto);

        return this.saldo;
    }

    // Método para retirar dinero de la cuenta
    retirar(monto) {
        this.saldo -= Number(monto);

        return this.saldo;
    }
}