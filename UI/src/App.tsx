import { useState } from 'react';
import { PlanBundlerWizard } from './components/PlanBundlerWizard';
import { OptimizationResults } from './components/OptimizationResults';
import { mockOptimize } from './services/api';
import { EmployeeProfile, OptimizationResponse } from './types/domain';

export function App() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResponse | null>(null);

  const handleOptimize = async (employeeProfiles: EmployeeProfile[], constraints: any) => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setOptimizationResults(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 300);

    try {
      // Real API call with simulated delay
      const results = await mockOptimize(employeeProfiles, constraints);
      clearInterval(progressInterval);
      setOptimizationProgress(100);

      // Short delay before showing results to complete the progress animation
      setTimeout(() => {
        setOptimizationResults(results);
        setIsOptimizing(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Optimization failed:', error);
      setIsOptimizing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-blue-800">
            ICHRA Benefit Bundler
          </h1>
          <p className="text-gray-600 mt-2">
            Optimize health plan selections for your employees using CMS marketplace data
          </p>
        </header>
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-5 lg:col-span-4">
            <PlanBundlerWizard
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              optimizationProgress={optimizationProgress}
            />
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <OptimizationResults
              results={optimizationResults}
              isLoading={isOptimizing}
              progress={optimizationProgress}
            />
          </div>
        </div>
      </div>
    </main>
  );
}