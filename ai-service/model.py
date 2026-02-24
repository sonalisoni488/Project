import os
import json
import numpy as np
import pickle
from typing import List, Optional, Dict, Any
import logging
from PIL import Image
import requests
from io import BytesIO

logger = logging.getLogger(__name__)

class WasteClassifier:
    """Waste classification model using transfer learning"""
    
    def __init__(self, model_path: str, model_file: str):
        """
        Initialize the waste classifier
        
        Args:
            model_path: Path to model directory
            model_file: Name of model file
        """
        self.model_path = model_path
        self.model_file = model_file
        self.model = None
        self.class_names = [
            'Plastic', 'Metal', 'Paper', 'Textile', 
            'E-waste', 'Construction', 'Glass', 'Organic'
        ]
        
        # Try to load the model
        self._load_model()
    
    def _load_model(self):
        """Load the classification model"""
        try:
            model_full_path = os.path.join(self.model_path, self.model_file)
            
            if os.path.exists(model_full_path):
                # Try to load with TensorFlow first
                try:
                    import tensorflow as tf
                    self.model = tf.keras.models.load_model(model_full_path)
                    logger.info("TensorFlow model loaded successfully")
                    return
                except ImportError:
                    logger.warning("TensorFlow not available, trying PyTorch...")
                except Exception as e:
                    logger.warning(f"Failed to load TensorFlow model: {e}")
                
                # Try PyTorch
                try:
                    import torch
                    self.model = torch.load(model_full_path, map_location='cpu')
                    self.model.eval()
                    logger.info("PyTorch model loaded successfully")
                    return
                except ImportError:
                    logger.warning("PyTorch not available")
                except Exception as e:
                    logger.warning(f"Failed to load PyTorch model: {e}")
            
            logger.warning("No pre-trained model found, using fallback classification")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for prediction
        
        Args:
            image_path: Path to image file or URL
            
        Returns:
            Preprocessed image array
        """
        try:
            # Load image
            if image_path.startswith('http'):
                response = requests.get(image_path)
                image = Image.open(BytesIO(response.content))
            else:
                image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to expected input size
            image = image.resize((224, 224))
            
            # Convert to numpy array and normalize
            image_array = np.array(image) / 255.0
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Predict waste type from image
        
        Args:
            image_path: Path to image file or URL
            
        Returns:
            Dictionary with prediction results
        """
        try:
            if self.model is None:
                # Fallback prediction based on simple heuristics
                return self._fallback_predict(image_path)
            
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            
            # Make prediction
            if hasattr(self.model, 'predict'):  # TensorFlow/Keras
                predictions = self.model.predict(processed_image)
                predicted_class_idx = np.argmax(predictions[0])
                confidence = float(np.max(predictions[0]))
            else:  # PyTorch
                import torch
                with torch.no_grad():
                    image_tensor = torch.FloatTensor(processed_image).permute(0, 3, 1, 2)
                    outputs = self.model(image_tensor)
                    probabilities = torch.softmax(outputs, dim=1)
                    predicted_class_idx = torch.argmax(probabilities, dim=1).item()
                    confidence = float(torch.max(probabilities).item())
            
            predicted_class = self.class_names[predicted_class_idx]
            
            return {
                "waste_type": predicted_class,
                "confidence": confidence * 100,  # Convert to percentage
                "all_predictions": self._get_all_predictions(predictions if hasattr(predictions, 'tolist') else probabilities)
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return self._fallback_predict(image_path)
    
    def _fallback_predict(self, image_path: str) -> Dict[str, Any]:
        """
        Fallback prediction using simple heuristics
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with prediction results
        """
        try:
            # Simple heuristic based on image properties
            if image_path.startswith('http'):
                response = requests.get(image_path)
                image = Image.open(BytesIO(response.content))
            else:
                image = Image.open(image_path)
            
            # Get basic image statistics
            width, height = image.size
            pixels = width * height
            
            # Simple rules (this is a very basic fallback)
            if pixels > 500000:  # Large images
                predicted_class = "Construction"
                confidence = 60.0
            elif width > height * 1.5:  # Wide images
                predicted_class = "E-waste"
                confidence = 55.0
            else:
                # Random prediction with moderate confidence
                import random
                predicted_class = random.choice(self.class_names)
                confidence = random.uniform(50.0, 70.0)
            
            return {
                "waste_type": predicted_class,
                "confidence": confidence,
                "fallback": True,
                "all_predictions": []
            }
            
        except Exception as e:
            logger.error(f"Error in fallback prediction: {e}")
            # Last resort
            import random
            predicted_class = random.choice(self.class_names)
            return {
                "waste_type": predicted_class,
                "confidence": 50.0,
                "fallback": True,
                "all_predictions": []
            }
    
    def _get_all_predictions(self, predictions) -> List[Dict[str, float]]:
        """Get all class predictions with confidence scores"""
        try:
            if hasattr(predictions, 'tolist'):
                predictions = predictions[0].tolist()
            elif hasattr(predictions, 'cpu'):
                predictions = predictions.cpu().numpy()[0]
            else:
                predictions = predictions[0]
            
            all_preds = []
            for i, class_name in enumerate(self.class_names):
                all_preds.append({
                    "class": class_name,
                    "confidence": float(predictions[i]) * 100
                })
            
            # Sort by confidence
            all_preds.sort(key=lambda x: x["confidence"], reverse=True)
            return all_preds
            
        except Exception as e:
            logger.error(f"Error getting all predictions: {e}")
            return []


class PricingModel:
    """Pricing prediction model for waste materials"""
    
    def __init__(self, model_path: str, model_file: str):
        """
        Initialize the pricing model
        
        Args:
            model_path: Path to model directory
            model_file: Name of model file
        """
        self.model_path = model_path
        self.model_file = model_file
        self.model = None
        
        # Load base pricing configuration
        self.base_prices = self._load_base_prices()
        self.location_multipliers = self._load_location_multipliers()
        
        # Try to load the trained model
        self._load_model()
    
    def _load_base_prices(self) -> Dict[str, float]:
        """Load base prices for different waste types"""
        try:
            # Try to load from environment or use defaults
            base_prices_str = os.getenv("BASE_PRICES")
            if base_prices_str:
                return json.loads(base_prices_str)
        except:
            pass
        
        # Default base prices per kg
        return {
            "Plastic": 0.5,
            "Metal": 2.0,
            "Paper": 0.3,
            "Textile": 0.8,
            "E-waste": 5.0,
            "Construction": 0.2,
            "Glass": 0.4,
            "Organic": 0.1
        }
    
    def _load_location_multipliers(self) -> Dict[str, float]:
        """Load location-based price multipliers"""
        try:
            # Try to load from environment or use defaults
            multipliers_str = os.getenv("LOCATION_MULTIPLIERS")
            if multipliers_str:
                return json.loads(multipliers_str)
        except:
            pass
        
        # Default location multipliers
        return {
            "New York": 1.2,
            "Los Angeles": 1.1,
            "Chicago": 1.0,
            "Houston": 0.9,
            "Phoenix": 0.8,
            "Miami": 1.05,
            "Seattle": 1.15,
            "Boston": 1.25,
            "San Francisco": 1.3
        }
    
    def _load_model(self):
        """Load the pricing model"""
        try:
            model_full_path = os.path.join(self.model_path, self.model_file)
            
            if os.path.exists(model_full_path):
                with open(model_full_path, 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("Pricing model loaded successfully")
            else:
                logger.warning("No pricing model found, using rule-based pricing")
                
        except Exception as e:
            logger.error(f"Error loading pricing model: {e}")
    
    def predict(self, waste_type: str, weight: float, location: str = None) -> Dict[str, Any]:
        """
        Predict price for waste material
        
        Args:
            waste_type: Type of waste
            weight: Weight in kg
            location: Location (optional)
            
        Returns:
            Dictionary with pricing information
        """
        try:
            # Get base price
            base_price = self.base_prices.get(waste_type, 0.5)
            
            # Calculate location multiplier
            location_multiplier = 1.0
            if location:
                location = location.strip()
                # Check for exact match first
                if location in self.location_multipliers:
                    location_multiplier = self.location_multipliers[location]
                else:
                    # Check for partial match (city name contains location key)
                    for key, value in self.location_multipliers.items():
                        if key.lower() in location.lower():
                            location_multiplier = value
                            break
            
            # Calculate weight-based adjustments
            weight_multiplier = self._calculate_weight_multiplier(weight)
            
            # Apply machine learning model if available
            if self.model is not None:
                try:
                    # Create features for the model
                    features = self._create_features(waste_type, weight, location)
                    ml_price = self.model.predict([features])[0]
                    
                    # Blend ML prediction with rule-based pricing
                    rule_based_price = base_price * weight * location_multiplier * weight_multiplier
                    final_price = (ml_price * 0.3) + (rule_based_price * 0.7)
                    
                    return {
                        "suggested_price": round(final_price, 2),
                        "base_price": round(base_price * weight, 2),
                        "location_multiplier": location_multiplier,
                        "weight_multiplier": weight_multiplier,
                        "ml_prediction": round(ml_price, 2),
                        "rule_based_price": round(rule_based_price, 2),
                        "method": "hybrid"
                    }
                except Exception as e:
                    logger.warning(f"ML prediction failed, using rule-based: {e}")
            
            # Rule-based pricing
            final_price = base_price * weight * location_multiplier * weight_multiplier
            
            return {
                "suggested_price": round(final_price, 2),
                "base_price": round(base_price * weight, 2),
                "location_multiplier": location_multiplier,
                "weight_multiplier": weight_multiplier,
                "method": "rule_based"
            }
            
        except Exception as e:
            logger.error(f"Error predicting price: {e}")
            # Fallback pricing
            fallback_price = self.base_prices.get(waste_type, 0.5) * weight
            return {
                "suggested_price": round(fallback_price, 2),
                "method": "fallback"
            }
    
    def _calculate_weight_multiplier(self, weight: float) -> float:
        """Calculate price multiplier based on weight"""
        if weight < 1:
            return 1.2  # Small quantities get premium
        elif weight < 10:
            return 1.0  # Standard pricing
        elif weight < 50:
            return 0.9  # Bulk discount
        else:
            return 0.8  # Large bulk discount
    
    def _create_features(self, waste_type: str, weight: float, location: str) -> List[float]:
        """Create feature vector for ML model"""
        # One-hot encode waste type
        waste_types = ['Plastic', 'Metal', 'Paper', 'Textile', 'E-waste', 'Construction', 'Glass', 'Organic']
        waste_features = [1.0 if wt == waste_type else 0.0 for wt in waste_types]
        
        # Numerical features
        weight_log = np.log1p(weight)
        weight_sqrt = np.sqrt(weight)
        
        # Location features (simplified)
        location_features = []
        if location:
            location_lower = location.lower()
            location_features = [
                1.0 if 'new york' in location_lower else 0.0,
                1.0 if 'los angeles' in location_lower else 0.0,
                1.0 if 'chicago' in location_lower else 0.0,
                1.0 if 'houston' in location_lower else 0.0,
                1.0 if 'miami' in location_lower else 0.0,
            ]
        else:
            location_features = [0.0] * 5
        
        return waste_features + [weight, weight_log, weight_sqrt] + location_features
