// Comprobar que los campos obligatorios no estén vacíos

export function validarCampoObligatorio(valor) {
	// Validar que el valor exista y no esté vacío
    return (
	    // El valor no debe ser undefined ni null
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ''
    );
}

// Comprobar que el monto sea un número positivo
export function validarMonto(monto) {
    const montoNumerico = Number(monto);
    return (
        Number.isFinite(montoNumerico) &&
        montoNumerico > 0
    );
}