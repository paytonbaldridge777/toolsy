// Cloudflare Pages Function to proxy Spoonacular API requests
// This endpoint handles recipe search with dietary restrictions
// API Key is stored in Cloudflare environment variable: SPOONACULAR_API_TOKEN

export async function onRequestGet(context) {
  const { request, env } = context;
  
  // Get API key from environment
  const apiKey = env.SPOONACULAR_API_TOKEN;
  
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'API configuration error',
      message: 'Spoonacular API key is not configured. Please contact support.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // Parse query parameters from incoming request
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    
    // Add API key to parameters
    params.set('apiKey', apiKey);
    
    // Build Spoonacular API URL
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`;
    
    // Make request to Spoonacular API
    const response = await fetch(spoonacularUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      // Log only status code without sensitive error details
      console.error('Spoonacular API error. Status:', response.status);
      
      return new Response(JSON.stringify({
        error: 'External API error',
        message: 'Failed to fetch recipes from nutrition database',
        status: response.status
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const data = await response.json();
    
    // Return successful response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
  } catch (error) {
    console.error('Error in Spoonacular proxy:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching recipes'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
