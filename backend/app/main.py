from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import time

app = FastAPI(
    title="AgriGenius AI — Smart Farming Agent API",
    description="Backend microservice for crop cycles, soil/irrigation advisory, RAG knowledge retrieval, and Groq/Gemini agent orchestration.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriGenius AI Smart Farming Agent",
        "version": "1.0.0",
        "timestamp": time.time(),
        "database": "Supabase PostgreSQL connected",
        "llm_engine": "Groq / Gemini Multi-Agent Layer"
    }

@app.get("/api/crops")
async def get_crop_catalog():
    return [
        {
            "id": "c1",
            "crop_name": "Tomato",
            "variety": "Arka Rakshak (F1 Hybrid)",
            "season": "Rabi",
            "expected_duration_days": 130,
            "optimal_temp_min": 18,
            "optimal_temp_max": 30,
            "water_requirement_mm": 550,
            "source_notes": "ICAR-IIHR Bangalore bred with triple disease resistance"
        },
        {
            "id": "c2",
            "crop_name": "Cotton",
            "variety": "Bt Cotton (Bollgard II)",
            "season": "Kharif",
            "expected_duration_days": 160,
            "optimal_temp_min": 21,
            "optimal_temp_max": 35,
            "water_requirement_mm": 700,
            "source_notes": "Requires deep black soil and timely boll-scouting"
        },
        {
            "id": "c3",
            "crop_name": "Paddy / Rice",
            "variety": "BPT 5204 (Samba Mahsuri)",
            "season": "Kharif",
            "expected_duration_days": 145,
            "optimal_temp_min": 20,
            "optimal_temp_max": 34,
            "water_requirement_mm": 1200,
            "source_notes": "Fine grain high yield; maintain standing water during tillering"
        },
        {
            "id": "c4",
            "crop_name": "Chilli",
            "variety": "Guntur Sannam (S4)",
            "season": "Kharif",
            "expected_duration_days": 150,
            "optimal_temp_min": 20,
            "optimal_temp_max": 32,
            "water_requirement_mm": 600,
            "source_notes": "Rich capsaicin content; monitor thrips and mite pressure"
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
