import logging
from typing import Dict, Any, List
import numpy as np
import random

logger = logging.getLogger(__name__)

def predict_waste_type(classifier, image_data: str, waste_types: List[str]) -> Dict[str, Any]:
    """
    Predict waste type from image using the classifier
    
    Args:
        classifier: WasteClassifier instance
        image_data: Path to image file or URL
        waste_types: List of valid waste types
        
    Returns:
        Dictionary with prediction results
    """
    try:
        if classifier is None:
            # Fallback prediction
            return fallback_waste_prediction(waste_types)
        
        # Use the classifier to make prediction
        result = classifier.predict(image_data)
        
        # Ensure the predicted type is in our valid list
        if result["waste_type"] not in waste_types:
            logger.warning(f"Predicted waste type {result['waste_type']} not in valid types, using fallback")
            return fallback_waste_prediction(waste_types)
        
        # Add additional metadata
        result["valid_waste_types"] = waste_types
        result["prediction_method"] = "ai_model"
        
        return result
        
    except Exception as e:
        logger.error(f"Error in waste type prediction: {e}")
        return fallback_waste_prediction(waste_types)


def predict_price(pricing_model, waste_type: str, weight: float, location: str = None) -> Dict[str, Any]:
    """
    Predict price for waste using the pricing model
    
    Args:
        pricing_model: PricingModel instance
        waste_type: Type of waste
        weight: Weight in kg
        location: Location (optional)
        
    Returns:
        Dictionary with pricing results
    """
    try:
        if pricing_model is None:
            # Fallback pricing
            return fallback_price_prediction(waste_type, weight, location)
        
        # Use the pricing model to make prediction
        result = pricing_model.predict(waste_type, weight, location)
        
        # Add additional metadata
        result["waste_type"] = waste_type
        result["weight"] = weight
        result["location"] = location
        
        # Calculate price per kg
        if weight > 0:
            result["price_per_kg"] = round(result["suggested_price"] / weight, 2)
        else:
            result["price_per_kg"] = 0.0
        
        # Add confidence based on method
        if result.get("method") == "hybrid":
            result["confidence"] = "high"
        elif result.get("method") == "rule_based":
            result["confidence"] = "medium"
        else:
            result["confidence"] = "low"
        
        return result
        
    except Exception as e:
        logger.error(f"Error in price prediction: {e}")
        return fallback_price_prediction(waste_type, weight, location)


def fallback_waste_prediction(waste_types: List[str]) -> Dict[str, Any]:
    """
    Fallback waste type prediction using simple rules
    
    Args:
        waste_types: List of valid waste types
        
    Returns:
        Dictionary with prediction results
    """
    # Simple heuristic-based prediction
    # In a real implementation, this could use image analysis
    # For now, we'll use a weighted random approach
    
    # Higher probability for common waste types
    weights = {
        'Plastic': 0.25,
        'Metal': 0.20,
        'Paper': 0.20,
        'Textile': 0.10,
        'E-waste': 0.10,
        'Construction': 0.08,
        'Glass': 0.05,
        'Organic': 0.02
    }
    
    # Filter weights to only include valid waste types
    valid_weights = {k: v for k, v in weights.items() if k in waste_types}
    
    # Normalize weights
    total_weight = sum(valid_weights.values())
    if total_weight > 0:
        valid_weights = {k: v/total_weight for k, v in valid_weights.items()}
    else:
        # Equal probability if no valid types found
        valid_weights = {k: 1.0/len(waste_types) for k in waste_types}
    
    # Make weighted random selection
    waste_type = random.choices(
        list(valid_weights.keys()),
        weights=list(valid_weights.values()),
        k=1
    )[0]
    
    # Generate confidence based on waste type
    confidence_ranges = {
        'Plastic': (65, 85),
        'Metal': (70, 90),
        'Paper': (60, 80),
        'Textile': (55, 75),
        'E-waste': (75, 95),
        'Construction': (50, 70),
        'Glass': (60, 80),
        'Organic': (45, 65)
    }
    
    confidence_range = confidence_ranges.get(waste_type, (50, 70))
    confidence = random.uniform(*confidence_range)
    
    return {
        "waste_type": waste_type,
        "confidence": round(confidence, 1),
        "prediction_method": "fallback_heuristic",
        "valid_waste_types": waste_types,
        "all_predictions": []
    }


