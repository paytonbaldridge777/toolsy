// Scholarships.com URL Configuration
// Maps our internal profile values to Scholarships.com directory URLs

const SCHOLARSHIPS_COM_CONFIG = {
  baseUrl: 'https://www.scholarships.com',
  
  // Academic Major mappings
  majors: {
    'computer science': 'computer-science',
    'engineering': 'engineering',
    'education': 'education',
    'business': 'business',
    'nursing': 'nursing',
    'psychology': 'psychology',
    'biology': 'biology',
    'mathematics': 'mathematics',
    'english': 'english',
    'history': 'history',
    'art': 'art',
    'music': 'music',
    'communications': 'communications',
    'criminal justice': 'criminal-justice',
    'architecture': 'architecture',
    'environmental science': 'environmental-science',
    'chemistry': 'chemistry',
    'physics': 'physics',
    'political science': 'political-science',
    'sociology': 'sociology',
    'accounting': 'accounting',
    'finance': 'finance',
    'marketing': 'marketing',
    'economics': 'economics',
    'pre-med': 'pre-med',
    'pre-law': 'pre-law',
    'social work': 'social-work',
    'journalism': 'journalism'
  },
  
  // GPA Band mappings
  gpaBands: {
    '1.0-2.0': {
      label: '1.0 - 2.0',
      slug: '1-0-2-0',
      min: 0,
      max: 2.0
    },
    '2.1-2.5': {
      label: '2.1 - 2.5',
      slug: '2-1-2-5',
      min: 2.1,
      max: 2.5
    },
    '2.6-3.0': {
      label: '2.6 - 3.0',
      slug: '2-6-3-0',
      min: 2.6,
      max: 3.0
    },
    '3.1-3.5': {
      label: '3.1 - 3.5',
      slug: '3-1-3-5',
      min: 3.1,
      max: 3.5
    },
    '3.6-4.0': {
      label: '3.6 - 4.0',
      slug: '3-6-4-0',
      min: 3.6,
      max: 5.0
    }
  },
  
  // School Year mappings
  schoolYear: {
    'high_school_freshman': {
      label: 'High School Freshman',
      slug: 'high-school-freshman'
    },
    'high_school_sophomore': {
      label: 'High School Sophomore',
      slug: 'high-school-sophomore'
    },
    'high_school_junior': {
      label: 'High School Junior',
      slug: 'high-school-junior'
    },
    'high_school_senior': {
      label: 'High School Senior',
      slug: 'high-school-senior'
    },
    'college_freshman': {
      label: 'College Freshman',
      slug: 'college-freshman'
    },
    'college_sophomore': {
      label: 'College Sophomore',
      slug: 'college-sophomore'
    },
    'college_junior': {
      label: 'College Junior',
      slug: 'college-junior'
    },
    'college_senior': {
      label: 'College Senior',
      slug: 'college-senior'
    },
    'graduate': {
      label: 'Graduate Student',
      slug: 'graduate-student'
    },
    'adult_student': {
      label: 'Adult Student',
      slug: 'adult-student'
    }
  },
  
  // Map our profile grade levels to school year
  gradeLevelToSchoolYear: {
    'hs_sophomore': 'high_school_sophomore',
    'hs_junior': 'high_school_junior',
    'hs_senior': 'high_school_senior',
    'undergraduate': 'college_freshman', // Default to freshman for undergraduate
    'graduate': 'graduate',
    'trade': 'adult_student'
  },
  
  // State mappings (US States)
  states: {
    'AL': { name: 'Alabama', slug: 'alabama' },
    'AK': { name: 'Alaska', slug: 'alaska' },
    'AZ': { name: 'Arizona', slug: 'arizona' },
    'AR': { name: 'Arkansas', slug: 'arkansas' },
    'CA': { name: 'California', slug: 'california' },
    'CO': { name: 'Colorado', slug: 'colorado' },
    'CT': { name: 'Connecticut', slug: 'connecticut' },
    'DE': { name: 'Delaware', slug: 'delaware' },
    'FL': { name: 'Florida', slug: 'florida' },
    'GA': { name: 'Georgia', slug: 'georgia' },
    'HI': { name: 'Hawaii', slug: 'hawaii' },
    'ID': { name: 'Idaho', slug: 'idaho' },
    'IL': { name: 'Illinois', slug: 'illinois' },
    'IN': { name: 'Indiana', slug: 'indiana' },
    'IA': { name: 'Iowa', slug: 'iowa' },
    'KS': { name: 'Kansas', slug: 'kansas' },
    'KY': { name: 'Kentucky', slug: 'kentucky' },
    'LA': { name: 'Louisiana', slug: 'louisiana' },
    'ME': { name: 'Maine', slug: 'maine' },
    'MD': { name: 'Maryland', slug: 'maryland' },
    'MA': { name: 'Massachusetts', slug: 'massachusetts' },
    'MI': { name: 'Michigan', slug: 'michigan' },
    'MN': { name: 'Minnesota', slug: 'minnesota' },
    'MS': { name: 'Mississippi', slug: 'mississippi' },
    'MO': { name: 'Missouri', slug: 'missouri' },
    'MT': { name: 'Montana', slug: 'montana' },
    'NE': { name: 'Nebraska', slug: 'nebraska' },
    'NV': { name: 'Nevada', slug: 'nevada' },
    'NH': { name: 'New Hampshire', slug: 'new-hampshire' },
    'NJ': { name: 'New Jersey', slug: 'new-jersey' },
    'NM': { name: 'New Mexico', slug: 'new-mexico' },
    'NY': { name: 'New York', slug: 'new-york' },
    'NC': { name: 'North Carolina', slug: 'north-carolina' },
    'ND': { name: 'North Dakota', slug: 'north-dakota' },
    'OH': { name: 'Ohio', slug: 'ohio' },
    'OK': { name: 'Oklahoma', slug: 'oklahoma' },
    'OR': { name: 'Oregon', slug: 'oregon' },
    'PA': { name: 'Pennsylvania', slug: 'pennsylvania' },
    'RI': { name: 'Rhode Island', slug: 'rhode-island' },
    'SC': { name: 'South Carolina', slug: 'south-carolina' },
    'SD': { name: 'South Dakota', slug: 'south-dakota' },
    'TN': { name: 'Tennessee', slug: 'tennessee' },
    'TX': { name: 'Texas', slug: 'texas' },
    'UT': { name: 'Utah', slug: 'utah' },
    'VT': { name: 'Vermont', slug: 'vermont' },
    'VA': { name: 'Virginia', slug: 'virginia' },
    'WA': { name: 'Washington', slug: 'washington' },
    'WV': { name: 'West Virginia', slug: 'west-virginia' },
    'WI': { name: 'Wisconsin', slug: 'wisconsin' },
    'WY': { name: 'Wyoming', slug: 'wyoming' },
    'DC': { name: 'District of Columbia', slug: 'district-of-columbia' }
  }
};

