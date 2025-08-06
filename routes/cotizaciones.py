from flask import Blueprint, render_template, request, redirect, url_for, flash, send_file
from db.conexion import conectar_db
from datetime import datetime
import os
from fpdf import FPDF
import pytz
import psycopg2.extras

bp_cotizaciones = Blueprint('cotizaciones', __name__)

# Configuración
PDF_FOLDER = 'pdfs'
MAX_CLIENTE_LENGTH = 100

@bp_cotizaciones.route('/cotizaciones', methods=['GET', 'POST'])
def cotizaciones():
    conn = conectar_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        # Obtener productos disponibles
        cur.execute("""
            SELECT id, codigo, nombre, categoria, cantidad, precio 
            FROM productos 
            WHERE cantidad > 0 
            ORDER BY nombre
        """)
        productos = cur.fetchall()

        if request.method == 'POST':
            cliente = request.form.get('cliente', '').strip()
            productos_ids = request.form.getlist('productos')
            cantidades = request.form.getlist('cantidades')
            total = float(request.form.get('total', 0))

            # Validaciones
            if not cliente:
                flash("El nombre del cliente es obligatorio", 'error')
                return redirect(url_for('cotizaciones.cotizaciones'))

            if len(cliente) > MAX_CLIENTE_LENGTH:
                flash(f"El nombre del cliente no puede superar los {MAX_CLIENTE_LENGTH} caracteres", 'error')
                return redirect(url_for('cotizaciones.cotizaciones'))

            if not productos_ids:
                flash("Debes seleccionar al menos un producto", 'error')
                return redirect(url_for('cotizaciones.cotizaciones'))

            # Obtener detalles de los productos seleccionados
            placeholders = ','.join(['%s'] * len(productos_ids))
            cur.execute(f"""
                SELECT id, codigo, nombre, precio 
                FROM productos 
                WHERE id IN ({placeholders})
            """, tuple(productos_ids))
            productos_info = cur.fetchall()

            # Formatear productos para almacenar
            productos_detalle = []
            for i, prod in enumerate(productos_info):
                cantidad = int(cantidades[i])
                productos_detalle.append(
                    f"{prod['codigo']} - {prod['nombre']} - Q{prod['precio']:.2f} x {cantidad}"
                )
            
            productos_str = '\n'.join(productos_detalle)

            # Obtener fecha y hora local
            zona_gt = pytz.timezone("America/Guatemala")
            ahora_gt = datetime.now(zona_gt)
            fecha = ahora_gt.date()
            hora = ahora_gt.time().strftime('%H:%M:%S')

            # Insertar cotización
            cur.execute("""
                INSERT INTO cotizaciones (fecha, hora, productos, cliente, valor_total)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (fecha, hora, productos_str, cliente, total))
            
            cotizacion_id = cur.fetchone()['id']
            conn.commit()
            
            flash("Cotización registrada correctamente", 'success')
            return redirect(url_for('cotizaciones.cotizaciones'))

        # Mostrar cotizaciones anteriores
        cur.execute("""
            SELECT id, fecha, hora, productos, cliente, valor_total 
            FROM cotizaciones 
            ORDER BY fecha DESC, hora DESC 
            LIMIT 10
        """)
        cotizaciones = cur.fetchall()

    except Exception as e:
        conn.rollback()
        flash(f"Error al procesar la cotización: {str(e)}", 'error')
        print(f"Error: {str(e)}")
        cotizaciones = []
        
    finally:
        conn.close()

    return render_template('cotizaciones.html', 
                        productos=productos, 
                        cotizaciones=cotizaciones,
                        datetime=datetime)

@bp_cotizaciones.route('/cotizacion/<int:id>')
def detalle_cotizacion(id):
    conn = conectar_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cur.execute("""
            SELECT fecha, hora, productos, cliente, valor_total 
            FROM cotizaciones 
            WHERE id = %s
        """, (id,))
        cotizacion = cur.fetchone()

        if not cotizacion:
            return "Cotización no encontrada", 404

        # Formatear el detalle para mostrar en el modal
        detalle_html = f"""
            <div class="mb-3">
                <h5>Cotización #{id}</h5>
                <p><strong>Fecha:</strong> {cotizacion['fecha']} {cotizacion['hora']}</p>
                <p><strong>Cliente:</strong> {cotizacion['cliente']}</p>
                <p><strong>Total:</strong> Q{cotizacion['valor_total']:.2f}</p>
            </div>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
        """

        for producto in cotizacion['productos'].split('\n'):
            detalle_html += f"""
                <tr>
                    <td>{producto.split(' - ')[1]}</td>
                    <td>{producto.split(' - ')[2]}</td>
                </tr>
            """

        detalle_html += """
                    </tbody>
                </table>
            </div>
        """

        return detalle_html

    except Exception as e:
        print(f"Error al obtener detalle: {str(e)}")
        return "Error al cargar el detalle", 500
        
    finally:
        conn.close()

@bp_cotizaciones.route('/generar_pdf/<int:id>')
def generar_pdf(id):
    conn = conectar_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cur.execute("""
            SELECT fecha, hora, productos, cliente, valor_total 
            FROM cotizaciones 
            WHERE id = %s
        """, (id,))
        cotizacion = cur.fetchone()

        if not cotizacion:
            flash("Cotización no encontrada", 'error')
            return redirect(url_for('cotizaciones.cotizaciones'))

        # Crear PDF con mejor formato
        pdf = FPDF()
        pdf.add_page()
        
        # Configuración inicial
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.set_margins(left=15, top=15, right=15)
        
        # Colores personalizados (RGB)
        azul_oscuro = (0, 51, 102)
        gris_oscuro = (64, 64, 64)
        verde = (0, 128, 0)
        rojo = (220, 53, 69)
        
        # Logo y encabezado
        pdf.set_font("Helvetica", 'B', 18)
        pdf.set_text_color(*azul_oscuro)
        pdf.cell(0, 10, "Librería Flor del Barrio", 0, 1, 'C')
        
        pdf.set_font("Helvetica", 'B', 14)
        pdf.set_text_color(*gris_oscuro)
        pdf.cell(0, 8, "COTIZACIÓN", 0, 1, 'C')
        pdf.ln(5)
        
        # Línea decorativa
        pdf.set_draw_color(*azul_oscuro)
        pdf.set_line_width(0.5)
        pdf.line(15, pdf.get_y(), 195, pdf.get_y())
        pdf.ln(8)
        
        # Información de la cotización
        pdf.set_font("Helvetica", 'B', 11)
        pdf.set_text_color(*gris_oscuro)
        pdf.cell(45, 8, "Número de cotización:", 0, 0)
        pdf.set_font("Helvetica", '', 11)
        pdf.set_text_color(0, 0, 0)  # Negro
        pdf.cell(0, 8, f"#{id}", 0, 1)
        
        pdf.set_font("Helvetica", 'B', 11)
        pdf.set_text_color(*gris_oscuro)
        pdf.cell(45, 8, "Fecha y hora:", 0, 0)
        pdf.set_font("Helvetica", '', 11)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 8, f"{cotizacion['fecha']} {cotizacion['hora']}", 0, 1)
        
        pdf.set_font("Helvetica", 'B', 11)
        pdf.set_text_color(*gris_oscuro)
        pdf.cell(45, 8, "Cliente:", 0, 0)
        pdf.set_font("Helvetica", '', 11)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 8, cotizacion['cliente'], 0, 1)
        pdf.ln(10)
        
        # Tabla de productos
        pdf.set_font("Helvetica", 'B', 12)
        pdf.set_text_color(*azul_oscuro)
        pdf.cell(0, 8, "Detalle de Productos:", 0, 1)
        pdf.ln(3)
        
        # Encabezados de tabla
        pdf.set_fill_color(*azul_oscuro)
        pdf.set_text_color(255, 255, 255)  # Blanco
        pdf.set_font("Helvetica", 'B', 10)
        pdf.cell(120, 8, "Producto", 1, 0, 'C', True)
        pdf.cell(30, 8, "Cantidad", 1, 0, 'C', True)
        pdf.cell(30, 8, "Precio", 1, 1, 'C', True)
        
        # Filas de productos
        pdf.set_font("Helvetica", '', 10)
        pdf.set_text_color(0, 0, 0)  # Negro
        pdf.set_fill_color(245, 245, 245)  # Gris claro para filas alternas
        
        productos = cotizacion['productos'].split('\n')
        for i, producto in enumerate(productos):
            if not producto.strip():
                continue
                
            # Alternar color de fondo para filas
            if i % 2 == 0:
                pdf.set_fill_color(245, 245, 245)
            else:
                pdf.set_fill_color(255, 255, 255)
            
            # Parsear producto (formato: "1 - Laptz Mongol - Q2.00")
            partes = producto.split(' - ')
            if len(partes) >= 3:
                cantidad = partes[0].strip()
                nombre = partes[1].strip()
                precio = partes[2].strip()
                
                pdf.cell(120, 8, nombre, 1, 0, 'L', True)
                pdf.cell(30, 8, cantidad, 1, 0, 'C', True)
                pdf.cell(30, 8, precio, 1, 1, 'R', True)
        
        # Total
        pdf.ln(5)
        pdf.set_font("Helvetica", 'B', 14)
        pdf.set_text_color(*rojo)
        pdf.cell(0, 10, f"TOTAL: Q{cotizacion['valor_total']:.2f}", 0, 1, 'R')
        
        # Pie de página
        pdf.ln(15)
        pdf.set_font("Helvetica", 'I', 8)
        pdf.set_text_color(*gris_oscuro)
        pdf.cell(0, 5, "Gracias por su preferencia", 0, 1, 'C')
        pdf.cell(0, 5, "Esta cotización es válida por 7 días", 0, 1, 'C')
        pdf.cell(0, 5, "Teléfono: [+502 3744-1186] | Email: [libreriaflorbarrio@gmail.com]", 0, 1, 'C')
        
        # Guardar PDF
        os.makedirs(PDF_FOLDER, exist_ok=True)
        nombre_archivo = f"cotizacion_{id}_{cotizacion['fecha']}.pdf"
        ruta_archivo = os.path.join(PDF_FOLDER, nombre_archivo)
        pdf.output(ruta_archivo)

        return send_file(ruta_archivo, as_attachment=True)

    except Exception as e:
        flash(f"Error al generar el PDF: {str(e)}", 'error')
        print(f"Error al generar PDF: {str(e)}")
        return redirect(url_for('cotizaciones.cotizaciones'))
        
    finally:
        conn.close()