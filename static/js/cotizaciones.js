$(document).ready(function() {
    // Variables globales
    let productosSeleccionados = [];
    let total = 0;

    // Función para validar y formatear números
    function validarNumero(valor, min = 1, max = Infinity) {
        const num = parseInt(valor);
        return !isNaN(num) && num >= min && num <= max;
    }

    // Función para mostrar notificaciones al usuario
    function mostrarNotificacion(mensaje, tipo = 'error') {
        const tipos = {
            error: { clase: 'alert-danger', icono: 'fa-exclamation-circle' },
            success: { clase: 'alert-success', icono: 'fa-check-circle' },
            info: { clase: 'alert-info', icono: 'fa-info-circle' }
        };
        
        const notificacion = $(`
            <div class="alert ${tipos[tipo].clase} alert-dismissible fade show" role="alert">
                <i class="fas ${tipos[tipo].icono} me-2"></i>${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        $('.container').prepend(notificacion);
        
        // Eliminar la notificación después de 5 segundos
        setTimeout(() => {
            notificacion.alert('close');
        }, 5000);
    }

    // Función para actualizar la tabla de productos seleccionados
    function actualizarTablaSeleccionados() {
        const $tbody = $('#tablaSeleccionados tbody');
        $tbody.empty();
        total = 0;

        productosSeleccionados.forEach((producto, index) => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            $tbody.append(`
                <tr data-id="${producto.id}">
                    <td>${producto.nombre}</td>
                    <td>Q${producto.precio.toFixed(2)}</td>
                    <td>
                        <input type="number" min="1" max="${producto.stock}" 
                               value="${producto.cantidad}" 
                               class="form-control form-control-sm cantidad-producto" 
                               style="width: 70px;">
                    </td>
                    <td>Q${subtotal.toFixed(2)}</td>
                    <td class="acciones">
                        <button class="btn btn-sm rojo btn-eliminar" title="Eliminar producto">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `);
        });

        $('#totalCotizacion').text(`Q${total.toFixed(2)}`);
    }

    // Buscar productos
    $('#buscarProducto').on('input', function() {
        const busqueda = $(this).val().trim().toLowerCase();
        
        if (busqueda.length > 0) {
            $('#tablaProductos tbody tr').each(function() {
                const textoFila = $(this).text().toLowerCase();
                $(this).toggle(textoFila.includes(busqueda));
            });
        } else {
            $('#tablaProductos tbody tr').show();
        }
    });

    // Agregar producto a la cotización
    $(document).on('click', '.btn-agregar', function() {
        const $fila = $(this).closest('tr');
        const id = $fila.data('id');
        const nombre = $fila.find('td:eq(1)').text();
        const precio = parseFloat($fila.data('precio'));
        const stock = parseInt($fila.find('td:eq(4)').text());

        // Validar stock disponible
        if (stock <= 0) {
            mostrarNotificacion('Este producto no tiene stock disponible', 'error');
            return;
        }

        // Verificar si el producto ya está agregado
        const existe = productosSeleccionados.some(p => p.id === id);
        
        if (!existe) {
            productosSeleccionados.push({
                id: id,
                nombre: nombre,
                precio: precio,
                cantidad: 1,
                stock: stock
            });
            
            actualizarTablaSeleccionados();
            mostrarNotificacion('Producto agregado correctamente', 'success');
        } else {
            mostrarNotificacion('Este producto ya fue agregado a la cotización', 'info');
        }
    });

    // Eliminar producto de la cotización
    $(document).on('click', '.btn-eliminar', function() {
        const id = $(this).closest('tr').data('id');
        productosSeleccionados = productosSeleccionados.filter(p => p.id !== id);
        actualizarTablaSeleccionados();
        mostrarNotificacion('Producto eliminado de la cotización', 'info');
    });

    // Actualizar cantidad de producto
    $(document).on('change', '.cantidad-producto', function() {
        const $input = $(this);
        const id = $input.closest('tr').data('id');
        const nuevaCantidad = parseInt($input.val());
        const producto = productosSeleccionados.find(p => p.id === id);

        if (producto) {
            if (validarNumero(nuevaCantidad, 1, producto.stock)) {
                producto.cantidad = nuevaCantidad;
                actualizarTablaSeleccionados();
            } else {
                mostrarNotificacion(`La cantidad debe estar entre 1 y ${producto.stock}`, 'error');
                $input.val(producto.cantidad);
                $input.focus();
            }
        }
    });

    // Limpiar formulario completamente
    $(document).on('click', 'button[type="reset"]', function(e) {
        e.preventDefault();
        
        // Confirmar antes de limpiar
        if (productosSeleccionados.length > 0 && !confirm('¿Estás seguro que deseas limpiar toda la cotización? Se perderán todos los productos agregados.')) {
            return;
        }
        
        // Limpiar productos seleccionados
        productosSeleccionados = [];
        total = 0;
        
        // Actualizar la tabla
        actualizarTablaSeleccionados();
        
        // Limpiar campos del formulario
        $('#formCotizacion')[0].reset();
        
        // Restablecer la fecha actual
        $('#fecha').val(new Date().toLocaleDateString('es-GT'));
        
        // Mostrar notificación
        mostrarNotificacion('Cotización limpiada correctamente', 'success');
    });

    // Enviar formulario de cotización
    $('#formCotizacion').on('submit', function(e) {
        e.preventDefault();
        
        // Validar cliente
        const cliente = $('#cliente').val().trim();
        if (cliente === '') {
            mostrarNotificacion('Debes ingresar el nombre del cliente', 'error');
            $('#cliente').focus();
            return;
        }
        
        // Validar productos
        if (productosSeleccionados.length === 0) {
            mostrarNotificacion('Debes agregar al menos un producto a la cotización', 'error');
            return;
        }
        
        // Validar cantidades
        let cantidadesValidas = true;
        productosSeleccionados.forEach(producto => {
            if (producto.cantidad > producto.stock) {
                cantidadesValidas = false;
            }
        });
        
        if (!cantidadesValidas) {
            mostrarNotificacion('Algunas cantidades superan el stock disponible', 'error');
            return;
        }

        // Crear campos ocultos con los productos seleccionados
        productosSeleccionados.forEach(producto => {
            $(this).append(`
                <input type="hidden" name="productos" value="${producto.id}">
                <input type="hidden" name="cantidades" value="${producto.cantidad}">
            `);
        });

        // Agregar el total al formulario
        $(this).append(`<input type="hidden" name="total" value="${total}">`);

        // Mostrar mensaje de confirmación
        if (confirm(`¿Deseas guardar la cotización por un total de Q${total.toFixed(2)}?`)) {
            // Deshabilitar botones para evitar envíos duplicados
            $('button[type="submit"]').prop('disabled', true);
            $('button[type="reset"]').prop('disabled', true);
            
            // Enviar el formulario
            this.submit();
        }
    });

    // Ver detalle de cotización
    $(document).on('click', '.btn-ver-detalle', function() {
        const id = $(this).data('id');
        
        // Mostrar spinner de carga
        $('#detalleCotizacion').html(`
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando detalles de la cotización...</p>
            </div>
        `);
        
        $('#modalDetalle').modal('show');
        
        $.get(`/cotizacion/${id}`, function(data) {
            $('#detalleCotizacion').html(data);
        }).fail(function() {
            $('#detalleCotizacion').html(`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar el detalle de la cotización
                </div>
            `);
        });
    });

    // Inicializar la fecha actual
    $('#fecha').val(new Date().toLocaleDateString('es-GT'));
});