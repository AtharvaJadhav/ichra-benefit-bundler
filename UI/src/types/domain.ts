export interface EmployeeProfile {
  type: string;
  count: number;
  ageRange: string;
  budgetCap: number;
  stateCode: string;
  tobaccoPreference: 'No Preference' | 'Tobacco' | 'Non-Tobacco';
}
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