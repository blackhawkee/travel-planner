import axios from 'axios';
import apiConfig from '../config';

export const createTravelPlan = async (planData) => {
  try {
    const response = await axios.post(apiConfig.plannerEndpoint, planData);
    return response.data;
  } catch (error) {
    console.error('Error creating travel plan:', error);
    throw error;
  }
};

export const getDestinationRecommendations = async (recData) => {
  try {
    const response = await axios.post(apiConfig.recommendationsEndpoint, recData);
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}; 