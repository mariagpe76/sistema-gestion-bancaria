import {authService,} from '../services/AuthService.js';
import {bancoService,} from '../services/BancoService.js';
import {formatCurrency,formatAccountNumber} from '../utils/formatters.js';

function renderDashboard(resumen) {
    const root =
        document.querySelector(
            '#dashboardRoot',
        );

    if (!root) {
        return;
    }

    const {
        usuario,
        cuentas,
        saldoTotal,
        totalCuentas,
        totalMovimientos,
    } = resumen;

    const cuentaPrincipal =
        cuentas[0] || null;


    root.innerHTML = `
        <section
            class="dashboard-welcome"
        >
            <div>
                <p
                    class="dashboard-label"
                >
                    Bienvenido
                </p>

                <h2>
                    ${usuario.nombre}
                </h2>

                <p>
                    Consulta el estado
                    actual de tus cuentas.
                </p>
            </div>
        </section>


        <section
            class="summary-grid"
        >

            <article
                class="summary-card"
            >
                <span>
                    Saldo total
                </span>

                <strong>
                    ${formatCurrency(
                        saldoTotal,
                    )}
                </strong>
            </article>


            <article
                class="summary-card"
            >
                <span>
                    Cuentas
                </span>

                <strong>
                    ${totalCuentas}
                </strong>
            </article>


            <article
                class="summary-card"
            >
                <span>
                    Movimientos
                </span>

                <strong>
                    ${totalMovimientos}
                </strong>
            </article>

        </section>


        <section
            class="dashboard-section"
        >

            <header
                class="section-header"
            >
                <div>
                    <span>
                        Cuenta principal
                    </span>

                    <h3>
                        Información bancaria
                    </h3>
                </div>
            </header>


            ${
                cuentaPrincipal
                    ? `
                        <article
                            class="account-card"
                        >
                            <div>
                                <span>
                                    Número de cuenta
                                </span>

                                <strong>
                                    ${formatAccountNumber(
                                        cuentaPrincipal
                                            .numeroCuenta,
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Tipo
                                </span>

                                <strong>
                                    ${cuentaPrincipal.tipo}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Saldo disponible
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        cuentaPrincipal
                                            .saldo,
                                    )}
                                </strong>
                            </div>
                        </article>
                    `
                    : `
                        <p>
                            No tienes cuentas
                            bancarias registradas.
                        </p>
                    `
            }

        </section>
    `;
}

/*
// Funcion para mostrar el nombre del usuario en el dashboard
function mostrarUsuario() {

    const usuario = authService.getCurrentUser();

    if (!usuario) {
        return;
    }

    const nombreUsuario = document.querySelector('#nombreUsuario',);

    if (nombreUsuario) {
        nombreUsuario.textContent = `Sesión iniciada como ${usuario.nombre}`;
    }
}*/

// Funcion para inicializar el evento de logout
function inicializarLogout() {
    const logoutBtn =
        document.querySelector(
            '#logoutBtn',
        );

    if (!logoutBtn) {
        return;
    }

    logoutBtn.addEventListener(
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
                if (!result.isConfirmed) {
                    return;
                }
                authService.logout();
                window.location.href =
                    'index.html';
            });
        },
    );
}

// Función de inicialización del dashboard
function init() {
    const accesoPermitido =
        authService.protegerRuta();
    if (!accesoPermitido) {
        return;
    }

    const usuario =
        authService
            .getCurrentUser();


    if (!usuario) {
        return;
    }


    try {
        bancoService
            .recargarBanco();


        const resumen =
            bancoService
                .obtenerResumenUsuario(
                    usuario.id,
                );


        renderDashboard(
            resumen,
        );


        inicializarLogout();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title:
                'No fue posible cargar el dashboard',
            text:
                error.message,
        });
    }
}

init();
