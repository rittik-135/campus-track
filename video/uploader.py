import os
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
from typing import Dict, Optional
from video.processor import processor_instance

class VideoUploader:
    def __init__(self, upload_folder: str = "data/videos", allowed_extensions: set = None):
        self.upload_folder = upload_folder
        self.allowed_extensions = allowed_extensions or {'mp4', 'avi', 'mov', 'mkv', 'wmv'}
        self.ensure_upload_folder()
    
    def ensure_upload_folder(self):
        """Create upload folder if it doesn't exist"""
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def allowed_file(self, filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_uploaded_file(self, file) -> Optional[str]:
        """Save uploaded file and return path"""
        if file and self.allowed_file(file.filename):
            # Create secure filename
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            
            # New filename: original_timestamp_unique.ext
            name, ext = os.path.splitext(filename)
            new_filename = f"{name}_{timestamp}_{unique_id}{ext}"
            
            # Full path
            filepath = os.path.join(self.upload_folder, new_filename)
            
            # Save file
            file.save(filepath)
            return filepath
        
        return None
    
    def process_uploaded_video(self, filepath: str, camera_id: str) -> Dict:
        """Process uploaded video file"""
        try:
            # Process the video
            results = processor_instance.process_video_file(filepath, camera_id)
            
            # Add video info to results
            results['video_path'] = filepath
            results['camera_id'] = camera_id
            results['upload_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            return results
        except Exception as e:
            print(f"Error processing video: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def get_video_info(self, filepath: str) -> Dict:
        """Get video file information"""
        try:
            import cv2
            cap = cv2.VideoCapture(filepath)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 0
            
            file_size = os.path.getsize(filepath)  # in bytes
            
            cap.release()
            
            return {
                'fps': fps,
                'frame_count': frame_count,
                'duration_seconds': duration,
                'file_size_bytes': file_size,
                'file_size_mb': round(file_size / (1024 * 1024), 2)
            }
        except Exception as e:
            print(f"Error getting video info: {e}")
            return {'error': str(e)}

# Global instance
uploader_instance = VideoUploader()