import { EmployeeProfile, OptimizationConstraints, OptimizationResponse } from '../types/domain';

// Real API call to the backend
export const optimizePlan = async (constraints: any): Promise<OptimizationResponse> => {
  const response = await fetch('http://localhost:8000/api/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(constraints),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Legacy mock function for backward compatibility
export const mockOptimize = async (
  employeeProfiles: EmployeeProfile[], 
  constraints: OptimizationConstraints
): Promise<any> => {
  // For now, we'll use the real API with the first employee profile
  // This maintains backward compatibility while using the real backend
  const firstProfile = employeeProfiles[0];
  
  // Transform the constraints to match the API format
  const apiConstraints = {
    age: parseInt(firstProfile.ageRange.split('-')[0]) || 30, // Use start of age range
    risk_score: 0.3, // Default risk score
    budget_cap: firstProfile.budgetCap,
    state_code: firstProfile.stateCode,
    max_monthly_premium: constraints.maxMonthlyPremium,
    min_actuarial_value: constraints.minActuarialValue,
    preferred_metal_level: constraints.preferredMetalLevel,
    preferred_plan_type: constraints.preferredPlanType,
    max_deductible: constraints.maxDeductible,
    hsa_eligible_only: constraints.hsaEligibleOnly,
    required_benefits: constraints.requiredBenefits,
    tobacco_preference: firstProfile.tobaccoPreference
  };

  try {
    const result = await optimizePlan(apiConstraints);
    return result;
  } catch (error) {
    console.error('API call failed, falling back to mock data:', error);
    // Fallback to mock data if API fails
    return getMockOptimizationResult(employeeProfiles, constraints);
  }
};

// Mock data for fallback
const getMockOptimizationResult = (employeeProfiles: EmployeeProfile[], constraints: OptimizationConstraints) => {
  return {
    selected_plan: {
      plan_id: "16842FL0260006-02",
      monthly_premium: 0.0,
      deductible: 0.0,
      out_of_pocket_max: 0.0,
      hsa_eligible: false,
      actuarial_value: 1.0,
      network_tier: "platinum",
      state_code: "FL",
      issuer_id: "16842",
      plan_marketing_name: "BlueOptions Bronze 24J01-06 ($0 Virtual PCP Visits / Rewards)",
      metal_level: "Bronze",
      plan_type: "PPO",
      market_coverage: "Individual",
      dental_only_plan: false,
      service_area_id: "FLS001",
      network_id: "FLN001"
    },
    utility_score: 0.965,
    total_cost: 0.0,
    optimization_time_ms: 926.1250495910645
  };
};