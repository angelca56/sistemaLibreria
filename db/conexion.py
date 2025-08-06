import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def conectar_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )

# Prueba de conexión
try:
    conexion = conectar_db()
    print("✅ Conexión exitosa a la base de datos PostgreSQL")
    conexion.close()
except Exception as e:
    print("❌ Error al conectar:", e)