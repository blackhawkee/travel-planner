import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';

// Fix for marker icons in react-leaflet
// (needed because webpack handles assets differently)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons for different days - improved for better visibility
const createDayIcon = (day, isActive = false) => {
  return L.divIcon({
    html: `<div class="day-marker-inner ${isActive ? 'active' : ''}">${day}</div>`,
    className: 'day-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

// Map view controller component
const MapViewController = ({ center, zoom, location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lon], 13);
    }
  }, [map, location]);
  
  return null;
};

// Component to fit bounds when locations change
const MapBoundsSetter = ({ locations, shouldFit }) => {
  const map = useMap();
  
  useEffect(() => {
    if (shouldFit && locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, locations, shouldFit]);
  
  return null;
};

// Improved function to extract locations from the travel plan
const extractLocationsFromPlan = async (planText, destination) => {
  try {
    console.log('Extracting locations from plan text');
    
    // First try to find day headers with locations
    let locations = [];
    
    // Pattern 1: Day X: Location or Day X - Location
    const dayHeaderRegex = /day\s+(\d+)(?:\s*[-:]\s*)([^,\n(]+)(?:\s*\(([^)]+)\))?/gi;
    let matches = [...planText.matchAll(dayHeaderRegex)];
    
    if (matches.length > 0) {
      console.log('Found day headers with pattern 1:', matches.length);
      locations = matches.map(match => ({
        day: parseInt(match[1]),
        location: match[2].trim(),
        description: match[3] ? match[3].trim() : '',
        isMain: true
      }));
    }
    
    // If no day headers, look for other patterns
    if (locations.length === 0) {
      // Pattern 2: "Day X" followed by location mentions
      const dayMarkers = [...planText.matchAll(/day\s+(\d+)[:\s-]*(.*?)(?=day\s+\d+|$)/gis)];
      
      if (dayMarkers.length > 0) {
        console.log('Found day sections with pattern 2:', dayMarkers.length);
        
        for (const marker of dayMarkers) {
          const day = parseInt(marker[1]);
          const dayText = marker[2];
          
          // Try to extract locations from the day's text
          const dayLocations = extractLocationsFromText(dayText);
          
          if (dayLocations.length > 0) {
            // The first one is the main location for the day
            locations.push({
              day,
              location: dayLocations[0],
              description: dayText.substring(0, 100).trim(),
              isMain: true
            });
            
            // Add other locations as points of interest
            for (let i = 1; i < dayLocations.length && i < 3; i++) {
              locations.push({
                day,
                location: dayLocations[i],
                description: `Point of interest for Day ${day}`,
                isMain: false
              });
            }
          }
        }
      }
    }
    
    // Pattern 3: Try to find any lines that start with a number followed by a location
    if (locations.length === 0) {
      const numericDayRegex = /^\s*(\d+)\.\s+([A-Z][^,.!?]+)/gm;
      const numericMatches = [...planText.matchAll(numericDayRegex)];
      
      if (numericMatches.length > 0) {
        console.log('Found numeric day format:', numericMatches.length);
        locations = numericMatches.map(match => ({
          day: parseInt(match[1]),
          location: match[2].trim(),
          description: '',
          isMain: true
        }));
      }
    }
    
    // If still no locations, try to extract the main destination
    if (locations.length === 0) {
      console.log('No day headers found, trying to extract main destination');
      
      // Look for title pattern: "Travel Plan for [Destination]"
      const titleMatch = planText.match(/(?:travel|trip|itinerary|vacation)(?:\s+plan)?\s+(?:to|for|in)\s+([A-Z][^,.!?\n]+)/i);
      
      if (titleMatch && titleMatch[1]) {
        locations.push({
          day: 1,
          location: titleMatch[1].trim(),
          description: 'Main destination',
          isMain: true
        });
      } else {
        // Try to find any capitalized place name
        const lines = planText.split('\n').filter(line => line.trim());
        for (const line of lines.slice(0, 10)) {  // Check more lines
          const placeMatch = line.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,})\b/);  // More permissive
          if (placeMatch && placeMatch[1] && !placeMatch[1].match(/^(Day|Travel|Itinerary|Trip|Plan)$/i)) {
            locations.push({
              day: 1,
              location: placeMatch[1].trim(),
              description: 'Main destination',
              isMain: true
            });
            break;
          }
        }
      }
    }
    
    // EXTREME FALLBACK: If still no locations, use destination param as fallback
    if (locations.length === 0 && destination && destination.trim().length > 0) {
      console.log('Using destination param as fallback');
      locations.push({
        day: 1,
        location: destination,
        description: 'Destination',
        isMain: true
      });
    }
    
    // Last resort: Allow user to see map even without locations
    if (locations.length === 0) {
      console.log('No locations found, using default world location');
      locations.push({
        day: 1,
        location: "World",
        description: 'Default location',
        isMain: true,
        lat: 0,
        lon: 0,
        displayName: 'World Map'
      });
    }
    
    console.log('Extracted locations before geocoding:', locations);
    
    // Geocode the locations
    const geocodedLocations = await Promise.all(locations.map(async (loc) => {
      // Skip geocoding if coordinates are already provided (for fallback location)
      if (loc.lat !== undefined && loc.lon !== undefined) {
        return loc;
      }
      
      try {
        // Geocode the location
        const geocodeResult = await geocodeLocation(loc.location);
        
        if (geocodeResult) {
          return {
            ...loc,
            lat: geocodeResult.lat,
            lon: geocodeResult.lon,
            displayName: geocodeResult.displayName
          };
        }
        
        // If geocoding fails, try adding the main destination for context
        if (!geocodeResult && locations.length > 1) {
          const mainLocation = locations.find(l => l.isMain)?.location;
          if (mainLocation && mainLocation !== loc.location) {
            const combinedLocation = `${loc.location}, ${mainLocation}`;
            const secondAttempt = await geocodeLocation(combinedLocation);
            
            if (secondAttempt) {
              return {
                ...loc,
                lat: secondAttempt.lat,
                lon: secondAttempt.lon,
                displayName: secondAttempt.displayName
              };
            }
          }
        }
        
        // Try with less specific location - just the first word if it's multi-word
        if (!geocodeResult && loc.location.includes(' ')) {
          const simplifiedLocation = loc.location.split(' ')[0];
          if (simplifiedLocation.length > 3) {
            const thirdAttempt = await geocodeLocation(simplifiedLocation);
            
            if (thirdAttempt) {
              return {
                ...loc,
                lat: thirdAttempt.lat,
                lon: thirdAttempt.lon,
                displayName: thirdAttempt.displayName
              };
            }
          }
        }
        
        return {
          ...loc,
          lat: null,
          lon: null
        };
      } catch (error) {
        console.error(`Error geocoding ${loc.location}:`, error);
        return {
          ...loc,
          lat: null,
          lon: null
        };
      }
    }));
    
    // Filter out locations without coordinates
    const validLocations = geocodedLocations.filter(loc => loc.lat !== null && loc.lon !== null);
    console.log('Valid geocoded locations:', validLocations.length);
    
    // Last resort fallback: If geocoding failed for all locations, return a default location
    if (validLocations.length === 0) {
      console.log('All geocoding failed, using default location');
      return [{
        day: 1,
        location: "Default",
        description: 'Unable to find specific locations in your itinerary',
        isMain: true,
        lat: 0,
        lon: 0,
        displayName: 'World Map'
      }];
    }
    
    return validLocations;
  } catch (error) {
    console.error('Error in extractLocationsFromPlan:', error);
    // Return a default location on error
    return [{
      day: 1,
      location: "Error",
      description: 'An error occurred while processing your itinerary',
      isMain: true,
      lat: 0,
      lon: 0,
      displayName: 'World Map'
    }];
  }
};

