import pulp
import pandas as pd
import time
from typing import List, Optional
from app.models.domain import Benefit, BundleRequest, EmployeeProfile, PlanFeature, BundleResult

class BundleOptimizer:
    def __init__(self):
        self.problem = None
    
    def optimize_bundle(self, available_benefits: List[Benefit], bundle_request: BundleRequest) -> List[Benefit]:
        """
        Optimize bundle selection using linear programming
        """
        if not available_benefits:
            return []
        
        # Create optimization problem
        self.problem = pulp.LpProblem("ICHRA_Bundle_Optimization", pulp.LpMinimize)
        
        # Create decision variables (binary: 1 if benefit is selected, 0 otherwise)
        benefit_vars = {}
        for benefit in available_benefits:
            benefit_vars[benefit.id] = pulp.LpVariable(
                f"benefit_{benefit.id}",
                cat=pulp.LpBinary
            )
        
        # Objective function: minimize total monthly premium
        self.problem += pulp.lpSum([
            benefit.monthly_premium * benefit_vars[benefit.id]
            for benefit in available_benefits
        ])
        
        # Constraints
        self._add_budget_constraint(benefit_vars, available_benefits, bundle_request)
        self._add_benefit_type_constraints(benefit_vars, available_benefits, bundle_request)
        self._add_deductible_constraints(benefit_vars, available_benefits, bundle_request)
        self._add_provider_preferences(benefit_vars, available_benefits, bundle_request)
        
        # Solve the problem
        self.problem.solve()
        
        # Extract solution
        selected_benefits = []
        for benefit in available_benefits:
            if benefit_vars[benefit.id].value() == 1:
                selected_benefits.append(benefit)
        
        return selected_benefits
    
    def _add_budget_constraint(self, benefit_vars, available_benefits: List[Benefit], bundle_request: BundleRequest):
        """
        Add budget constraint if specified
        """
        if bundle_request.budget_constraint:
            self.problem += pulp.lpSum([
                benefit.monthly_premium * benefit_vars[benefit.id]
                for benefit in available_benefits
            ]) <= bundle_request.budget_constraint
    
    def _add_benefit_type_constraints(self, benefit_vars, available_benefits: List[Benefit], bundle_request: BundleRequest):
        """
        Ensure at least one benefit of each requested type is selected
        """
        for benefit_type in bundle_request.benefit_types:
            type_benefits = [b for b in available_benefits if b.type == benefit_type]
            if type_benefits:
                self.problem += pulp.lpSum([
                    benefit_vars[benefit.id] for benefit in type_benefits
                ]) >= 1
    
    def _add_deductible_constraints(self, benefit_vars, available_benefits: List[Benefit], bundle_request: BundleRequest):
        """
        Add deductible constraints if specified
        """
        if bundle_request.max_deductible:
            self.problem += pulp.lpSum([
                benefit.annual_deductible * benefit_vars[benefit.id]
                for benefit in available_benefits
            ]) <= bundle_request.max_deductible
        
        if bundle_request.max_out_of_pocket:
            self.problem += pulp.lpSum([
                benefit.max_out_of_pocket * benefit_vars[benefit.id]
                for benefit in available_benefits
            ]) <= bundle_request.max_out_of_pocket
    
    def _add_provider_preferences(self, benefit_vars, available_benefits: List[Benefit], bundle_request: BundleRequest):
        """
        Add provider preference constraints if specified
        """
        if bundle_request.preferred_providers:
            # Prefer benefits from preferred providers
            preferred_benefits = [
                b for b in available_benefits 
                if b.provider in bundle_request.preferred_providers
            ]
            non_preferred_benefits = [
                b for b in available_benefits 
                if b.provider not in bundle_request.preferred_providers
            ]
            
            # Add constraint to prefer preferred providers when possible
            if preferred_benefits and non_preferred_benefits:
                self.problem += pulp.lpSum([
                    benefit_vars[b.id] for b in preferred_benefits
                ]) >= pulp.lpSum([
                    benefit_vars[b.id] for b in non_preferred_benefits
                ])
    
    def get_optimization_status(self) -> str:
        """
        Get the status of the optimization problem
        """
        if self.problem:
            return pulp.LpStatus[self.problem.status]
        return "No problem solved"
    
    def get_objective_value(self) -> Optional[float]:
        """
        Get the objective value of the solved problem
        """
        if self.problem and self.problem.status == pulp.LpStatusOptimal:
            return pulp.value(self.problem.objective)
        return None

class BenefitBundler:
    def optimize(self, profile: EmployeeProfile, plans: List[PlanFeature]) -> BundleResult:
        start_time = time.time()
        if not plans:
            raise ValueError("No plans provided for optimization.")

        # Decision variables: plan_selected[plan_id] = Binary
        plan_vars = {plan.plan_id: pulp.LpVariable(f"plan_{plan.plan_id}", cat=pulp.LpBinary) for plan in plans}

        # Utility function for each plan
        def utility(plan: PlanFeature, profile: EmployeeProfile) -> float:
            # Lower premium is better
            premium_score = max(0, 1 - (plan.monthly_premium / max(1, profile.budget_cap)))
            # Lower deductible is better, especially for high risk
            deductible_score = max(0, 1 - (plan.deductible / max(1, profile.budget_cap * 12))) * (0.5 + profile.risk_score/2)
            # Higher actuarial value is better
            av_score = plan.actuarial_value
            # Lower out-of-pocket max is better
            oop_score = max(0, 1 - (plan.out_of_pocket_max / max(1, profile.budget_cap * 12)))
            # Weighted sum
            weights = profile.preference_weights
            score = (
                weights.get("cost", 0.4) * premium_score +
                weights.get("coverage", 0.3) * av_score +
                weights.get("network", 0.2) * oop_score +
                weights.get("flexibility", 0.1) * deductible_score
            )
            return score

        # Create the optimization problem
        prob = pulp.LpProblem("Plan_Selection", pulp.LpMaximize)

        # Objective: maximize sum(plan_selected[i] * utility(plan[i], profile))
        prob += pulp.lpSum([plan_vars[plan.plan_id] * utility(plan, profile) for plan in plans])

        # Constraint: Only one plan can be selected
        prob += pulp.lpSum([plan_vars[plan.plan_id] for plan in plans]) == 1

        # Constraint: Selected plan premium <= budget_cap
        prob += pulp.lpSum([plan_vars[plan.plan_id] * plan.monthly_premium for plan in plans]) <= profile.budget_cap

        # Constraint: If not HSA eligible, can't select HSA plans
        if not any([w for w in profile.preference_weights if 'hsa' in w.lower()]):
            for plan in plans:
                if plan.hsa_eligible:
                    prob += plan_vars[plan.plan_id] == 0

        # Solve
        prob.solve()
        status = pulp.LpStatus[prob.status]
        if status != 'Optimal':
            raise RuntimeError(f"Optimization failed: {status}")

        # Find selected plan
        selected_plan = None
        for plan in plans:
            if plan_vars[plan.plan_id].varValue == 1:
                selected_plan = plan
                break
        if not selected_plan:
            raise RuntimeError("No plan selected by optimization.")

        # Compute utility and cost
        utility_score = utility(selected_plan, profile)
        total_cost = selected_plan.monthly_premium
        optimization_time_ms = (time.time() - start_time) * 1000

        return BundleResult(
            selected_plan=selected_plan,
            utility_score=utility_score,
            total_cost=total_cost,
            optimization_time_ms=optimization_time_ms
        ) 