from pydantic import BaseModel
from typing import Literal

class RiskFinding(BaseModel):
    # Yahan apne variables aur unke types define karo
    # Example: name: str
    clause_text:str
    page_number:int
    section_title:str
    risk_level: Literal["Critical", "High", "Medium", "Low"]
    explanation:str
    recommendation:str
    