// Helper function to extract location candidates from text
const extractLocationsFromText = (text) => {
  const locations = [];
  
  // Look for patterns indicating locations
  const patterns = [
    // Places with type indicators
    /visit\s+(?:the\s+)?([A-Z][^,.!?]*(?:Museum|Palace|Castle|Cathedral|Park|Garden|Temple|Square|Market))/gi,
    /tour\s+(?:of\s+)?([A-Z][^,.!?]*(?:District|Quarter|Neighborhood|Area))/gi,
    /explore\s+(?:the\s+)?([A-Z][^,.!?]*(?:District|Quarter|Neighborhood|Area|Market|Street))/gi,
    /stay\s+(?:at|in)\s+(?:the\s+)?([A-Z][^,.!?]*(?:Hotel|Resort|Inn|Villa|Apartment))/gi,
    /(?:arrive|depart)\s+(?:at|in|from)\s+(?:the\s+)?([A-Z][^,.!?]*(?:Airport|Station|Terminal))/gi,
    
    // Cities, districts, attractions
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Museum|Palace|Castle|Cathedral|Park|Garden|Temple|Square|Market|District|Quarter|Hotel|Resort))\b/gi,
    
    // Streets, roads, etc.
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|Avenue|Boulevard|Road|Lane))\b/gi,
    
    // Famous landmarks that might not have a type indicator
    /\b(Eiffel Tower|Big Ben|Taj Mahal|Statue of Liberty|Colosseum|Grand Canyon|Pyramids|Great Wall|Times Square|Central Park)\b/gi,
    
    // Activity patterns that might indicate locations
    /(?:visit|explore|see|tour)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    
    // Capitalized place names (as a fallback)
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g
  ];
  
  // Apply each pattern and collect matches
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[1] && match[1].length > 2) {
        // Filter out common non-location capitalized phrases
        if (!match[1].match(/^(Day|Morning|Afternoon|Evening|Breakfast|Lunch|Dinner|Check|Hotel|Continue|Start|End|Travel|Flight|You|Your|Free|Local)$/i)) {
          locations.push(match[1].trim());
        }
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(locations)];
};

