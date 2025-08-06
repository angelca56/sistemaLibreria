from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from db.conexion import conectar_db

bp = Blueprint('login', __name__)

# Ruta principal del login
@bp.route('/')
def login():
    return render_template('login.html')

# Verificación de usuario desde JS
@bp.route('/verificar_usuario', methods=['POST'])
def verificar_usuario():
    datos = request.get_json()
    correo = datos['correo']
    password = datos['password']

    try:
        conn = conectar_db()
        cur = conn.cursor()
        cur.execute("SELECT nombres FROM usuarios WHERE correo=%s AND contrasena=%s", (correo, password))
        usuario = cur.fetchone()
        conn.close()

        if usuario:
            session['nombres'] = usuario[0]  # ✅ Guardar en sesión
            return jsonify({"permitido": True, "nombres": usuario[0]})
        else:
            return jsonify({"permitido": False})

    except Exception as e:
        print("❌ Error al verificar usuario:", e)
        return jsonify({"permitido": False, "error": "Error del servidor"}), 500

# ✅ Nueva ruta sin parámetro en la URL
@bp.route('/paneles/')
@bp.route('/paneles')
def paneles():
    nombres = session.get('nombres')  # sacar desde la sesión
    return render_template('paneles.html', nombres=nombres)

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login.login'))