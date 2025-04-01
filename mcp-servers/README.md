# Travel Planner MCP Servers

This directory contains Model Context Protocol (MCP) servers for enhancing the Travel Planner application with AI-powered services. These servers are designed to work with Claude for Desktop and Gemini Flash.

## Overview

The Travel Planner MCP integration includes three servers:

1. **Transport-Hotels Server**: For searching and booking transport tickets (flights, trains, buses) and hotels
2. **Payment Server**: For processing payments for bookings
3. **Email Service**: For sending itinerary and booking confirmation emails

## Prerequisites

- Python 3.10 or higher
- Claude for Desktop (latest version) or Gemini Flash
- The MCP Python SDK 1.2.0 or higher

## Installation

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Servers

Each server can be run individually:

```bash
python transport-hotels/transport_hotels.py
python payment/payment_service.py
python email-service/email_service.py
```

## Configuring Claude for Desktop

To use these servers with Claude for Desktop, you need to configure the Claude Desktop App configuration. Edit your `claude_desktop_config.json` file (typically found at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
    "mcpServers": {
        "transport-hotels": {
            "command": "python",
            "args": [
                "/ABSOLUTE/PATH/TO/transport-hotels/transport_hotels.py"
            ]
        },
        "payment": {
            "command": "python",
            "args": [
                "/ABSOLUTE/PATH/TO/payment/payment_service.py"
            ]
        },
        "email-service": {
            "command": "python",
            "args": [
                "/ABSOLUTE/PATH/TO/email-service/email_service.py"
            ]
        }
    }
}
```

Replace `/ABSOLUTE/PATH/TO/` with the actual path to your MCP server files.

## Configuring Gemini Flash

To use these servers with Gemini Flash, follow these steps:

1. Ensure you have Gemini Flash installed with MCP support

2. Configure your Gemini Flash settings to enable MCP:
   
   ```json
   {
     "mcp": {
       "enabled": true,
       "servers": {
         "transport-hotels": {
           "command": "python",
           "args": [
             "/ABSOLUTE/PATH/TO/transport-hotels/transport_hotels.py"
           ]
         },
         "payment": {
           "command": "python",
           "args": [
             "/ABSOLUTE/PATH/TO/payment/payment_service.py"
           ]
         },
         "email-service": {
           "command": "python",
           "args": [
             "/ABSOLUTE/PATH/TO/email-service/email_service.py"
           ]
         }
       }
     }
   }
   ```

   Replace `/ABSOLUTE/PATH/TO/` with the actual path to your MCP server files. The exact location of the Gemini Flash configuration may vary based on your operating system and installation.

## Using the MCP Services

Once configured, you can use these services with your AI assistant of choice. Some example prompts:

### Transport & Hotels
- "Find flights from New York to Paris on June 15th"
- "Search for hotels in Paris from June 15th to June 20th for 2 guests"
- "Reserve a train ticket from London to Paris on August 10th"

### Payment
- "Process payment for my hotel reservation HR12345"
- "Check the status of my payment PAY-1234567890"

### Email
- "Send my travel itinerary to johndoe@example.com"
- "Email my flight booking confirmation to johndoe@example.com"

## Demo Features

These servers are for demonstration purposes and simulate real-world services:

- Transport and hotel options are randomly generated
- Payment processing is simulated with a 95% success rate
- Emails are not actually sent but recorded in memory

For a production application, you would integrate with real booking APIs, payment gateways, and email services. 