import cv2
import threading
import time
from datetime import datetime
from typing import Generator, Tuple, Dict, Optional
from video.processor import processor_instance

class DemoCamera:
    def __init__(self):
        self.camera = None
        self.is_running = False
        self.frame = None
        self.lock = threading.Lock()
        self.last_access = time.time()
        self.timeout = 300  # 5 minutes timeout
    
    def start_camera(self):
        """Start the webcam"""
        if self.camera is None:
            self.camera = cv2.VideoCapture(0)  # 0 is default camera
            if not self.camera.isOpened():
                raise RuntimeError("Could not open webcam")
        
        self.is_running = True
        self.capture_thread = threading.Thread(target=self._capture_frames)
        self.capture_thread.daemon = True
        self.capture_thread.start()
    
    def stop_camera(self):
        """Stop the webcam"""
        self.is_running = False
        if self.camera:
            self.camera.release()
            self.camera = None
    
    def _capture_frames(self):
        """Capture frames from webcam in background thread"""
        while self.is_running:
            ret, frame = self.camera.read()
            if ret:
                with self.lock:
                    self.frame = frame
                    self.last_access = time.time()
            else:
                time.sleep(0.1)
    
    def get_frame(self) -> Optional[Tuple[bytes, str]]:
        """Get current frame for display"""
        with self.lock:
            if self.frame is not None:
                # Process frame for person detection
                processed_detections = processor_instance.process_webcam_frame(
                    self.frame.copy(), "DEMO_CAM"
                )
                
                # Encode frame as JPEG
                ret, buffer = cv2.imencode('.jpg', self.frame)
                if ret:
                    frame_bytes = buffer.tobytes()
                    return frame_bytes, processed_detections
        
        return None, []
    
    def generate_frames(self) -> Generator[bytes, None, None]:
        """Generate frames for video stream"""
        while self.is_running:
            frame_data, detections = self.get_frame()
            if frame_data:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')
            time.sleep(0.033)  # ~30 FPS
    
    def is_camera_active(self) -> bool:
        """Check if camera is still active"""
        current_time = time.time()
        if current_time - self.last_access > self.timeout:
            self.stop_camera()
            return False
        return self.is_running and self.camera is not None
    
    def get_camera_status(self) -> Dict:
        """Get camera status information"""
        return {
            'is_active': self.is_camera_active(),
            'last_access': datetime.fromtimestamp(self.last_access).strftime("%Y-%m-%d %H:%M:%S"),
            'timeout': self.timeout
        }

# Global instance
demo_cam_instance = DemoCamera()