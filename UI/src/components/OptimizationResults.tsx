import React from 'react';
import { OptimizationResponse } from '../types/domain';
import { CheckIcon, DollarSignIcon, ShieldIcon, ClockIcon, StarIcon } from 'lucide-react';

interface OptimizationResultsProps {
  results: OptimizationResponse | null;
  isLoading: boolean;
  progress: number;
}

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  results,
  isLoading,
  progress
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Optimizing Your Plan Selection
        </h2>
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Our advanced algorithm is finding the optimal plan for your requirements...
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Optimization in Progress
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Analyzing plan options</li>
              <li>• Evaluating cost-benefit ratios</li>
              <li>• Calculating utility scores</li>
              <li>• Selecting optimal plan</li>
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
          <ShieldIcon className="w-16 h-16 text-blue-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Plan Optimization Results
          </h2>
          <p className="text-gray-600">
            Configure your requirements and run the optimization to see your optimal plan selection here.
          </p>
        </div>
      </div>
    );
  }

  const { selected_plan, utility_score, total_cost, optimization_time_ms } = results;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-800 px-6 py-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Optimal Plan Selection</h2>
            <p className="text-blue-100 text-sm mt-1">
              Total Cost: ${total_cost.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-700 py-1 px-3 rounded-full text-xs font-medium flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            {optimization_time_ms.toFixed(0)}ms
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Selected Plan */}
        <div className="border border-green-200 rounded-lg bg-green-50 p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommended Plan
                </h3>
              </div>
              <p className="text-green-800 text-sm mt-1">
                Objective Value: {utility_score.toFixed(3)}
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-full px-3 py-1 text-sm font-medium text-green-800">
              {selected_plan.plan_id}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Details */}
            <div className="bg-white rounded-md p-3 border border-green-100">
              <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                <ShieldIcon className="w-4 h-4 mr-1 text-green-600" />
                Plan Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Name:</span>
                  <span className="font-medium text-gray-900">{selected_plan.plan_marketing_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Type:</span>
                  <span className="font-medium">{selected_plan.plan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metal Level:</span>
                  <span className="font-medium">{selected_plan.metal_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actuarial Value:</span>
                  <span className="font-medium">{(selected_plan.actuarial_value * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Tier:</span>
                  <span className="font-medium capitalize">{selected_plan.network_tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HSA Eligible:</span>
                  <span className="font-medium">{selected_plan.hsa_eligible ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="bg-white rounded-md p-3 border border-green-100">
              <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                <DollarSignIcon className="w-4 h-4 mr-1 text-green-600" />
                Cost Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Premium:</span>
                  <span className="font-medium">
                    ${selected_plan.monthly_premium.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductible:</span>
                  <span className="font-medium">
                    ${selected_plan.deductible.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Out-of-Pocket Max:</span>
                  <span className="font-medium">
                    ${selected_plan.out_of_pocket_max.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Cost:</span>
                  <span className="font-medium">
                    ${(selected_plan.monthly_premium * 12).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Plan Information */}
          <div className="mt-4 bg-white rounded-md p-3 border border-green-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">State:</span>
                <span className="font-medium ml-1">{selected_plan.state_code}</span>
              </div>
              <div>
                <span className="text-gray-600">Issuer ID:</span>
                <span className="font-medium ml-1">{selected_plan.issuer_id}</span>
              </div>
              <div>
                <span className="text-gray-600">Market Coverage:</span>
                <span className="font-medium ml-1">{selected_plan.market_coverage}</span>
              </div>
              <div>
                <span className="text-gray-600">Dental Only:</span>
                <span className="font-medium ml-1">{selected_plan.dental_only_plan ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <StarIcon className="w-5 h-5 mr-2" />
            Optimization Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {utility_score.toFixed(3)}
              </div>
              <div className="text-blue-700">Objective Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${total_cost.toFixed(2)}
              </div>
              <div className="text-blue-700">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {optimization_time_ms.toFixed(0)}ms
              </div>
              <div className="text-blue-700">Optimization Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 