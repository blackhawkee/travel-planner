from typing import Any, List, Dict, Optional
from mcp.server.fastmcp import FastMCP
import json
import datetime
import random

# Initialize FastMCP server
mcp = FastMCP("transport-hotels")

# Sample data
CITIES = [
    "Paris", "London", "New York", "Tokyo", "Rome", "Amsterdam", "Berlin",
    "Madrid", "Barcelona", "Vienna", "Prague", "Athens", "Bangkok", "Singapore",
    "Sydney", "Cairo", "Istanbul", "Dubai", "Las Vegas", "San Francisco"
]

AIRLINES = ["SkyWings", "GlobalAir", "TransAtlantic", "PacificFlyers", "Continental Express"]
TRAIN_COMPANIES = ["EuroRail", "SpeedTrain", "ExpressConnect", "RailLink", "TrackMaster"]
BUS_COMPANIES = ["RoadTripper", "BusExplorer", "CityConnect", "CountryTours", "ExpressBus"]
HOTEL_CHAINS = ["LuxStay", "ComfortInn", "TravelLodge", "CityHotels", "VacationResort"]

# Sample data generator functions
def generate_transport_options(origin: str, destination: str, date: str, transport_type: str) -> List[Dict]:
    """Generate sample transport options based on type, origin, destination and date."""
    try:
        # Parse the date
        travel_date = datetime.datetime.strptime(date, "%Y-%m-%d")
        
        # Generate 3-5 options
        num_options = random.randint(3, 5)
        options = []
        
        companies = []
        if transport_type.lower() == "flight":
            companies = AIRLINES
            duration_base = 60 + random.randint(30, 240)  # 1.5-5 hours
            price_base = 150 + random.randint(50, 500)
        elif transport_type.lower() == "train":
            companies = TRAIN_COMPANIES
            duration_base = 90 + random.randint(30, 180)  # 2-4.5 hours
            price_base = 50 + random.randint(20, 150)
        elif transport_type.lower() == "bus":
            companies = BUS_COMPANIES
            duration_base = 120 + random.randint(60, 240)  # 3-6 hours
            price_base = 20 + random.randint(10, 80)
        else:
            return []
        
        for i in range(num_options):
            # Generate departure time (between 6am and 10pm)
            departure_hour = random.randint(6, 22)
            departure_minute = random.choice([0, 15, 30, 45])
            departure_time = travel_date.replace(hour=departure_hour, minute=departure_minute)
            
            # Random duration (varies by transport type)
            duration_minutes = duration_base + random.randint(-30, 30)
            
            # Calculate arrival time
            arrival_time = departure_time + datetime.timedelta(minutes=duration_minutes)
            
            # Random price (varies by transport type)
            price = price_base + random.randint(-20, 100)
            
            # Random company
            company = random.choice(companies)
            
            # Generate a transport ID
            transport_id = f"{transport_type[0]}{random.randint(1000, 9999)}"
            
            options.append({
                "id": transport_id,
                "type": transport_type,
                "company": company,
                "origin": origin,
                "destination": destination,
                "departure": departure_time.strftime("%Y-%m-%d %H:%M"),
                "arrival": arrival_time.strftime("%Y-%m-%d %H:%M"),
                "duration": f"{duration_minutes // 60}h {duration_minutes % 60}m",
                "price": price,
                "currency": "USD",
                "seats_available": random.randint(1, 30),
                "class": random.choice(["Economy", "Business", "First Class"]) if transport_type == "flight" else random.choice(["Standard", "Premium", "Deluxe"])
            })
        
        return sorted(options, key=lambda x: x["price"])
        
    except Exception as e:
        print(f"Error generating transport options: {e}")
        return []

