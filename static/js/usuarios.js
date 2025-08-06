// Funciones de manejo de errores
function mostrarError(campo, mensaje) {
    const elemento = document.getElementById(campo);
    elemento.style.borderColor = '#ff4444';
    
    const errorElement = document.getElementById(`error-${campo}`);
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }
}

function limpiarError(campo) {
    const elemento = document.getElementById(campo);
    elemento.style.borderColor = '';
    
    const errorElement = document.getElementById(`error-${campo}`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function validarCampo(campo, condicion, mensaje) {
    const valor = document.getElementById(campo).value.trim();
    if (condicion(valor)) {
        mostrarError(campo, mensaje);
        return false;
    }
    limpiarError(campo);
    return true;
}

function validarFormulario() {
    let valido = true;
    
    // Validar nombre
    valido = validarCampo('nombre', 
        v => v.length < 3, 
        'El nombre debe tener al menos 3 caracteres'
    ) && valido;
    
    // Validar apellido
    valido = validarCampo('apellido', 
        v => v.length < 3, 
        'El apellido debe tener al menos 3 caracteres'
    ) && valido;
    
    // Validar correo
    valido = validarCampo('correo', 
        v => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 
        'Ingresa un correo válido'
    ) && valido;
    
    // Validar contraseña
    valido = validarCampo('contrasena', 
        v => v.length < 6, 
        'La contraseña debe tener al menos 6 caracteres'
    ) && valido;
    
    // Validar rol
    valido = validarCampo('rol', 
        v => v === '', 
        'Selecciona un rol válido'
    ) && valido;
    
    return valido;
}

// Mostrar/ocultar contraseña
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Mostrar contraseña en la tabla
function showPasswordInTable(button) {
    const password = button.getAttribute('data-contrasena');
    const passwordSpan = button.previousElementSibling;
    
    if (passwordSpan.textContent === '•••••••') {
        passwordSpan.textContent = password;
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordSpan.textContent = '•••••••';
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Manejo del formulario de nuevo usuario
function toggleFormularioRegistro() {
    const formulario = document.getElementById('formulario-registro');
    formulario.style.display = formulario.style.display === 'none' ? 'block' : 'none';
    
    // Limpiar formulario al mostrarlo
    if (formulario.style.display === 'block') {
        document.getElementById('form-usuario').reset();
        ['nombre', 'apellido', 'correo', 'contrasena', 'rol'].forEach(limpiarError);
    }
}

// Confirmación para eliminar usuario
function confirmarEliminacion(event) {
    event.preventDefault();
    const form = event.target.closest('form');
    
    const modal = document.getElementById('modal-confirmacion');
    modal.style.display = 'block';
    
    document.getElementById('btn-confirmar').onclick = function() {
        form.submit();
    };
    
    document.getElementById('btn-cancelar-modal').onclick = function() {
        modal.style.display = 'none';
    };
}

// Función mejorada para mostrar/ocultar el formulario de registro
function toggleFormularioRegistro() {
    const formulario = document.getElementById('formulario-registro');
    const estaVisible = formulario.style.display === 'block';
    
    // Alternar visibilidad
    formulario.style.display = estaVisible ? 'none' : 'block';
    
    // Si se está mostrando, hacer scroll suave hacia el formulario
    if (!estaVisible) {
        formulario.scrollIntoView({ behavior: 'smooth' });
        
        // Enfocar el primer campo del formulario
        document.getElementById('nombre').focus();
    }
}

// Event listeners cuando el DOM está cargado
document.addEventListener("DOMContentLoaded", () => {
    // Formulario de usuario
    const form = document.getElementById('form-usuario');
    
    // Validación al enviar
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validarFormulario()) {
                e.preventDefault();
            }
        });
    }
    
    // Validación en tiempo real
    ['nombre', 'apellido', 'correo', 'contrasena', 'rol'].forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                switch(campo) {
                    case 'nombre':
                    case 'apellido':
                        validarCampo(campo, v => v.length < 3, 'Mínimo 3 caracteres');
                        break;
                    case 'correo':
                        validarCampo(campo, v => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Correo inválido');
                        break;
                    case 'contrasena':
                        validarCampo(campo, v => v.length < 6, 'Mínimo 6 caracteres');
                        break;
                    case 'rol':
                        validarCampo(campo, v => v === '', 'Selecciona un rol');
                        break;
                }
            });
        }
    });
    
    // Botón nuevo usuario - con manejo de evento mejorado
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFormularioRegistro();
        });
    }

    // Botón cancelar formulario - con prevención de submit
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFormularioRegistro();
        });
    }
    
    // Mostrar/ocultar contraseña en formulario
    const btnVerContrasena = document.querySelector('.input-contrasena .btn-ver-contrasena');
    if (btnVerContrasena) {
        btnVerContrasena.addEventListener('click', function() {
            togglePasswordVisibility('contrasena', this);
        });
    }
    
    // Mostrar contraseña en tabla
    const botonesVerContrasena = document.querySelectorAll('.btn-ver-contrasena:not(.input-contrasena .btn-ver-contrasena)');
    botonesVerContrasena.forEach(btn => {
        btn.addEventListener('click', function() {
            showPasswordInTable(this);
        });
    });
    
    // Confirmación para eliminar usuario
    const formsEliminar = document.querySelectorAll('.form-eliminar');
    formsEliminar.forEach(form => {
        form.addEventListener('submit', confirmarEliminacion);
    });
    
    // Cerrar modal haciendo clic fuera
    const modal = document.getElementById('modal-confirmacion');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});