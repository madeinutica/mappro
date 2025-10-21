// Google Places API utilities
import { GOOGLE_PLACES_API_KEY } from '../../config/google.config';

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export async function searchNearbyPlaces(lat, lng, radius = 100, type = 'establishment') {
  try {
    const response = await fetch(
      `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching nearby places:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId) {
  try {
    const response = await fetch(
      `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=name,rating,reviews,formatted_address&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

export async function findPlaceByText(query) {
  try {
    const response = await fetch(
      `${GOOGLE_PLACES_BASE_URL}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates || [];
  } catch (error) {
    console.error('Error finding place by text:', error);
    return [];
  }
}