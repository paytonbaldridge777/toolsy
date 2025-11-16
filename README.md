# Scholarship Data Integration

This project integrates real scholarship data from multiple sources into the Scholarship Coach tool:
- **Wikidata** (CC0/Public Domain) - International scholarships
- **CareerOneStop API** - US-focused scholarships (requires API token)

## Overview

The scholarship data is automatically updated via GitHub Actions and stored in `data/scholarships.json`, which the front-end loads to display scholarship opportunities.

## Components

### 1. Wikidata Fetcher Script (`scripts/fetch-wikidata-scholarships.ts`)

A TypeScript script that:
- Queries Wikidata's SPARQL endpoint for scholarship data
- Uses CC0/public domain data - no API key required
- Normalizes the data into a consistent schema
- Writes the normalized data to `data/scholarships.json`
- Includes source metadata (`source: "wikidata"`, `tags: ["seed_wikidata"]`)

**Usage:**
```bash
npm run build:scholarships:wikidata
```

**Features:**
- Fetches international scholarships from Wikidata
- Includes scholarship name, description, country, and official website
- Falls back to sample data if network is unavailable
- Maps Wikidata entities to normalized schema

### 2. Data Updater Script (`scripts/update-scholarships.ts`)

A TypeScript script that:
- Fetches scholarship data from the CareerOneStop API
- Normalizes the data into a consistent schema
- Writes the normalized data to `data/scholarships.json`
- Generates statistics about the scholarships

**Usage:**
```bash
npm run update-scholarships
```

**Configuration:**
- Set the `CAREERONESTOP_API_TOKEN` environment variable with your API key
- If no API token is provided, the script will use mock data for testing

### 3. GitHub Actions Workflows

**Wikidata Scholarships (`.github/workflows/update-wikidata-scholarships.yml`):**
- Runs weekly on Monday at 2:00 AM UTC
- Fetches scholarships from Wikidata
- Uses no proprietary APIs or secrets
- Commits changes if data has been updated

**CareerOneStop Scholarships (`.github/workflows/update-scholarships.yml`):**
- Runs daily at 3:00 AM UTC
- Requires `CAREERONESTOP_API_TOKEN` secret
- Fetches US-focused scholarship data
- Commits changes if data has been updated

**Manual Trigger:**
Both workflows can be manually triggered from the Actions tab in GitHub.

### 4. Normalized Scholarship Schema

Each scholarship in `data/scholarships.json` follows this structure:

```typescript
{
  "id": "WD-Q1144593",                    // Unique identifier (WD-* for Wikidata, COS-* for CareerOneStop)
  "title": "Example Scholarship Name",    // Scholarship name
  "provider": "Example Provider Name",    // Organization offering the scholarship
  "source": "wikidata",                  // Data source ("wikidata" or "CareerOneStop")
  "amountMin": 1000,                     // Minimum award amount (USD) - may be null
  "amountMax": 5000,                     // Maximum award amount (USD) - may be null
  "currency": "USD",                     // Currency code
  "deadline": "2026-02-15",              // Application deadline (ISO 8601 date)
  "levelOfStudy": ["High School", "Undergraduate"], // Education levels
  "countries": ["US"],                   // Eligible countries
  "states": ["TX"],                      // Eligible states (if applicable)
  "needsBased": true,                    // Whether it's need-based
  "meritBased": true,                    // Whether it's merit-based
  "minGPA": 3.0,                         // Minimum GPA requirement
  "eligibleMajors": ["Engineering", "STEM"], // Eligible majors/fields
  "eligibility": {
    "citizenship": ["US Citizen"],       // Citizenship requirements
    "incomeMaxUSD": 80000,              // Maximum household income (if applicable)
    "firstGenCollege": false,           // First-generation college student requirement
    "specialGroups": ["Veteran"]        // Special demographic groups
  },
  "requiresEssay": "short",             // "none" | "short" | "long"
  "requiresRecommendation": true,       // Whether recommendation letters are required
  "applicationEffortLevel": 2,          // 1-3, indicating application complexity
  "tags": ["seed_wikidata", "international"], // Searchable tags (includes "seed_wikidata" for Wikidata sources)
  "officialUrl": "https://...",         // Official scholarship application URL - may be null
  "description": "Short description.",   // Scholarship description
  "lastVerified": "2025-11-16",         // Date the data was last updated
  "rawSource": {
    "wikidataId": "Q1144593"            // Original source identifier (wikidataId or careerOneStopId)
  }
}
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- (Optional) CareerOneStop API Token for US scholarship data - obtain from [CareerOneStop Developer Portal](https://www.careeronestop.org/Developers/WebAPI/web-api.aspx)
- No API token needed for Wikidata - it's CC0/public domain

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Fetch Wikidata scholarships (no API key needed):**
   ```bash
   npm run build:scholarships:wikidata
   ```

3. **(Optional) Fetch CareerOneStop scholarships:**
   ```bash
   # Set up API token
   export CAREERONESTOP_API_TOKEN=your_api_token_here
   
   # Run the updater script
   npm run update-scholarships
   ```

4. **View the generated data:**
   ```bash
   cat data/scholarships.json
   ```

### GitHub Actions Setup

**For Wikidata (no secrets needed):**
- The workflow runs automatically weekly
- Can be manually triggered from the Actions tab
- No setup required - uses public domain data

**For CareerOneStop (optional):**
1. **Add the API token as a secret:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CAREERONESTOP_API_TOKEN`
   - Value: Your CareerOneStop API token

