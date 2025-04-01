from typing import Any, Dict, List, Optional
from mcp.server.fastmcp import FastMCP
import json
import datetime
import random

# Initialize FastMCP server
mcp = FastMCP("email-service")

# In-memory store for sent emails (in a real app, this would be a database)
sent_emails = {}

# Helper functions
def generate_email_id():
    """Generate a unique email ID"""
    return f"EMAIL-{random.randint(10000, 99999)}"

def format_itinerary_email(name, itinerary, bookings=None):
    """Format an itinerary email"""
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    email_subject = f"Your Travel Itinerary - {current_date}"
    
    # Start with basic HTML template
    email_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4a90e2; color: white; padding: 10px 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #999; }}
            .booking {{ margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background-color: white; }}
            .booking h3 {{ color: #4a90e2; margin-top: 0; }}
            .itinerary {{ white-space: pre-line; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Travel Itinerary</h1>
            </div>
            <div class="content">
                <p>Dear {name},</p>
                <p>Thank you for using our Travel Planner. Below is your complete travel itinerary.</p>
                
                <h2>Your Itinerary</h2>
                <div class="itinerary">
                    {itinerary}
                </div>
    """
    
    # Add booking details if available
    if bookings and len(bookings) > 0:
        email_body += """
                <h2>Your Bookings</h2>
        """
        
        for booking in bookings:
            booking_type = booking.get("type", "Unknown")
            email_body += f"""
                <div class="booking">
                    <h3>{booking_type} Booking</h3>
            """
            
            if booking_type.lower() in ["flight", "train", "bus"]:
                email_body += f"""
                    <p><strong>Booking Reference:</strong> {booking.get("booking_reference", "N/A")}</p>
                    <p><strong>From:</strong> {booking.get("origin", "N/A")}</p>
                    <p><strong>To:</strong> {booking.get("destination", "N/A")}</p>
                    <p><strong>Date/Time:</strong> {booking.get("departure", "N/A")}</p>
                    <p><strong>Company:</strong> {booking.get("company", "N/A")}</p>
                """
                if "seat" in booking:
                    email_body += f"""<p><strong>Seat:</strong> {booking["seat"]}</p>"""
            elif booking_type.lower() == "hotel":
                email_body += f"""
                    <p><strong>Booking Reference:</strong> {booking.get("booking_reference", "N/A")}</p>
                    <p><strong>Hotel:</strong> {booking.get("name", "N/A")}</p>
                    <p><strong>Check-in:</strong> {booking.get("check_in", "N/A")}</p>
                    <p><strong>Check-out:</strong> {booking.get("check_out", "N/A")}</p>
                    <p><strong>Room Type:</strong> {booking.get("room_type", "N/A")}</p>
                """
            
            email_body += """
                </div>
            """
    
    # Complete the email template
    email_body += """
                <p>We hope you have a wonderful trip!</p>
                <p>Best regards,<br/>Travel Planner Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2023 Travel Planner. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return {
        "subject": email_subject,
        "body": email_body
    }

# MCP Tools
@mcp.tool()
async def send_itinerary_email(recipient_email: str, recipient_name: str, itinerary_text: str, booking_details: Optional[str] = None) -> str:
    """Send an email with the travel itinerary and optional booking details.
    
    Args:
        recipient_email: Email address of the recipient
        recipient_name: Name of the recipient
        itinerary_text: The full itinerary text
        booking_details: Optional JSON string containing booking details
    
    Returns:
        JSON string containing email sending status
    """
    try:
        # Generate email ID
        email_id = generate_email_id()
        
        # Parse booking details if provided
        bookings = []
        if booking_details:
            try:
                bookings = json.loads(booking_details)
                if not isinstance(bookings, list):
                    bookings = [bookings]
            except json.JSONDecodeError:
                return json.dumps({
                    "success": False,
                    "error": "Invalid booking details format. Must be valid JSON.",
                    "email_id": email_id
                }, indent=2)
        
        # Format the email
        email_content = format_itinerary_email(recipient_name, itinerary_text, bookings)
        
        # In a real app, this would use an email sending service
        # For the demo, we'll simulate successful email sending
        email_record = {
            "email_id": email_id,
            "recipient": recipient_email,
            "recipient_name": recipient_name,
            "subject": email_content["subject"],
            "body": email_content["body"],
            "sent_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "sent"
        }
        
        # Store the email record
        sent_emails[email_id] = email_record
        
        # Return success response
        return json.dumps({
            "success": True,
            "email_id": email_id,
            "recipient": recipient_email,
            "subject": email_content["subject"],
            "sent_at": email_record["sent_at"],
            "message": f"Itinerary email sent successfully to {recipient_email}"
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "message": "Failed to send itinerary email"
        }, indent=2)

@mcp.tool()
async def send_booking_confirmation(recipient_email: str, recipient_name: str, booking_type: str, booking_details: str) -> str:
    """Send a booking confirmation email for a specific booking.
    
    Args:
        recipient_email: Email address of the recipient
        recipient_name: Name of the recipient
        booking_type: Type of booking (flight, hotel, train, bus)
        booking_details: JSON string containing the booking details
    
    Returns:
        JSON string containing email sending status
    """
    try:
        # Generate email ID
        email_id = generate_email_id()
        
        # Parse booking details
        try:
            booking = json.loads(booking_details)
        except json.JSONDecodeError:
            return json.dumps({
                "success": False,
                "error": "Invalid booking details format. Must be valid JSON.",
                "email_id": email_id
            }, indent=2)
        
        # Determine email subject based on booking type
        if booking_type.lower() == "flight":
            subject = f"Your Flight Booking Confirmation - {booking.get('booking_reference', 'N/A')}"
        elif booking_type.lower() == "hotel":
            subject = f"Your Hotel Booking Confirmation - {booking.get('booking_reference', 'N/A')}"
        elif booking_type.lower() == "train":
            subject = f"Your Train Booking Confirmation - {booking.get('booking_reference', 'N/A')}"
        elif booking_type.lower() == "bus":
            subject = f"Your Bus Booking Confirmation - {booking.get('booking_reference', 'N/A')}"
        else:
            subject = f"Your Travel Booking Confirmation - {booking.get('booking_reference', 'N/A')}"
        
        # Generate email body (simplified version)
        email_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4a90e2; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #999; }}
                .booking {{ margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; background-color: white; }}
                .booking h3 {{ color: #4a90e2; margin-top: 0; }}
                .important {{ color: #e74c3c; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{booking_type.capitalize()} Booking Confirmation</h1>
                </div>
                <div class="content">
                    <p>Dear {recipient_name},</p>
                    <p>Thank you for your booking. Your {booking_type.lower()} has been confirmed.</p>
                    
                    <div class="booking">
                        <h3>Booking Details</h3>
        """
        
        # Add booking specific details
        if booking_type.lower() in ["flight", "train", "bus"]:
            email_body += f"""
                        <p><strong>Booking Reference:</strong> {booking.get('booking_reference', 'N/A')}</p>
                        <p><strong>From:</strong> {booking.get('origin', 'N/A')}</p>
                        <p><strong>To:</strong> {booking.get('destination', 'N/A')}</p>
                        <p><strong>Date/Time:</strong> {booking.get('departure', 'N/A')}</p>
                        <p><strong>Company:</strong> {booking.get('company', 'N/A')}</p>
                        <p><strong>Class/Type:</strong> {booking.get('ticket_class', 'Standard')}</p>
            """
            
            if booking_type.lower() == "flight":
                email_body += f"""
                        <p><strong>Check-in:</strong> {booking.get('check_in_time', 'Recommended 2 hours before departure')}</p>
                        <p><strong>Baggage Allowance:</strong> {booking.get('baggage_allowance', 'Standard allowance')}</p>
                """
                
                if booking.get('gate'):
                    email_body += f"""<p><strong>Gate:</strong> {booking['gate']}</p>"""
                
                if booking.get('terminal'):
                    email_body += f"""<p><strong>Terminal:</strong> {booking['terminal']}</p>"""
        
        elif booking_type.lower() == "hotel":
            email_body += f"""
                        <p><strong>Booking Reference:</strong> {booking.get('booking_reference', 'N/A')}</p>
                        <p><strong>Hotel:</strong> {booking.get('name', 'N/A')}</p>
                        <p><strong>Address:</strong> {booking.get('address', 'N/A')}</p>
                        <p><strong>Check-in:</strong> {booking.get('check_in', 'N/A')} ({booking.get('check_in_time', 'After 3:00 PM')})</p>
                        <p><strong>Check-out:</strong> {booking.get('check_out', 'N/A')} ({booking.get('check_out_time', 'Before 11:00 AM')})</p>
                        <p><strong>Room Type:</strong> {booking.get('room_type', 'Standard')}</p>
                        <p><strong>Guests:</strong> {booking.get('guests', '1')}</p>
            """
            
            if booking.get('special_requests'):
                email_body += f"""<p><strong>Special Requests:</strong> {booking['special_requests']}</p>"""
        
        # Complete the email template
        email_body += """
                    </div>
                    
                    <p class="important">Important: Please keep this confirmation for your records.</p>
                    <p>We hope you have a wonderful trip!</p>
                    <p>Best regards,<br/>Travel Planner Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2023 Travel Planner. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # In a real app, this would use an email sending service
        # For the demo, we'll simulate successful email sending
        email_record = {
            "email_id": email_id,
            "recipient": recipient_email,
            "recipient_name": recipient_name,
            "subject": subject,
            "body": email_body,
            "booking_type": booking_type,
            "booking_reference": booking.get("booking_reference", "N/A"),
            "sent_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "sent"
        }
        
        # Store the email record
        sent_emails[email_id] = email_record
        
        # Return success response
        return json.dumps({
            "success": True,
            "email_id": email_id,
            "recipient": recipient_email,
            "subject": subject,
            "booking_type": booking_type,
            "booking_reference": booking.get("booking_reference", "N/A"),
            "sent_at": email_record["sent_at"],
            "message": f"{booking_type.capitalize()} booking confirmation email sent successfully to {recipient_email}"
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e),
            "message": f"Failed to send {booking_type} booking confirmation email"
        }, indent=2)

@mcp.tool()
async def check_email_status(email_id: str) -> str:
    """Check the status of a sent email.
    
    Args:
        email_id: The ID of the email to check
    
    Returns:
        JSON string containing email status
    """
    # Check if email exists
    if email_id not in sent_emails:
        return json.dumps({
            "success": False,
            "error": "Email not found",
            "email_id": email_id
        }, indent=2)
    
    # Get email details
    email = sent_emails[email_id]
    
    # Return email status
    response = {
        "email_id": email_id,
        "recipient": email["recipient"],
        "subject": email["subject"],
        "sent_at": email["sent_at"],
        "status": email["status"]
    }
    
    if "booking_type" in email:
        response["booking_type"] = email["booking_type"]
        response["booking_reference"] = email["booking_reference"]
    
    return json.dumps(response, indent=2)

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio') 