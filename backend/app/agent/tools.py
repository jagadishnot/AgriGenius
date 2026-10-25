import math
from typing import Dict, Any, Optional

def calculate_irrigation_guidance(
    crop_type: str,
    growth_stage: str,
    soil_type: str,
    soil_moisture: Optional[float],
    recent_rainfall_mm: float,
    temp_c: float,
    area_acres: float
) -> Dict[str, Any]:
    """Calculate irrigation requirement using crop coefficient Kc and moisture balance."""
    kc_table = {
        "sowing": 0.45,
        "vegetative": 0.75,
        "flowering": 1.15,
        "fruiting": 1.10,
        "maturity": 0.65,
        "harvested": 0.0,
    }
    kc = kc_table.get(growth_stage.lower(), 0.8)
    daily_eto = max(2.5, min(8.5, temp_c * 0.16))
    crop_water_mm = daily_eto * kc
    effective_rain = min(recent_rainfall_mm * 0.7, crop_water_mm * 2)

    deficit_mm = max(0.0, (crop_water_mm * 2) - effective_rain)
    urgency = "moderate"

    if soil_moisture is not None:
        if soil_moisture < 25:
            urgency = "critical"
            deficit_mm += 12
        elif soil_moisture < 40:
            urgency = "high"
            deficit_mm += 6
        elif soil_moisture > 75:
            urgency = "none"
            deficit_mm = 0.0

    liters_needed = int(deficit_mm * 4047 * max(0.1, area_acres))
    return {
        "tool_name": "calculate_irrigation_guidance",
        "deficit_mm": round(deficit_mm, 1),
        "liters_needed": liters_needed,
        "urgency": urgency,
        "kc_applied": kc,
        "assumptions": [
            "Estimates based on Hargreaves temperature-based ETo",
            "Effective rainfall efficiency estimated at 70%"
        ]
    }

def assess_disease_risk(temp_c: float, humidity: float, rain_mm: float) -> Dict[str, Any]:
    """Microclimate fungal and bacterial pest pressure analysis."""
    score = 20
    if humidity > 80:
        score += 35
    elif humidity > 65:
        score += 20
    if 22 <= temp_c <= 30:
        score += 25
    if rain_mm > 15:
        score += 20

    score = min(100, max(0, score))
    level = "low"
    if score >= 80:
        level = "severe"
    elif score >= 60:
        level = "high"
    elif score >= 40:
        level = "moderate"

    return {
        "tool_name": "assess_disease_risk",
        "risk_level": level,
        "risk_score": score,
        "alert": "Fungal spore germination alert" if score >= 60 else "Normal pest pressure"
    }