def generate_hotel_options(city: str, check_in: str, check_out: str, guests: int) -> List[Dict]:
    """Generate sample hotel options for a city and date range."""
    try:
        # Parse dates
        check_in_date = datetime.datetime.strptime(check_in, "%Y-%m-%d")
        check_out_date = datetime.datetime.strptime(check_out, "%Y-%m-%d")
        
        # Calculate number of nights
        nights = (check_out_date - check_in_date).days
        if nights <= 0:
            return []
        
        # Generate 3-7 hotel options
        num_options = random.randint(3, 7)
        options = []
        
        for i in range(num_options):
            # Random hotel chain
            hotel_chain = random.choice(HOTEL_CHAINS)
            
            # Hotel name (chain + city + descriptor)
            descriptors = ["Plaza", "Grand", "Royal", "Central", "Resort", "Suites", "Inn"]
            hotel_name = f"{hotel_chain} {city} {random.choice(descriptors)}"
            
            # Random star rating (3-5)
            stars = random.randint(3, 5)
            
            # Base price per night (varies by star rating)
            base_price = 50 + (stars * 30) + random.randint(0, 100)
            
            # Adjust price for number of guests
            guest_factor = 1.0 + ((guests - 1) * 0.3)  # Each additional guest adds 30%
            price_per_night = int(base_price * guest_factor)
            
            # Total price for the stay
            total_price = price_per_night * nights
            
            # Random amenities
            all_amenities = ["WiFi", "Pool", "Gym", "Restaurant", "Bar", "Room Service", "Spa", "Parking", "Airport Shuttle", "Breakfast Included"]
            num_amenities = random.randint(3, len(all_amenities))
            amenities = random.sample(all_amenities, num_amenities)
            
            # Generate hotel ID
            hotel_id = f"H{random.randint(1000, 9999)}"
            
            options.append({
                "id": hotel_id,
                "name": hotel_name,
                "chain": hotel_chain,
                "city": city,
                "address": f"{random.randint(1, 999)} {random.choice(['Main', 'First', 'Park', 'Oak', 'Maple', 'Pine'])} {random.choice(['Street', 'Avenue', 'Boulevard', 'Road'])}",
                "stars": stars,
                "price_per_night": price_per_night,
                "total_price": total_price,
                "currency": "USD",
                "check_in": check_in,
                "check_out": check_out,
                "nights": nights,
                "guests": guests,
                "amenities": amenities,
                "rooms_available": random.randint(1, 10),
                "rating": round(3.0 + random.random() * 2.0, 1),  # Random rating between 3.0 and 5.0
                "reviews": random.randint(50, 500)
            })
        
        return sorted(options, key=lambda x: x["total_price"])
        
    except Exception as e:
        print(f"Error generating hotel options: {e}")
        return []

# MCP Tools
@mcp.tool()
async def search_flights(origin: str, destination: str, date: str) -> str:
    """Search for available flights between two cities on a specific date.
    
    Args:
        origin: City of departure
        destination: City of arrival
        date: Travel date in YYYY-MM-DD format
    
    Returns:
        JSON string containing available flight options
    """
    flights = generate_transport_options(origin, destination, date, "flight")
    return json.dumps(flights, indent=2)

@mcp.tool()
async def search_trains(origin: str, destination: str, date: str) -> str:
    """Search for available train connections between two cities on a specific date.
    
    Args:
        origin: City of departure
        destination: City of arrival
        date: Travel date in YYYY-MM-DD format
    
    Returns:
        JSON string containing available train options
    """
    trains = generate_transport_options(origin, destination, date, "train")
    return json.dumps(trains, indent=2)

@mcp.tool()
async def search_buses(origin: str, destination: str, date: str) -> str:
    """Search for available bus connections between two cities on a specific date.
    
    Args:
        origin: City of departure
        destination: City of arrival
        date: Travel date in YYYY-MM-DD format
    
    Returns:
        JSON string containing available bus options
    """
    buses = generate_transport_options(origin, destination, date, "bus")
    return json.dumps(buses, indent=2)

@mcp.tool()
async def search_hotels(city: str, check_in: str, check_out: str, guests: int = 1) -> str:
    """Search for available hotels in a city for a specific date range.
    
    Args:
        city: City name
        check_in: Check-in date in YYYY-MM-DD format
        check_out: Check-out date in YYYY-MM-DD format
        guests: Number of guests (default: 1)
    
    Returns:
        JSON string containing available hotel options
    """
    hotels = generate_hotel_options(city, check_in, check_out, guests)
    return json.dumps(hotels, indent=2)

@mcp.tool()
async def get_transport_details(transport_id: str) -> str:
    """Get detailed information about a specific transport booking.
    
    Args:
        transport_id: The ID of the transport booking
    
    Returns:
        JSON string containing transport details
    """
    # In a real app, this would look up the booking in a database
    # For the demo, we'll generate a random transport detail
    transport_type = "flight" if transport_id.startswith("F") else "train" if transport_id.startswith("T") else "bus"
    
    details = {
        "id": transport_id,
        "type": transport_type,
        "status": "Confirmed",
        "company": random.choice(AIRLINES if transport_type == "flight" else TRAIN_COMPANIES if transport_type == "train" else BUS_COMPANIES),
        "origin": random.choice(CITIES),
        "destination": random.choice(CITIES),
        "departure": (datetime.datetime.now() + datetime.timedelta(days=random.randint(7, 30))).strftime("%Y-%m-%d %H:%M"),
        "booking_reference": f"REF{random.randint(10000, 99999)}",
        "passenger_name": "Sample Passenger",
        "ticket_class": random.choice(["Economy", "Business", "First Class"]) if transport_type == "flight" else random.choice(["Standard", "Premium"]),
        "seat": f"{random.choice('ABCDEF')}{random.randint(1, 30)}",
        "gate": f"{random.choice('ABCDE')}{random.randint(1, 20)}" if transport_type == "flight" else None,
        "terminal": str(random.randint(1, 5)) if transport_type == "flight" else None,
        "baggage_allowance": f"{random.randint(1, 2)} x {random.randint(20, 25)}kg" if transport_type == "flight" else None,
        "check_in_time": "2 hours before departure" if transport_type == "flight" else "30 minutes before departure",
        "special_instructions": "Please arrive early to complete security checks." if transport_type == "flight" else "Please have your booking reference ready for boarding."
    }
    
    return json.dumps(details, indent=2)

