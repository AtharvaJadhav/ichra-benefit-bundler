from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class BenefitType(str, Enum):
    HEALTH_INSURANCE = "health_insurance"
    DENTAL = "dental"
    VISION = "vision"
    PRESCRIPTION = "prescription"
    MENTAL_HEALTH = "mental_health"
    WELLNESS = "wellness"

class CoverageLevel(str, Enum):
    INDIVIDUAL = "individual"
    FAMILY = "family"
    EMPLOYEE_AND_SPOUSE = "employee_and_spouse"
    EMPLOYEE_AND_CHILDREN = "employee_and_children"

class BundleStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"

class MetalLevel(str, Enum):
    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"
    CATASTROPHIC = "Catastrophic"

class MarketCoverage(str, Enum):
    INDIVIDUAL = "Individual"
    SHOP = "SHOP (Small Group)"
    BOTH = "Both"

# CMS PUF Data Models
class CMSPlanAttributes(BaseModel):
    business_year: str
    state_code: str
    issuer_id: str
    issuer_market_place_marketing_name: str
    source_name: str
    import_date: str
    market_coverage: str
    dental_only_plan: str
    standard_component_id: str
    plan_marketing_name: str
    hios_product_id: str
    network_id: str
    service_area_id: str
    formulary_id: Optional[str]
    is_new_plan: str
    plan_type: str
    metal_level: str
    design_type: str
    unique_plan_design: Optional[str]
    qhp_non_qhp_type_id: Optional[str]
    plan_id: str
    plan_variant_marketing_name: str
    csr_variation_type: Optional[str]
    issuer_actuarial_value: Optional[str]
    av_calculator_output_number: Optional[str]
    is_hsa_eligible: Optional[str]
    hsa_or_hra_employer_contribution: Optional[str]
    hsa_or_hra_employer_contribution_amount: Optional[str]

class CMSServiceArea(BaseModel):
    business_year: str
    state_code: str
    issuer_id: str
    source_name: str
    import_date: str
    service_area_id: str
    service_area_name: str
    cover_entire_state: str
    county: Optional[str]
    partial_county: Optional[str]
    zip_codes: Optional[str]
    partial_county_justification: Optional[str]
    market_coverage: str
    dental_only_plan: str

class CMSRate(BaseModel):
    business_year: str
    state_code: str
    issuer_id: str
    source_name: str
    import_date: str
    rate_effective_date: str
    rate_expiration_date: str
    plan_id: str
    rating_area_id: str
    tobacco: Optional[str]
    age: str
    individual_rate: Optional[str]
    individual_tobacco_rate: Optional[str]
    couple: Optional[str]
    primary_subscriber_and_one_dependent: Optional[str]
    primary_subscriber_and_two_dependents: Optional[str]
    primary_subscriber_and_three_or_more_dependents: Optional[str]
    couple_and_one_dependent: Optional[str]
    couple_and_two_dependents: Optional[str]
    couple_and_three_or_more_dependents: Optional[str]

class CMSBenefits(BaseModel):
    business_year: str
    state_code: str
    issuer_id: str
    source_name: str
    import_date: str
    standard_component_id: str
    plan_id: str
    benefit_name: str
    copay_inn_tier1: Optional[str]
    copay_inn_tier2: Optional[str]
    copay_outof_net: Optional[str]
    coins_inn_tier1: Optional[str]
    coins_inn_tier2: Optional[str]
    coins_outof_net: Optional[str]
    is_ehb: Optional[str]
    is_covered: Optional[str]
    quant_limit_on_svc: Optional[str]
    limit_qty: Optional[str]
    limit_unit: Optional[str]
    exclusions: Optional[str]
    explanation: Optional[str]
    ehb_var_reason: Optional[str]
    is_excl_from_inn_moop: Optional[str]
    is_excl_from_oon_moop: Optional[str]

class Benefit(BaseModel):
    id: str
    name: str
    type: BenefitType
    provider: str
    monthly_premium: float
    annual_deductible: float
    coinsurance_rate: float
    copay_amount: Optional[float] = None
    max_out_of_pocket: float
    coverage_details: Dict[str, Any]
    network_type: str
    prescription_coverage: bool = False
    mental_health_coverage: bool = False
    wellness_benefits: List[str] = []

class Bundle(BaseModel):
    id: str
    name: str
    description: str
    benefits: List[Benefit]
    total_monthly_premium: float
    total_annual_deductible: float
    total_max_out_of_pocket: float
    status: BundleStatus = BundleStatus.DRAFT
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}

class BundleRequest(BaseModel):
    name: str
    description: str
    benefit_types: List[BenefitType]
    coverage_level: CoverageLevel
    budget_constraint: Optional[float] = None
    preferred_providers: Optional[List[str]] = None
    required_benefits: Optional[List[str]] = None
    max_deductible: Optional[float] = None
    max_out_of_pocket: Optional[float] = None
    network_preferences: Optional[List[str]] = None

class BundleResponse(BaseModel):
    success: bool
    bundle: Optional[Bundle] = None
    message: str
    errors: Optional[List[str]] = None

class PlanFeature(BaseModel):
    plan_id: str
    monthly_premium: float
    deductible: float
    out_of_pocket_max: float
    hsa_eligible: bool
    actuarial_value: float = Field(ge=0, le=1)
    network_tier: str = Field(pattern="^(bronze|silver|gold|platinum)$")
    # Additional CMS-specific fields
    state_code: str
    issuer_id: str
    plan_marketing_name: str
    metal_level: str
    plan_type: str
    market_coverage: str
    dental_only_plan: bool = False
    service_area_id: Optional[str] = None
    network_id: Optional[str] = None

class EmployeeProfile(BaseModel):
    age: int
    risk_score: float = Field(ge=0, le=1)
    budget_cap: float
    preference_weights: Dict[str, float] = Field(default_factory=lambda: {
        "cost": 0.4,
        "coverage": 0.3,
        "network": 0.2,
        "flexibility": 0.1
    })

class BundleResult(BaseModel):
    selected_plan: PlanFeature
    utility_score: float
    total_cost: float
    optimization_time_ms: float 