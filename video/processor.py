import cv2
import numpy as np
import os
from datetime import datetime
from tracking.detector import detector_instance
from tracking.reid import reid_instance
from tracking.database import db_instance
from typing import Generator, Tuple, Dict, List

class VideoProcessor:
    def __init__(self):
        self.fps = 30  # Default FPS
        self.frame_count = 0
    
    def process_video_file(self, video_path: str, camera_id: str) -> Dict:
        """Process a video file and track persons"""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")
        
        # Get video info
        self.fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        results = {
            'persons_detected': 0,
            'persons_tracked': [],
            'processing_time': 0,
            'frame_count': 0
        }
        
        frame_num = 0
        start_time = datetime.now()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_num += 1
            if frame_num % 5 != 0:  # Process every 5th frame to speed up
                continue
            
            # Detect persons in frame
            detections = detector_instance.detect_persons(frame)
            
            for detection in detections:
                person_id = reid_instance.find_existing_person(detection, camera_id)
                
                if person_id is None:
                    # New person detected
                    person_id = db_instance.get_next_person_id()
                    reid_instance.add_to_memory(person_id, detection, camera_id)
                    results['persons_detected'] += 1
                
                # Save frame image
                timestamp = self.get_timestamp()
                image_path = detector_instance.save_frame_image(
                    frame, person_id, detection['type'], camera_id, timestamp
                )
                
                # Add to database
                face_encoding = detection.get('encoding')
                body_features = detection.get('features')
                
                db_instance.add_person(
                    person_id=person_id,
                    camera_id=camera_id,
                    timestamp=timestamp,
                    image_path=image_path,
                    face_encoding=face_encoding,
                    body_features=body_features
                )
            
            results['frame_count'] += 1
        
        cap.release()
        results['processing_time'] = (datetime.now() - start_time).total_seconds()
        
        return results
    
    def process_webcam_frame(self, frame, camera_id: str) -> List[Dict]:
        """Process a single webcam frame and return person detections with IDs"""
        detections = detector_instance.detect_persons(frame)
        annotated_detections = []
        
        for detection in detections:
            person_id = reid_instance.find_existing_person(detection, camera_id)
            
            if person_id is None:
                # New person detected
                person_id = db_instance.get_next_person_id()
                reid_instance.add_to_memory(person_id, detection, camera_id)
            
            # Annotate frame with person ID
            top, right, bottom, left = detection['location']
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, person_id, (left, top - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            
            annotated_detections.append({
                'person_id': person_id,
                'location': detection['location'],
                'confidence': detection.get('confidence', 0.8),
                'type': detection['type']
            })
        
        return annotated_detections
    
    def get_timestamp(self) -> str:
        """Get current timestamp as string"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def generate_video_frames(self, video_path: str, camera_id: str) -> Generator[Tuple[bytes, str], None, None]:
        """Generate frames for video playback with annotations"""
        cap = cv2.VideoCapture(video_path)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every 10th frame for real-time display
            if self.frame_count % 10 == 0:
                # Add person detection annotations
                detections = detector_instance.detect_persons(frame)
                for detection in detections:
                    person_id = reid_instance.find_existing_person(detection, camera_id)
                    
                    if person_id is None:
                        person_id = db_instance.get_next_person_id()
                        reid_instance.add_to_memory(person_id, detection, camera_id)
                    
                    top, right, bottom, left = detection['location']
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                    cv2.putText(frame, person_id, (left, top - 10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        cap.release()

# Global instance
processor_instance = VideoProcessor()