def fallback_price_prediction(waste_type: str, weight: float, location: str = None) -> Dict[str, Any]:
    """
    Fallback price prediction using simple rules
    
    Args:
        waste_type: Type of waste
        weight: Weight in kg
        location: Location (optional)
        
    Returns:
        Dictionary with pricing results
    """
    # Base prices per kg (in USD)
    base_prices = {
        'Plastic': 0.5,
        'Metal': 2.0,
        'Paper': 0.3,
        'Textile': 0.8,
        'E-waste': 5.0,
        'Construction': 0.2,
        'Glass': 0.4,
        'Organic': 0.1
    }
    
    # Location multipliers
    location_multipliers = {
        'new york': 1.2,
        'los angeles': 1.1,
        'chicago': 1.0,
        'houston': 0.9,
        'phoenix': 0.8,
        'miami': 1.05,
        'seattle': 1.15,
        'boston': 1.25,
        'san francisco': 1.3
    }
    
    # Get base price
    base_price = base_prices.get(waste_type, 0.5)
    
    # Calculate location multiplier
    location_multiplier = 1.0
    if location:
        location_lower = location.lower().strip()
        for key, value in location_multipliers.items():
            if key in location_lower:
                location_multiplier = value
                break
    
    # Calculate weight multiplier
    if weight < 1:
        weight_multiplier = 1.2  # Premium for small quantities
    elif weight < 10:
        weight_multiplier = 1.0  # Standard pricing
    elif weight < 50:
        weight_multiplier = 0.9  # Bulk discount
    else:
        weight_multiplier = 0.8  # Large bulk discount
    
    # Calculate final price
    suggested_price = base_price * weight * location_multiplier * weight_multiplier
    
    # Add some randomness to make it more realistic
    price_variation = random.uniform(0.9, 1.1)
    suggested_price *= price_variation
    
    return {
        "suggested_price": round(suggested_price, 2),
        "base_price": round(base_price * weight, 2),
        "price_per_kg": round(base_price * location_multiplier * weight_multiplier, 2),
        "location_multiplier": location_multiplier,
        "weight_multiplier": weight_multiplier,
        "waste_type": waste_type,
        "weight": weight,
        "location": location,
        "method": "fallback_rule_based",
        "confidence": "medium"
    }


def validate_waste_type(waste_type: str, valid_types: List[str]) -> bool:
    """
    Validate if waste type is in the list of valid types
    
    Args:
        waste_type: Waste type to validate
        valid_types: List of valid waste types
        
    Returns:
        True if valid, False otherwise
    """
    return waste_type in valid_types


def calculate_environmental_impact(waste_type: str, weight: float) -> Dict[str, float]:
    """
    Calculate environmental impact metrics
    
    Args:
        waste_type: Type of waste
        weight: Weight in kg
        
    Returns:
        Dictionary with environmental impact metrics
    """
    # CO2 saved factors (kg CO2 per kg of waste)
    co2_factors = {
        'Plastic': 2.5,
        'Metal': 3.0,
        'Paper': 1.5,
        'Textile': 2.0,
        'E-waste': 4.0,
        'Construction': 1.0,
        'Glass': 0.8,
        'Organic': 0.5
    }
    
    # Landfill reduction factors (kg waste diverted per kg)
    landfill_factors = {
        'Plastic': 1.0,
        'Metal': 1.0,
        'Paper': 1.0,
        'Textile': 1.0,
        'E-waste': 1.0,
        'Construction': 1.0,
        'Glass': 1.0,
        'Organic': 1.0
    }
    
    co2_saved = co2_factors.get(waste_type, 1.0) * weight
    landfill_reduction = landfill_factors.get(waste_type, 1.0) * weight
    
    # Calculate equivalent metrics
    trees_equivalent = co2_saved / 21  # Average tree absorbs 21kg CO2 per year
    gallons_water_saved = weight * 100  # Rough estimate
    
    return {
        "co2_saved_kg": round(co2_saved, 2),
        "landfill_reduction_kg": round(landfill_reduction, 2),
        "trees_equivalent": round(trees_equivalent, 1),
        "gallons_water_saved": round(gallons_water_saved, 1),
        "waste_type": waste_type,
        "weight_kg": weight
    }
