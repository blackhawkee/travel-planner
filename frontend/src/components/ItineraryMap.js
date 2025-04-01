import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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
  Alert
} from '@mui/material';

// Fix for marker icons in react-leaflet
// (needed because webpack handles assets differently)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons for different days
const createDayIcon = (day) => {
  return L.divIcon({
    html: `<div style="background-color: #1976d2; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${day}</div>`,
    className: 'day-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Function to extract locations from the travel plan
const extractLocationsFromPlan = async (planText) => {
  try {
    // This is a simple heuristic to extract locations and days from the plan
    // In a real app, you might want to use a more sophisticated approach or API
    
    // Parse day headers
    const dayRegex = /day\s+(\d+)[:\s-]+([^(\n]+)(?:\(([^)]+)\))?/gi;
    const dayMatches = [...planText.matchAll(dayRegex)];
    
    if (dayMatches.length === 0) {
      // If we can't find day markers, try to parse the destination from the first line
      const lines = planText.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        // Just use the main destination
        return [{ day: 1, location: lines[0].trim(), description: 'Main destination' }];
      }
      return [];
    }
    
    // Extract location for each day
    const locations = await Promise.all(dayMatches.map(async (match) => {
      const day = parseInt(match[1]);
      const locationText = match[2].trim();
      const description = match[3] ? match[3].trim() : '';
      
      // Use OpenStreetMap Nominatim API to geocode the location
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`;
      
      try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
          return {
            day,
            location: locationText,
            description,
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          };
        }
        
        return {
          day,
          location: locationText,
          description,
          lat: null,
          lon: null
        };
      } catch (error) {
        console.error(`Error geocoding ${locationText}:`, error);
        return {
          day,
          location: locationText,
          description,
          lat: null,
          lon: null
        };
      }
    }));
    
    // Filter out locations without coordinates
    return locations.filter(loc => loc.lat !== null && loc.lon !== null);
  } catch (error) {
    console.error('Error extracting locations:', error);
    return [];
  }
};

const ItineraryMap = ({ open, onClose, planText, destination }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(12);
  
  useEffect(() => {
    const loadLocations = async () => {
      if (!open || !planText) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // First, try to geocode the main destination
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setZoom(10); // Zoom level for the main destination
        }
        
        // Then extract all day locations
        const extractedLocations = await extractLocationsFromPlan(planText);
        setLocations(extractedLocations);
        
        // If we have locations but couldn't get the main destination, use the first location
        if (extractedLocations.length > 0 && (!data || data.length === 0)) {
          setCenter([extractedLocations[0].lat, extractedLocations[0].lon]);
        }
        
        // Adjust zoom based on number of locations
        if (extractedLocations.length > 1) {
          setZoom(extractedLocations.length > 5 ? 6 : 8);
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
  
  // Create a polyline between locations in day order
  const polylinePositions = locations
    .sort((a, b) => a.day - b.day)
    .map(loc => [loc.lat, loc.lon]);
  
  if (!open) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="map-dialog-title"
    >
      <DialogTitle id="map-dialog-title">
        Travel Itinerary Map: {destination}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : locations.length === 0 ? (
          <Alert severity="info">No location data could be extracted from the itinerary.</Alert>
        ) : (
          <Box sx={{ height: 500, width: '100%' }}>
            <MapContainer 
              center={center} 
              zoom={zoom} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Draw polyline connecting all points */}
              {polylinePositions.length > 1 && (
                <Polyline 
                  positions={polylinePositions}
                  color="#1976d2"
                  weight={3}
                  opacity={0.7}
                  dashArray="5, 10"
                />
              )}
              
              {/* Show markers for each location */}
              {locations.map((loc) => (
                <Marker 
                  key={`day-${loc.day}`}
                  position={[loc.lat, loc.lon]}
                  icon={createDayIcon(loc.day)}
                >
                  <Popup>
                    <Typography variant="subtitle1">Day {loc.day}</Typography>
                    <Typography variant="body2">{loc.location}</Typography>
                    {loc.description && (
                      <Typography variant="body2" color="textSecondary">
                        {loc.description}
                      </Typography>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary">
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