import {STORAGE_KEYS, storageService} from './StorageService.js';

// Servicio de autenticación
class AuthService {
    // Método para iniciar sesión
    login(email, password) {
        const usuarios =
            storageService.obtener(
                STORAGE_KEYS.USUARIOS,
                [],
            );

        const emailNormalizado =
            String(email)
                .trim()
                .toLowerCase();

        const usuario =
            usuarios.find(
                (u) =>
                    u.email.toLowerCase() ===
                        emailNormalizado &&
                    u.password === password &&
                    u.activo !== false,
            );

        if (!usuario) {
            throw new Error(
                'Correo o contraseña incorrectos.',
            );
        }

        const sesion = {
            usuarioId: usuario.id,
            fechaInicio:
                new Date().toISOString(),
        };

        storageService.guardarDatos(
            STORAGE_KEYS.SESION,
            sesion,
        );

        return usuario;
    }

    // Método para cerrar sesión
    logout() {
        storageService.eliminar(
            STORAGE_KEYS.SESION,
        );
    }

    // Método para obtener el usuario actual de la sesión
    getCurrentUser() {
        const sesion =
            storageService.obtener(
                STORAGE_KEYS.SESION,
                null,
            );
        if (!sesion) {
            return null;
        }
 
        const usuarios =
            storageService.obtener(
                STORAGE_KEYS.USUARIOS,
                [],
            );
        
        return (
            usuarios.find(
                (usuario) =>
                    usuario.id ===
                    sesion.usuarioId,
            ) || null
        );
    }

    // Método para proteger rutas y redirigir si no hay usuario autenticado
    protegerRuta() {
        const usuario =
            this.getCurrentUser();
        if (!usuario) {
            window.location.href =
                'index.html';

            return false;
        }

        return true;
    }
}

export const authService = new AuthService();
