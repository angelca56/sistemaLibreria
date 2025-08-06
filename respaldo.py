import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables de entorno desde .env
load_dotenv()

# Obtener datos de conexión
HOST = os.getenv("DB_HOST")
DB = os.getenv("DB_NAME")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
PORT = os.getenv("DB_PORT")

# Crear carpeta de respaldo en Descargas
carpeta_descargas = Path.home() / "Downloads" / "sistemalibDB"
carpeta_descargas.mkdir(parents=True, exist_ok=True)

# Crear nombre del archivo con fecha y hora
fecha_hora = datetime.now().strftime("%Y-%m-%d_%H-%M")
nombre_archivo = f"respaldo_{fecha_hora}.sql"
ruta_archivo = carpeta_descargas / nombre_archivo

# Comando para hacer el respaldo con pg_dump
comando = [
    "pg_dump",
    "-h", HOST,
    "-p", PORT,
    "-U", USER,
    "-d", DB,
    "-F", "p",  # formato .sql
    "-f", str(ruta_archivo)
]

# Ejecutar comando
print(f"🔄 Generando respaldo en: {ruta_archivo}")
env = os.environ.copy()
env["PGPASSWORD"] = PASSWORD  # pasar contraseña de forma segura

try:
    subprocess.run(comando, env=env, check=True)
    print("✅ Respaldo completado con éxito.")
except subprocess.CalledProcessError as e:
    print("❌ Error al generar respaldo:", e)