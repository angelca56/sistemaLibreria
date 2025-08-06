document.addEventListener("DOMContentLoaded", () => {
    // Botón Entradas / Salidas
    const btnEntradas = document.querySelector(".cotizaciones");
    if (btnEntradas) {
        btnEntradas.addEventListener("click", () => {
            window.location.href = "/cotizaciones";
        });
    }

    // Botón Inventario
    const btnInventario = document.querySelector(".inventario");
    if (btnInventario) {
        btnInventario.addEventListener("click", () => {
            window.location.href = "/inventario";
        });
    }

    // Botón Usuarios
    const btnUsuarios = document.querySelector(".usuarios");
    if (btnUsuarios) {
        btnUsuarios.addEventListener("click", () => {
            window.location.href = "/usuarios";
        });
    }

    // Botón Cerrar Sesión
    const btnCerrar = document.querySelector(".cerrar");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            window.location.href = "/logout";
        });
    }

    // Efecto hover mejorado para las tarjetas
    const cards = document.querySelectorAll('.panel-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});