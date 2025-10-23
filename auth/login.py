from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import random
import string
from config.settings import ALLOWED_EMAIL_DOMAINS, CAPTCHA_LENGTH, DEFAULT_PASSWORD, ROLE_PERMISSIONS

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def generate_captcha():
    """Generate random alphanumeric CAPTCHA"""
    characters = string.ascii_uppercase + string.digits
    captcha = ''.join(random.choice(characters) for _ in range(CAPTCHA_LENGTH))
    return captcha

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        role = request.form.get('role', '')
        user_captcha = request.form.get('captcha', '').strip()
        
        # Validate CAPTCHA
        if 'captcha' not in session or user_captcha.upper() != session['captcha']:
            flash('Invalid CAPTCHA. Please try again.')
            return render_template('login.html', captcha_code=generate_captcha())
        
        # Validate email domain
        if not any(email.endswith(domain) for domain in ALLOWED_EMAIL_DOMAINS):
            flash('Email must be from @cuchd.in or @cumail.in')
            return render_template('login.html', captcha_code=generate_captcha())
        
        # Validate password (for demo - in real app, hash passwords)
        if password != DEFAULT_PASSWORD:
            flash('Invalid password')
            return render_template('login.html', captcha_code=generate_captcha())
        
        # Validate role
        if role not in ROLE_PERMISSIONS:
            flash('Invalid role selected')
            return render_template('login.html', captcha_code=generate_captcha())
        
        # Login successful
        session['user_role'] = role
        session['user_email'] = email
        
        # Redirect based on role
        if role == 'student':
            flash('Students cannot access tracking data for privacy reasons.')
            return render_template('login.html', captcha_code=generate_captcha())
        else:
            return redirect(url_for('dashboard'))
    
    # Generate new CAPTCHA for GET request
    captcha = generate_captcha()
    session['captcha'] = captcha
    return render_template('login.html', captcha_code=captcha)

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))