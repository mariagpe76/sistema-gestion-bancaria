import {
    authService,
} from '../services/AuthService.js';

import {
    bancoService,
} from '../services/BancoService.js';

import {
    formatCurrency,
    formatAccountNumber,
} from '../utils/formatters.js';

import {
    validarMonto,
    validarCampoObligatorio,
} from '../utils/validators.js';


/* =========================================
   CIERRE DE SESIÓN
========================================= */

function initLogout() {
    const btn =
        document.querySelector(
            '#logoutBtn',
        );


    if (!btn) {
        return;
    }


    btn.addEventListener(
        'click',
        () => {
            Swal.fire({
                icon: 'question',
                title:
                    'Cerrar sesión',
                text:
                    '¿Seguro que deseas salir?',
                showCancelButton:
                    true,
                confirmButtonText:
                    'Sí, salir',
                cancelButtonText:
                    'Cancelar',
            }).then((result) => {
                if (
                    !result.isConfirmed
                ) {
                    return;
                }


                authService.logout();


                window.location.href =
                    'index.html';
            });
        },
    );
}


/* =========================================
   RENDER DEL FORMULARIO
========================================= */

function renderFormulario(
    usuario,
    cuentas,
) {
    const root =
        document.querySelector(
            '#transferenciaRoot',
        );


    if (!root) {
        return;
    }


    const cuentaPrincipal =
        cuentas[0] || null;


    if (!cuentaPrincipal) {
        root.innerHTML = `
            <section
                class="transferencia-card"
            >
                <h2>
                    No tienes cuentas
                    disponibles.
                </h2>
            </section>
        `;

        return;
    }


    root.innerHTML = `
        <section
            class="transferencia-header"
        >

            <div>
                <span
                    class="dashboard-label"
                >
                    Operaciones bancarias
                </span>

                <h2>
                    Transferir dinero
                </h2>

                <p>
                    Realiza transferencias
                    entre cuentas registradas.
                </p>
            </div>


            <article
                class="saldo-disponible"
            >
                <span>
                    Saldo disponible
                </span>

                <strong
                    id="saldoActual"
                >
                    ${formatCurrency(
                        cuentaPrincipal.saldo,
                    )}
                </strong>
            </article>

        </section>


        <section
            class="operaciones-grid"
        >

            <article
                class="transferencia-card"
            >

                <h3>
                    Nueva transferencia
                </h3>


                <form
                    id="formTransferencia"
                    novalidate
                >

                    <div
                        class="form-group"
                    >
                        <label
                            for="cuentaOrigen"
                        >
                            Cuenta origen
                        </label>

                        <select
                            id="cuentaOrigen"
                        >
                            <option
                                value=""
                            >
                                Selecciona una cuenta
                            </option>

                            ${cuentas
                                .map(
                                    (cuenta) => `
                                        <option
                                            value="${cuenta.id}"
                                        >
                                            ${formatAccountNumber(
                                                cuenta.numeroCuenta,
                                            )}
                                            -
                                            ${formatCurrency(
                                                cuenta.saldo,
                                            )}
                                        </option>
                                    `,
                                )
                                .join('')}
                        </select>
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="cuentaDestino"
                        >
                            Número de cuenta destino
                        </label>

                        <input
                            id="cuentaDestino"
                            type="text"
                            placeholder="123456789012"
                            maxlength="14"
                        >
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="montoTransferencia"
                        >
                            Monto
                        </label>

                        <input
                            id="montoTransferencia"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="descripcionTransferencia"
                        >
                            Descripción
                        </label>

                        <input
                            id="descripcionTransferencia"
                            type="text"
                            maxlength="80"
                            placeholder="Concepto de la transferencia"
                        >
                    </div>


                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Confirmar transferencia
                    </button>

                </form>

            </article>


            <article
                class="transferencia-card"
            >

                <h3>
                    Depositar saldo
                </h3>

                <p
                    class="operation-help"
                >
                    Utiliza esta operación
                    para cargar saldo en tu
                    cuenta durante la práctica.
                </p>


                <form
                    id="formDeposito"
                    novalidate
                >

                    <div
                        class="form-group"
                    >
                        <label
                            for="cuentaDeposito"
                        >
                            Cuenta
                        </label>

                        <select
                            id="cuentaDeposito"
                        >

                            ${cuentas
                                .map(
                                    (cuenta) => `
                                        <option
                                            value="${cuenta.id}"
                                        >
                                            ${formatAccountNumber(
                                                cuenta.numeroCuenta,
                                            )}
                                        </option>
                                    `,
                                )
                                .join('')}

                        </select>
                    </div>


                    <div
                        class="form-group"
                    >
                        <label
                            for="montoDeposito"
                        >
                            Monto
                        </label>

                        <input
                            id="montoDeposito"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>


                    <button
                        type="submit"
                        class="btn btn-secondary"
                    >
                        Realizar depósito
                    </button>

                </form>

            </article>

        </section>
    `;


    // Registramos los eventos después
    // de crear los formularios.
    initEventosOperaciones(
        usuario,
    );
}


/* =========================================
   EVENTOS DE OPERACIONES
========================================= */

