// Importar generarId() para poder asignar automáticamente un identificador a cada usuario que creemos.
import { generarId } from '../utils/helpers.js';

// Comprobar que se cree correctamente un usuario con sus propiedades
export class Usuario {
    constructor({
        id = generarId(),
        nombre,
        email,
        telefono = '',
        password,
        activo = true,
    }) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.password = password;
        this.activo = activo;
    }
}