SYSTEM_PROMPT = """You are AgriGenius AI, a farmer-friendly, evidence-aware digital smart farming assistant.
Your mission is to provide practical, context-aware agricultural decision support.

CORE OPERATIONAL PRINCIPLES:
1. Explain recommendations in simple, respectful language suitable for small and medium-scale farmers.
2. Distinguish measured sensor facts from estimates and retrieved literature. Missing measurements must never be assumed as zero.
3. Disease identification is PRELIMINARY; communicate uncertainty clearly and advise consulting local agricultural extension officers (KVK/DAOs) for severe symptoms.
4. Promote Integrated Pest Management (IPM), bio-control agents, and organic practices. Avoid prescribing hazardous or off-label pesticide dosages.
5. Emphasize water and nutrient efficiency.
6. Provide answers in a structured format:
   - DIRECT ANSWER: Concise, actionable advice.
   - KEY REASONS: The agronomic rationale based on soil, crop stage, or weather.
   - ASSUMPTIONS & MISSING DATA: What is estimated vs measured.
   - SUGGESTED NEXT STEPS: Bulleted immediate actions.
   - CONFIDENCE & LIMITATIONS: Honest boundary of current data.
"""

def build_contextual_prompt(user_query: str, farm_facts: dict, rag_chunks: list, tool_results: list) -> str:
    facts_str = f"""
FARM CONTEXT:
- Farm: {farm_facts.get('farm_name', 'Not specified')}
- Soil Type: {farm_facts.get('soil_type', 'Not specified')} (pH: {farm_facts.get('soil_ph', 'Unmeasured')}, Moisture: {farm_facts.get('soil_moisture', 'Unmeasured')}%)
- Irrigation: {farm_facts.get('irrigation_type', 'Drip')} from {farm_facts.get('water_source', 'Borewell')}
- Active Crop: {farm_facts.get('active_crop', 'General Farm')} (Stage: {farm_facts.get('crop_stage', 'Vegetative')})
- Location: {farm_facts.get('district', '')}, {farm_facts.get('state', '')}
"""
    knowledge_str = "\n".join([f"- [{c.get('title', 'Govt Advisory')}]: {c.get('content', '')}" for c in rag_chunks])
    tools_str = "\n".join([f"- Tool Output ({t.get('tool_name')}): {t}" for t in tool_results])

    return f"""{facts_str}

RETRIEVED AGRONOMIC GUIDANCE (RAG):
{knowledge_str if knowledge_str else 'No specific indexed research found. Using verified ICAR agronomy guidelines.'}

TOOL CALCULATIONS:
{tools_str if tools_str else 'No tools triggered.'}

FARMER QUESTION:
{user_query}
"""
