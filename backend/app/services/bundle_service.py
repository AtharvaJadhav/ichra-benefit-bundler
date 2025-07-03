import uuid
from datetime import datetime
from typing import List, Optional
from app.models.domain import Bundle, BundleRequest, Benefit, EmployeeProfile, BundleResult
from app.services.data_service import DataService
from app.optimization.bundler import BundleOptimizer, BenefitBundler
import logging
from functools import lru_cache
import hashlib
import json
import time

class BundleService:
    def __init__(self, data_service: DataService, optimizer: BenefitBundler):
        self.data_service = data_service
        self.optimizer = optimizer
        self.logger = logging.getLogger("BundleService")
    
    async def create_bundle(self, bundle_request: BundleRequest) -> Bundle:
        """
        Create a new benefit bundle based on the request
        """
        # Get available benefits
        available_benefits = await self.data_service.get_benefits(
            benefit_types=[bt.value for bt in bundle_request.benefit_types]
        )
        
        # Use optimizer to create optimal bundle
        optimized_benefits = self.optimizer.optimize_bundle(
            available_benefits=available_benefits,
            bundle_request=bundle_request
        )
        
        # Calculate totals
        total_monthly_premium = sum(b.monthly_premium for b in optimized_benefits)
        total_annual_deductible = sum(b.annual_deductible for b in optimized_benefits)
        total_max_out_of_pocket = sum(b.max_out_of_pocket for b in optimized_benefits)
        
        # Create bundle
        bundle = Bundle(
            id=str(uuid.uuid4()),
            name=bundle_request.name,
            description=bundle_request.description,
            benefits=optimized_benefits,
            total_monthly_premium=total_monthly_premium,
            total_annual_deductible=total_annual_deductible,
            total_max_out_of_pocket=total_max_out_of_pocket,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save bundle
        await self.data_service.save_bundle(bundle)
        
        return bundle
    
    async def get_bundle(self, bundle_id: str) -> Optional[Bundle]:
        """
        Get a specific bundle by ID
        """
        return await self.data_service.get_bundle(bundle_id)
    
    async def get_bundles(self, limit: int = 10, offset: int = 0) -> List[Bundle]:
        """
        Get a list of bundles with pagination
        """
        return await self.data_service.get_bundles(limit=limit, offset=offset)
    
    async def update_bundle(self, bundle_id: str, bundle_request: BundleRequest) -> Bundle:
        """
        Update an existing bundle
        """
        # Get existing bundle
        existing_bundle = await self.data_service.get_bundle(bundle_id)
        if not existing_bundle:
            raise ValueError("Bundle not found")
        
        # Create new bundle with updated data
        updated_bundle = await self.create_bundle(bundle_request)
        updated_bundle.id = bundle_id  # Keep the same ID
        updated_bundle.updated_at = datetime.utcnow()
        
        # Save updated bundle
        await self.data_service.save_bundle(updated_bundle)
        
        return updated_bundle
    
    async def delete_bundle(self, bundle_id: str) -> bool:
        """
        Delete a bundle
        """
        return await self.data_service.delete_bundle(bundle_id)
    
    async def search_bundles(self, search_criteria: dict) -> List[Bundle]:
        """
        Search bundles based on criteria
        """
        # This would implement search logic based on criteria
        # For now, return all bundles
        return await self.data_service.get_bundles()
    
    async def compare_bundles(self, bundle_ids: List[str]) -> dict:
        """
        Compare multiple bundles
        """
        bundles = []
        for bundle_id in bundle_ids:
            bundle = await self.data_service.get_bundle(bundle_id)
            if bundle:
                bundles.append(bundle)
        
        if len(bundles) < 2:
            raise ValueError("At least 2 bundles required for comparison")
        
        # Create comparison matrix
        comparison = {
            "bundles": bundles,
            "comparison_matrix": self._create_comparison_matrix(bundles),
            "recommendations": self._generate_recommendations(bundles)
        }
        
        return comparison
    
    def _create_comparison_matrix(self, bundles: List[Bundle]) -> dict:
        """
        Create a comparison matrix for bundles
        """
        matrix = {}
        
        for bundle in bundles:
            matrix[bundle.id] = {
                "name": bundle.name,
                "total_monthly_premium": bundle.total_monthly_premium,
                "total_annual_deductible": bundle.total_annual_deductible,
                "total_max_out_of_pocket": bundle.total_max_out_of_pocket,
                "benefit_count": len(bundle.benefits),
                "benefit_types": [b.type.value for b in bundle.benefits]
            }
        
        return matrix
    
    def _generate_recommendations(self, bundles: List[Bundle]) -> List[str]:
        """
        Generate recommendations based on bundle comparison
        """
        recommendations = []
        
        # Find lowest cost bundle
        lowest_cost = min(bundles, key=lambda b: b.total_monthly_premium)
        recommendations.append(f"Lowest cost option: {lowest_cost.name} (${lowest_cost.total_monthly_premium}/month)")
        
        # Find most comprehensive bundle
        most_comprehensive = max(bundles, key=lambda b: len(b.benefits))
        recommendations.append(f"Most comprehensive: {most_comprehensive.name} ({len(most_comprehensive.benefits)} benefits)")
        
        # Find best value (lowest cost per benefit)
        best_value = min(bundles, key=lambda b: b.total_monthly_premium / len(b.benefits))
        recommendations.append(f"Best value: {best_value.name} (${best_value.total_monthly_premium / len(best_value.benefits):.2f} per benefit)")
        
        return recommendations

    @lru_cache(maxsize=128)
    def find_optimal_bundle(self, profile_hash: str, state: str) -> BundleResult:
        start_time = time.time()
        self.logger.info(f"Optimization requested for state={state}, profile_hash={profile_hash}")
        plans = self.data_service.get_plans_by_state(state)
        if not plans:
            self.logger.warning(f"No plans available for state {state}")
            raise ValueError(f"No plans available for state {state}")
        # Filter out plans over budget
        # (Assume profile_hash encodes budget, but for safety, check all plans)
        # In real use, pass profile separately and hash only for cache key
        # Here, we just check all plans
        # (If all plans are over budget, return best-effort or raise)
        # For now, let optimizer handle budget constraint
        try:
            # For cache, we don't have the profile object, so this is for illustration
            # In real use, pass profile as argument and hash for cache key
            raise NotImplementedError("Pass EmployeeProfile and hash in real use")
        except Exception as e:
            self.logger.error(f"Optimization failed: {e}")
            raise
        finally:
            elapsed = (time.time() - start_time) * 1000
            self.logger.info(f"Optimization completed in {elapsed:.2f} ms")

# Utility function to hash profile for caching
def profile_to_hash(profile: EmployeeProfile) -> str:
    profile_json = json.dumps(profile.model_dump(), sort_keys=True)
    return hashlib.sha256(profile_json.encode()).hexdigest() 