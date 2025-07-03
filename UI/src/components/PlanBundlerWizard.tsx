import React, { useState } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ProgressStream } from './ui/ProgressStream';
import { EmployeeProfile, OptimizationConstraints } from '../types/domain';
import { ChevronRightIcon, UserIcon, ShieldIcon, BarChartIcon, InfoIcon, ChevronDownIcon } from 'lucide-react';

interface PlanBundlerWizardProps {
  onOptimize: (employeeProfiles: EmployeeProfile[], constraints: OptimizationConstraints) => void;
  isOptimizing: boolean;
  optimizationProgress: number;
}

export const PlanBundlerWizard: React.FC<PlanBundlerWizardProps> = ({
  onOptimize,
  isOptimizing,
  optimizationProgress
}) => {
  const [step, setStep] = useState(1);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfile[]>([{
    type: 'young_healthy',
    count: 25,
    ageRange: '21',
    budgetCap: 400,
    stateCode: 'AK',
    tobaccoPreference: 'No Preference'
  }]);

  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    maxMonthlyPremium: 500,
    minActuarialValue: 70,
    preferredMetalLevel: 'Low',
    preferredPlanType: 'PPO',
    requiredBenefits: ['Routine Dental Services (Adult)', 'Dental Check-Up for Children'],
    maxDeductible: 5000,
    hsaEligibleOnly: false
  });

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddEmployeeProfile = () => {
    setEmployeeProfiles([...employeeProfiles, {
      type: `employee_group_${employeeProfiles.length + 1}`,
      count: 10,
      ageRange: 'Family Option',
      budgetCap: 450,
      stateCode: 'AK',
      tobaccoPreference: 'No Preference'
    }]);
  };

  const handleRemoveEmployeeProfile = (index: number) => {
    setEmployeeProfiles(employeeProfiles.filter((_, i) => i !== index));
  };

  const handleUpdateEmployeeProfile = (index: number, updates: Partial<EmployeeProfile>) => {
    setEmployeeProfiles(employeeProfiles.map((profile, i) => i === index ? {
      ...profile,
      ...updates
    } : profile));
  };

  const handleUpdateConstraints = (updates: Partial<OptimizationConstraints>) => {
    setConstraints({
      ...constraints,
      ...updates
    });
  };

  const handleSubmit = () => {
    onOptimize(employeeProfiles, constraints);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="bg-blue-800 px-6 py-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">ICHRA Benefit Bundler</h2>
            <p className="text-blue-100 text-sm mt-1">
              Configure optimization parameters using CMS marketplace data
            </p>
          </div>
          <button
            onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
            className="flex items-center text-blue-100 hover:text-white text-sm transition-colors"
          >
            <InfoIcon className="w-4 h-4 mr-1" />
            Algorithm Info
            {showAlgorithmInfo ? (
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Algorithm Information - Collapsible */}
      {showAlgorithmInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Objective Function</h3>
              <p className="text-blue-700 leading-relaxed">
                Maximize utility combining <strong>premium affordability</strong>, 
                <strong>deductible reasonableness</strong>, <strong>actuarial value</strong>, and 
                <strong>out-of-pocket protection</strong>, weighted by employee preferences.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Key Constraints</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Only one plan per employee group</li>
                <li>• Premium ≤ budget cap</li>
                <li>• HSA plans excluded if not preferred</li>
                <li>• Must meet minimum actuarial value</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {i}
              </div>
              <span className="text-xs mt-1 text-gray-600">
                {i === 1 ? 'Employees' : i === 2 ? 'Constraints' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Employee Profiles */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Employee Demographics
            </h3>
            
            {employeeProfiles.map((profile, index) => (
              <div key={index} className="border rounded-md p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Employee Group {index + 1}</h4>
                  {employeeProfiles.length > 1 && (
                    <button
                      onClick={() => handleRemoveEmployeeProfile(index)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={profile.type}
                      onChange={e => handleUpdateEmployeeProfile(index, { type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      value={profile.count}
                      onChange={e => handleUpdateEmployeeProfile(index, { count: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Age Range
                    </label>
                    <select
                      value={profile.ageRange}
                      onChange={e => handleUpdateEmployeeProfile(index, { ageRange: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="0-20">0-20 years</option>
                      <option value="21">21 years</option>
                      <option value="22">22 years</option>
                      <option value="23">23 years</option>
                      <option value="24">24 years</option>
                      <option value="25">25 years</option>
                      <option value="26">26 years</option>
                      <option value="27">27 years</option>
                      <option value="28">28 years</option>
                      <option value="29">29 years</option>
                      <option value="30">30 years</option>
                      <option value="31">31 years</option>
                      <option value="32">32 years</option>
                      <option value="33">33 years</option>
                      <option value="34">34 years</option>
                      <option value="35">35 years</option>
                      <option value="36">36 years</option>
                      <option value="37">37 years</option>
                      <option value="38">38 years</option>
                      <option value="39">39 years</option>
                      <option value="40">40 years</option>
                      <option value="41">41 years</option>
                      <option value="42">42 years</option>
                      <option value="43">43 years</option>
                      <option value="44">44 years</option>
                      <option value="45">45 years</option>
                      <option value="46">46 years</option>
                      <option value="47">47 years</option>
                      <option value="48">48 years</option>
                      <option value="49">49 years</option>
                      <option value="50">50 years</option>
                      <option value="51">51 years</option>
                      <option value="52">52 years</option>
                      <option value="53">53 years</option>
                      <option value="54">54 years</option>
                      <option value="55">55 years</option>
                      <option value="56">56 years</option>
                      <option value="57">57 years</option>
                      <option value="58">58 years</option>
                      <option value="59">59 years</option>
                      <option value="60">60 years</option>
                      <option value="61">61 years</option>
                      <option value="62">62 years</option>
                      <option value="63">63 years</option>
                      <option value="64">64 years</option>
                      <option value="Family Option">Family Option</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State Code
                    </label>
                    <select
                      value={profile.stateCode}
                      onChange={e => handleUpdateEmployeeProfile(index, { stateCode: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="AK">Alaska (AK)</option>
                      <option value="AL">Alabama (AL)</option>
                      <option value="AR">Arkansas (AR)</option>
                      <option value="AZ">Arizona (AZ)</option>
                      <option value="CA">California (CA)</option>
                      <option value="CO">Colorado (CO)</option>
                      <option value="CT">Connecticut (CT)</option>
                      <option value="DC">District of Columbia (DC)</option>
                      <option value="DE">Delaware (DE)</option>
                      <option value="FL">Florida (FL)</option>
                      <option value="GA">Georgia (GA)</option>
                      <option value="HI">Hawaii (HI)</option>
                      <option value="IA">Iowa (IA)</option>
                      <option value="ID">Idaho (ID)</option>
                      <option value="IL">Illinois (IL)</option>
                      <option value="IN">Indiana (IN)</option>
                      <option value="KS">Kansas (KS)</option>
                      <option value="KY">Kentucky (KY)</option>
                      <option value="LA">Louisiana (LA)</option>
                      <option value="MA">Massachusetts (MA)</option>
                      <option value="MD">Maryland (MD)</option>
                      <option value="ME">Maine (ME)</option>
                      <option value="MI">Michigan (MI)</option>
                      <option value="MN">Minnesota (MN)</option>
                      <option value="MO">Missouri (MO)</option>
                      <option value="MS">Mississippi (MS)</option>
                      <option value="MT">Montana (MT)</option>
                      <option value="NC">North Carolina (NC)</option>
                      <option value="ND">North Dakota (ND)</option>
                      <option value="NE">Nebraska (NE)</option>
                      <option value="NH">New Hampshire (NH)</option>
                      <option value="NJ">New Jersey (NJ)</option>
                      <option value="NM">New Mexico (NM)</option>
                      <option value="NV">Nevada (NV)</option>
                      <option value="NY">New York (NY)</option>
                      <option value="OH">Ohio (OH)</option>
                      <option value="OK">Oklahoma (OK)</option>
                      <option value="OR">Oregon (OR)</option>
                      <option value="PA">Pennsylvania (PA)</option>
                      <option value="RI">Rhode Island (RI)</option>
                      <option value="SC">South Carolina (SC)</option>
                      <option value="SD">South Dakota (SD)</option>
                      <option value="TN">Tennessee (TN)</option>
                      <option value="TX">Texas (TX)</option>
                      <option value="UT">Utah (UT)</option>
                      <option value="VA">Virginia (VA)</option>
                      <option value="VT">Vermont (VT)</option>
                      <option value="WA">Washington (WA)</option>
                      <option value="WI">Wisconsin (WI)</option>
                      <option value="WV">West Virginia (WV)</option>
                      <option value="WY">Wyoming (WY)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Budget Cap ($)
                    </label>
                    <input
                      type="number"
                      value={profile.budgetCap}
                      onChange={e => handleUpdateEmployeeProfile(index, { budgetCap: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tobacco Preference
                    </label>
                    <select
                      value={profile.tobaccoPreference}
                      onChange={e => handleUpdateEmployeeProfile(index, { 
                        tobaccoPreference: e.target.value as 'No Preference' | 'Tobacco' | 'Non-Tobacco' 
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="No Preference">No Preference</option>
                      <option value="Tobacco">Tobacco</option>
                      <option value="Non-Tobacco">Non-Tobacco</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleAddEmployeeProfile}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Add Employee Group
            </button>
            
            <div className="flex justify-end">
              <button
                onClick={handleNextStep}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                Next Step
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Optimization Constraints */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ShieldIcon className="w-5 h-5 mr-2 text-blue-600" />
              Optimization Constraints
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Monthly Premium ($)
                </label>
                <input
                  type="number"
                  value={constraints.maxMonthlyPremium}
                  onChange={e => handleUpdateConstraints({ maxMonthlyPremium: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Actuarial Value (%)
                </label>
                <input
                  type="number"
                  min="60"
                  max="100"
                  value={constraints.minActuarialValue}
                  onChange={e => handleUpdateConstraints({ minActuarialValue: parseInt(e.target.value) || 70 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Metal Level
                </label>
                <select
                  value={constraints.preferredMetalLevel}
                  onChange={e => handleUpdateConstraints({ preferredMetalLevel: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="Low">Low (Bronze)</option>
                  <option value="High">High (Gold/Platinum)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Plan Type
                </label>
                <select
                  value={constraints.preferredPlanType}
                  onChange={e => handleUpdateConstraints({ preferredPlanType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="PPO">PPO</option>
                  <option value="HMO">HMO</option>
                  <option value="EPO">EPO</option>
                  <option value="POS">POS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Deductible ($)
                </label>
                <input
                  type="number"
                  value={constraints.maxDeductible || ''}
                  onChange={e => handleUpdateConstraints({ maxDeductible: parseInt(e.target.value) || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  HSA Eligible Only
                </label>
                <select
                  value={constraints.hsaEligibleOnly ? 'true' : 'false'}
                  onChange={e => handleUpdateConstraints({ hsaEligibleOnly: e.target.value === 'true' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Benefits
              </label>
              <div className="space-y-2">
                {[
                  'Routine Dental Services (Adult)',
                  'Dental Check-Up for Children',
                  'Basic Dental Care - Child',
                  'Orthodontia - Child',
                  'Emergency Room',
                  'Urgent Care',
                  'Primary Care Physician',
                  'Specialist',
                  'Prescription Drugs'
                ].map(benefit => (
                  <label key={benefit} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={constraints.requiredBenefits.includes(benefit)}
                      onChange={e => {
                        if (e.target.checked) {
                          handleUpdateConstraints({
                            requiredBenefits: [...constraints.requiredBenefits, benefit]
                          });
                        } else {
                          handleUpdateConstraints({
                            requiredBenefits: constraints.requiredBenefits.filter(b => b !== benefit)
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{benefit}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                Next Step
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review and Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChartIcon className="w-5 h-5 mr-2 text-blue-600" />
              Review Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Employee Groups</h4>
                {employeeProfiles.map((profile, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                    <p className="text-sm">
                      <span className="font-medium">{profile.type}</span>: {profile.count} employees, 
                      Age: {profile.ageRange}, State: {profile.stateCode}, 
                      Budget: ${profile.budgetCap}/month, Tobacco: {profile.tobaccoPreference}
                    </p>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Optimization Constraints</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">
                    Max Premium: ${constraints.maxMonthlyPremium}, Min AV: {constraints.minActuarialValue}%, 
                    Metal Level: {constraints.preferredMetalLevel}, Plan Type: {constraints.preferredPlanType}
                  </p>
                  <p className="text-sm mt-1">
                    Required Benefits: {constraints.requiredBenefits.join(', ')}
                  </p>
                  {constraints.maxDeductible && (
                    <p className="text-sm mt-1">Max Deductible: ${constraints.maxDeductible}</p>
                  )}
                  <p className="text-sm mt-1">
                    HSA Eligible Only: {constraints.hsaEligibleOnly ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={isOptimizing}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isOptimizing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Optimizing...</span>
                  </>
                ) : (
                  <>
                    <BarChartIcon className="w-4 h-4 mr-2" />
                    Start Optimization
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Progress Stream */}
        {isOptimizing && (
          <div className="mt-6">
            <ProgressStream progress={optimizationProgress} />
          </div>
        )}
      </div>
    </div>
  );
};