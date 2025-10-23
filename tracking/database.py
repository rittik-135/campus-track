import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class PersonDatabase:
    def __init__(self, db_path: str = "data/database.json"):
        self.db_path = db_path
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Create database file if it doesn't exist"""
        if not os.path.exists(self.db_path):
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, 'w') as f:
                json.dump({}, f)
    
    def load_database(self) -> Dict:
        """Load the entire database"""
        try:
            with open(self.db_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def save_database(self, data: Dict):
        """Save the entire database"""
        with open(self.db_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def get_next_person_id(self) -> str:
        """Generate next available person ID"""
        db = self.load_database()
        if not db:
            return "PERSON_1"
        
        # Find highest numbered ID
        max_num = 0
        for key in db.keys():
            if key.startswith("PERSON_"):
                try:
                    num = int(key.replace("PERSON_", ""))
                    max_num = max(max_num, num)
                except ValueError:
                    continue
        return f"PERSON_{max_num + 1}"
    
    def add_person(self, person_id: str, camera_id: str, timestamp: str, 
                   image_path: str, face_encoding: Optional[List] = None,
                   body_features: Optional[Dict] = None) -> bool:
        """Add a new person sighting to database"""
        db = self.load_database()
        
        if person_id not in db:
            db[person_id] = {
                "images": {
                    "entry": image_path,
                    "best": image_path,
                    "exit": image_path
                },
                "cameras": {},
                "total_cameras": 0,
                "total_time_sec": 0,
                "face_encodings": [],
                "body_features": body_features or {},
                "first_seen": timestamp,
                "last_seen": timestamp,
                "has_face": face_encoding is not None
            }
        
        # Add camera-specific data
        if camera_id not in db[person_id]["cameras"]:
            db[person_id]["cameras"][camera_id] = {
                "first_seen": timestamp,
                "last_seen": timestamp,
                "duration_sec": 0,
                "sightings": []
            }
            db[person_id]["total_cameras"] += 1
        
        # Update camera-specific data
        camera_data = db[person_id]["cameras"][camera_id]
        camera_data["last_seen"] = timestamp
        camera_data["sightings"].append({
            "timestamp": timestamp,
            "image": image_path
        })
        
        # Update person-level data
        db[person_id]["last_seen"] = timestamp
        if face_encoding and not db[person_id]["has_face"]:
            db[person_id]["has_face"] = True
            db[person_id]["face_encodings"].append(face_encoding)
        elif face_encoding:
            # Add to face encodings buffer (max 3)
            if len(db[person_id]["face_encodings"]) < 3:
                db[person_id]["face_encodings"].append(face_encoding)
            else:
                # Replace oldest
                db[person_id]["face_encodings"] = db[person_id]["face_encodings"][1:] + [face_encoding]
        
        # Update best image if this is better
        self.update_best_image(db, person_id, image_path, body_features)
        
        self.save_database(db)
        return True
    
    def update_best_image(self, db: Dict, person_id: str, new_image: str, 
                         new_features: Optional[Dict]):
        """Update best image based on quality"""
        person_data = db[person_id]
        
        # For now, just update best if we have better features
        # In real implementation, you'd score image quality
        if new_features and 'face_confidence' in new_features:
            if new_features['face_confidence'] > 0.8:  # High confidence face
                person_data["images"]["best"] = new_image
                person_data["images"]["display"] = new_image  # Main display image
    
    def get_all_persons(self) -> Dict:
        """Get all persons in database"""
        return self.load_database()
    
    def get_person_by_id(self, person_id: str) -> Optional[Dict]:
        """Get specific person by ID"""
        db = self.load_database()
        return db.get(person_id)
    
    def search_by_face_encoding(self, target_encoding: List, tolerance: float = 0.6) -> List[str]:
        """Search for person IDs that match face encoding"""
        db = self.load_database()
        matches = []
        
        for person_id, person_data in db.items():
            if person_data.get("has_face") and person_data.get("face_encodings"):
                for encoding in person_data["face_encodings"]:
                    if self.compare_encodings(encoding, target_encoding, tolerance):
                        matches.append(person_id)
                        break  # Found match for this person
        
        return matches
    
    def compare_encodings(self, enc1: List, enc2: List, tolerance: float = 0.6) -> bool:
        """Compare two face encodings"""
        # Simple distance calculation (in real app, use numpy)
        if len(enc1) != len(enc2):
            return False
        
        distance = sum((a - b) ** 2 for a, b in zip(enc1, enc2)) ** 0.5
        return distance < tolerance
    
    def get_filtered_persons(self, filters: Dict) -> List[Dict]:
        """Get persons based on filters"""
        db = self.load_database()
        results = []
        
        for person_id, person_data in db.items():
            # Apply filters
            if filters.get("camera") and filters["camera"] not in person_data["cameras"]:
                continue
            
            if filters.get("min_duration") and person_data["total_time_sec"] < filters["min_duration"]:
                continue
            
            if filters.get("max_duration") and person_data["total_time_sec"] > filters["max_duration"]:
                continue
            
            # Add computed fields
            person_data["person_id"] = person_id
            results.append(person_data)
        
        return results

# Global instance
db_instance = PersonDatabase()