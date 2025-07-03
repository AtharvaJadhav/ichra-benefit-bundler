import { EmployeeProfile, OptimizationConstraints, OptimizationResult } from '../types/domain';
// Mock data for plan features based on actual CSV data structure
const mockPlans = [
  {
    planId: '21989AK0010001-00',
    planMarketingName: 'Premier',
    planType: 'PPO',
    metalLevel: 'Low',
    individualRate: 32.00,
    actuarialValue: 69.90,
    isHSAEligible: false,
    hsaContributionAmount: undefined,
    networkId: 'AKN001',
    serviceAreaId: 'AKS001',
    medicalDeductibleIndividual: 0,
    medicalDeductibleFamily: 0,
    medicalMOOPIndividual: 700,
    medicalMOOPFamily: 1400,
    coveredBenefits: [
      'Routine Dental Services (Adult)',
      'Dental Check-Up for Children',
      'Basic Dental Care - Child',
      'Orthodontia - Child'
    ],
    copayAmounts: {
      'Routine Dental Services (Adult)': 'No Charge',
      'Dental Check-Up for Children': 'No Charge',
      'Basic Dental Care - Child': 'No Charge',
      'Orthodontia - Child': 'No Charge',
      'Emergency Room': 'Not Covered',
      'Urgent Care': 'Not Covered',
      'Primary Care Physician': 'Not Covered',
      'Specialist': 'Not Covered'
    },
    coinsuranceRates: {
      'Routine Dental Services (Adult)': '20%',
      'Dental Check-Up for Children': '20%',
      'Basic Dental Care - Child': '40%',
      'Orthodontia - Child': '50%',
      'Emergency Room': 'Not Covered',
      'Urgent Care': 'Not Covered',
      'Primary Care Physician': 'Not Covered',
      'Specialist': 'Not Covered'
    }
  },
  {
    planId: '21989AK0020001-00',
    planMarketingName: 'Premier',
    planType: 'PPO',
    metalLevel: 'High',
    individualRate: 36.95,
    actuarialValue: 84.60,
    isHSAEligible: false,
    hsaContributionAmount: undefined,
    networkId: 'AKN001',
    serviceAreaId: 'AKS001',
    medicalDeductibleIndividual: 0,
    medicalDeductibleFamily: 0,
    medicalMOOPIndividual: 700,
    medicalMOOPFamily: 1400,
    coveredBenefits: [
      'Routine Dental Services (Adult)',
      'Dental Check-Up for Children',
      'Emergency Room',
      'Urgent Care'
    ],
    copayAmounts: {
      'Routine Dental Services (Adult)': 'No Charge',
      'Dental Check-Up for Children': 'No Charge',
      'Basic Dental Care - Child': 'Not Covered',
      'Orthodontia - Child': 'Not Covered',
      'Emergency Room': '$100',
      'Urgent Care': '$25',
      'Primary Care Physician': 'Not Covered',
      'Specialist': 'Not Covered'
    },
    coinsuranceRates: {
      'Routine Dental Services (Adult)': '20%',
      'Dental Check-Up for Children': '20%',
      'Basic Dental Care - Child': 'Not Covered',
      'Orthodontia - Child': 'Not Covered',
      'Emergency Room': '20%',
      'Urgent Care': '20%',
      'Primary Care Physician': 'Not Covered',
      'Specialist': 'Not Covered'
    }
  },
  {
    planId: '21989AK0020002-00',
    planMarketingName: 'Premier',
    planType: 'PPO',
    metalLevel: 'Low',
    individualRate: 29.00,
    actuarialValue: 70.00,
    isHSAEligible: false,
    hsaContributionAmount: undefined,
    networkId: 'AKN001',
    serviceAreaId: 'AKS001',
    medicalDeductibleIndividual: 50,
    medicalDeductibleFamily: 100,
    medicalMOOPIndividual: 700,
    medicalMOOPFamily: 1400,
    coveredBenefits: [
      'Routine Dental Services (Adult)',
      'Dental Check-Up for Children',
      'Primary Care Physician',
      'Specialist'
    ],
    copayAmounts: {
      'Routine Dental Services (Adult)': 'No Charge',
      'Dental Check-Up for Children': 'No Charge',
      'Basic Dental Care - Child': 'Not Covered',
      'Orthodontia - Child': 'Not Covered',
      'Emergency Room': 'Not Covered',
      'Urgent Care': 'Not Covered',
      'Primary Care Physician': '$20',
      'Specialist': '$40'
    },
    coinsuranceRates: {
      'Routine Dental Services (Adult)': '20%',
      'Dental Check-Up for Children': '20%',
      'Basic Dental Care - Child': 'Not Covered',
      'Orthodontia - Child': 'Not Covered',
      'Emergency Room': 'Not Covered',
      'Urgent Care': 'Not Covered',
      'Primary Care Physician': '20%',
      'Specialist': '20%'
    }
  }
];
// Mock utility calculation function (simplified)
const calculateUtility = (plan: typeof mockPlans[0], profile: EmployeeProfile): number => {
  // Base utility components based on actual data
  const affordability = Math.max(0, 1.0 - plan.individualRate / profile.budgetCap);
  const protection = plan.medicalMOOPIndividual ? Math.max(0, 1.0 - plan.medicalMOOPIndividual / 10000) : 0.5;
  const coverage = plan.actuarialValue / 100; // Convert percentage to decimal
  const networkScore = 0.8; // Assume good network for PPO plans
  
  // Simple weighted utility calculation
  const utility = affordability * 0.3 + protection * 0.3 + coverage * 0.2 + networkScore * 0.2;
  
  // Scale to 0-10 range
  return Math.min(Math.max(utility * 10, 0), 10);
};
// Mock optimization function
export const mockOptimize = async (
  employeeProfiles: EmployeeProfile[], 
  constraints: OptimizationConstraints
): Promise<OptimizationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const optimalBundles = employeeProfiles.map(profile => {
    // Filter plans based on constraints
    const eligiblePlans = mockPlans.filter(plan => {
      if (constraints.maxMonthlyPremium && plan.individualRate > constraints.maxMonthlyPremium) return false;
      if (constraints.minActuarialValue && plan.actuarialValue < constraints.minActuarialValue) return false;
      if (constraints.preferredMetalLevel && plan.metalLevel !== constraints.preferredMetalLevel) return false;
      if (constraints.preferredPlanType && plan.planType !== constraints.preferredPlanType) return false;
      if (constraints.maxDeductible && plan.medicalDeductibleIndividual && plan.medicalDeductibleIndividual > constraints.maxDeductible) return false;
      if (constraints.hsaEligibleOnly && !plan.isHSAEligible) return false;
      
      // Check required benefits
      for (const benefit of constraints.requiredBenefits) {
        if (!plan.coveredBenefits.includes(benefit)) return false;
      }
      
      return true;
    });

    // Calculate utility for each plan
    const plansWithUtility = eligiblePlans.map(plan => ({
      ...plan,
      utilityScore: calculateUtility(plan, profile)
    }));

    // Sort by utility score
    plansWithUtility.sort((a, b) => b.utilityScore - a.utilityScore);

    // Select the best plan
    const recommendedPlan = plansWithUtility[0] || {
      ...mockPlans[0],
      utilityScore: 0
    };

    // Generate alternative plans (next 2 best options)
    const alternativePlans = plansWithUtility.slice(1, 3);

    return {
      employeeType: profile.type,
      recommendedPlan,
      costBreakdown: {
        monthlyPremium: recommendedPlan.individualRate,
        annualCost: recommendedPlan.individualRate * 12,
        employerContribution: Math.min(profile.budgetCap, recommendedPlan.individualRate) * 12,
        employeeContribution: Math.max(0, recommendedPlan.individualRate - profile.budgetCap) * 12
      },
      coverageSummary: {
        networkStrength: 8.5, // Mock network strength score
        coverageLevel: recommendedPlan.actuarialValue > 80 ? 'Excellent' : 
                      recommendedPlan.actuarialValue > 70 ? 'Good' : 'Basic',
        riskProtection: recommendedPlan.medicalMOOPIndividual ? 
                       Math.max(0, 10 - recommendedPlan.medicalMOOPIndividual / 1000) : 7.0
      },
      alternativePlans
    };
  });

  // Calculate total cost
  const totalCost = optimalBundles.reduce((sum, bundle) => {
    const employeeCount = employeeProfiles.find(p => p.type === bundle.employeeType)?.count || 0;
    return sum + (bundle.costBreakdown.employerContribution * employeeCount);
  }, 0);

  return {
    optimalBundles,
    totalCost,
    optimizationStatus: 'optimal'
  };
};