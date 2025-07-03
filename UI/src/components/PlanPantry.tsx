import React, { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ProgressStream } from './ui/ProgressStream';
import { OptimizationResult } from '../types/domain';
import { BarChartIcon, DollarSignIcon, ShieldIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';

interface PlanPantryProps {
  results: OptimizationResult | null;
  isLoading: boolean;
  progress: number;
}

export const PlanPantry: React.FC<PlanPantryProps> = ({
  results,
  isLoading,
  progress
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Find the selected bundle or use the first one
  const selectedBundle = results?.optimalBundles.find(bundle => bundle.employeeType === selectedGroup) || results?.optimalBundles[0];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Optimizing Your Plan Bundles
        </h2>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <LoadingSpinner size="lg" color="blue" />
            <p className="mt-4 text-gray-600">
              Our advanced algorithm is finding the optimal plan bundles for
              your employees using CMS marketplace data...
            </p>
          </div>
          <ProgressStream progress={progress} color="blue" />
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Optimization in Progress
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Analyzing employee demographics</li>
              <li>• Evaluating plan features against constraints</li>
              <li>• Calculating utility scores</li>
              <li>• Identifying optimal bundles</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center items-center">
        <div className="text-center max-w-md">
          <BarChartIcon className="w-16 h-16 text-blue-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            ICHRA Plan Pantry
          </h2>
          <p className="text-gray-600">
            Configure your employee profiles and constraints, then run the
            optimization to see your optimal plan bundles here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-800 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Optimal Plan Bundles</h2>
            <p className="text-blue-100 text-sm mt-1">
              Total Annual Employer Cost: ${results.totalCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-700 py-1 px-3 rounded-full text-xs font-medium">
            {results.optimizationStatus === 'optimal' ? 'Optimal Solution' : 
             results.optimizationStatus === 'suboptimal' ? 'Near-Optimal Solution' : 'Infeasible'}
          </div>
        </div>
      </div>

      {results.optimizationStatus === 'infeasible' ? (
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Optimization Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {results.message || 'No feasible solution found. Please try relaxing your constraints.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Group Selector */}
          {results.optimalBundles.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee Group
              </label>
              <div className="flex flex-wrap gap-2">
                {results.optimalBundles.map(bundle => (
                  <button
                    key={bundle.employeeType}
                    onClick={() => setSelectedGroup(bundle.employeeType)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      (!selectedGroup && bundle === results.optimalBundles[0]) || selectedGroup === bundle.employeeType
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {bundle.employeeType}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedBundle && (
            <div className="space-y-6">
              {/* Recommended Plan */}
              <div className="border border-green-200 rounded-lg bg-green-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recommended Plan
                      </h3>
                    </div>
                    <p className="text-green-800 text-sm mt-1">
                      Utility Score: {selectedBundle.recommendedPlan.utilityScore.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-full px-3 py-1 text-sm font-medium text-green-800">
                    {selectedBundle.recommendedPlan.planId}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-md p-3 border border-green-100">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSignIcon className="w-4 h-4 mr-1 text-green-600" />
                      Cost
                    </h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Premium:</span>
                        <span className="font-medium">
                          ${selectedBundle.recommendedPlan.individualRate}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Cost:</span>
                        <span className="font-medium">
                          ${selectedBundle.costBreakdown.annualCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Employer Contribution:</span>
                        <span className="font-medium">
                          ${selectedBundle.costBreakdown.employerContribution.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Employee Contribution:</span>
                        <span className="font-medium">
                          ${selectedBundle.costBreakdown.employeeContribution.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-green-100">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <ShieldIcon className="w-4 h-4 mr-1 text-green-600" />
                      Plan Details
                    </h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plan Name:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.planMarketingName}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plan Type:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.planType}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Metal Level:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.metalLevel}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Actuarial Value:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.actuarialValue}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">HSA Eligible:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.isHSAEligible ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-green-100">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <ShieldIcon className="w-4 h-4 mr-1 text-green-600" />
                      Coverage Details
                    </h4>
                    <div className="mt-2 space-y-1">
                      {selectedBundle.recommendedPlan.medicalDeductibleIndividual && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Individual Deductible:</span>
                          <span className="font-medium">
                            ${selectedBundle.recommendedPlan.medicalDeductibleIndividual.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedBundle.recommendedPlan.medicalDeductibleFamily && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Family Deductible:</span>
                          <span className="font-medium">
                            ${selectedBundle.recommendedPlan.medicalDeductibleFamily.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedBundle.recommendedPlan.medicalMOOPIndividual && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Individual MOOP:</span>
                          <span className="font-medium">
                            ${selectedBundle.recommendedPlan.medicalMOOPIndividual.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedBundle.recommendedPlan.medicalMOOPFamily && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Family MOOP:</span>
                          <span className="font-medium">
                            ${selectedBundle.recommendedPlan.medicalMOOPFamily.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Network ID:</span>
                        <span className="font-medium">
                          {selectedBundle.recommendedPlan.networkId}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Covered Benefits */}
                {selectedBundle.recommendedPlan.coveredBenefits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Covered Benefits</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedBundle.recommendedPlan.coveredBenefits.map(benefit => (
                        <div key={benefit} className="flex items-center text-sm">
                          <CheckIcon className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative Plans */}
              {selectedBundle.alternativePlans.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Alternative Plans
                  </h3>
                  <div className="space-y-3">
                                         {selectedBundle.alternativePlans.slice(0, 3).map((plan) => (
                      <div key={plan.planId} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {plan.planMarketingName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {plan.planType} • {plan.metalLevel} • Utility: {plan.utilityScore.toFixed(1)}/10
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${plan.individualRate}/month
                            </p>
                            <p className="text-xs text-gray-500">
                              AV: {plan.actuarialValue}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coverage Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Coverage Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedBundle.coverageSummary.networkStrength}/10
                    </div>
                    <div className="text-sm text-gray-600">Network Strength</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedBundle.coverageSummary.coverageLevel}
                    </div>
                    <div className="text-sm text-gray-600">Coverage Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedBundle.coverageSummary.riskProtection}/10
                    </div>
                    <div className="text-sm text-gray-600">Risk Protection</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};