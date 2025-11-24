# Weight Control App API Integration

This directory contains Cloudflare Pages Functions that proxy API requests to external nutrition services.

## Environment Variables Required

The following secrets must be configured in Cloudflare Pages settings:

### SPOONACULAR_API_TOKEN
- **Purpose**: Access Spoonacular nutrition and recipe API
- **Where to get it**: https://spoonacular.com/food-api
- **Used by**: `/functions/api/spoonacular/recipes/complexSearch.js`

### USDA_API_TOKEN (Future use)
- **Purpose**: Access USDA FoodData Central API
- **Where to get it**: https://fdc.nal.usda.gov/api-guide.html
- **Note**: Currently not implemented but reserved for future nutrition data needs

## How to Configure Secrets

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages → Your site → Settings
3. Under "Environment Variables", add:
   - Variable name: `SPOONACULAR_API_TOKEN`
   - Value: Your API key
   - Environment: Production (and Preview if needed)

## API Endpoints

### GET /api/spoonacular/recipes/complexSearch

Searches for recipes based on dietary restrictions and nutritional targets.

**Query Parameters:**
- `type` - Meal type (breakfast, lunch, dinner, snack)
- `targetCalories` - Target calories for the meal
- `number` - Number of results to return (default: 5)
- `diet` - Diet type (vegetarian, vegan, paleo, keto, gluten_free)
- `intolerances` - Comma-separated list of intolerances
- `excludeIngredients` - Comma-separated list of ingredients to exclude
- `includeIngredients` - Comma-separated list of preferred ingredients
- `addRecipeInformation` - Include recipe details (true/false)
- `fillIngredients` - Include ingredient lists (true/false)
- `addRecipeNutrition` - Include nutrition data (true/false)

**Example:**
```
/api/spoonacular/recipes/complexSearch?type=breakfast&targetCalories=500&number=5&diet=vegetarian&addRecipeNutrition=true
```

**Response:**
Returns Spoonacular API response with recipe results including nutrition information.

**Error Handling:**
- Returns 500 if API key is not configured
- Returns appropriate status code if Spoonacular API fails
- Returns error message without exposing API key

## Security

- API keys are never exposed to the client
- All requests are proxied through Cloudflare Functions
- CORS is enabled for the application origin
- Responses are cached for 1 hour to reduce API usage
