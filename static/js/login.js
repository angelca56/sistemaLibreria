document.addEventListener("DOMContentLoaded", function() {
    // Mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Envío del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const correo = document.getElementById('correo').value.trim();
            const password = document.getElementById('password').value.trim();
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (!correo || !password) {
                alert("Por favor, completa todos los campos.");
                return;
            }
            
            // Mostrar estado de carga
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando...';
            }
            
            try {
                const response = await fetch("/verificar_usuario", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ correo, password })
                });

                const resultado = await response.json();

                if (resultado.permitido) {
                    window.location.href = "/paneles/";
                } else {
                    alert("Usuario no encontrado o contraseña incorrecta.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión';
                    }
                }
            } catch (error) {
                console.error("Error al verificar el usuario:", error);
                alert("Hubo un error de conexión.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión';
                }
            }
        });
    }
});