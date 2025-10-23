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
    
    # Import video modules (for routes)
    from video.uploader import uploader_instance
    from video.demo_cam import demo_cam_instance
    
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
    
    # Upload route (protected)
    @app.route('/upload', methods=['GET', 'POST'])
    def upload():
        if 'user_role' not in session:
            return redirect(url_for('auth.login'))
        
        if session['user_role'] not in ['security', 'admin']:
            return "Access denied", 403
        
        if request.method == 'POST':
            if 'video' not in request.files:
                return "No video file provided", 400
            
            file = request.files['video']
            if file.filename == '':
                return "No video file selected", 400
            
            # Save and process video
            filepath = uploader_instance.save_uploaded_file(file)
            if filepath:
                results = uploader_instance.process_uploaded_video(filepath, f"CAM_{int(time.time())}")
                return {"success": True, "results": results}
            else:
                return {"success": False, "error": "Invalid file type"}
        
        return render_template('upload.html', role=session['user_role'])
    
    # DEMO_CAM route (protected)
    @app.route('/demo_cam')
    def demo_cam():
        if 'user_role' not in session:
            return redirect(url_for('auth.login'))
        
        if session['user_role'] not in ['security', 'admin']:
            return "Access denied", 403
        
        try:
            demo_cam_instance.start_camera()
        except RuntimeError:
            return "Could not start camera. Please check camera permissions.", 500
        
        return render_template('demo_cam.html', role=session['user_role'])
    
    # Video feed route
    @app.route('/video_feed')
    def video_feed():
        from flask import Response
        return Response(
            demo_cam_instance.generate_frames(),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    
    return app

if __name__ == '__main__':
    import time  # Add this import
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)