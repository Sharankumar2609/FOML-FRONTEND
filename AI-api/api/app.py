from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import numpy as np
import os
import ktrain

# Local imports
from src.agent import PetitionAnalyzer
from api.model import PetitionRequest, PetitionResponse

# --- Environment & Predictor ---
os.environ['TF_USE_LEGACY_KERAS'] = 'True'
predictor_file_path = 'd://HACKFEST/twitter_disaster_predictor'
predictor = ktrain.load_predictor(predictor_file_path)

# --- FastAPI app setup ---
app = FastAPI(
    title="Petition Analysis API",
    description="API for analyzing government petitions in the Indian context",
    version="1.0.0"
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

petition_analyzer = PetitionAnalyzer()

# --- Utilities ---
def make_serializable(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.float32):
        return float(obj)
    if isinstance(obj, np.float64):
        return float(obj)
    return obj

# --- Endpoints ---

@app.get("/")
async def root():
    """Root endpoint that returns API information."""
    return {
        "message": "Welcome to the Petition Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "/analyze": "POST - Analyze a petition using LangChain",
            "/verify": "POST - Verify if a petition is disaster-related"
        }
    }

@app.post("/analyze", response_model=PetitionResponse)
async def analyze_petition(request: PetitionRequest):
    """
    Analyze a petition and return structured results (via LangChain agent).
    """
    try:
        result = petition_analyzer.get_response(
            petition_text=request.petition_text,
            additional_context=request.additional_context
        )
        return PetitionResponse(success=True, data=result.dict())
    except Exception as e:
        return PetitionResponse(success=False, error=str(e))

# New input model for verification
class VerificationRequest(BaseModel):
    petition: str

@app.post("/verify")
async def verify_petition(request: VerificationRequest):
    """
    Verify if the petition text is disaster-related using the ML model.
    """
    try:
        petition = request.petition

        if not petition.strip():
            raise HTTPException(status_code=400, detail="Petition must be a non-empty string")

        prediction = predictor.predict(petition)
        confidence = predictor.predict_proba(petition)

        return {
            'text': petition,
            'prediction': make_serializable(prediction),
            'confidence': make_serializable(confidence),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "The API is running smoothly."}
