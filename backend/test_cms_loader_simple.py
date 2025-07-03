#!/usr/bin/env python3
"""
Simple test script for CMS data loader functionality (no external dependencies)
"""

import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Mock dependencies for testing
class MockRedis:
    def __init__(self, *args, **kwargs):
        pass
    
    def setex(self, *args, **kwargs):
        return True
    
    def get(self, *args, **kwargs):
        return None
    
    def keys(self, *args, **kwargs):
        return []
    
    def delete(self, *args, **kwargs):
        return 1

# Mock the imports
sys.modules['redis'] = type('MockRedisModule', (), {'from_url': lambda x: MockRedis()})()

try:
    import pandas as pd
except ImportError:
    print("pandas not available - creating mock")
    class MockPandas:
        def read_csv(self, *args, **kwargs):
            return MockDataFrame()
    
    class MockDataFrame:
        def __init__(self):
            self.columns = ['StandardComponentId', 'MonthlyPremiumIndividual21', 'IndividualMedicalDeductible', 'IndividualMedicalMaximumOutofPocket', 'HSAOrHRAEmployerContribution', 'AVCalculatorOutputNumber']
        
        def iterrows(self):
            return []
    
    pd = MockPandas()

# Now import our modules
from app.models.domain import PlanFeature
from app.core.config import Settings

# Mock settings
class MockSettings:
    REDIS_URL = "redis://localhost:6379"

# Replace settings
import app.core.config
app.core.config.settings = MockSettings()

# Now import the data service
from app.services.data_service import DataService

def test_cms_loader():
    """Test the CMS data loader functionality"""
    print("Testing CMS Data Loader...")
    
    # Initialize data service
    data_service = DataService()
    
    # Test loading CMS data
    print("\n1. Loading CMS data from data directory...")
    plans = data_service.load_cms_data("data")
    print(f"   Loaded {len(plans)} plans")
    
    if plans:
        print("\n2. Sample plan details:")
        for i, plan in enumerate(plans[:3]):  # Show first 3 plans
            print(f"   Plan {i+1}:")
            print(f"     ID: {plan.plan_id}")
            print(f"     Premium: ${plan.monthly_premium}")
            print(f"     Deductible: ${plan.deductible}")
            print(f"     Out-of-pocket max: ${plan.out_of_pocket_max}")
            print(f"     HSA Eligible: {plan.hsa_eligible}")
            print(f"     Actuarial Value: {plan.actuarial_value}")
            print(f"     Network Tier: {plan.network_tier}")
            print()
    
    # Test filtering by state
    print("\n3. Testing state filtering...")
    ca_plans = data_service.get_plans_by_state("CA")
    print(f"   Found {len(ca_plans)} plans for California")
    
    # Test filtering by network tier
    print("\n4. Testing network tier filtering...")
    gold_plans = data_service.get_plans_by_network_tier("gold")
    print(f"   Found {len(gold_plans)} gold tier plans")
    
    # Test filtering by budget
    print("\n5. Testing budget filtering...")
    budget_plans = data_service.get_plans_by_budget(400.0)
    print(f"   Found {len(budget_plans)} plans under $400/month")
    
    print("\nCMS Data Loader test completed successfully!")

if __name__ == "__main__":
    test_cms_loader() 