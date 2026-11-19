from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.routes.auth_routes import auth_bp
from app.routes.products_routes import products_bp
from app.routes.orders_routes import orders_bp
from app.routes.inventory_routes import inventory_bp
from app.routes.movements_routes import movements_bp
from app.routes.clients_routes import clients_bp
from app.routes.users_routes import users_bp
from app.routes.roles_routes import roles_bp
from app.routes.reviews_routes import reviews_bp
from app.routes.payments_routes import payments_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.suppliers_routes import suppliers_bp
from app.routes.presentations_routes import presentations_bp
from app.routes.toppings_routes import toppings_bp
from app.routes.cash_register_routes import cash_register_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(orders_bp, url_prefix="/api/orders")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(movements_bp, url_prefix="/api/movements")
    app.register_blueprint(clients_bp, url_prefix="/api/clients")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(roles_bp, url_prefix="/api/roles")
    app.register_blueprint(reviews_bp, url_prefix="/api/reviews")
    app.register_blueprint(payments_bp, url_prefix="/api/payments")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")
    app.register_blueprint(presentations_bp, url_prefix="/api/presentations")
    app.register_blueprint(toppings_bp, url_prefix="/api/toppings")
    app.register_blueprint(cash_register_bp, url_prefix="/api/cash-register")

    return app