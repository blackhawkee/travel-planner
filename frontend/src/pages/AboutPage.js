import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';

function AboutPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Travel AI Planner
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            Travel AI Planner is designed to make travel planning effortless and personalized. 
            We combine the power of cutting-edge AI language models with thoughtful user experience 
            to help you discover new destinations and create detailed travel itineraries tailored to your preferences.
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you're a seasoned traveler looking for your next adventure or planning your first international trip, 
            our AI assistants can provide valuable insights, recommendations, and detailed plans to make your journey 
            memorable and stress-free.
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <SmartToyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI Technology
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  Our application uses multiple large language models to generate travel plans and recommendations:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AutoAwesomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Google Gemini Pro" 
                      secondary="Our default model, offering excellent travel knowledge and detailed responses" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AutoAwesomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Anthropic Claude" 
                      secondary="A thoughtful alternative model with nuanced travel understanding" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AutoAwesomeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ollama Integration" 
                      secondary="For users who prefer to run AI models locally on their own hardware" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Privacy & Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  We prioritize your privacy and control over AI usage:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Model Selection" 
                      secondary="Choose your preferred AI model for each request" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Self-Hosted Option" 
                      secondary="Use Ollama to run models locally without sending data to external services" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="No Account Required" 
                      secondary="Use our service without creating an account or sharing personal information" 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="body1" paragraph>
            Our application uses advanced prompt engineering to generate tailored travel plans based on your inputs.
            The AI models have been trained on vast amounts of information about destinations worldwide, including
            cultural attractions, local cuisine, accommodation options, and travel logistics.
          </Typography>
          <Typography variant="body1" paragraph>
            When you make a request, we format your preferences into a detailed prompt that guides the AI to generate
            comprehensive and relevant travel recommendations or itineraries. While the suggestions are AI-generated,
            they can provide an excellent starting point for your travel planning.
          </Typography>
          <Typography variant="body1">
            Remember to always verify critical information like visa requirements, opening hours, and safety advisories
            through official sources before finalizing your travel plans.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default AboutPage; 