function initEventosOperaciones(
    usuario,
) {
    const formTransferencia =
        document.querySelector(
            '#formTransferencia',
        );

    const formDeposito =
        document.querySelector(
            '#formDeposito',
        );


    if (formTransferencia) {
        formTransferencia
            .addEventListener(
                'submit',
                (event) =>
                    manejarTransferencia(
                        event,
                        usuario,
                    ),
            );
    }


    if (formDeposito) {
        formDeposito
            .addEventListener(
                'submit',
                (event) =>
                    manejarDeposito(
                        event,
                        usuario,
                    ),
            );
    }
}


/* =========================================
   DEPÓSITOS
========================================= */

function manejarDeposito(
    event,
    usuario,
) {
    event.preventDefault();


    const cuentaId =
        document
            .querySelector(
                '#cuentaDeposito',
            )
            .value;


    const monto =
        document
            .querySelector(
                '#montoDeposito',
            )
            .value;


    if (!validarMonto(monto)) {
        Swal.fire({
            icon: 'warning',
            title:
                'Monto inválido',
            text:
                'El monto debe ser mayor a cero.',
        });

        return;
    }


    try {
        bancoService
            .realizarDeposito({
                cuentaId,
                monto,
                descripcion:
                    'Depósito desde interfaz',
            });


        Swal.fire({
            icon: 'success',
            title:
                'Depósito exitoso',
            text:
                `Se depositaron ${formatCurrency(
                    monto,
                )}.`,
        }).then(() => {
            recargarFormulario(
                usuario,
            );
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title:
                'No fue posible depositar',
            text:
                error.message,
        });
    }
}


/* =========================================
   TRANSFERENCIAS
========================================= */

function manejarTransferencia(
    event,
    usuario,
) {
    event.preventDefault();


    const cuentaOrigenId =
        document
            .querySelector(
                '#cuentaOrigen',
            )
            .value;


    const numeroCuentaDestino =
        document
            .querySelector(
                '#cuentaDestino',
            )
            .value
            .trim();


    const monto =
        document
            .querySelector(
                '#montoTransferencia',
            )
            .value;


    const descripcion =
        document
            .querySelector(
                '#descripcionTransferencia',
            )
            .value
            .trim();


    // Validamos que exista una cuenta origen.
    if (
        !validarCampoObligatorio(
            cuentaOrigenId,
        )
    ) {
        Swal.fire({
            icon: 'warning',
            title:
                'Selecciona la cuenta origen',
        });

        return;
    }


    // Validamos la cuenta destino.
    if (
        !validarCampoObligatorio(
            numeroCuentaDestino,
        )
    ) {
        Swal.fire({
            icon: 'warning',
            title:
                'Ingresa la cuenta destino',
        });

        return;
    }


    // Validamos el monto antes de llegar
    // al servicio bancario.
    if (!validarMonto(monto)) {
        Swal.fire({
            icon: 'warning',
            title:
                'Monto inválido',
            text:
                'El monto debe ser mayor a cero.',
        });

        return;
    }


    // Antes de mover dinero mostramos
    // una confirmación al usuario.
    Swal.fire({
        icon: 'question',
        title:
            'Confirmar transferencia',
        html: `
            <p>
                Estás por transferir
                <strong>
                    ${formatCurrency(
                        monto,
                    )}
                </strong>
            </p>

            <p>
                Cuenta destino:
                <strong>
                    ${numeroCuentaDestino}
                </strong>
            </p>
        `,
        showCancelButton:
            true,
        confirmButtonText:
            'Transferir',
        cancelButtonText:
            'Cancelar',
    }).then((result) => {

        if (
            !result.isConfirmed
        ) {
            return;
        }


        try {
            bancoService
                .realizarTransferencia({
                    cuentaOrigenId,
                    numeroCuentaDestino,
                    monto,
                    descripcion,
                });


            Swal.fire({
                icon: 'success',
                title:
                    'Transferencia exitosa',
                text:
                    `${formatCurrency(
                        monto,
                    )} fueron transferidos correctamente.`,
            }).then(() => {
                recargarFormulario(
                    usuario,
                );
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title:
                    'No fue posible realizar la transferencia',
                text:
                    error.message,
            });
        }
    });
}


/* =========================================
   ACTUALIZACIÓN DE INTERFAZ
========================================= */

function recargarFormulario(
    usuario,
) {
    bancoService.recargarBanco();


    const {
        cuentas,
    } =
        bancoService
            .obtenerDatosUsuario(
                usuario.id,
            );


    renderFormulario(
        usuario,
        cuentas,
    );
}


/* =========================================
   INICIALIZACIÓN
========================================= */

function init() {
    const accesoPermitido =
        authService
            .protegerRuta();


    if (!accesoPermitido) {
        return;
    }


    initLogout();


    const usuario =
        authService
            .getCurrentUser();


    if (!usuario) {
        return;
    }


    try {
        bancoService
            .recargarBanco();


        const {
            cuentas,
        } =
            bancoService
                .obtenerDatosUsuario(
                    usuario.id,
                );


        renderFormulario(
            usuario,
            cuentas,
        );
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title:
                'No fue posible cargar las operaciones',
            text:
                error.message,
        });
    }
}


if (
    document.querySelector(
        '.app-transferencia',
    )
) {
    init();
}