from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FarmContext(BaseModel):
    farm_id: Optional[str] = None
    farm_name: Optional[str] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    soil_moisture: Optional[float] = None
    total_area: Optional[float] = None
    area_unit: Optional[str] = "acres"
    irrigation_type: Optional[str] = None
    water_source: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class CropContext(BaseModel):
    crop_cycle_id: Optional[str] = None
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    growth_stage: Optional[str] = None
    sowing_date: Optional[str] = None
    expected_harvest_date: Optional[str] = None

class AgentCitation(BaseModel):
    title: str
    category: str
    source_url: Optional[str] = None
    relevance_snippet: str

class AgentState(BaseModel):
    user_id: str
    goal: str
    farm_context: Optional[FarmContext] = None
    crop_context: Optional[CropContext] = None
    retrieved_chunks: List[Dict[str, Any]] = Field(default_factory=list)
    tool_results: List[Dict[str, Any]] = Field(default_factory=list)
    answer: Optional[str] = None
    direct_answer: Optional[str] = None
    key_reasons: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    confidence_limitations: Optional[str] = None
    citations: List[AgentCitation] = Field(default_factory=list)
    trace_metadata: Dict[str, Any] = Field(default_factory=dict)
