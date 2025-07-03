from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .domain import (
    BenefitType, CoverageLevel, BundleStatus, Benefit, Bundle, BundleRequest, BundleResponse,
    MetalLevel, MarketCoverage, CMSPlanAttributes, CMSServiceArea, CMSRate, CMSBenefits, PlanFeature, EmployeeProfile
)

# Re-export domain models as schemas for API use
__all__ = [
    "BenefitType",
    "CoverageLevel", 
    "BundleStatus",
    "Benefit",
    "Bundle",
    "BundleRequest",
    "BundleResponse",
    "MetalLevel",
    "MarketCoverage",
    "CMSPlanAttributes",
    "CMSServiceArea", 
    "CMSRate",
    "CMSBenefits",
    "PlanFeature"
]

# Additional API-specific schemas
class BundleListResponse(BaseModel):
    bundles: List[Bundle]
    total_count: int
    limit: int
    offset: int

class BundleSearchRequest(BaseModel):
    benefit_types: Optional[List[BenefitType]] = None
    max_budget: Optional[float] = None
    coverage_level: Optional[CoverageLevel] = None
    providers: Optional[List[str]] = None
    network_type: Optional[str] = None

class BundleComparisonRequest(BaseModel):
    bundle_ids: List[str] = Field(..., min_items=2, max_items=5)
    comparison_criteria: Optional[List[str]] = None

class BundleComparisonResponse(BaseModel):
    comparison_id: str
    bundles: List[Bundle]
    comparison_matrix: Dict[str, Dict[str, Any]]
    recommendations: List[str]

# CMS-specific schemas
class PlanSearchRequest(BaseModel):
    state_code: Optional[str] = None
    metal_level: Optional[MetalLevel] = None
    market_coverage: Optional[MarketCoverage] = None
    max_premium: Optional[float] = None
    dental_only: Optional[bool] = None
    hsa_eligible: Optional[bool] = None
    network_tier: Optional[str] = None

class PlanListResponse(BaseModel):
    plans: List[PlanFeature]
    total_count: int
    limit: int
    offset: int
    filters_applied: Dict[str, Any]

class PlanComparisonRequest(BaseModel):
    plan_ids: List[str] = Field(..., min_items=2, max_items=10)
    comparison_criteria: Optional[List[str]] = None

class PlanComparisonResponse(BaseModel):
    comparison_id: str
    plans: List[PlanFeature]
    comparison_matrix: Dict[str, Dict[str, Any]]
    recommendations: List[str]

class OptimizationRequest(BaseModel):
    age: int
    risk_score: float
    budget_cap: float
    state_code: str
    max_monthly_premium: Optional[float] = None
    min_actuarial_value: Optional[float] = None
    preferred_metal_level: Optional[str] = None
    preferred_plan_type: Optional[str] = None
    max_deductible: Optional[float] = None
    hsa_eligible_only: Optional[bool] = None
    required_benefits: Optional[List[str]] = None
    tobacco_preference: Optional[str] = None 