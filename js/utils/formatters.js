// Comprobar que se formatee correctamente la moneda, fecha y número de cuenta

export function formatCurrency(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return '$0.00';
    }

    return numero.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });
}

// Comprobar que se formatee correctamente la fecha
export function formatDate(fecha) {
    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
        return '';
    }

    return fechaObjeto.toLocaleDateString('es-MX');
}

// Comprobar que se formatee correctamente el número de cuenta
export function formatAccountNumber(numeroCuenta) {
    const numero = String(numeroCuenta ?? '');

    return numero.replace(
        /(\d{4})(?=\d)/g,
        '$1 ',
    );
}