export interface EmployeeProfile {
  type: string;
  count: number;
  ageRange: string;
  budgetCap: number;
  stateCode: string;
  tobaccoPreference: 'No Preference' | 'Tobacco' | 'Non-Tobacco';
}

// New interface for the actual API response structure
export interface SelectedPlan {
  plan_id: string;
  monthly_premium: number;
  deductible: number;
  out_of_pocket_max: number;
  hsa_eligible: boolean;
  actuarial_value: number;
  network_tier: string;
  state_code: string;
  issuer_id: string;
  plan_marketing_name: string;
  metal_level: string;
  plan_type: string;
  market_coverage: string;
  dental_only_plan: boolean;
  service_area_id: string;
  network_id: string;
}

export interface OptimizationResponse {
  selected_plan: SelectedPlan;
  utility_score: number;
  total_cost: number;
  optimization_time_ms: number;
}

// Legacy interfaces for backward compatibility
export interface PlanFeature {
  planId: string;
  planMarketingName: string;
  planType: string;
  metalLevel: string;
  individualRate: number;
  actuarialValue: number;
  isHSAEligible: boolean;
  hsaContributionAmount?: number;
  networkId: string;
  serviceAreaId: string;
  medicalDeductibleIndividual?: number;
  medicalDeductibleFamily?: number;
  medicalMOOPIndividual?: number;
  medicalMOOPFamily?: number;
  coveredBenefits: string[];
  copayAmounts: Record<string, string>;
  coinsuranceRates: Record<string, string>;
}

export interface PlanBundle {
  employeeType: string;
  recommendedPlan: PlanFeature & {
    utilityScore: number;
  };
  costBreakdown: {
    monthlyPremium: number;
    annualCost: number;
    employerContribution: number;
    employeeContribution: number;
  };
  coverageSummary: {
    networkStrength: number;
    coverageLevel: string;
    riskProtection: number;
  };
  alternativePlans: Array<PlanFeature & {
    utilityScore: number;
  }>;
}

export interface OptimizationResult {
  optimalBundles: PlanBundle[];
  totalCost: number;
  optimizationStatus: 'optimal' | 'suboptimal' | 'infeasible';
  message?: string;
}

export interface OptimizationConstraints {
  maxMonthlyPremium: number;
  minActuarialValue: number;
  preferredMetalLevel: string;
  preferredPlanType: string;
  requiredBenefits: string[];
  maxDeductible?: number;
  hsaEligibleOnly?: boolean;
}