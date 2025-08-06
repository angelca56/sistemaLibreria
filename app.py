from flask import Flask
from routes import register_routes
from dotenv import load_dotenv
import os


def create_app():
    # Cargar variables de entorno
    load_dotenv()

    # Crear app
    app = Flask(__name__)
    app.secret_key = os.getenv('SECRET_KEY')

    # Registrar rutas externas
    register_routes(app )

    return app

app = create_app()

# Iniciar servidor
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)