import cv2
import numpy as np
import face_recognition
from typing import List, Tuple, Dict, Optional
import os

class PersonDetector:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
    
    def detect_faces(self, frame) -> List[Dict]:
        """Detect faces in frame and return face locations + encodings"""
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Find face locations and encodings
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
            
            faces = []
            for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
                faces.append({
                    'location': (top, right, bottom, left),
                    'encoding': encoding.tolist(),  # Convert to list for JSON
                    'confidence': 0.9,  # High confidence for face
                    'type': 'face'
                })
            
            return faces
        except Exception as e:
            print(f"Face detection error: {e}")
            return []
    
    def detect_bodies(self, frame) -> List[Dict]:
        """Detect bodies using simple HOG (faster than deep learning)"""
        try:
            # Convert to grayscale for HOG
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Simple body detection using HOG (faster than YOLO for demo)
            hog = cv2.HOGDescriptor()
            hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            
            # Detect people
            boxes, weights = hog.detectMultiScale(gray, winStride=(8, 8), padding=(32, 32), scale=1.05)
            
            bodies = []
            for (x, y, w, h) in boxes:
                # Extract body features (color histogram, height ratio, etc.)
                body_roi = frame[y:y+h, x:x+w]
                features = self.extract_body_features(body_roi)
                
                bodies.append({
                    'location': (y, x+w, y+h, x),
                    'features': features,
                    'confidence': 0.7 if weights[0] > 0.5 else 0.3,  # Simple confidence
                    'type': 'body'
                })
            
            return bodies
        except Exception as e:
            print(f"Body detection error: {e}")
            return []
    
    def extract_body_features(self, body_image) -> Dict:
        """Extract simple body features for matching"""
        if body_image.size == 0:
            return {}
        
        # Get dominant color (simplified)
        avg_color = np.mean(body_image, axis=(0, 1))
        
        # Get height/width ratio
        height, width = body_image.shape[:2]
        aspect_ratio = width / height if height > 0 else 1.0
        
        return {
            'dominant_color': avg_color.tolist(),
            'aspect_ratio': aspect_ratio,
            'height': height,
            'width': width
        }
    
    def detect_persons(self, frame) -> List[Dict]:
        """Detect both faces and bodies in frame"""
        faces = self.detect_faces(frame)
        bodies = self.detect_bodies(frame)
        
        # Combine results
        all_detections = faces + bodies
        
        # Sort by confidence (faces first, then bodies)
        all_detections.sort(key=lambda x: x.get('confidence', 0), reverse=True)
        
        return all_detections
    
    def save_frame_image(self, frame, person_id: str, detection_type: str, 
                        camera_id: str, timestamp: str) -> str:
        """Save frame with person to static/images/tracked/"""
        try:
            # Create directory if doesn't exist
            save_dir = f"static/images/tracked/{person_id}"
            os.makedirs(save_dir, exist_ok=True)
            
            # Generate filename
            filename = f"{person_id}_{detection_type}_{timestamp.replace(':', '-')}.jpg"
            filepath = os.path.join(save_dir, filename)
            
            # Save image
            cv2.imwrite(filepath, frame)
            
            # Return relative path for web access
            return f"images/tracked/{person_id}/{filename}"
        except Exception as e:
            print(f"Error saving image: {e}")
            return ""

# Global instance
detector_instance = PersonDetector()