from flask import Blueprint, render_template, request, redirect, url_for, flash
from db.conexion import conectar_db

bp_usuarios = Blueprint('usuarios', __name__)

# Mostrar usuarios
@bp_usuarios.route('/usuarios', methods=['GET', 'POST'])
def usuarios():
    conn = conectar_db()
    cur = conn.cursor()
    
    # Formulario de nuevo usuario
    if request.method == 'POST':
        nombre = request.form['nombre'].strip()
        apellido = request.form['apellido'].strip()
        correo = request.form['correo'].strip()
        contrasena = request.form['contrasena'].strip()
        rol = request.form['rol'].strip()

        if not (nombre and apellido and correo and contrasena and rol):
            flash("Todos los campos son obligatorios.")
        else:
            cur.execute("""
                INSERT INTO usuarios (nombres, apellidos, correo, contrasena, rol)
                VALUES (%s, %s, %s, %s, %s)
            """, (nombre, apellido, correo, contrasena, rol))
            conn.commit()
            flash("Usuario registrado exitosamente.")
        return redirect(url_for('usuarios.usuarios'))

    cur.execute("SELECT * FROM usuarios")
    usuarios = cur.fetchall()
    conn.close()

    return render_template('usuarios.html', usuarios=usuarios)

# Eliminar usuario
@bp_usuarios.route('/eliminar_usuario/<int:usuario_id>', methods=['POST'])
def eliminar_usuario(usuario_id):
    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM usuarios WHERE id = %s", (usuario_id,))
    conn.commit()
    conn.close()
    flash("Usuario eliminado.")
    return redirect(url_for('usuarios.usuarios'))

# Editar usuario
@bp_usuarios.route('/editar_usuario/<int:usuario_id>')
def editar_usuario(usuario_id):
    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id = %s", (usuario_id,))
    usuario = cur.fetchone()
    conn.close()

    if not usuario:
        flash("Usuario no encontrado.")
        return redirect(url_for('usuarios.usuarios'))

    return render_template('editar_usuario.html', usuario=usuario)


# Actualizar usuario
@bp_usuarios.route('/actualizar_usuario/<int:usuario_id>', methods=['POST'])
def actualizar_usuario(usuario_id):
    nombre = request.form['nombre'].strip()
    apellido = request.form['apellido'].strip()
    correo = request.form['correo'].strip()
    contrasena = request.form['contrasena'].strip()
    rol = request.form['rol'].strip()

    if not (nombre and apellido and correo and contrasena and rol):
        flash("Todos los campos son obligatorios.")
        return redirect(url_for('usuarios.editar_usuario', usuario_id=usuario_id))

    conn = conectar_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE usuarios
        SET nombres = %s, apellidos = %s, correo = %s, contrasena = %s, rol = %s
        WHERE id = %s
    """, (nombre, apellido, correo, contrasena, rol, usuario_id))
    conn.commit()
    conn.close()
    flash("Usuario actualizado correctamente.")
    return redirect(url_for('usuarios.usuarios'))