from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.conexion import conectar_db

bp_inventario = Blueprint('inventario', __name__)

# Ruta para mostrar el inventario
@bp_inventario.route('/inventario')
def inventario():
    
    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM productos ORDER BY id")
    productos = cur.fetchall()

    valor_final = sum(prod[4] * prod[5] for prod in productos)

    conn.close()
    return render_template('inventario.html', productos=productos, valor_final=valor_final)

# Ruta para agregar un producto
@bp_inventario.route('/agregar_producto', methods=['POST'])
def agregar_producto():
    data = request.form
    codigo = data['codigo'].strip()
    nombre = data['nombre'].strip()
    categoria = data['categoria'].strip()
    cantidad = data['cantidad'].strip()
    precio = data['precio'].strip()

    if not (codigo and nombre and categoria and cantidad and precio):
        flash("Todos los campos son obligatorios.")
        return redirect(url_for('inventario.inventario'))

    try:
        cantidad = int(cantidad)
        precio = float(precio)
        if cantidad < 1 or precio < 0:
            flash("Cantidad debe ser mayor a 0 y precio no puede ser negativo.")
            return redirect(url_for('inventario.inventario'))
    except ValueError:
        flash("Cantidad y precio deben ser numéricos.")
        return redirect(url_for('inventario.inventario'))

    conn = conectar_db()
    cur = conn.cursor()

    # Verificar si el código ya existe
    cur.execute("SELECT 1 FROM productos WHERE codigo = %s", (codigo,))
    if cur.fetchone():
        flash("El código del producto ya existe.")
        conn.close()
        return redirect(url_for('inventario.inventario'))

    cur.execute("""
        INSERT INTO productos (codigo, nombre, categoria, cantidad, precio)
        VALUES (%s, %s, %s, %s, %s)
    """, (codigo, nombre, categoria, cantidad, precio))

    conn.commit()
    conn.close()
    flash("Producto agregado exitosamente.")
    return redirect(url_for('inventario.inventario'))

# Rutas para editar un producto
@bp_inventario.route('/editar_producto/<int:producto_id>')
def editar_producto(producto_id):
    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM productos WHERE id = %s", (producto_id,))
    producto = cur.fetchone()
    conn.close()

    if not producto:
        flash("Producto no encontrado.")
        return redirect(url_for('inventario.inventario'))

    return render_template('editar_producto.html', producto=producto)

# Ruta para actualizar un producto
@bp_inventario.route('/actualizar_producto/<int:producto_id>', methods=['POST'])
def actualizar_producto(producto_id):
    data = request.form
    nombre = data['nombre'].strip()
    categoria = data['categoria'].strip()
    cantidad = data['cantidad'].strip()
    precio = data['precio'].strip()

    if not (nombre and categoria and cantidad and precio):
        flash("Todos los campos son obligatorios.")
        return redirect(url_for('inventario.editar_producto', producto_id=producto_id))

    try:
        cantidad = int(cantidad)
        precio = float(precio)
        if cantidad < 1 or precio < 0:
            flash("Cantidad debe ser mayor a 0 y precio no puede ser negativo.")
            return redirect(url_for('inventario.editar_producto', producto_id=producto_id))
    except ValueError:
        flash("Cantidad y precio deben ser numéricos.")
        return redirect(url_for('inventario.editar_producto', producto_id=producto_id))

    conn = conectar_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE productos SET nombre=%s, categoria=%s, cantidad=%s, precio=%s
        WHERE id=%s
    """, (nombre, categoria, cantidad, precio, producto_id))

    conn.commit()
    conn.close()
    flash("Producto actualizado correctamente.")
    return redirect(url_for('inventario.inventario'))

# Ruta para eliminar un producto
@bp_inventario.route('/eliminar_producto/<int:producto_id>', methods=['POST'])
def eliminar_producto(producto_id):
    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM productos WHERE id = %s", (producto_id,))
    conn.commit()
    conn.close()
    flash("Producto eliminado correctamente.")
    return redirect(url_for('inventario.inventario'))

# Ruta para ingresar la cantidad de un producto
@bp_inventario.route('/ingreso_producto', methods=['POST'])
def ingreso_producto():
    codigo = request.form['codigo'].strip()
    cantidad = request.form['cantidad'].strip()

    try:
        cantidad = int(cantidad)
        if cantidad < 1:
            flash("Cantidad debe ser mayor que 0.")
            return redirect(url_for('inventario.inventario'))
    except ValueError:
        flash("Cantidad inválida.")
        return redirect(url_for('inventario.inventario'))

    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("UPDATE productos SET cantidad = cantidad + %s WHERE codigo = %s", (cantidad, codigo))
    if cur.rowcount == 0:
        flash("Producto no encontrado para ingreso.")
    else:
        flash("Ingreso registrado.")
    conn.commit()
    conn.close()
    return redirect(url_for('inventario.inventario'))

# Ruta para egresar la cantidad de un producto
@bp_inventario.route('/egreso_producto', methods=['POST'])
def egreso_producto():
    codigo = request.form['codigo'].strip()
    cantidad = request.form['cantidad'].strip()

    try:
        cantidad = int(cantidad)
        if cantidad < 1:
            flash("Cantidad debe ser mayor que 0.")
            return redirect(url_for('inventario.inventario'))
    except ValueError:
        flash("Cantidad inválida.")
        return redirect(url_for('inventario.inventario'))

    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("SELECT cantidad FROM productos WHERE codigo = %s", (codigo,))
    resultado = cur.fetchone()

    if not resultado:
        flash("Producto no encontrado para egreso.")
    elif resultado[0] < cantidad:
        flash(f"No hay suficiente stock (disponible: {resultado[0]}).")
    else:
        cur.execute("UPDATE productos SET cantidad = cantidad - %s WHERE codigo = %s", (cantidad, codigo))
        flash("Egreso realizado correctamente.")

    conn.commit()
    conn.close()
    return redirect(url_for('inventario.inventario'))