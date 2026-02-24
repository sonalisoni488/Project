from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
import aiofiles
import tempfile
from typing import Dict, Any
import json
import logging

# Import our modules
from model import WasteClassifier, PricingModel
from predict import predict_waste_type, predict_price

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Waste2Resource AI Service",
    description="AI-powered waste classification and pricing service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
waste_classifier = None
pricing_model = None

# Waste types configuration
WASTE_TYPES = os.getenv("WASTE_TYPES", '["Plastic", "Metal", "Paper", "Textile", "E-waste", "Construction", "Glass", "Organic"]')
WASTE_TYPES = json.loads(WASTE_TYPES)

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global waste_classifier, pricing_model
    
    try:
        logger.info("Initializing AI models...")
        
        # Initialize waste classifier
        model_path = os.getenv("MODEL_PATH", "models/")
        classification_model = os.getenv("CLASSIFICATION_MODEL", "waste_classifier.h5")
        
        waste_classifier = WasteClassifier(model_path, classification_model)
        
        # Initialize pricing model
        pricing_model_file = os.getenv("PRICING_MODEL", "pricing_model.pkl")
        pricing_model = PricingModel(model_path, pricing_model_file)
        
        logger.info("AI models initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize models: {str(e)}")
        # Continue without models - will use fallback logic

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Waste2Resource AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "predict": "/predict",
            "price": "/price",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models": {
            "waste_classifier": waste_classifier is not None,
            "pricing_model": pricing_model is not None
        }
    }

@app.post("/predict")
async def predict_waste(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    image_url: str = None
):
    """
    Predict waste type from image
    
    Args:
        file: Uploaded image file
        image_url: URL of image (alternative to file upload)
    
    Returns:
        JSON response with predicted waste type and confidence
    """
    try:
        # Handle image input
        image_data = None
        
        if file and file.filename:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name
                
            # Schedule cleanup
            background_tasks.add_task(os.unlink, temp_file_path)
            image_data = temp_file_path
            
        elif image_url:
            image_data = image_url
        else:
            raise HTTPException(
                status_code=400, 
                detail="Either file or image_url must be provided"
            )
        
        # Make prediction
        result = predict_waste_type(waste_classifier, image_data, WASTE_TYPES)
        
        logger.info(f"Waste prediction: {result}")
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/price")
async def predict_waste_price(
    waste_type: str,
    weight: float,
    location: str = None
):
    """
    Predict price for waste based on type, weight, and location
    
    Args:
        waste_type: Type of waste
        weight: Weight in kg
        location: Location (optional)
    
    Returns:
        JSON response with suggested price
    """
    try:
        # Validate inputs
        if waste_type not in WASTE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid waste type. Must be one of: {WASTE_TYPES}"
            )
        
        if weight <= 0:
            raise HTTPException(
                status_code=400,
                detail="Weight must be greater than 0"
            )
        
        # Make prediction
        result = predict_price(pricing_model, waste_type, weight, location)
        
        logger.info(f"Price prediction: {result}")
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Price prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Price prediction failed: {str(e)}")

@app.post("/batch-predict")
async def batch_predict(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...)
):
    """
    Batch predict waste types from multiple images
    
    Args:
        files: List of uploaded image files
    
    Returns:
        JSON response with predictions for all images
    """
    try:
        if len(files) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 files allowed per batch"
            )
        
        results = []
        temp_files = []
        
        for file in files:
            if not file.filename:
                continue
                
            # Save file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_file_path = temp_file.name
                temp_files.append(temp_file_path)
            
            # Make prediction
            result = predict_waste_type(waste_classifier, temp_file_path, WASTE_TYPES)
            result["filename"] = file.filename
            results.append(result)
        
        # Schedule cleanup
        for temp_file in temp_files:
            background_tasks.add_task(os.unlink, temp_file)
        
        logger.info(f"Batch prediction completed for {len(results)} files")
        
        return JSONResponse(content={
            "predictions": results,
            "total": len(results)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/models/info")
async def get_models_info():
    """Get information about loaded models"""
    return {
        "waste_types": WASTE_TYPES,
        "models_loaded": {
            "waste_classifier": waste_classifier is not None,
            "pricing_model": pricing_model is not None
        },
        "model_paths": {
            "classification_model": os.getenv("CLASSIFICATION_MODEL", "waste_classifier.h5"),
            "pricing_model": os.getenv("PRICING_MODEL", "pricing_model.pkl")
        }
    }

@app.get("/stats")
async def get_service_stats():
    """Get service statistics"""
    return {
        "service": "Waste2Resource AI Service",
        "version": "1.0.0",
        "supported_waste_types": WASTE_TYPES,
        "endpoints": [
            {"path": "/predict", "method": "POST", "description": "Predict waste type from image"},
            {"path": "/price", "method": "POST", "description": "Predict price for waste"},
            {"path": "/batch-predict", "method": "POST", "description": "Batch predict waste types"},
            {"path": "/health", "method": "GET", "description": "Health check"},
            {"path": "/models/info", "method": "GET", "description": "Get model information"}
        ]
    }

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
