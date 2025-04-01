import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import FlightIcon from '@mui/icons-material/Flight';

function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Plan Your Dream Trip with AI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Let artificial intelligence help you create personalized travel itineraries
          and discover new destinations that match your interests.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4, mb: 8 }}
        >
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/planner"
            startIcon={<MapIcon />}
          >
            Create Travel Plan
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/recommendations"
            startIcon={<ExploreIcon />}
          >
            Get Recommendations
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://source.unsplash.com/random/800x400/?travel,city"
              alt="City travel"
            />
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Personalized Itineraries
              </Typography>
              <Typography variant="body1">
                Get a detailed day-by-day plan tailored to your interests, budget,
                and travel style with recommendations for accommodations, activities,
                and local cuisine.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://source.unsplash.com/random/800x400/?travel,nature"
              alt="Nature destinations"
            />
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Discover New Destinations
              </Typography>
              <Typography variant="body1">
                Tell us what you love, and we'll suggest destinations that match your
                preferences. Explore places you might never have considered before.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="140"
              image="https://source.unsplash.com/random/800x400/?travel,tech"
              alt="AI technology"
            />
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Powered by Advanced AI
              </Typography>
              <Typography variant="body1">
                Our application leverages cutting-edge language models including Google's
                Gemini Pro, Anthropic's Claude, and open-source models via Ollama for
                the most relevant and helpful travel guidance.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage; 