// Helper function to get GPA band from numeric GPA
function getGPABand(gpa) {
  if (!gpa) return null;
  
  for (const [key, band] of Object.entries(SCHOLARSHIPS_COM_CONFIG.gpaBands)) {
    if (gpa >= band.min && gpa <= band.max) {
      return key;
    }
  }
  return null;
}

// Helper function to normalize major string
function normalizeMajor(major) {
  if (!major) return null;
  const normalized = major.toLowerCase().trim();
  return SCHOLARSHIPS_COM_CONFIG.majors[normalized] || null;
}

// Helper function to get state slug
function getStateSlug(stateCode) {
  if (!stateCode) return null;
  const state = SCHOLARSHIPS_COM_CONFIG.states[stateCode.toUpperCase()];
  return state ? state.slug : null;
}

// Helper function to get school year slug
function getSchoolYearSlug(gradeLevel) {
  if (!gradeLevel) return null;
  const schoolYearKey = SCHOLARSHIPS_COM_CONFIG.gradeLevelToSchoolYear[gradeLevel];
  if (!schoolYearKey) return null;
  const schoolYear = SCHOLARSHIPS_COM_CONFIG.schoolYear[schoolYearKey];
  return schoolYear ? schoolYear.slug : null;
}

// Generate Scholarships.com URLs
function generateScholarshipLinks(searchParams) {
  const links = [];
  const baseUrl = SCHOLARSHIPS_COM_CONFIG.baseUrl;
  
  // By Academic Major
  if (searchParams.major) {
    const majorSlug = normalizeMajor(searchParams.major);
    if (majorSlug) {
      links.push({
        label: `Scholarships for ${searchParams.major}`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/academic-major/${majorSlug}`,
        category: 'Major'
      });
    }
  }
  
  // By GPA
  if (searchParams.gpaBand) {
    const band = SCHOLARSHIPS_COM_CONFIG.gpaBands[searchParams.gpaBand];
    if (band) {
      links.push({
        label: `GPA ${band.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/grade-point-average/${band.slug}`,
        category: 'GPA'
      });
    }
  }
  
  // By School Year
  if (searchParams.schoolYear) {
    const schoolYear = SCHOLARSHIPS_COM_CONFIG.schoolYear[searchParams.schoolYear];
    if (schoolYear) {
      links.push({
        label: `${schoolYear.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/school-year/${schoolYear.slug}`,
        category: 'School Year'
      });
    }
  }
  
  // By Residence State
  if (searchParams.residenceState) {
    const state = SCHOLARSHIPS_COM_CONFIG.states[searchParams.residenceState];
    if (state) {
      links.push({
        label: `${state.name} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarships-by-state/${state.slug}-scholarships`,
        category: 'Residence State'
      });
    }
  }
  
  // By Financial Need
  if (searchParams.financialNeed) {
    links.push({
      label: 'Need-Based Scholarships',
      url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/financial-need`,
      category: 'Financial Need'
    });
  }
  
  return links;
}
