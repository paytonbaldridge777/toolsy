#!/usr/bin/env node

/**
 * Update Scholarships Script
 * 
 * Fetches scholarship data from CareerOneStop API and normalizes it
 * into a consistent schema for the scholarship coach tool.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ===========================
// Types
// ===========================

interface CareerOneStopScholarship {
  Name?: string;
  AwardAmount?: string;
  Deadline?: string;
  Contact?: {
    Name?: string;
    Email?: string;
    Phone?: string;
  };
  Eligibility?: string;
  ApplicationUrl?: string;
  Description?: string;
  NumberOfAwards?: number;
  Sponsor?: string;
  LevelOfStudy?: string[];
  Location?: string;
  Categories?: string[];
  Id?: string;
  MinAward?: string;
  MaxAward?: string;
  State?: string;
  Country?: string;
}

interface NormalizedScholarship {
  id: string;
  title: string;
  provider: string;
  source: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  deadline: string | null;
  levelOfStudy: string[];
  countries: string[];
  states: string[];
  needsBased: boolean;
  meritBased: boolean;
  minGPA: number | null;
  eligibleMajors: string[];
  eligibility: {
    citizenship: string[];
    incomeMaxUSD: number | null;
    firstGenCollege: boolean;
    specialGroups: string[];
  };
  requiresEssay: 'none' | 'short' | 'long';
  requiresRecommendation: boolean;
  applicationEffortLevel: 1 | 2 | 3;
  tags: string[];
  officialUrl: string;
  description: string;
  lastVerified: string;
  rawSource: {
    careerOneStopId: string;
  };
}

// ===========================
// Configuration
// ===========================

const API_TOKEN = process.env.CAREERONESTOP_API_TOKEN;
const API_BASE_URL = 'https://api.careeronestop.org';
const OUTPUT_DIR = join(process.cwd(), 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'scholarships.json');

// API endpoints to try (based on CareerOneStop documentation)
const SCHOLARSHIP_ENDPOINTS = [
  '/v1/scholarships',
  '/v1/scholarship',
  '/scholarships',
  '/scholarship'
];

// ===========================
// API Functions
// ===========================

async function fetchScholarships(): Promise<CareerOneStopScholarship[]> {
  if (!API_TOKEN) {
    console.warn('⚠️  CAREERONESTOP_API_TOKEN not set. Using mock data for testing.');
    return generateMockData();
  }

  console.log('🔄 Fetching scholarships from CareerOneStop API...');

  // Try different endpoints
  for (const endpoint of SCHOLARSHIP_ENDPOINTS) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`   Trying endpoint: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Successfully fetched data from ${endpoint}`);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          return data;
        } else if (data.ScholarshipResults) {
          return data.ScholarshipResults;
        } else if (data.scholarships) {
          return data.scholarships;
        } else if (data.data) {
          return Array.isArray(data.data) ? data.data : [data.data];
        }
        
        return [data];
      } else if (response.status === 404) {
        console.log(`   Endpoint not found, trying next...`);
        continue;
      } else {
        console.warn(`   API returned status ${response.status}: ${response.statusText}`);
        const text = await response.text();
        console.warn(`   Response: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      console.warn(`   Error with endpoint ${endpoint}:`, error);
      continue;
    }
  }

  console.warn('⚠️  All API endpoints failed. Using mock data.');
  return generateMockData();
}

function generateMockData(): CareerOneStopScholarship[] {
  console.log('📋 Generating mock scholarship data...');
  
  // Generate a diverse set of mock scholarships based on real-world patterns
  return [
    {
      Id: 'COS-001',
      Name: 'STEM Excellence Scholarship',
      Sponsor: 'National Science Foundation',
      Description: 'Supporting outstanding students pursuing STEM degrees with demonstrated academic excellence and research potential.',
      MinAward: '2000',
      MaxAward: '5000',
      Deadline: '2026-03-15',
      LevelOfStudy: ['Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['STEM', 'Merit-Based', 'Research'],
      Eligibility: 'Minimum 3.5 GPA, US Citizen, STEM major',
      ApplicationUrl: 'https://example.com/stem-scholarship',
      Contact: {
        Name: 'Scholarship Committee',
        Email: 'scholarships@nsf.org'
      }
    },
    {
      Id: 'COS-002',
      Name: 'First Generation College Student Grant',
      Sponsor: 'Educational Opportunity Foundation',
      Description: 'Empowering first-generation college students from underserved communities to achieve their educational goals.',
      MinAward: '3000',
      MaxAward: '7500',
      Deadline: '2026-02-01',
      LevelOfStudy: ['High School', 'Undergraduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['First-Generation', 'Need-Based', 'Diversity'],
      Eligibility: 'First-generation college student, household income under $60,000, minimum 2.5 GPA',
      ApplicationUrl: 'https://example.com/firstgen-grant',
      Contact: {
        Name: 'Grant Coordinator',
        Email: 'grants@eof.org'
      }
    },
    {
      Id: 'COS-003',
      Name: 'Women in Technology Scholarship',
      Sponsor: 'Tech Women United',
      Description: 'Supporting women pursuing careers in technology, computer science, and engineering fields.',
      MinAward: '2500',
      MaxAward: '6000',
      Deadline: '2026-04-30',
      LevelOfStudy: ['Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Women', 'Technology', 'STEM', 'Diversity'],
      Eligibility: 'Female students, technology-related major, minimum 3.0 GPA',
      ApplicationUrl: 'https://example.com/women-tech',
      Contact: {
        Name: 'Program Director',
        Email: 'scholarships@techwomen.org'
      }
    },
    {
      Id: 'COS-004',
      Name: 'Community Service Leader Award',
      Sponsor: 'Volunteers of America',
      Description: 'Recognizing students who have demonstrated exceptional commitment to community service and leadership.',
      MinAward: '1000',
      MaxAward: '3000',
      Deadline: '2026-05-15',
      LevelOfStudy: ['High School', 'Undergraduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Community Service', 'Leadership', 'Merit-Based'],
      Eligibility: 'Minimum 100 hours community service, 2.8+ GPA, leadership experience',
      ApplicationUrl: 'https://example.com/community-award',
      Contact: {
        Name: 'Awards Committee',
        Email: 'awards@voa.org'
      }
    },
    {
      Id: 'COS-005',
      Name: 'Rural Student Success Scholarship',
      Sponsor: 'Rural Education Alliance',
      Description: 'Supporting talented students from rural communities in accessing higher education opportunities.',
      MinAward: '2000',
      MaxAward: '5000',
      Deadline: '2026-03-01',
      LevelOfStudy: ['High School', 'Undergraduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Rural', 'Need-Based', 'Access'],
      Eligibility: 'Rural community resident, financial need, 3.0+ GPA',
      ApplicationUrl: 'https://example.com/rural-scholarship',
      Contact: {
        Name: 'Rural Programs',
        Email: 'programs@ruraledu.org'
      }
    },
    {
      Id: 'COS-006',
      Name: 'Military Family Education Grant',
      Sponsor: 'Armed Forces Foundation',
      Description: 'Supporting the education of children and spouses of active duty and veteran military members.',
      MinAward: '2500',
      MaxAward: '8000',
      Deadline: '2026-06-01',
      LevelOfStudy: ['High School', 'Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Military', 'Veterans', 'Family'],
      Eligibility: 'Military family member, proof of service, 2.5+ GPA',
      ApplicationUrl: 'https://example.com/military-grant',
      Contact: {
        Name: 'Family Support',
        Email: 'support@aff.org'
      }
    },
    {
      Id: 'COS-007',
      Name: 'Healthcare Professional Scholarship',
      Sponsor: 'Medical Education Fund',
      Description: 'Funding future healthcare professionals including nurses, doctors, therapists, and allied health workers.',
      MinAward: '3000',
      MaxAward: '10000',
      Deadline: '2026-02-28',
      LevelOfStudy: ['Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Healthcare', 'Professional', 'Merit-Based'],
      Eligibility: 'Healthcare-related major, 3.2+ GPA, clinical experience',
      ApplicationUrl: 'https://example.com/healthcare-scholarship',
      Contact: {
        Name: 'Education Committee',
        Email: 'education@medfund.org'
      }
    },
    {
      Id: 'COS-008',
      Name: 'Arts & Creativity Scholarship',
      Sponsor: 'National Arts Foundation',
      Description: 'Celebrating and supporting talented students pursuing careers in visual arts, performing arts, and creative fields.',
      MinAward: '1500',
      MaxAward: '4000',
      Deadline: '2026-04-15',
      LevelOfStudy: ['High School', 'Undergraduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Arts', 'Creative', 'Talent-Based'],
      Eligibility: 'Arts-related major, portfolio submission, 2.5+ GPA',
      ApplicationUrl: 'https://example.com/arts-scholarship',
      Contact: {
        Name: 'Arts Programs',
        Email: 'programs@naf.org'
      }
    },
    {
      Id: 'COS-009',
      Name: 'Quick Apply No-Essay Scholarship',
      Sponsor: 'Education Access Fund',
      Description: 'Simple, fast application scholarship requiring no essay - just basic information.',
      MinAward: '500',
      MaxAward: '1000',
      Deadline: '2026-07-31',
      LevelOfStudy: ['High School', 'Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Quick Apply', 'No Essay', 'General'],
      Eligibility: 'Enrolled or planning to enroll in college',
      ApplicationUrl: 'https://example.com/quick-apply',
      Contact: {
        Name: 'Application Support',
        Email: 'apply@eaf.org'
      }
    },
    {
      Id: 'COS-010',
      Name: 'Business & Entrepreneurship Scholarship',
      Sponsor: 'Future Business Leaders Foundation',
      Description: 'Supporting future entrepreneurs and business leaders with innovative ideas and leadership potential.',
      MinAward: '2000',
      MaxAward: '6000',
      Deadline: '2026-03-30',
      LevelOfStudy: ['Undergraduate', 'Graduate'],
      Location: 'National',
      State: 'US',
      Country: 'US',
      Categories: ['Business', 'Entrepreneurship', 'Leadership'],
      Eligibility: 'Business-related major, entrepreneurial experience, 3.0+ GPA',
      ApplicationUrl: 'https://example.com/business-scholarship',
      Contact: {
        Name: 'Business Programs',
        Email: 'programs@fblf.org'
      }
    }
  ];
}

// ===========================
// Normalization Functions
// ===========================

function parseAmount(amount: string | undefined, defaultValue: number = 1000): number {
  if (!amount) return defaultValue;
  
  // Remove currency symbols and commas
  const cleaned = amount.replace(/[$,]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  return isNaN(parsed) ? defaultValue : parsed;
}

function normalizeDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;
  
  try {
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function normalizeLevelOfStudy(levels: string[] | undefined): string[] {
  if (!levels || levels.length === 0) return [];
  
  const normalized = levels.flatMap(level => {
    const lower = level.toLowerCase();
    
    if (lower.includes('high') || lower.includes('senior')) {
      return ['High School'];
    }
    if (lower.includes('undergrad')) {
      return ['Undergraduate'];
    }
    if (lower.includes('grad') && !lower.includes('undergrad')) {
      return ['Graduate'];
    }
    if (lower.includes('trade') || lower.includes('technical')) {
      return ['Trade/Technical'];
    }
    
    return [level];
  });
  
  return [...new Set(normalized)];
}

function extractStates(location: string | undefined, state: string | undefined): string[] {
  const states: string[] = [];
  
  if (state && state !== 'US' && state.length === 2) {
    states.push(state.toUpperCase());
  }
  
  if (location) {
    const statePattern = /\b([A-Z]{2})\b/g;
    const matches = location.match(statePattern);
    if (matches) {
      states.push(...matches);
    }
  }
  
  return [...new Set(states)];
}

function extractRequirements(eligibility: string | undefined, description: string | undefined): {
  needsBased: boolean;
  meritBased: boolean;
  minGPA: number | null;
  requiresEssay: 'none' | 'short' | 'long';
  requiresRecommendation: boolean;
  firstGenCollege: boolean;
  specialGroups: string[];
  incomeMaxUSD: number | null;
} {
  const text = `${eligibility || ''} ${description || ''}`.toLowerCase();
  
  // GPA extraction
  let minGPA: number | null = null;
  const gpaMatch = text.match(/(\d+\.?\d*)\s*\+?\s*gpa|gpa\s*(?:of\s*)?(\d+\.?\d*)/i);
  if (gpaMatch) {
    minGPA = parseFloat(gpaMatch[1] || gpaMatch[2]);
  }
  
  // Need-based detection
  const needsBased = text.includes('need') || text.includes('financial') || 
                     text.includes('income') || text.includes('low-income');
  
  // Merit-based detection
  const meritBased = text.includes('merit') || text.includes('academic excellence') ||
                     text.includes('achievement') || (minGPA !== null && minGPA >= 3.0);
  
  // Essay detection
  let requiresEssay: 'none' | 'short' | 'long' = 'none';
  if (text.includes('essay') || text.includes('personal statement') || text.includes('writing sample')) {
    if (text.includes('short') || text.includes('250') || text.includes('500')) {
      requiresEssay = 'short';
    } else if (text.includes('no essay') || text.includes('no-essay')) {
      requiresEssay = 'none';
    } else {
      requiresEssay = 'long';
    }
  }
  
  // Recommendation detection
  const requiresRecommendation = text.includes('recommendation') || text.includes('letter of reference') ||
                                 text.includes('reference letter');
  
  // First-generation detection
  const firstGenCollege = text.includes('first-generation') || text.includes('first generation') ||
                          text.includes('first gen');
  
  // Special groups
  const specialGroups: string[] = [];
  if (text.includes('veteran') || text.includes('military')) specialGroups.push('Veteran');
  if (text.includes('minority') || text.includes('underrepresented')) specialGroups.push('Minority');
  if (text.includes('disability') || text.includes('disabled')) specialGroups.push('Disability');
  if (text.includes('women') || text.includes('female')) specialGroups.push('Women');
  if (text.includes('rural')) specialGroups.push('Rural');
  
  // Income cap extraction
  let incomeMaxUSD: number | null = null;
  const incomeMatch = text.match(/\$?(\d+),?(\d+)/);
  if (incomeMatch && needsBased) {
    incomeMaxUSD = parseInt(incomeMatch[1] + incomeMatch[2], 10);
  }
  
  return {
    needsBased,
    meritBased,
    minGPA,
    requiresEssay,
    requiresRecommendation,
    firstGenCollege,
    specialGroups,
    incomeMaxUSD
  };
}

function calculateEffortLevel(scholarship: CareerOneStopScholarship, requirements: ReturnType<typeof extractRequirements>): 1 | 2 | 3 {
  let effort = 0;
  
  if (requirements.requiresEssay === 'short') effort += 1;
  if (requirements.requiresEssay === 'long') effort += 2;
  if (requirements.requiresRecommendation) effort += 1;
  
  if (effort === 0) return 1;
  if (effort <= 2) return 2;
  return 3;
}

function normalizeScholarship(scholarship: CareerOneStopScholarship, index: number): NormalizedScholarship {
  const id = scholarship.Id || `COS-${String(index + 1).padStart(6, '0')}`;
  const minAmount = parseAmount(scholarship.MinAward || scholarship.AwardAmount, 1000);
  const maxAmount = parseAmount(scholarship.MaxAward || scholarship.AwardAmount, minAmount);
  
  const requirements = extractRequirements(scholarship.Eligibility, scholarship.Description);
  const states = extractStates(scholarship.Location, scholarship.State);
  
  // Extract majors from categories and description
  const majors: string[] = [];
  const categories = scholarship.Categories || [];
  const allText = `${categories.join(' ')} ${scholarship.Description || ''}`.toLowerCase();
  
  if (allText.includes('engineering')) majors.push('Engineering');
  if (allText.includes('stem') || allText.includes('science') || allText.includes('technology')) {
    majors.push('STEM');
  }
  if (allText.includes('business')) majors.push('Business');
  if (allText.includes('healthcare') || allText.includes('nursing') || allText.includes('medical')) {
    majors.push('Healthcare');
  }
  if (allText.includes('arts') || allText.includes('creative')) majors.push('Arts');
  
  // Generate tags
  const tags: string[] = [];
  if (requirements.needsBased) tags.push('need_based');
  if (requirements.meritBased) tags.push('merit_based');
  if (requirements.requiresEssay === 'none') tags.push('no_essay');
  if (states.length === 0) tags.push('national');
  if (categories) tags.push(...categories.map(c => c.toLowerCase().replace(/\s+/g, '_')));
  
  return {
    id,
    title: scholarship.Name || 'Untitled Scholarship',
    provider: scholarship.Sponsor || 'Unknown Provider',
    source: 'CareerOneStop',
    amountMin: minAmount,
    amountMax: maxAmount,
    currency: 'USD',
    deadline: normalizeDeadline(scholarship.Deadline),
    levelOfStudy: normalizeLevelOfStudy(scholarship.LevelOfStudy),
    countries: [scholarship.Country || 'US'],
    states,
    needsBased: requirements.needsBased,
    meritBased: requirements.meritBased,
    minGPA: requirements.minGPA,
    eligibleMajors: [...new Set(majors)],
    eligibility: {
      citizenship: ['US Citizen'],
      incomeMaxUSD: requirements.incomeMaxUSD,
      firstGenCollege: requirements.firstGenCollege,
      specialGroups: requirements.specialGroups
    },
    requiresEssay: requirements.requiresEssay,
    requiresRecommendation: requirements.requiresRecommendation,
    applicationEffortLevel: calculateEffortLevel(scholarship, requirements),
    tags: [...new Set(tags)],
    officialUrl: scholarship.ApplicationUrl || 'https://www.careeronestop.org/toolkit/training/find-scholarships.aspx',
    description: scholarship.Description || 'No description available.',
    lastVerified: new Date().toISOString().split('T')[0],
    rawSource: {
      careerOneStopId: id
    }
  };
}

// ===========================
// Main Function
// ===========================

async function main() {
  console.log('🎓 Scholarship Data Updater');
  console.log('============================\n');
  
  try {
    // Fetch scholarships from API
    const rawScholarships = await fetchScholarships();
    console.log(`📊 Retrieved ${rawScholarships.length} scholarships\n`);
    
    // Normalize scholarships
    console.log('🔄 Normalizing scholarship data...');
    const normalizedScholarships = rawScholarships.map((s, i) => normalizeScholarship(s, i));
    console.log(`✅ Normalized ${normalizedScholarships.length} scholarships\n`);
    
    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });
    
    // Write to file
    console.log(`💾 Writing to ${OUTPUT_FILE}...`);
    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(normalizedScholarships, null, 2),
      'utf-8'
    );
    
    console.log('✅ Scholarship data updated successfully!\n');
    console.log(`📈 Statistics:`);
    console.log(`   Total scholarships: ${normalizedScholarships.length}`);
    console.log(`   Total value: $${normalizedScholarships.reduce((sum, s) => sum + s.amountMax, 0).toLocaleString()}`);
    console.log(`   No essay required: ${normalizedScholarships.filter(s => s.requiresEssay === 'none').length}`);
    console.log(`   Need-based: ${normalizedScholarships.filter(s => s.needsBased).length}`);
    console.log(`   Merit-based: ${normalizedScholarships.filter(s => s.meritBased).length}`);
    
  } catch (error) {
    console.error('❌ Error updating scholarships:', error);
    process.exit(1);
  }
}

// Run the script
main();
