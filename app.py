from flask import Flask, render_template, request, redirect, url_for, session
import random
import string
from config.settings import ALLOWED_EMAIL_DOMAINS, CAPTCHA_LENGTH

def create_app():
    app = Flask(__name__)
    app.secret_key = 'campus_track_secret_key_2025'  # Change this in production
    
    # Import routes
    from auth.login import auth_bp
    app.register_blueprint(auth_bp)
    
    # Home route (redirects to login)
    @app.route('/')
    def home():
        return redirect(url_for('auth.login'))
    
    # Dashboard route (protected)
    @app.route('/dashboard')
    def dashboard():
        if 'user_role' not in session:
            return redirect(url_for('auth.login'))
        return render_template('dashboard.html', role=session['user_role'])
    
    # Search route (protected)
    @app.route('/search')
    def search():
        if 'user_role' not in session:
            return redirect(url_for('auth.login'))
        return render_template('search.html', role=session['user_role'])
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)