// Helper function to geocode a location
const geocodeLocation = async (locationText) => {
  try {
    console.log('Geocoding location:', locationText);
    
    // Clean up the location text
    locationText = locationText.trim()
      .replace(/^\s*-\s*/, '') // Remove leading dash
      .replace(/\s*\(.*?\)\s*/, ' ') // Remove text in parentheses
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    if (locationText.length < 3) {
      console.log('Location text too short:', locationText);
      return null;
    }
    
    // Add delay to avoid rate limiting (Nominatim has a 1 request per second policy)
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Use OpenStreetMap Nominatim API to geocode the location
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}&limit=1`;
    
    const headers = {
      'User-Agent': 'TravelPlanner/1.0',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referrer-Policy': 'no-referrer'
    };
    
    // Try with a retry mechanism
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        response = await fetch(geocodeUrl, { 
          headers,
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (response.ok) break;
        
        // If we get rate limited, wait longer before retry
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (retries + 1)));
        }
        
        retries++;
        console.log(`Retry ${retries}/${maxRetries} for geocoding ${locationText}`);
      } catch (fetchError) {
        console.error('Fetch error during geocoding:', fetchError);
        retries++;
        if (retries > maxRetries) throw fetchError;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    // Check if the response is ok
    if (!response || !response.ok) {
      console.error('Geocoding API error:', response?.status, await response?.text?.());
      
      // Try to use a fallback geocoding service
      console.log('Geocoding failed, using fallback method');
      
      // This is a simulation of geocoding with common known locations
      // In a real app, you might want to use a different API or have a local database
      const knownLocations = {
        'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
        'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
        'new york': { lat: 40.7128, lon: -74.0060, name: 'New York, USA' },
        'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
        'rome': { lat: 41.9028, lon: 12.4964, name: 'Rome, Italy' },
        'amsterdam': { lat: 52.3676, lon: 4.9041, name: 'Amsterdam, Netherlands' },
        'berlin': { lat: 52.5200, lon: 13.4050, name: 'Berlin, Germany' },
        'madrid': { lat: 40.4168, lon: -3.7038, name: 'Madrid, Spain' },
        'barcelona': { lat: 41.3851, lon: 2.1734, name: 'Barcelona, Spain' },
        'vienna': { lat: 48.2082, lon: 16.3738, name: 'Vienna, Austria' },
        'prague': { lat: 50.0755, lon: 14.4378, name: 'Prague, Czech Republic' },
        'athens': { lat: 37.9838, lon: 23.7275, name: 'Athens, Greece' },
        'bangkok': { lat: 13.7563, lon: 100.5018, name: 'Bangkok, Thailand' },
        'singapore': { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
        'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
        'cairo': { lat: 30.0444, lon: 31.2357, name: 'Cairo, Egypt' },
        'istanbul': { lat: 41.0082, lon: 28.9784, name: 'Istanbul, Turkey' },
        'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
        'las vegas': { lat: 36.1699, lon: -115.1398, name: 'Las Vegas, USA' },
        'san francisco': { lat: 37.7749, lon: -122.4194, name: 'San Francisco, USA' },
        'los angeles': { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, USA' },
        'miami': { lat: 25.7617, lon: -80.1918, name: 'Miami, USA' },
        'chicago': { lat: 41.8781, lon: -87.6298, name: 'Chicago, USA' },
        'toronto': { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada' },
        'vancouver': { lat: 49.2827, lon: -123.1207, name: 'Vancouver, Canada' },
        'montreal': { lat: 45.5017, lon: -73.5673, name: 'Montreal, Canada' },
        'mexico city': { lat: 19.4326, lon: -99.1332, name: 'Mexico City, Mexico' },
        'rio de janeiro': { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro, Brazil' },
        'buenos aires': { lat: -34.6037, lon: -58.3816, name: 'Buenos Aires, Argentina' },
        'cape town': { lat: -33.9249, lon: 18.4241, name: 'Cape Town, South Africa' }
      };
      
      // Try to match the location name against our known locations
      const locationLower = locationText.toLowerCase();
      for (const [key, value] of Object.entries(knownLocations)) {
        if (locationLower.includes(key)) {
          console.log('Found fallback location match:', key);
          return {
            lat: value.lat,
            lon: value.lon,
            displayName: value.name
          };
        }
      }
      
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      console.log('Geocoding successful for:', locationText, data[0]);
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    // If no results, try adding more context
    if (data.length === 0) {
      // Try appending "city" or "landmark" if it's a simple name
      if (!locationText.includes(" ") && locationText.length < 10) {
        // Skip the extra query to avoid too many API calls in this case
        console.log('Simple name, skipping additional query for:', locationText);
        return null;
      }
    }
    
    console.log('No geocoding results for:', locationText);
    return null;
  } catch (error) {
    console.error(`Error geocoding ${locationText}:`, error);
    return null;
  }
};

// Day Navigation Component
const DayNavigation = ({ days, currentDay, onDayChange }) => {
  const handlePrevDay = () => {
    if (currentDay > 1) {
      onDayChange(currentDay - 1);
    }
  };
  
  const handleNextDay = () => {
    if (currentDay < days) {
      onDayChange(currentDay + 1);
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 2,
      p: 1,
      borderRadius: 1,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}>
      <Tooltip title="Previous Day">
        <span>
          <IconButton 
            onClick={handlePrevDay} 
            disabled={currentDay <= 1}
            size="large"
          >
            <ArrowBackIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        Day {currentDay} of {days}
      </Typography>
      
      <Tooltip title="Next Day">
        <span>
          <IconButton 
            onClick={handleNextDay} 
            disabled={currentDay >= days}
            size="large"
          >
            <ArrowForwardIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

// Main Map Component
const ItineraryMap = ({ open, onClose, planText, destination }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(12);
  const [currentDay, setCurrentDay] = useState(1);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'all'
  const [debugInfo, setDebugInfo] = useState('');
  const [usedFallback, setUsedFallback] = useState(false);

  // Get current day locations
  const currentDayLocations = locations.filter(loc => loc.day === currentDay);
  
  // Get main location for the day
  const mainDayLocation = currentDayLocations.find(loc => loc.isMain) || currentDayLocations[0];
  
  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  useEffect(() => {
    const loadLocations = async () => {
      if (!open || !planText) return;
      
      setLoading(true);
      setError(null);
      setDebugInfo('');
      setUsedFallback(false);
      
      try {
        console.log('Processing plan text:', planText.substring(0, 100) + '...');
        
        // First, try to geocode the main destination
        let mainDestResult = null;
        if (destination && destination.trim().length > 0) {
          mainDestResult = await geocodeLocation(destination);
          if (mainDestResult) {
            setCenter([mainDestResult.lat, mainDestResult.lon]);
            setZoom(10); // Zoom level for the main destination
          } else {
            console.log('Failed to geocode main destination:', destination);
            setCenter([0, 0]);
            setZoom(2); // World view
          }
        }
        
        // Then extract all locations - pass destination as parameter
        const extractedLocations = await extractLocationsFromPlan(planText, destination);
        console.log('Extracted locations:', extractedLocations);
        
        // Check if we're using fallback locations
        if (extractedLocations.length === 1 && 
            (extractedLocations[0].location === "Default" || extractedLocations[0].location === "Error" || extractedLocations[0].location === "World")) {
          setUsedFallback(true);
          setDebugInfo('Using a fallback location. We could not extract specific locations from your itinerary. Try adding clear day headers with locations.');
        } else if (extractedLocations.length === 0) {
          setDebugInfo('No locations could be extracted. The text may not contain clear day headers or recognizable location names.');
        }
        
        setLocations(extractedLocations);
        
        // If we have locations but couldn't get the main destination, use the first location
        if (extractedLocations.length > 0) {
          if (!mainDestResult) {
            setCenter([extractedLocations[0].lat, extractedLocations[0].lon]);
            
            // Set zoom level based on whether it's a fallback or not
            if (usedFallback) {
              setZoom(2); // World view for fallbacks
            } else {
              setZoom(10); // Closer zoom for real locations
            }
          }
          // Set current day to first day
          setCurrentDay(extractedLocations[0].day);
        }
        
      } catch (err) {
        console.error('Error loading map data:', err);
        setError('Failed to load map data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadLocations();
  }, [open, planText, destination]);
  
  // Handle clicking on a day in the list
  const handleDayClick = (day) => {
    setCurrentDay(day);
    setViewMode('day');
  };
  
  // Get unique days
  const uniqueDays = [...new Set(locations.map(loc => loc.day))].sort((a, b) => a - b);
  
  // Get max day number
  const maxDay = uniqueDays.length > 0 ? Math.max(...uniqueDays) : 1;
  
  // Create polyline positions based on current view mode
  const polylinePositions = viewMode === 'all' 
    ? locations
        .filter(loc => loc.isMain)
        .sort((a, b) => a.day - b.day)
        .map(loc => [loc.lat, loc.lon])
    : currentDayLocations.map(loc => [loc.lat, loc.lon]);
  
  if (!open) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      aria-labelledby="map-dialog-title"
    >
      <DialogTitle id="map-dialog-title">
        Travel Itinerary Map: {destination || 'Your Trip'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Analyzing your itinerary and extracting locations...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : locations.length === 0 ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              No location data could be extracted from the itinerary. The text may not contain clear day headers or recognizable location names.
            </Alert>
            {debugInfo && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {debugInfo}
              </Typography>
            )}
            <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                Tips for better location detection:
              </Typography>
              <Typography variant="body2" component="div">
                <ul>
                  <li>Make sure your itinerary has clear day headers (e.g., "Day 1: Paris" or "Day 2 - London")</li>
                  <li>Use proper capitalization for place names</li>
                  <li>Include the full location names (e.g., "Eiffel Tower, Paris" instead of just "Eiffel Tower")</li>
                </ul>
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            {usedFallback && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                We couldn't extract specific locations from your itinerary. Showing a default map view instead.
              </Alert>
            )}
            
            {debugInfo && !usedFallback && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {debugInfo}
              </Alert>
            )}
            
            {/* View Mode Tabs - Only show if not using fallback */}
            {!usedFallback && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={viewMode} 
                  onChange={handleViewModeChange}
                  centered
                >
                  <Tab 
                    icon={<LocationOnIcon />} 
                    label="Day-by-Day View" 
                    value="day" 
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Tab 
                    icon={<RouteIcon />} 
                    label="Complete Route" 
                    value="all" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Tabs>
              </Box>
            )}
            
            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1 }}>
              {/* Itinerary day list - Only show if not using fallback or if we have multiple days */}
              {(!usedFallback && uniqueDays.length > 0) && (
                <Box sx={{ 
                  width: { xs: '100%', md: '30%' }, 
                  pr: { md: 2 },
                  height: { xs: 'auto', md: '500px' }, 
                  mb: { xs: 2, md: 0 },
                  overflowY: 'auto',
                  borderRight: { md: '1px solid #eee' }
                }}>
                  {viewMode === 'day' && uniqueDays.length > 0 && (
                    <DayNavigation 
                      days={maxDay} 
                      currentDay={currentDay} 
                      onDayChange={setCurrentDay} 
                    />
                  )}
                  
                  <List>
                    {uniqueDays.map((day) => {
                      const dayLocations = locations.filter(loc => loc.day === day);
                      const mainLocation = dayLocations.find(loc => loc.isMain) || dayLocations[0];
                      
                      return (
                        <React.Fragment key={`list-day-${day}`}>
                          <ListItem 
                            button 
                            onClick={() => handleDayClick(day)}
                            selected={currentDay === day}
                            sx={{ 
                              borderLeft: '4px solid',
                              borderLeftColor: currentDay === day ? 'primary.main' : 'transparent',
                              bgcolor: currentDay === day ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Chip 
                                label={`Day ${day}`} 
                                color={currentDay === day ? "primary" : "default"}
                                sx={{ mr: 2, minWidth: '70px' }} 
                                variant={currentDay === day ? "filled" : "outlined"}
                              />
                              <ListItemText 
                                primary={mainLocation.location}
                                secondary={dayLocations.length > 1 ? `${dayLocations.length} locations` : null}
                                primaryTypographyProps={{ 
                                  fontWeight: currentDay === day ? 700 : 500
                                }}
                              />
                            </Box>
                          </ListItem>
                          
                          {/* Show secondary locations if this day is selected */}
                          {currentDay === day && dayLocations.length > 1 && (
                            <Box sx={{ pl: 4, pr: 2, mb: 1 }}>
                              <List disablePadding dense>
                                {dayLocations.map((loc, idx) => (
                                  <ListItem key={`subloc-${day}-${idx}`} dense sx={{ py: 0.5 }}>
                                    <ListItemText 
                                      primary={loc.location}
                                      primaryTypographyProps={{ 
                                        variant: 'body2',
                                        fontWeight: loc.isMain ? 500 : 400
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                          
                          <Divider component="li" />
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}
              
              {/* Map */}
              <Box sx={{ 
                width: { xs: '100%', md: usedFallback || uniqueDays.length === 0 ? '100%' : '70%' }, 
                height: { xs: '400px', md: '500px' }
              }}>
                <MapContainer 
                  center={center} 
                  zoom={zoom} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* View controller */}
                  {viewMode === 'day' && mainDayLocation && !usedFallback && (
                    <MapViewController 
                      location={mainDayLocation}
                    />
                  )}
                  
                  {/* Auto-fit bounds for 'all' view */}
                  {viewMode === 'all' && !usedFallback && (
                    <MapBoundsSetter locations={locations} shouldFit={viewMode === 'all'} />
                  )}
                  
                  {/* Auto-fit bounds for current day locations */}
                  {viewMode === 'day' && currentDayLocations.length > 1 && !usedFallback && (
                    <MapBoundsSetter locations={currentDayLocations} shouldFit={true} />
                  )}
                  
                  {/* Draw polyline connecting points */}
                  {polylinePositions.length > 1 && !usedFallback && (
                    <Polyline 
                      positions={polylinePositions}
                      color="#1976d2"
                      weight={3}
                      opacity={0.7}
                      dashArray="5, 10"
                    />
                  )}
                  
                  {/* Show markers based on view mode */}
                  {(viewMode === 'all' ? locations : currentDayLocations).map((loc, idx) => (
                    <Marker 
                      key={`marker-${loc.day}-${idx}`}
                      position={[loc.lat, loc.lon]}
                      icon={createDayIcon(loc.day, viewMode === 'day' && loc.isMain)}
                    >
                      <Popup>
                        <Typography variant="subtitle1">Day {loc.day}</Typography>
                        <Typography variant="body1" fontWeight="bold">{loc.location}</Typography>
                        {loc.description && (
                          <Typography variant="body2" mt={1}>
                            {loc.description}
                          </Typography>
                        )}
                        {loc.displayName && !loc.displayName.includes(loc.location) && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            {loc.displayName}
                          </Typography>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Box>
            
            {viewMode === 'day' && currentDayLocations.length > 0 && !usedFallback && (
              <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6">
                  Day {currentDay}: {currentDayLocations.length > 1 ? `${currentDayLocations.length} Locations` : mainDayLocation.location}
                </Typography>
                
                {currentDayLocations.map((loc, idx) => (
                  <Box key={`detail-${loc.day}-${idx}`} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={loc.isMain ? 'bold' : 'normal'}>
                      {loc.location}
                    </Typography>
                    {loc.description && (
                      <Typography variant="body2" color="text.secondary">
                        {loc.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}
            
            {usedFallback && (
              <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tips for better location detection:
                </Typography>
                <Typography variant="body2" component="div">
                  <ul>
                    <li>Format your itinerary with clear day headers (e.g., "Day 1: Paris" or "Day 2 - London")</li>
                    <li>Make sure place names are properly capitalized</li>
                    <li>Be specific with location names, including city names with attractions</li>
                    <li>Use standard location formatting (e.g., "Visit the Eiffel Tower in Paris")</li>
                  </ul>
                </Typography>
              </Paper>
            )}
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Map data extracted from the itinerary. Locations are approximated based on place names.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItineraryMap; 