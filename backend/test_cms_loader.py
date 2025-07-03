#!/usr/bin/env python3
"""
Test script for CMS data loader functionality
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.data_service import DataService

def test_data_loading():
    """Test the CMS data loading functionality"""
    print("Testing CMS data loading...")
    
    service = DataService()
    
    # Test loading CMS data
    plans = service.load_cms_data('data')
    
    print(f"Loaded {len(plans)} plans from CMS data")
    
    if plans:
        print("\nSample plans:")
        for i, plan in enumerate(plans[:5]):  # Show first 5 plans
            print(f"\nPlan {i+1}:")
            print(f"  ID: {plan.plan_id}")
            print(f"  Name: {plan.plan_marketing_name}")
            print(f"  State: {plan.state_code}")
            print(f"  Metal Level: {plan.metal_level}")
            print(f"  Monthly Premium: ${plan.monthly_premium:.2f}")
            print(f"  Deductible: ${plan.deductible:.2f}")
            print(f"  Out-of-Pocket Max: ${plan.out_of_pocket_max:.2f}")
            print(f"  HSA Eligible: {plan.hsa_eligible}")
            print(f"  Dental Only: {plan.dental_only_plan}")
            print(f"  Network Tier: {plan.network_tier}")
            print(f"  Actuarial Value: {plan.actuarial_value:.2f}")
        
        # Test filtering by state
        ak_plans = service.get_plans_by_state('AK')
        print(f"\nFound {len(ak_plans)} plans for Alaska")
        
        # Test filtering by metal level
        gold_plans = service.get_plans_by_network_tier('gold')
        print(f"Found {len(gold_plans)} gold tier plans")
        
        # Test filtering by budget
        budget_plans = service.get_plans_by_budget(500.0)
        print(f"Found {len(budget_plans)} plans under $500/month")
        
    else:
        print("No plans loaded. Check if CSV files exist in the data directory.")

if __name__ == "__main__":
    test_data_loading() 