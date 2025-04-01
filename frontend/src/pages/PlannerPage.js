import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Paper,
  CircularProgress,
  Alert,
  FormHelperText,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { createTravelPlan } from '../utils/api';
import apiConfig from '../config';
import MapIcon from '@mui/icons-material/Map';
import ItineraryMap from '../components/ItineraryMap';
import TravelServices from '../components/TravelServices';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const interestOptions = [
  'Adventure',
  'Art & Culture',
  'Food & Cuisine',
  'History',
  'Nature',
  'Nightlife',
  'Photography',
  'Relaxation',
  'Shopping',
  'Sports',
  'Wildlife',
  'Architecture',
];

const travelStyleOptions = [
  'Budget',
  'Mid-range',
  'Luxury',
  'Backpacking',
  'Family-friendly',
  'Solo travel',
  'Eco-friendly',
  'Cultural immersion',
];

function PlannerPage() {
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    budget: '',
    interests: [],
    travel_style: '',
    llm_provider: 'gemini',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      interests: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await createTravelPlan(formData);
      setResult(response.plan);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenMap = () => {
    setMapOpen(true);
  };
  
  const handleCloseMap = () => {
    setMapOpen(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Create Your Travel Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Tell us about your dream destination, and our AI will create a personalized itinerary.
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  helperText="City, country, or region you want to visit"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Duration (days)"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 30 }}
                  helperText="Number of days for your trip (1-30)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  helperText="Optional budget range (e.g., $1000-$2000)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="travel-style-label">Travel Style</InputLabel>
                  <Select
                    labelId="travel-style-label"
                    name="travel_style"
                    value={formData.travel_style}
                    onChange={handleChange}
                    label="Travel Style"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {travelStyleOptions.map((style) => (
                      <MenuItem key={style} value={style}>
                        {style}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional travel style preference</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="interests-label">Interests</InputLabel>
                  <Select
                    labelId="interests-label"
                    multiple
                    name="interests"
                    value={formData.interests}
                    onChange={handleInterestChange}
                    input={<OutlinedInput label="Interests" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {interestOptions.map((interest) => (
                      <MenuItem key={interest} value={interest}>
                        {interest}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional: Select your interests</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="llm-provider-label">AI Model</InputLabel>
                  <Select
                    labelId="llm-provider-label"
                    name="llm_provider"
                    value={formData.llm_provider}
                    onChange={handleChange}
                    label="AI Model"
                  >
                    {apiConfig.llmProviders.map((provider) => (
                      <MenuItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select the AI model to use</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.destination || !formData.duration}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Travel Plan'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Your Personalized Travel Plan
              </Typography>
              <Box>
                <Tooltip title="View on Map">
                  <IconButton color="primary" onClick={handleOpenMap}>
                    <MapIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <ReactMarkdown>{result}</ReactMarkdown>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
              <TravelServices itinerary={result} destination={formData.destination} />
              <Button 
                variant="outlined"
                color="primary"
                onClick={handleOpenMap}
                startIcon={<MapIcon />}
                sx={{ mt: 2 }}
              >
                View on Map
              </Button>
            </Box>
            
            {/* Map Dialog */}
            <ItineraryMap 
              open={mapOpen} 
              onClose={handleCloseMap} 
              planText={result}
              destination={formData.destination}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default PlannerPage; 