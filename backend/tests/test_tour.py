import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tour-cost-planner.preview.emergentagent.com').rstrip('/')

# Health check
def test_api_health():
    """Test API root endpoint"""
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"

# Validation tests
def test_tour_generate_missing_place():
    """Missing place should return 422"""
    r = requests.post(f"{BASE_URL}/api/tour/generate", json={"days": 3})
    assert r.status_code == 422

def test_tour_generate_invalid_days():
    """Days=0 should return 422"""
    r = requests.post(f"{BASE_URL}/api/tour/generate", json={"place": "Goa", "days": 0})
    assert r.status_code == 422

def test_tour_generate_too_many_days():
    """Days > 30 should return 422"""
    r = requests.post(f"{BASE_URL}/api/tour/generate", json={"place": "Goa", "days": 31})
    assert r.status_code == 422

def test_tour_generate_goa():
    """Test full tour generation for Goa - 3 days (may take 10-30 seconds)"""
    r = requests.post(
        f"{BASE_URL}/api/tour/generate",
        json={"place": "Goa", "days": 3},
        timeout=60
    )
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:300]}"
    data = r.json()
    
    # Check top-level fields
    assert "itinerary" in data, "Missing itinerary"
    assert "premium_plan" in data, "Missing premium_plan"
    assert "budget_plan" in data, "Missing budget_plan"
    assert "destination" in data
    assert "duration_days" in data
    
    # Check itinerary has 3 days
    assert len(data["itinerary"]) == 3, f"Expected 3 days, got {len(data['itinerary'])}"
    
    # Check premium_plan structure
    premium = data["premium_plan"]
    assert "hotel" in premium
    assert "transport" in premium
    assert "grand_total_inr" in premium
    assert premium["hotel"].get("vehicle_type") != "Hatchback" or premium.get("transport", {}).get("vehicle_type") != "Hatchback"
    assert premium["transport"]["vehicle_type"] == "Sedan"
    
    # Check budget_plan structure
    budget = data["budget_plan"]
    assert "hotel" in budget
    assert "transport" in budget
    assert budget["transport"]["vehicle_type"] == "Hatchback"
    assert "grand_total_inr" in budget
    
    # Check INR values are numbers not strings
    assert isinstance(premium["grand_total_inr"], (int, float))
    assert isinstance(budget["grand_total_inr"], (int, float))

def test_tour_generate_with_budget():
    """Test tour generation with budget parameter"""
    r = requests.post(
        f"{BASE_URL}/api/tour/generate",
        json={"place": "Delhi", "days": 2, "budget": 15000},
        timeout=60
    )
    assert r.status_code == 200
    data = r.json()
    assert "itinerary" in data
    assert len(data["itinerary"]) == 2

def test_tour_history():
    """Test tour history endpoint"""
    r = requests.get(f"{BASE_URL}/api/tour/history")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
