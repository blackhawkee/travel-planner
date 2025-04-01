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
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { getDestinationRecommendations } from '../utils/api';
import apiConfig from '../config';

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

const seasonOptions = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'Rainy Season',
  'Dry Season',
  'Shoulder Season',
];

const budgetOptions = [
  'Budget',
  'Mid-range',
  'Luxury',
  'No preference',
];

function RecommendationsPage() {
  const [formData, setFormData] = useState({
    current_location: '',
    interests: [],
    travel_history: [],
    budget: '',
    season: '',
    llm_provider: 'gemini',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  
  const [travelHistoryInput, setTravelHistoryInput] = useState('');

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

  const handleTravelHistoryInputChange = (event) => {
    setTravelHistoryInput(event.target.value);
  };

  const handleAddTravelHistory = () => {
    if (travelHistoryInput.trim()) {
      setFormData({
        ...formData,
        travel_history: [...formData.travel_history, travelHistoryInput.trim()],
      });
      setTravelHistoryInput('');
    }
  };

  const handleDeleteTravelHistory = (placeToDelete) => {
    setFormData({
      ...formData,
      travel_history: formData.travel_history.filter(
        (place) => place !== placeToDelete
      ),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (formData.interests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await getDestinationRecommendations(formData);
      setResult(response.recommendations);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Get Destination Recommendations
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Tell us your preferences, and our AI will suggest destinations that match your interests.
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                  helperText="Where you're currently located (optional)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="budget-label">Budget Preference</InputLabel>
                  <Select
                    labelId="budget-label"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    label="Budget Preference"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {budgetOptions.map((budget) => (
                      <MenuItem key={budget} value={budget}>
                        {budget}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional budget level</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="season-label">Preferred Season</InputLabel>
                  <Select
                    labelId="season-label"
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    label="Preferred Season"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {seasonOptions.map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional season preference</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
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
                <FormControl fullWidth required>
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
                  <FormHelperText>Select one or more interests (*required)</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Travel History (Optional)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add places you've already visited"
                    value={travelHistoryInput}
                    onChange={handleTravelHistoryInputChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTravelHistory();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTravelHistory}
                    sx={{ ml: 1, height: 56 }}
                  >
                    Add
                  </Button>
                </Box>
                {formData.travel_history.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.travel_history.map((place) => (
                      <Chip
                        key={place}
                        label={place}
                        onDelete={() => handleDeleteTravelHistory(place)}
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || formData.interests.length === 0}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Get Recommendations'}
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
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Recommended Destinations
            </Typography>
            <Box className="markdown-content">
              <ReactMarkdown>{result}</ReactMarkdown>
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default RecommendationsPage; 