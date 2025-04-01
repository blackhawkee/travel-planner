from typing import Any, Dict, Optional
from mcp.server.fastmcp import FastMCP
import json
import datetime
import random
import uuid

# Initialize FastMCP server
mcp = FastMCP("payment")

# In-memory store for payments (in a real app, this would be a database)
payment_records = {}

# Helper function to generate a payment ID
def generate_payment_id():
    return f"PAY-{uuid.uuid4().hex[:10].upper()}"

# Helper function to validate credit card (simple validation)
def validate_card(card_number, expiry, cvv):
    # Very basic validation
    if not (card_number and expiry and cvv):
        return False
    
    # Check if card number has valid length and is numeric
    if not (card_number.isdigit() and 13 <= len(card_number) <= 19):
        return False
    
    # Check if expiry is in MM/YY format
    if not (len(expiry) == 5 and expiry[2] == '/' and expiry[:2].isdigit() and expiry[3:].isdigit()):
        return False
    
    # Check if expiry date is in the future
    current_month = datetime.datetime.now().month
    current_year = datetime.datetime.now().year % 100  # Get last 2 digits
    expiry_month = int(expiry[:2])
    expiry_year = int(expiry[3:])
    
    if expiry_year < current_year or (expiry_year == current_year and expiry_month < current_month):
        return False
    
    # Check if CVV is 3 or 4 digits
    if not (cvv.isdigit() and 3 <= len(cvv) <= 4):
        return False
    
    return True

# MCP Tools
@mcp.tool()
async def process_payment(reservation_id: str, amount: float, currency: str, 
                          card_number: str, card_expiry: str, card_cvv: str,
                          cardholder_name: str, email: str) -> str:
    """Process a payment for a reservation.
    
    Args:
        reservation_id: The ID of the reservation to pay for
        amount: The payment amount
        currency: The currency code (e.g., USD, EUR)
        card_number: The credit card number
        card_expiry: The card expiry date in MM/YY format
        card_cvv: The card security code (CVV)
        cardholder_name: The name on the card
        email: Email address for payment receipt
    
    Returns:
        JSON string containing payment details
    """
    # Validate card details
    if not validate_card(card_number, card_expiry, card_cvv):
        return json.dumps({
            "success": False,
            "error": "Invalid card details. Please check and try again.",
            "reservation_id": reservation_id
        }, indent=2)
    
    # Generate payment ID
    payment_id = generate_payment_id()
    
    # Mask card number for security
    masked_card = f"{'*' * (len(card_number) - 4)}{card_number[-4:]}"
    
    # In a real app, this would connect to a payment gateway
    # For demo purposes, we'll simulate success/failure with 95% success rate
    success = random.random() < 0.95
    
    payment_record = {
        "payment_id": payment_id,
        "reservation_id": reservation_id,
        "amount": amount,
        "currency": currency,
        "status": "completed" if success else "failed",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "payment_method": "Credit Card",
        "card_details": {
            "card_type": get_card_type(card_number),
            "masked_number": masked_card,
            "expiry": card_expiry,
            "cardholder": cardholder_name
        },
        "email": email,
        "transaction_reference": f"TX{random.randint(100000, 999999)}",
        "success": success
    }
    
    # Store payment record
    payment_records[payment_id] = payment_record
    
    # Build response
    response = {
        "success": success,
        "payment_id": payment_id,
        "reservation_id": reservation_id,
        "amount": amount,
        "currency": currency,
        "timestamp": payment_record["timestamp"],
        "card_details": {
            "type": payment_record["card_details"]["card_type"],
            "masked_number": masked_card
        }
    }
    
    if not success:
        response["error"] = "Payment processing failed. Please try again or use a different payment method."
    
    return json.dumps(response, indent=2)

@mcp.tool()
async def get_payment_status(payment_id: str) -> str:
    """Check the status of a payment.
    
    Args:
        payment_id: The ID of the payment to check
    
    Returns:
        JSON string containing payment status
    """
    # Check if payment exists
    if payment_id not in payment_records:
        return json.dumps({
            "success": False,
            "error": "Payment not found",
            "payment_id": payment_id
        }, indent=2)
    
    # Get payment details
    payment = payment_records[payment_id]
    
    response = {
        "payment_id": payment_id,
        "reservation_id": payment["reservation_id"],
        "status": payment["status"],
        "amount": payment["amount"],
        "currency": payment["currency"],
        "timestamp": payment["timestamp"],
        "payment_method": payment["payment_method"],
        "card_details": {
            "type": payment["card_details"]["card_type"],
            "masked_number": payment["card_details"]["masked_number"]
        },
        "transaction_reference": payment["transaction_reference"]
    }
    
    return json.dumps(response, indent=2)

