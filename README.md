# Sistema de gestión bancaria
En este repositorio se encontrará el desarrollo progresivo 
de un sistema de gestión bancaria mediante tres hitos: v0.1.0, v0.5.0 y v0.10.0

## Tecnologías
- HTML5 — estructura de las diferentes vistas.
- CSS3 — estilos proporcionados para la interfaz.
- JavaScript ES6+ — lógica principal de la aplicación.
- ES Modules — organización y separación del código.
- Programación Orientada a Objetos — modelado del dominio bancario.
- Programación Funcional — procesamiento y transformación de información.
- LocalStorage — persistencia de datos.
- JSON — almacenamiento y recuperación de información.
- SweetAlert2 — alertas y confirmaciones interactivas.
- Node.js / npm — administración de dependencias y entorno de testing.
- Jest — testing automatizado.
- jsdom — entorno de navegador para determinadas pruebas.
- Git — control de versiones.
- GitHub — repositorio remoto.
- Live Server — ejecución local de la aplicación.

## Características

El proyecto permitirá:

- Creación de usuarios.
- Creación y comportamiento de cuentas.
- Registro de movimientos.
- Depósitos.
- Transferencias.
- Validación de saldo.
- Autenticación.
- Servicios bancarios.
- Validaciones.
- Funciones auxiliares.

## Funcionalidades implementadas

Actualmente el sistema permite:

- Crear usuarios.
- Crear cuentas.
- Relacionar cuentas con usuarios.
- Realizar depósitos.
- Registrar movimientos.
- Aplicar reglas básicas del dominio.
- Guardar usuarios en LocalStorage.
- Guardar cuentas en LocalStorage.
- Guardar movimientos en LocalStorage.
- Recuperar datos después de recargar la página.
- Reconstruir instancias de las clases almacenadas.

## Usuario
- class Usuario

## Cuenta
- class Cuenta

## Movimiento
- class Movimiento

## Banco.js
- agregarUsuario()
- buscarUsuarioPorId()
- agregarCuenta()
- buscarCuentaPorId()
- buscarCuentaPorNumero()
- obtenerCuentasDeUsuario()
- registrarMovimiento()
- obtenerMovimientosDeCuenta()
- realizarDeposito()

## StorageService.js
- LocalStorage
- JSON.stringify()
- JSON.parse()
- STORAGE_KEYS

## Arquitectura

El proyecto utilizará las siguientes capas:

- Models
- Services
- UI
- Utils
- Tests

## Versión actual
v0.5.0 - Persistencia con LocalStorage y StorageService
