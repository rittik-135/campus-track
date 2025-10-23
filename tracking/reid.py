import numpy as np
from typing import List, Dict, Optional, Tuple
from tracking.database import db_instance
from tracking.detector import detector_instance

class PersonReID:
    def __init__(self):
        self.short_term_memory = {}  # Temporary storage for recent persons
        self.memory_duration = 60  # Keep in memory for 60 seconds
    
    def find_existing_person(self, detection: Dict, camera_id: str) -> Optional[str]:
        """Find if this person was seen before (in database or short-term memory)"""
        
        # First check short-term memory (for re-entries in same session)
        person_id = self.check_short_term_memory(detection, camera_id)
        if person_id:
            return person_id
        
        # Then check database for face matches
        if detection['type'] == 'face' and 'encoding' in detection:
            person_id = self.find_by_face_encoding(detection['encoding'])
            if person_id:
                return person_id
        
        # Then check database for body matches (if no face)
        if detection['type'] == 'body' and 'features' in detection:
            person_id = self.find_by_body_features(detection['features'])
            if person_id:
                return person_id
        
        return None
    
    def check_short_term_memory(self, detection: Dict, camera_id: str) -> Optional[str]:
        """Check if person was seen recently (for re-entries)"""
        current_time = self.get_current_timestamp()
        
        # Clean old entries
        expired_keys = []
        for key, data in self.short_term_memory.items():
            if (current_time - data['last_seen']) > self.memory_duration:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.short_term_memory[key]
        
        # Check for matches in memory
        for person_id, person_data in self.short_term_memory.items():
            if person_data['camera'] == camera_id:
                # Check if this is the same person
                if detection['type'] == 'face':
                    if 'encoding' in detection and 'encoding' in person_data:
                        if self.compare_face_encodings(detection['encoding'], person_data['encoding']):
                            person_data['last_seen'] = current_time
                            return person_id
                elif detection['type'] == 'body':
                    if 'features' in detection and 'features' in person_data:
                        if self.compare_body_features(detection['features'], person_data['features']):
                            person_data['last_seen'] = current_time
                            return person_id
        
        return None
    
    def find_by_face_encoding(self, target_encoding: List, tolerance: float = 0.6) -> Optional[str]:
        """Find person in database by face encoding"""
        try:
            return db_instance.search_by_face_encoding(target_encoding, tolerance)
        except Exception as e:
            print(f"Face search error: {e}")
            return None
    
    def find_by_body_features(self, target_features: Dict, tolerance: float = 0.3) -> Optional[str]:
        """Find person in database by body features"""
        try:
            db = db_instance.load_database()
            
            for person_id, person_data in db.items():
                if person_data.get('body_features'):
                    if self.compare_body_features(target_features, person_data['body_features'], tolerance):
                        return person_id
            return None
        except Exception as e:
            print(f"Body search error: {e}")
            return None
    
    def compare_face_encodings(self, enc1: List, enc2: List, tolerance: float = 0.6) -> bool:
        """Compare two face encodings"""
        return db_instance.compare_encodings(enc1, enc2, tolerance)
    
    def compare_body_features(self, features1: Dict, features2: Dict, tolerance: float = 0.3) -> bool:
        """Compare two body feature sets"""
        try:
            # Compare dominant colors
            if 'dominant_color' in features1 and 'dominant_color' in features2:
                color_diff = np.linalg.norm(
                    np.array(features1['dominant_color']) - np.array(features2['dominant_color'])
                )
                if color_diff > 50:  # Adjust tolerance as needed
                    return False
            
            # Compare aspect ratios
            if 'aspect_ratio' in features1 and 'aspect_ratio' in features2:
                ratio_diff = abs(features1['aspect_ratio'] - features2['aspect_ratio'])
                if ratio_diff > tolerance:
                    return False
            
            # Compare height ratios
            if 'height' in features1 and 'height' in features2:
                height_diff = abs(features1['height'] - features2['height']) / max(features1['height'], features2['height'])
                if height_diff > tolerance:
                    return False
            
            return True
        except Exception as e:
            print(f"Body feature comparison error: {e}")
            return False
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp as string"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def add_to_memory(self, person_id: str, detection: Dict, camera_id: str):
        """Add person to short-term memory"""
        current_time = self.get_current_timestamp()
        self.short_term_memory[person_id] = {
            'detection': detection,
            'camera': camera_id,
            'first_seen': current_time,
            'last_seen': current_time,
            'encoding': detection.get('encoding'),
            'features': detection.get('features')
        }

# Global instance
reid_instance = PersonReID()