@mcp.tool()
async def refund_payment(payment_id: str, reason: str = "Customer request") -> str:
    """Process a refund for a payment.
    
    Args:
        payment_id: The ID of the payment to refund
        reason: The reason for the refund
    
    Returns:
        JSON string containing refund details
    """
    # Check if payment exists
    if payment_id not in payment_records:
        return json.dumps({
            "success": False,
            "error": "Payment not found",
            "payment_id": payment_id
        }, indent=2)
    
    # Get payment details
    payment = payment_records[payment_id]
    
    # Check if payment can be refunded (only completed payments can be refunded)
    if payment["status"] != "completed":
        return json.dumps({
            "success": False,
            "error": f"Payment cannot be refunded (current status: {payment['status']})",
            "payment_id": payment_id
        }, indent=2)
    
    # Process refund - in a real app, this would connect to payment gateway
    # For demo, we'll simulate success with 95% success rate
    success = random.random() < 0.95
    
    if success:
        # Update payment status
        payment["status"] = "refunded"
        payment_records[payment_id] = payment
    
    # Build response
    response = {
        "success": success,
        "payment_id": payment_id,
        "reservation_id": payment["reservation_id"],
        "amount": payment["amount"],
        "currency": payment["currency"],
        "refund_timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "reason": reason,
        "status": payment["status"],
        "refund_reference": f"RF{random.randint(100000, 999999)}"
    }
    
    if not success:
        response["error"] = "Refund processing failed. Please try again later."
    
    return json.dumps(response, indent=2)

@mcp.tool()
async def validate_payment_details(card_number: str, card_expiry: str, card_cvv: str) -> str:
    """Validate payment details without processing a payment.
    
    Args:
        card_number: The credit card number
        card_expiry: The card expiry date in MM/YY format
        card_cvv: The card security code (CVV)
    
    Returns:
        JSON string containing validation results
    """
    result = validate_card(card_number, card_expiry, card_cvv)
    
    # Get card type if valid
    card_type = get_card_type(card_number) if result else "Unknown"
    
    response = {
        "valid": result,
        "card_type": card_type if result else None,
        "errors": []
    }
    
    # Add specific error messages if validation failed
    if not result:
        if not (card_number.isdigit() and 13 <= len(card_number) <= 19):
            response["errors"].append("Invalid card number")
        
        if not (len(card_expiry) == 5 and expiry[2] == '/' and expiry[:2].isdigit() and expiry[3:].isdigit()):
            response["errors"].append("Invalid expiry date format (should be MM/YY)")
        else:
            current_month = datetime.datetime.now().month
            current_year = datetime.datetime.now().year % 100
            expiry_month = int(card_expiry[:2])
            expiry_year = int(card_expiry[3:])
            
            if expiry_year < current_year or (expiry_year == current_year and expiry_month < current_month):
                response["errors"].append("Card has expired")
        
        if not (card_cvv.isdigit() and 3 <= len(card_cvv) <= 4):
            response["errors"].append("Invalid CVV code")
    
    return json.dumps(response, indent=2)

# Helper function to determine card type based on number
def get_card_type(card_number):
    if not card_number or not card_number.isdigit():
        return "Unknown"
    
    # Simple detection based on card number prefix and length
    if card_number.startswith('4'):
        return "Visa"
    elif card_number.startswith(('51', '52', '53', '54', '55')):
        return "MasterCard"
    elif card_number.startswith(('34', '37')):
        return "American Express"
    elif card_number.startswith(('300', '301', '302', '303', '304', '305', '36', '38')):
        return "Diners Club"
    elif card_number.startswith('6'):
        return "Discover"
    elif card_number.startswith(('2221', '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229', '223', '224', '225', '226', '227', '228', '229', '23', '24', '25', '26', '270', '271', '2720')):
        return "MasterCard"
    else:
        return "Unknown"

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio') 