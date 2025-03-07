from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Import and register blueprints
    from app.routes import stripe_bp
    app.register_blueprint(stripe_bp)
    
    return app
