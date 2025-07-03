from app.models.domain import EmployeeProfile
from app.services.data_service import DataService
from app.optimization.bundler import BenefitBundler

# 1. Create a sample EmployeeProfile
profile = EmployeeProfile(
    age=30,
    risk_score=0.3,
    budget_cap=500.0
)

# 2. Load some sample plans (e.g. for Alaska)
data_service = DataService()
plans = data_service.get_plans_by_state('AK')

print(f"Loaded {len(plans)} plans for AK")
if not plans:
    print("No plans found for AK. Exiting test.")
    exit(1)

# 3. Run the optimization
bundler = BenefitBundler()
try:
    result = bundler.optimize(profile, plans)
except Exception as e:
    print(f"Optimization failed: {e}")
    exit(1)

# 4. Print the results in a formatted way
print("\n=== Optimization Result ===")
print(f"Selected Plan: {result.selected_plan.plan_marketing_name} (ID: {result.selected_plan.plan_id})")
print(f"  Premium: ${result.selected_plan.monthly_premium:.2f}")
print(f"  Deductible: ${result.selected_plan.deductible:.2f}")
print(f"  Out-of-Pocket Max: ${result.selected_plan.out_of_pocket_max:.2f}")
print(f"  Metal Level: {result.selected_plan.metal_level}")
print(f"  HSA Eligible: {result.selected_plan.hsa_eligible}")
print(f"  Utility Score: {result.utility_score:.4f}")
print(f"  Optimization Time: {result.optimization_time_ms:.2f} ms")

# 5. Verify constraints are satisfied
assert result.selected_plan.monthly_premium <= profile.budget_cap, "Selected plan exceeds budget!"
assert result.selected_plan is not None, "No plan selected!"
print("\nAll constraints satisfied. Test passed.") 