2. **The workflow will automatically run:**
   - Daily at 3:00 AM UTC
   - Can be manually triggered from the Actions tab

## Front-End Integration

The Scholarship Coach tool (`education/scholarship-coach/`) automatically loads scholarship data from `/data/scholarships.json`. The front-end has been updated to:

- Load from the new data file location
- Handle the normalized schema fields
- Display scholarships with the new data structure
- Maintain all existing filtering and matching functionality

### Key Changes in Front-End:

- **Data source:** Changed from `scholarships.json` to `/data/scholarships.json`
- **Field mappings:** Updated to use new schema field names (e.g., `name` → `title`, `url` → `officialUrl`, `levels` → `levelOfStudy`)
- **Eligibility display:** Dynamically generates eligibility summaries from the structured eligibility data
- **Backward compatibility:** All existing features (search, filters, saving, matching) work with the new schema

## Data Flow

```
Wikidata SPARQL Endpoint (CC0/Public Domain)
       ↓
fetch-wikidata-scholarships.ts
       ↓
data/scholarships.json
       ↓
GitHub Actions (weekly commit)
       ↓
Front-end (loads on page load)
       ↓
User Interface

Alternative path:
CareerOneStop API (requires token)
       ↓
update-scholarships.ts
       ↓
data/scholarships.json (replaces Wikidata data)
```

## Testing

### Test the Updater Scripts

```bash
# Wikidata (no API token needed)
npm run build:scholarships:wikidata

# CareerOneStop (requires API token, uses mock data without it)
npm run update-scholarships

# With API token
CAREERONESTOP_API_TOKEN=your_token npm run update-scholarships
```

### Test the Front-End

1. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open your browser to:
   ```
   http://localhost:8080/education/scholarship-coach/
   ```

3. Verify:
   - Scholarships load successfully
   - Filtering works correctly
   - Detail modals display proper information
   - Saving scholarships functions properly

## Maintenance

### Updating the Schema

If you need to modify the normalized schema:

1. Update the `NormalizedScholarship` interface in both:
   - `scripts/fetch-wikidata-scholarships.ts`
   - `scripts/update-scholarships.ts`
2. Update the normalization functions in both scripts
3. Update the front-end code in `education/scholarship-coach/app.js` to use the new fields
4. Run the appropriate updater script to regenerate the data file
5. Test the front-end to ensure everything works

### Monitoring

- Check the GitHub Actions logs to ensure daily updates are running successfully
- Review the generated `data/scholarships.json` file periodically to verify data quality
- Monitor the front-end for any display or functionality issues

## Troubleshooting

### Script Issues

**Problem:** "CAREERONESTOP_API_TOKEN not set"
- **Solution:** Set the environment variable or let the script use mock data

**Problem:** "All API endpoints failed"
- **Solution:** Verify your API token is valid and you have network access to the CareerOneStop API

### Front-End Issues

**Problem:** "Error loading scholarships"
- **Solution:** Ensure `data/scholarships.json` exists and is valid JSON

**Problem:** Scholarships not displaying correctly
- **Solution:** Check browser console for errors and verify the schema matches expectations

### GitHub Actions Issues

**Problem:** Workflow failing to commit
- **Solution:** Ensure the workflow has write permissions and the API token secret is set correctly

## Security Notes

- **Never commit API tokens** to the repository
- Store the `CAREERONESTOP_API_TOKEN` as a GitHub secret
- The generated `data/scholarships.json` file is public and contains no sensitive data
- User data is stored locally in the browser (not on the server)

## Resources

- [CareerOneStop API Documentation](https://www.careeronestop.org/Developers/WebAPI/web-api.aspx)
- [CareerOneStop API Explorer](https://api.careeronestop.org/api-explorer/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## License

This integration follows the licensing terms of the Toolsy project.
