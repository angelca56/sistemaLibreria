from . import login, inventario, usuarios, cotizaciones

def register_routes(app):
    app.register_blueprint(login.bp)
    app.register_blueprint(inventario.bp_inventario)
    app.register_blueprint(usuarios.bp_usuarios)
    app.register_blueprint(cotizaciones.bp_cotizaciones)