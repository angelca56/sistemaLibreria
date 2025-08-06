document.addEventListener("DOMContentLoaded", function() {
    // Función para mostrar mensajes de error
    function mostrarError(input, mensaje) {
        const grupoFormulario = input.closest('.grupo-formulario');
        let errorElement = grupoFormulario.querySelector('.error-mensaje');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-mensaje';
            grupoFormulario.appendChild(errorElement);
        }
        
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
        input.style.borderColor = 'var(--danger-color)';
    }

    // Función para limpiar errores
    function limpiarError(input) {
        const grupoFormulario = input.closest('.grupo-formulario');
        const errorElement = grupoFormulario.querySelector('.error-mensaje');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        input.style.borderColor = 'var(--border-color)';
    }

    // Validaciones específicas
    function validarCodigo(input) {
        const valor = input.value.trim();
        const regex = /^\d{1,10}$/; // 1 a 10 dígitos
        
        if (!valor) {
            mostrarError(input, 'El código es obligatorio');
            return false;
        }
        
        if (!regex.test(valor)) {
            mostrarError(input, 'El código debe contener solo números (1-10 dígitos)');
            return false;
        }
        
        limpiarError(input);
        return true;
    }

    function validarNombre(input) {
        const valor = input.value.trim();
        const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,-]{3,50}$/; // 3-50 caracteres alfanuméricos y algunos símbolos
        
        if (!valor) {
            mostrarError(input, 'El nombre es obligatorio');
            return false;
        }
        
        if (!regex.test(valor)) {
            mostrarError(input, 'El nombre debe tener entre 3-50 caracteres (letras, números, espacios, .,-)');
            return false;
        }
        
        limpiarError(input);
        return true;
    }

    function validarCategoria(select) {
        const valor = select.value;
        
        if (!valor) {
            mostrarError(select, 'Debe seleccionar una categoría');
            return false;
        }
        
        limpiarError(select);
        return true;
    }

    function validarCantidad(input) {
        const valor = input.value.trim();
        const regex = /^\d+$/; // Solo números enteros
        
        if (!valor) {
            mostrarError(input, 'La cantidad es obligatoria');
            return false;
        }
        
        if (!regex.test(valor)) {
            mostrarError(input, 'La cantidad debe ser un número entero');
            return false;
        }
        
        const cantidad = parseInt(valor);
        if (cantidad < 1) {
            mostrarError(input, 'La cantidad debe ser al menos 1');
            return false;
        }
        
        limpiarError(input);
        return true;
    }

    function validarPrecio(input) {
        const valor = input.value.trim();
        const regex = /^\d+(\.\d{1,2})?$/; // Números con hasta 2 decimales
        
        if (!valor) {
            mostrarError(input, 'El precio es obligatorio');
            return false;
        }
        
        if (!regex.test(valor)) {
            mostrarError(input, 'El precio debe ser un número con hasta 2 decimales');
            return false;
        }
        
        const precio = parseFloat(valor);
        if (precio <= 0) {
            mostrarError(input, 'El precio debe ser mayor a 0');
            return false;
        }
        
        limpiarError(input);
        return true;
    }

    // Validación en tiempo real
    const codigoInput = document.getElementById('codigo');
    const nombreInput = document.getElementById('nombre');
    const categoriaSelect = document.getElementById('categoria');
    const cantidadInput = document.getElementById('cantidad');
    const precioInput = document.getElementById('precio');

    if (codigoInput) codigoInput.addEventListener('blur', function() { validarCodigo(this); });
    if (nombreInput) nombreInput.addEventListener('blur', function() { validarNombre(this); });
    if (categoriaSelect) categoriaSelect.addEventListener('change', function() { validarCategoria(this); });
    if (cantidadInput) cantidadInput.addEventListener('blur', function() { validarCantidad(this); });
    if (precioInput) precioInput.addEventListener('blur', function() { validarPrecio(this); });

    // Bloquear botones al enviar formularios
    const formularios = [
        document.getElementById('form-agregar'),
        document.getElementById('form-ingreso'),
        document.getElementById('form-egreso')
    ];
    
    formularios.forEach(form => {
        if (form) {
            form.addEventListener('submit', function(e) {
                const boton = this.querySelector('button[type="submit"]');
                if (boton) {
                    boton.disabled = true;
                    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                }
            });
        }
    });

    // Validación completa al enviar formulario agregar
    const formAgregar = document.getElementById('form-agregar');
    if (formAgregar) {
        formAgregar.addEventListener('submit', function(e) {
            let valido = true;
            
            if (!validarCodigo(this.codigo)) valido = false;
            if (!validarNombre(this.nombre)) valido = false;
            if (!validarCategoria(this.categoria)) valido = false;
            if (!validarCantidad(this.cantidad)) valido = false;
            if (!validarPrecio(this.precio)) valido = false;
            
            if (!valido) {
                e.preventDefault();
                const boton = this.querySelector('button[type="submit"]');
                if (boton) {
                    boton.disabled = false;
                    boton.innerHTML = '<i class="fas fa-save"></i> Agregar Producto';
                }
                
                // Desplazar al primer error
                const primerError = this.querySelector('.error-mensaje[style="display: block;"]');
                if (primerError) {
                    primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    // Búsqueda en tiempo real
    const buscador = document.getElementById('busqueda');
    if (buscador) {
        buscador.addEventListener('input', function() {
            const texto = this.value.toLowerCase();
            const filas = document.querySelectorAll('#tabla-productos tbody tr');
            
            filas.forEach(fila => {
                const codigo = fila.getAttribute('data-codigo').toLowerCase();
                const nombre = fila.getAttribute('data-nombre').toLowerCase();
                const categoria = fila.getAttribute('data-categoria').toLowerCase();
                
                if (codigo.includes(texto) || nombre.includes(texto) || categoria.includes(texto)) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    }
    
    // Confirmación para eliminar
    const formsEliminar = document.querySelectorAll('.form-eliminar');
    formsEliminar.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const modal = document.getElementById('modal-confirmacion');
            const mensaje = document.getElementById('mensaje-confirmacion');
            const btnConfirmar = document.getElementById('btn-confirmar');
            
            mensaje.textContent = '¿Estás seguro de que deseas eliminar este producto?';
            modal.style.display = 'flex';
            
            btnConfirmar.onclick = function() {
                form.submit();
            };
            
            document.getElementById('btn-cancelar-modal').onclick = function() {
                modal.style.display = 'none';
            };
        });
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