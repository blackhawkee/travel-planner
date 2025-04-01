from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from .llm_service import get_llm_service, LLMService

travel_router = APIRouter(tags=["Travel"])

class TravelPlanRequest(BaseModel):
    destination: str
    duration: int
    budget: Optional[str] = None
    interests: Optional[List[str]] = None
    travel_style: Optional[str] = None
    llm_provider: Optional[str] = "gemini" # Default to Gemini Pro

class RecommendationRequest(BaseModel):
    current_location: str
    interests: List[str]
    travel_history: Optional[List[str]] = None
    budget: Optional[str] = None
    season: Optional[str] = None
    llm_provider: Optional[str] = "gemini" # Default to Gemini Pro

@travel_router.post("/plan", status_code=status.HTTP_200_OK)
async def create_travel_plan(request: TravelPlanRequest, llm_service: LLMService = Depends(get_llm_service)):
    try:
        # Validate inputs
        if request.duration <= 0:
            raise ValueError("Duration must be greater than 0 days")
            
        if not request.destination or len(request.destination.strip()) == 0:
            raise ValueError("Destination cannot be empty")
        
        prompt = f"""
        Create a detailed travel plan for a trip to {request.destination} for {request.duration} days.
        {f'Budget: {request.budget}' if request.budget else ''}
        {f'Interests: {", ".join(request.interests)}' if request.interests else ''}
        {f'Travel style: {request.travel_style}' if request.travel_style else ''}
        
        Include:
        1. Day-by-day itinerary with activities
        2. Recommended accommodations
        3. Transportation tips
        4. Must-see attractions
        5. Local food recommendations
        6. Estimated costs
        7. Packing suggestions
        8. Safety tips
        
        Format the response neatly with clear sections and subsections.
        """
        
        response = await llm_service.generate_completion(prompt, request.llm_provider)
        return {"plan": response}
    except ValueError as e:
        # Client error - bad input
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException as e:
        # Re-raise HTTP exceptions as-is
        raise e
    except Exception as e:
        # Server error - log and return generic error
        print(f"Error in create_travel_plan: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                           detail="An error occurred while generating the travel plan. Please try again later.")

@travel_router.post("/recommend", status_code=status.HTTP_200_OK)
async def get_destination_recommendations(
    request: RecommendationRequest, 
    llm_service: LLMService = Depends(get_llm_service)
):
    try:
        # Validate inputs
        if not request.interests or len(request.interests) == 0:
            raise ValueError("At least one interest must be provided")
        
        prompt = f"""
        Recommend 5 travel destinations based on the following information:
        Current location: {request.current_location}
        Interests: {", ".join(request.interests)}
        {f'Travel history: {", ".join(request.travel_history)}' if request.travel_history else ''}
        {f'Budget: {request.budget}' if request.budget else ''}
        {f'Season: {request.season}' if request.season else ''}
        
        For each destination, provide:
        1. Why it matches the user's interests
        2. Best time to visit
        3. Estimated budget needed
        4. Top 3 attractions
        5. A unique experience only possible there
        
        Format as a structured list with clear sections for each destination.
        """
        
        response = await llm_service.generate_completion(prompt, request.llm_provider)
        return {"recommendations": response}
    except ValueError as e:
        # Client error - bad input
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException as e:
        # Re-raise HTTP exceptions as-is
        raise e
    except Exception as e:
        # Server error - log and return generic error
        print(f"Error in get_destination_recommendations: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                           detail="An error occurred while generating recommendations. Please try again later.") 