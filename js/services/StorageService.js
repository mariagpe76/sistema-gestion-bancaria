// 
export const STORAGE_KEYS = {
    USUARIOS: 'usuarios',
    CUENTAS: 'cuentas',
    MOVIMIENTOS: 'movimientos',
    SESION: 'sesion',
};

class StorageService {
    // Método para guardar datos en el almacenamiento local
    guardarDatos(clave, valor) {
        const valorJSON = JSON.stringify(valor);
        localStorage.setItem(clave, valorJSON);
    }

    // Método para obtener datos del almacenamiento local
    obtener(clave, valorPorDefecto = null) {
        const valor = localStorage.getItem(clave);

        if (valor === null) {
            return valorPorDefecto;
        }
        
        // Intentamos convertir el valor almacenado de JSON a un objeto JavaScript.
        try {
            return JSON.parse(valor);
        } catch (error) {
            //Si el JSON almacenado es inválido, evitamos detener toda la aplicación.
            console.error(
                `No fue posible leer la clave "${clave}" de LocalStorage.`,
                error,
            );
            /* Si ocurre un error regresamos el valor predeterminado. */
            return valorPorDefecto;
        }

    }

    eliminar(clave) {
        localStorage.removeItem(clave);
    }

    limpiar() {
        localStorage.clear();
    }

}

export const storageService = new StorageService();