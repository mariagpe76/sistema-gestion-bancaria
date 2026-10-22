// Comprobar que se genere un ID único

export function generarId() {
    return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;
}

// Comprobar que se genere un número de cuenta válido
export function generarNumeroCuenta() {
    let numeroCuenta = '';

    for (let i = 0; i < 12; i += 1) {
        numeroCuenta +=
            Math.floor(
                Math.random() * 10,
            );
    }

    return numeroCuenta;
}