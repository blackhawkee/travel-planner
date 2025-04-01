import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Link,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Integration component for MCP servers
const TravelServices = ({ itinerary, destination }) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [aiModel, setAiModel] = useState('claude'); // Default to Claude

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAiModelChange = (event, newValue) => {
    if (newValue !== null) {
      setAiModel(newValue);
    }
  };

  // Format a date 30 days from now for examples
  const futureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Return a date 5 days after the given date
  const laterDate = (startDate) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 5);
    return date.toISOString().split('T')[0];
  };

  // Simple display of tab content
  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index} style={{ padding: '20px 0' }}>
        {value === index && children}
      </div>
    );
  };

  // Random ID generators for examples
  const flightId = `F${Math.floor(1000 + Math.random() * 9000)}`;
  const hotelId = `H${Math.floor(1000 + Math.random() * 9000)}`;
  const reservationId = `R${Math.floor(10000 + Math.random() * 90000)}`;
  const hotelReservationId = `HR${Math.floor(10000 + Math.random() * 90000)}`;
  const paymentId = `PAY-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
  
  // Example dates
  const travelDate = futureDate();
  const checkInDate = travelDate;
  const checkOutDate = laterDate(checkInDate);

  // Get current AI product name based on selection
  const aiProductName = aiModel === 'claude' ? 'Claude for Desktop' : 'Gemini Flash';

  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpen}
        startIcon={<FlightIcon />}
        sx={{ mt: 2, mr: 1 }}
      >
        Book Travel & Hotels
      </Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            Travel Services for {destination || 'Your Trip'}
            <Tooltip title={`These services require MCP integration with ${aiProductName}`}>
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" alignItems="center">
            <ToggleButtonGroup
              value={aiModel}
              exclusive
              onChange={handleAiModelChange}
              size="small"
              aria-label="AI assistant selection"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="claude" aria-label="Claude">
                Claude
              </ToggleButton>
              <ToggleButton value="gemini" aria-label="Gemini">
                Gemini
              </ToggleButton>
            </ToggleButtonGroup>
            <Chip 
              label={`Powered by MCP`} 
              color="primary" 
              variant="outlined" 
              size="small"
              icon={<SmartToyIcon />}
              component={Link}
              href="https://modelcontextprotocol.io/quickstart/server"
              target="_blank"
              clickable
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            These services are powered by the Model Context Protocol (MCP) and require {aiProductName}. 
            See the <Link href="https://modelcontextprotocol.io" target="_blank" rel="noopener">MCP documentation</Link> for setup instructions.
          </Alert>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab icon={<FlightIcon />} label="Transport" />
              <Tab icon={<HotelIcon />} label="Hotels" />
              <Tab icon={<PaymentIcon />} label="Payment" />
              <Tab icon={<EmailIcon />} label="Email" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Transport Booking</Typography>
              <Typography paragraph>
                Search and book flights, trains, and buses to your destination using {aiProductName} with the transport-hotels MCP server.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><SearchIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Search for Flights" 
                        secondary={`Example: "Find flights from New York to ${destination || 'Paris'} on ${travelDate}"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DirectionsTransitIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Search for Trains" 
                        secondary={`Example: "Search trains from London to ${destination || 'Paris'} on ${travelDate}"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DirectionsBusIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Search for Buses" 
                        secondary={`Example: "Find bus tickets to ${destination || 'Amsterdam'} from Brussels on ${travelDate}"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><BookOnlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Reserve Transport" 
                        secondary={`Example: "Reserve flight ${flightId} for John Doe (john@example.com)"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Get Booking Details" 
                        secondary={`Example: "Show me details for transport booking ${flightId}"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Note: This uses the transport-hotels MCP server which provides tools for searching and booking various modes of transportation.
                The search results and booking information are simulated for demonstration purposes.
              </Typography>
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Hotel Booking</Typography>
              <Typography paragraph>
                Find and book hotels at your destination using {aiProductName} with the transport-hotels MCP server.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><SearchIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Search for Hotels" 
                        secondary={`Example: "Find hotels in ${destination || 'Paris'} from ${checkInDate} to ${checkOutDate} for 2 guests"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BookOnlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Reserve Hotel Room" 
                        secondary={`Example: "Reserve hotel ${hotelId} for Jane Smith (jane@example.com)"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Get Hotel Details" 
                        secondary={`Example: "Show me details for hotel ${hotelId}"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Compare Hotels" 
                        secondary={`Example: "Compare 3-star and 4-star hotels in ${destination || 'Rome'} for my dates"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                The hotel search provides options with different star ratings, amenities, and price points.
                All hotels are simulated with realistic data for demonstration purposes.
              </Typography>
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Payment Processing</Typography>
              <Typography paragraph>
                Securely process payments for your bookings using {aiProductName} with the payment MCP server.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CreditCardIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Process Payment" 
                        secondary={`Example: "Process payment for reservation ${reservationId}, amount $350 using my credit card"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Check Payment Status" 
                        secondary={`Example: "Check status of payment ${paymentId}"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><RefreshIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Request Refund" 
                        secondary={`Example: "Refund payment ${paymentId} due to change of plans"`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Validate Card Details" 
                        secondary={'Example: "Validate my credit card details"'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                For demonstration purposes only: No real payments are processed, and no actual credit card information should be used.
              </Alert>
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Email Services</Typography>
              <Typography paragraph>
                Send your itinerary and booking confirmations via email using {aiProductName} with the email-service MCP server.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><MailOutlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Send Itinerary Email" 
                        secondary={'Example: "Send my itinerary to johndoe@example.com"'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ConfirmationNumberIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Send Booking Confirmation" 
                        secondary={`Example: "Email my flight booking confirmation for ${flightId} to johndoe@example.com"`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Check Email Status" 
                        secondary={'Example: "Check status of my email EMAIL-12345"'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Email Multiple Bookings" 
                        secondary={'Example: "Send all my booking confirmations to my email"'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Note: For demonstration purposes, emails are not actually sent but are recorded in the server's memory.
                In a real application, this would connect to an email service provider.
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="subtitle2" gutterBottom>
                Email Your Itinerary
              </Typography>
              <Typography variant="body2">
                Ask {aiProductName} to send your itinerary to your email with any of these example queries:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <li>
                  <Typography variant="body2">
                    "Send my {destination || 'trip'} itinerary to my email"
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    "Email me a copy of this travel plan"
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    "Forward the itinerary and booking details to [your email]"
                  </Typography>
                </li>
              </Box>
            </Paper>
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          {aiModel === 'gemini' && (
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'left', ml: 2 }}>
              Gemini Flash integration requires appropriate MCP configuration in your Gemini settings.
            </Typography>
          )}
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TravelServices; 