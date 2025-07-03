import redis
import json
import pandas as pd
import logging
import os
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.models.domain import Benefit, Bundle, PlanFeature, CMSPlanAttributes, CMSServiceArea, CMSRate, CMSBenefits

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataService:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.cms_loaded = False
        self.plan_attributes_df = None
        self.rate_df = None
        self.benefits_df = None
        self.service_area_df = None
        self.plans_cache = None
    
    async def get_benefits(self, benefit_types: Optional[List[str]] = None) -> List[Benefit]:
        """
        Retrieve available benefits from data source
        """
        # This would typically connect to a database or external API
        # For now, returning mock data
        mock_benefits = [
            Benefit(
                id="benefit_001",
                name="Blue Cross Blue Shield Gold Plan",
                type="health_insurance",
                provider="Blue Cross Blue Shield",
                monthly_premium=450.0,
                annual_deductible=1500.0,
                coinsurance_rate=0.2,
                copay_amount=25.0,
                max_out_of_pocket=6000.0,
                coverage_details={"in_network": True, "out_network": False},
                network_type="PPO",
                prescription_coverage=True,
                mental_health_coverage=True,
                wellness_benefits=["gym_membership", "health_coaching"]
            ),
            Benefit(
                id="benefit_002", 
                name="Delta Dental Premier",
                type="dental",
                provider="Delta Dental",
                monthly_premium=35.0,
                annual_deductible=50.0,
                coinsurance_rate=0.0,
                copay_amount=None,
                max_out_of_pocket=1000.0,
                coverage_details={"preventive": "100%", "basic": "80%", "major": "50%"},
                network_type="PPO",
                prescription_coverage=False,
                mental_health_coverage=False,
                wellness_benefits=[]
            )
        ]
        
        if benefit_types:
            return [b for b in mock_benefits if b.type in benefit_types]
        return mock_benefits
    
    async def save_bundle(self, bundle: Bundle) -> bool:
        """
        Save a bundle to the data store
        """
        try:
            bundle_data = bundle.model_dump()
            self.redis_client.setex(
                f"bundle:{bundle.id}",
                3600,  # 1 hour TTL
                json.dumps(bundle_data)
            )
            return True
        except Exception as e:
            logger.error(f"Error saving bundle: {e}")
            return False
    
    async def get_bundle(self, bundle_id: str) -> Optional[Bundle]:
        """
        Retrieve a bundle by ID
        """
        try:
            bundle_data = self.redis_client.get(f"bundle:{bundle_id}")
            if bundle_data:
                return Bundle(**json.loads(bundle_data))
            return None
        except Exception as e:
            logger.error(f"Error retrieving bundle: {e}")
            return None
    
    async def get_bundles(self, limit: int = 10, offset: int = 0) -> List[Bundle]:
        """
        Retrieve multiple bundles with pagination
        """
        try:
            # This is a simplified implementation
            # In a real application, you'd use a proper database
            bundle_keys = self.redis_client.keys("bundle:*")
            bundles = []
            
            for key in bundle_keys[offset:offset + limit]:
                bundle_data = self.redis_client.get(key)
                if bundle_data:
                    bundles.append(Bundle(**json.loads(bundle_data)))
            
            return bundles
        except Exception as e:
            logger.error(f"Error retrieving bundles: {e}")
            return []
    
    async def delete_bundle(self, bundle_id: str) -> bool:
        """
        Delete a bundle by ID
        """
        try:
            result = self.redis_client.delete(f"bundle:{bundle_id}")
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting bundle: {e}")
            return False

    def load_cms_data(self, data_directory: str = "data", plan_year: str = "2025") -> List[PlanFeature]:
        """
        Load CMS PUF data from CSV files and transform into PlanFeature objects. Only loads once per process.
        """
        if self.cms_loaded and self.plans_cache is not None:
            logger.info("CMS data already loaded, using cached data.")
            return self.plans_cache
        try:
            data_path = Path(data_directory)
            if not data_path.exists():
                logger.warning(f"Data directory {data_directory} does not exist")
                return []
            puf_files = {
                'plan_attributes': data_path / f"plan-attributes-puf-{plan_year}.csv",
                'rate': data_path / f"rate-puf-{plan_year}.csv", 
                'benefits': data_path / f"benefits-and-cost-sharing-puf-{plan_year}.csv",
                'service_area': data_path / f"service-area-puf-{plan_year}.csv"
            }
            self.plan_attributes_df = None
            self.rate_df = None
            self.benefits_df = None
            self.service_area_df = None
            if puf_files['plan_attributes'].exists():
                logger.info(f"Loading Plan Attributes PUF: {puf_files['plan_attributes']}")
                self.plan_attributes_df = pd.read_csv(puf_files['plan_attributes'], low_memory=False, nrows=1000)
                logger.info(f"Loaded {len(self.plan_attributes_df)} plan attributes records")
            else:
                logger.warning(f"Plan Attributes PUF not found: {puf_files['plan_attributes']}")
            if puf_files['rate'].exists():
                logger.info(f"Loading Rate PUF: {puf_files['rate']}")
                self.rate_df = pd.read_csv(puf_files['rate'], low_memory=False, nrows=1000)
                logger.info(f"Loaded {len(self.rate_df)} rate records")
            else:
                logger.warning(f"Rate PUF not found: {puf_files['rate']}")
            if puf_files['benefits'].exists():
                logger.info(f"Loading Benefits PUF: {puf_files['benefits']}")
                self.benefits_df = pd.read_csv(puf_files['benefits'], low_memory=False, nrows=1000)
                logger.info(f"Loaded {len(self.benefits_df)} benefits records")
            else:
                logger.warning(f"Benefits PUF not found: {puf_files['benefits']}")
            if puf_files['service_area'].exists():
                logger.info(f"Loading Service Area PUF: {puf_files['service_area']}")
                self.service_area_df = pd.read_csv(puf_files['service_area'], low_memory=False, nrows=1000)
                logger.info(f"Loaded {len(self.service_area_df)} service area records")
            else:
                logger.warning(f"Service Area PUF not found: {puf_files['service_area']}")
            if self.plan_attributes_df is None and self.rate_df is None:
                logger.info("PUF files not found, looking for generic CSV files...")
                csv_files = list(data_path.glob("*.csv"))
                if csv_files:
                    logger.info(f"Found {len(csv_files)} generic CSV files")
                    all_plans = []
                    for csv_file in csv_files:
                        plans = self._parse_cms_csv(csv_file)
                        all_plans.extend(plans)
                    self.plans_cache = all_plans
                    self.cms_loaded = True
                    return all_plans
                else:
                    logger.warning("No CSV files found")
                    return []
            all_plans = self._merge_puf_data(self.plan_attributes_df, self.rate_df, self.benefits_df, self.service_area_df)
            self.plans_cache = all_plans
            self.cms_loaded = True
            logger.info(f"Successfully loaded {len(all_plans)} plans from CMS PUF data (cached in memory)")
            return all_plans
        except Exception as e:
            logger.error(f"Error loading CMS data: {e}")
            return []

    def _parse_cms_csv(self, csv_file: Path) -> List[PlanFeature]:
        """
        Parse a generic CMS CSV file and extract plan features
        """
        try:
            df = pd.read_csv(csv_file, low_memory=False)
            plans = []
            
            for _, row in df.iterrows():
                plan = self._create_plan_feature_from_row(row)
                if plan:
                    plans.append(plan)
            
            return plans
        except Exception as e:
            logger.error(f"Error parsing CSV file {csv_file}: {e}")
            return []

    def _create_plan_feature_from_row(self, row: pd.Series) -> Optional[PlanFeature]:
        """
        Create a PlanFeature from a CSV row
        """
        try:
            # Extract basic plan information
            plan_id = str(row.get('PlanId', row.get('plan_id', '')))
            if not plan_id or plan_id == 'nan':
                return None
            
            # Extract premium (try different possible column names)
            premium = self._safe_float(row.get('IndividualRate', row.get('individual_rate', row.get('MonthlyPremium', 0))))
            
            # Extract deductible (try different possible column names)
            deductible = self._safe_float(row.get('Deductible', row.get('deductible', row.get('AnnualDeductible', 0))))
            
            # Extract out-of-pocket maximum
            oop_max = self._safe_float(row.get('OutOfPocketMax', row.get('out_of_pocket_max', row.get('MaxOutOfPocket', 0))))
            
            # Extract actuarial value
            av = self._safe_float(row.get('ActuarialValue', row.get('actuarial_value', row.get('AVCalculatorOutputNumber', 0.7))))
            
            # Determine network tier from actuarial value
            network_tier = self._determine_network_tier(av)
            
            # Extract HSA eligibility
            hsa_eligible = str(row.get('IsHSAEligible', row.get('is_hsa_eligible', 'No'))).lower() == 'yes'
            
            # Extract additional CMS-specific fields
            state_code = str(row.get('StateCode', row.get('state_code', '')))
            issuer_id = str(row.get('IssuerId', row.get('issuer_id', '')))
            plan_marketing_name = str(row.get('PlanMarketingName', row.get('plan_marketing_name', '')))
            metal_level = str(row.get('MetalLevel', row.get('metal_level', 'Silver')))
            plan_type = str(row.get('PlanType', row.get('plan_type', '')))
            market_coverage = str(row.get('MarketCoverage', row.get('market_coverage', '')))
            dental_only = str(row.get('DentalOnlyPlan', row.get('dental_only_plan', 'No'))).lower() == 'yes'
            service_area_id = str(row.get('ServiceAreaId', row.get('service_area_id', '')))
            network_id = str(row.get('NetworkId', row.get('network_id', '')))
            
            return PlanFeature(
                plan_id=plan_id,
                monthly_premium=premium,
                deductible=deductible,
                out_of_pocket_max=oop_max,
                hsa_eligible=hsa_eligible,
                actuarial_value=av,
                network_tier=network_tier,
                state_code=state_code,
                issuer_id=issuer_id,
                plan_marketing_name=plan_marketing_name,
                metal_level=metal_level,
                plan_type=plan_type,
                market_coverage=market_coverage,
                dental_only_plan=dental_only,
                service_area_id=service_area_id if service_area_id != 'nan' else None,
                network_id=network_id if network_id != 'nan' else None
            )
        except Exception as e:
            logger.error(f"Error creating plan feature from row: {e}")
            return None

    def _safe_float(self, value) -> float:
        """
        Safely convert a value to float, handling NaN and string values
        """
        if pd.isna(value) or value == 'nan' or value == '':
            return 0.0
        try:
            # Remove currency symbols and commas
            if isinstance(value, str):
                value = value.replace('$', '').replace(',', '').replace(' ', '')
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    def _determine_network_tier(self, actuarial_value: float) -> str:
        """
        Determine network tier based on actuarial value
        """
        if actuarial_value >= 0.9:
            return "platinum"
        elif actuarial_value >= 0.8:
            return "gold"
        elif actuarial_value >= 0.7:
            return "silver"
        else:
            return "bronze"

    def _merge_puf_data(self, plan_attributes_df: pd.DataFrame, rate_df: pd.DataFrame, 
                       benefits_df: pd.DataFrame, service_area_df: pd.DataFrame) -> List[PlanFeature]:
        """
        Merge data from multiple PUF files to create comprehensive plan features
        """
        plans = []
        
        # Use plan attributes as the primary source
        if plan_attributes_df is not None and not plan_attributes_df.empty:
            logger.info("Processing plan attributes data...")
            for _, plan_row in plan_attributes_df.iterrows():
                plan = self._create_plan_from_puf_data(plan_row, rate_df, benefits_df, service_area_df)
                if plan:
                    plans.append(plan)
        
        # If no plan attributes, use rate data as fallback
        elif rate_df is not None and not rate_df.empty:
            logger.info("Processing rate data as fallback...")
            for _, rate_row in rate_df.iterrows():
                plan = self._create_plan_from_rate_data(rate_row, benefits_df, service_area_df)
                if plan:
                    plans.append(plan)
        
        # Remove duplicates based on plan_id
        unique_plans = {}
        for plan in plans:
            if plan.plan_id not in unique_plans:
                unique_plans[plan.plan_id] = plan
        
        return list(unique_plans.values())

    def _create_plan_from_puf_data(self, plan_row: pd.Series, rate_df: pd.DataFrame, 
                                  benefits_df: pd.DataFrame, service_area_df: pd.DataFrame) -> Optional[PlanFeature]:
        """
        Create a plan feature from plan attributes PUF data
        """
        try:
            plan_id = str(plan_row.get('PlanId', ''))
            if not plan_id or plan_id == 'nan':
                return None
            
            # Get premium from rate data
            premium = self._get_premium_from_rate_data(plan_id, rate_df)
            
            # Get actuarial value from plan attributes or benefits
            av = self._get_actuarial_value_from_plan_attributes(plan_row, benefits_df)
            
            # Determine HSA eligibility
            hsa_eligible = self._determine_hsa_eligibility(plan_row)
            
            # Extract other fields
            state_code = str(plan_row.get('StateCode', ''))
            issuer_id = str(plan_row.get('IssuerId', ''))
            plan_marketing_name = str(plan_row.get('PlanMarketingName', ''))
            metal_level = str(plan_row.get('MetalLevel', 'Silver'))
            plan_type = str(plan_row.get('PlanType', ''))
            market_coverage = str(plan_row.get('MarketCoverage', ''))
            dental_only = str(plan_row.get('DentalOnlyPlan', 'No')).lower() == 'yes'
            service_area_id = str(plan_row.get('ServiceAreaId', ''))
            network_id = str(plan_row.get('NetworkId', ''))
            
            # Estimate deductible and out-of-pocket max based on metal level
            deductible, oop_max = self._estimate_cost_sharing(metal_level, premium)
            
            return PlanFeature(
                plan_id=plan_id,
                monthly_premium=premium,
                deductible=deductible,
                out_of_pocket_max=oop_max,
                hsa_eligible=hsa_eligible,
                actuarial_value=av,
                network_tier=self._determine_network_tier(av),
                state_code=state_code,
                issuer_id=issuer_id,
                plan_marketing_name=plan_marketing_name,
                metal_level=metal_level,
                plan_type=plan_type,
                market_coverage=market_coverage,
                dental_only_plan=dental_only,
                service_area_id=service_area_id if service_area_id != 'nan' else None,
                network_id=network_id if network_id != 'nan' else None
            )
        except Exception as e:
            logger.error(f"Error creating plan from PUF data: {e}")
            return None

    def _create_plan_from_rate_data(self, rate_row: pd.Series, benefits_df: pd.DataFrame, 
                                   service_area_df: pd.DataFrame) -> Optional[PlanFeature]:
        """
        Create a plan feature from rate PUF data
        """
        try:
            plan_id = str(rate_row.get('PlanId', ''))
            if not plan_id or plan_id == 'nan':
                return None
            
            # Get premium from rate data
            premium = self._safe_float(rate_row.get('IndividualRate', 0))
            
            # Get actuarial value from benefits data
            av = self._get_actuarial_value_from_benefits(plan_id, benefits_df)
            
            # Extract other fields
            state_code = str(rate_row.get('StateCode', ''))
            issuer_id = str(rate_row.get('IssuerId', ''))
            
            # Estimate other fields since they're not in rate data
            plan_marketing_name = f"Plan {plan_id}"
            metal_level = "Silver"  # Default
            plan_type = "HMO"  # Default
            market_coverage = "Individual"  # Default
            dental_only = False  # Default
            hsa_eligible = False  # Default
            
            # Estimate deductible and out-of-pocket max based on metal level
            deductible, oop_max = self._estimate_cost_sharing(metal_level, premium)
            
            return PlanFeature(
                plan_id=plan_id,
                monthly_premium=premium,
                deductible=deductible,
                out_of_pocket_max=oop_max,
                hsa_eligible=hsa_eligible,
                actuarial_value=av,
                network_tier=self._determine_network_tier(av),
                state_code=state_code,
                issuer_id=issuer_id,
                plan_marketing_name=plan_marketing_name,
                metal_level=metal_level,
                plan_type=plan_type,
                market_coverage=market_coverage,
                dental_only_plan=dental_only
            )
        except Exception as e:
            logger.error(f"Error creating plan from rate data: {e}")
            return None

    def _get_premium_from_rate_data(self, plan_id: str, rate_df: pd.DataFrame) -> float:
        """
        Get premium for a plan from rate data
        """
        if rate_df is None or rate_df.empty:
            return 0.0
        
        plan_rates = rate_df[rate_df['PlanId'] == plan_id]
        if plan_rates.empty:
            return 0.0
        
        # Get the most recent rate (assuming rate_effective_date is available)
        if 'RateEffectiveDate' in plan_rates.columns:
            plan_rates = plan_rates.sort_values('RateEffectiveDate', ascending=False)
        
        # Get individual rate, fallback to first available rate
        rate = plan_rates.iloc[0]
        return self._safe_float(rate.get('IndividualRate', 0))

    def _get_actuarial_value_from_plan_attributes(self, plan_row: pd.Series, benefits_df: pd.DataFrame) -> float:
        """
        Get actuarial value from plan attributes or benefits data
        """
        # Try to get from plan attributes first
        av = self._safe_float(plan_row.get('IssuerActuarialValue', 0))
        if av > 0:
            return av
        
        av = self._safe_float(plan_row.get('AVCalculatorOutputNumber', 0))
        if av > 0:
            return av
        
        # Fallback to benefits data
        plan_id = str(plan_row.get('PlanId', ''))
        if benefits_df is not None and not benefits_df.empty:
            return self._get_actuarial_value_from_benefits(plan_id, benefits_df)
        
        # Default based on metal level
        metal_level = str(plan_row.get('MetalLevel', 'Silver')).lower()
        if metal_level == 'platinum':
            return 0.9
        elif metal_level == 'gold':
            return 0.8
        elif metal_level == 'silver':
            return 0.7
        else:
            return 0.6

    def _get_actuarial_value_from_benefits(self, plan_id: str, benefits_df: pd.DataFrame) -> float:
        """
        Get actuarial value from benefits data
        """
        if benefits_df is None or benefits_df.empty:
            return 0.7  # Default to Silver level
        
        # This is a simplified approach - in reality, AV calculation is complex
        # and requires detailed benefit analysis
        plan_benefits = benefits_df[benefits_df['PlanId'] == plan_id]
        if plan_benefits.empty:
            return 0.7
        
        # Count EHB benefits as a rough proxy for AV
        ehb_count = len(plan_benefits[plan_benefits['IsEHB'] == 'Yes'])
        total_benefits = len(plan_benefits)
        
        if total_benefits > 0:
            ehb_ratio = ehb_count / total_benefits
            # Map EHB ratio to AV (simplified)
            if ehb_ratio >= 0.9:
                return 0.9
            elif ehb_ratio >= 0.8:
                return 0.8
            elif ehb_ratio >= 0.7:
                return 0.7
            else:
                return 0.6
        
        return 0.7

    def _determine_hsa_eligibility(self, plan_row: pd.Series) -> bool:
        """
        Determine HSA eligibility from plan attributes
        """
        hsa_field = plan_row.get('IsHSAEligible', 'No')
        if isinstance(hsa_field, str):
            return hsa_field.lower() == 'yes'
        return False

    def _estimate_cost_sharing(self, metal_level: str, premium: float) -> tuple[float, float]:
        """
        Estimate deductible and out-of-pocket maximum based on metal level and premium
        """
        metal_level = metal_level.lower()
        
        # Rough estimates based on typical cost-sharing patterns
        if metal_level == 'platinum':
            deductible = premium * 2  # Low deductible
            oop_max = premium * 8
        elif metal_level == 'gold':
            deductible = premium * 4
            oop_max = premium * 10
        elif metal_level == 'silver':
            deductible = premium * 6
            oop_max = premium * 12
        else:  # bronze
            deductible = premium * 8
            oop_max = premium * 15
        
        return deductible, oop_max

    def get_plans_by_state(self, state_code: str, data_directory: str = "data") -> List[PlanFeature]:
        """
        Get plans for a specific state from in-memory cache.
        """
        if not self.cms_loaded or self.plans_cache is None:
            self.load_cms_data(data_directory)
        return [plan for plan in self.plans_cache if plan.state_code.upper() == state_code.upper()]

    def get_plans_by_network_tier(self, network_tier: str, data_directory: str = "data") -> List[PlanFeature]:
        """
        Get plans by network tier (bronze, silver, gold, platinum)
        """
        if not self.cms_loaded or self.plans_cache is None:
            self.load_cms_data(data_directory)
        return [plan for plan in self.plans_cache if plan.network_tier.lower() == network_tier.lower()]

    def get_plans_by_budget(self, max_monthly_premium: float, data_directory: str = "data") -> List[PlanFeature]:
        """
        Get plans within a budget constraint
        """
        if not self.cms_loaded or self.plans_cache is None:
            self.load_cms_data(data_directory)
        return [plan for plan in self.plans_cache if plan.monthly_premium <= max_monthly_premium] 