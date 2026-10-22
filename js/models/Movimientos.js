// Importar generarId() para asignar un identificador único a cada movimiento.
import { generarId } from '../utils/helpers.js';

// Comprobar que se cree correctamente un movimiento con sus propiedades
export class Movimiento {
    constructor({
        id = generarId(),
        tipo,
        monto,
        descripcion = '',
        cuentaOrigen = null,
        cuentaDestino = null,
        saldoResultante = null,
        fecha = new Date().toISOString(),
    }) {
        this.id = id;
        this.tipo = tipo;
        this.monto = Number(monto);
        this.descripcion = descripcion;
        this.cuentaOrigen = cuentaOrigen;
        this.cuentaDestino = cuentaDestino;
        this.saldoResultante = saldoResultante;
        this.fecha = fecha;
    }
}