@mcp.tool()
async def get_hotel_details(hotel_id: str) -> str:
    """Get detailed information about a specific hotel booking.
    
    Args:
        hotel_id: The ID of the hotel booking
    
    Returns:
        JSON string containing hotel details
    """
    # In a real app, this would look up the booking in a database
    # For the demo, we'll generate a random hotel detail
    
    city = random.choice(CITIES)
    hotel_chain = random.choice(HOTEL_CHAINS)
    descriptors = ["Plaza", "Grand", "Royal", "Central", "Resort", "Suites", "Inn"]
    hotel_name = f"{hotel_chain} {city} {random.choice(descriptors)}"
    
    check_in_date = datetime.datetime.now() + datetime.timedelta(days=random.randint(7, 30))
    nights = random.randint(2, 7)
    check_out_date = check_in_date + datetime.timedelta(days=nights)
    
    stars = random.randint(3, 5)
    price_per_night = 50 + (stars * 30) + random.randint(0, 100)
    
    details = {
        "id": hotel_id,
        "name": hotel_name,
        "chain": hotel_chain,
        "address": f"{random.randint(1, 999)} {random.choice(['Main', 'First', 'Park', 'Oak', 'Maple', 'Pine'])} {random.choice(['Street', 'Avenue', 'Boulevard', 'Road'])}, {city}",
        "contact": f"+1 555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "booking_reference": f"BK{random.randint(10000, 99999)}",
        "status": "Confirmed",
        "guest_name": "Sample Guest",
        "check_in": check_in_date.strftime("%Y-%m-%d"),
        "check_out": check_out_date.strftime("%Y-%m-%d"),
        "nights": nights,
        "room_type": random.choice(["Standard", "Deluxe", "Suite", "Executive"]),
        "guests": random.randint(1, 3),
        "price_per_night": price_per_night,
        "total_price": price_per_night * nights,
        "currency": "USD",
        "amenities": random.sample(["WiFi", "Pool", "Gym", "Restaurant", "Bar", "Room Service", "Spa", "Parking", "Airport Shuttle", "Breakfast Included"], random.randint(3, 6)),
        "check_in_time": "After 3:00 PM",
        "check_out_time": "Before 11:00 AM",
        "special_requests": "Non-smoking room" if random.random() > 0.5 else None
    }
    
    return json.dumps(details, indent=2)

@mcp.tool()
async def reserve_transport(transport_id: str, passenger_name: str, email: str) -> str:
    """Reserve a transport ticket and hold it for payment.
    
    Args:
        transport_id: The ID of the transport option to reserve
        passenger_name: Full name of the passenger
        email: Email address for booking confirmation
    
    Returns:
        JSON string containing reservation details
    """
    # In a real app, this would create a reservation in a database
    transport_type = "flight" if transport_id.startswith("F") else "train" if transport_id.startswith("T") else "bus"
    reservation = {
        "reservation_id": f"R{random.randint(10000, 99999)}",
        "transport_id": transport_id,
        "transport_type": transport_type,
        "status": "Reserved",
        "passenger_name": passenger_name,
        "email": email,
        "reservation_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "expiry_time": (datetime.datetime.now() + datetime.timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
        "message": "Reservation successful. Please complete payment within 30 minutes to confirm your booking."
    }
    
    return json.dumps(reservation, indent=2)

@mcp.tool()
async def reserve_hotel(hotel_id: str, guest_name: str, email: str) -> str:
    """Reserve a hotel room and hold it for payment.
    
    Args:
        hotel_id: The ID of the hotel option to reserve
        guest_name: Full name of the guest
        email: Email address for booking confirmation
    
    Returns:
        JSON string containing reservation details
    """
    # In a real app, this would create a reservation in a database
    reservation = {
        "reservation_id": f"HR{random.randint(10000, 99999)}",
        "hotel_id": hotel_id,
        "status": "Reserved",
        "guest_name": guest_name,
        "email": email,
        "reservation_time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "expiry_time": (datetime.datetime.now() + datetime.timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S"),
        "message": "Reservation successful. Please complete payment within 30 minutes to confirm your booking."
    }
    
    return json.dumps(reservation, indent=2)

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio') 