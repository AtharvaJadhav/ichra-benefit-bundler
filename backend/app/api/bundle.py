from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.models.schemas import BundleRequest, BundleResponse, Bundle, OptimizationRequest, BundleResult, PlanFeature
from app.services.bundle_service import BundleService
from app.services.data_service import DataService
from app.optimization.bundler import BenefitBundler

router = APIRouter()

def get_data_service():
    return DataService()

def get_benefit_bundler():
    return BenefitBundler()

@router.post("/bundles", response_model=BundleResponse)
async def create_bundle(bundle_request: BundleRequest):
    """
    Create a new ICHRA benefit bundle based on the provided requirements
    """
    try:
        bundle_service = BundleService()
        bundle = await bundle_service.create_bundle(bundle_request)
        return BundleResponse(
            success=True,
            bundle=bundle,
            message="Bundle created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bundles", response_model=List[Bundle])
async def get_bundles(limit: Optional[int] = 10, offset: Optional[int] = 0):
    """
    Get a list of available benefit bundles
    """
    try:
        bundle_service = BundleService()
        bundles = await bundle_service.get_bundles(limit=limit, offset=offset)
        return bundles
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bundles/{bundle_id}", response_model=Bundle)
async def get_bundle(bundle_id: str):
    """
    Get a specific benefit bundle by ID
    """
    try:
        bundle_service = BundleService()
        bundle = await bundle_service.get_bundle(bundle_id)
        if not bundle:
            raise HTTPException(status_code=404, detail="Bundle not found")
        return bundle
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/bundles/{bundle_id}", response_model=BundleResponse)
async def update_bundle(bundle_id: str, bundle_request: BundleRequest):
    """
    Update an existing benefit bundle
    """
    try:
        bundle_service = BundleService()
        bundle = await bundle_service.update_bundle(bundle_id, bundle_request)
        return BundleResponse(
            success=True,
            bundle=bundle,
            message="Bundle updated successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/bundles/{bundle_id}")
async def delete_bundle(bundle_id: str):
    """
    Delete a benefit bundle
    """
    try:
        bundle_service = BundleService()
        await bundle_service.delete_bundle(bundle_id)
        return {"message": "Bundle deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/optimize", response_model=BundleResult, status_code=status.HTTP_200_OK)
async def optimize_bundle(
    request: OptimizationRequest,
    data_service: DataService = Depends(get_data_service),
    bundler: BenefitBundler = Depends(get_benefit_bundler)
):
    """
    Optimize a benefit bundle for an employee profile and state.
    """
    try:
        plans = data_service.get_plans_by_state(request.state_code)
        if not plans:
            raise HTTPException(status_code=404, detail=f"No plans found for state {request.state_code}")
        result = bundler.optimize(request.employee_profile, plans)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@router.get("/plans/{state_code}", response_model=List[PlanFeature], status_code=status.HTTP_200_OK)
async def get_plans_for_state(
    state_code: str,
    data_service: DataService = Depends(get_data_service)
):
    """
    Get available plans for a state.
    """
    try:
        plans = data_service.get_plans_by_state(state_code)
        if not plans:
            raise HTTPException(status_code=404, detail=f"No plans found for state {state_code}")
        return plans
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load plans: {str(e)}")

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"} 