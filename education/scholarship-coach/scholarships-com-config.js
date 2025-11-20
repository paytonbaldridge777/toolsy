// Scholarships.com URL Configuration
// Maps our internal profile values to Scholarships.com directory URLs

const SCHOLARSHIPS_COM_CONFIG = {
  baseUrl: 'https://www.scholarships.com',
  
  // Academic Major mappings
  majors: {
    'accounting': 'accounting',
    'actuarial science': 'actuarial-science',
    'advertising': 'advertising',
    'aerospace engineering': 'aerospace-engineering',
    'agriculture': 'agriculture',
    'animal science': 'animal-science',
    'anthropology': 'anthropology',
    'architecture': 'architecture',
    'art': 'art',
    'art history': 'art-history',
    'astronomy': 'astronomy',
    'athletic training': 'athletic-training',
    'biochemistry': 'biochemistry',
    'biology': 'biology',
    'business': 'business',
    'chemical engineering': 'chemical-engineering',
    'chemistry': 'chemistry',
    'civil engineering': 'civil-engineering',
    'communications': 'communications',
    'computer engineering': 'computer-engineering',
    'computer science': 'computer-science',
    'construction management': 'construction-management',
    'criminal justice': 'criminal-justice',
    'culinary arts': 'culinary-arts',
    'cybersecurity': 'cybersecurity',
    'dance': 'dance',
    'dental hygiene': 'dental-hygiene',
    'dentistry': 'dentistry',
    'economics': 'economics',
    'education': 'education',
    'electrical engineering': 'electrical-engineering',
    'english': 'english',
    'environmental science': 'environmental-science',
    'fashion design': 'fashion-design',
    'film studies': 'film-studies',
    'finance': 'finance',
    'fine arts': 'fine-arts',
    'forensic science': 'forensic-science',
    'graphic design': 'graphic-design',
    'health sciences': 'health-sciences',
    'history': 'history',
    'hospitality management': 'hospitality-management',
    'human resources': 'human-resources',
    'industrial engineering': 'industrial-engineering',
    'information technology': 'information-technology',
    'interior design': 'interior-design',
    'international relations': 'international-relations',
    'journalism': 'journalism',
    'kinesiology': 'kinesiology',
    'landscape architecture': 'landscape-architecture',
    'law': 'law',
    'liberal arts': 'liberal-arts',
    'linguistics': 'linguistics',
    'marine biology': 'marine-biology',
    'marketing': 'marketing',
    'mathematics': 'mathematics',
    'mechanical engineering': 'mechanical-engineering',
    'medicine': 'medicine',
    'microbiology': 'microbiology',
    'music': 'music',
    'neuroscience': 'neuroscience',
    'nursing': 'nursing',
    'nutrition': 'nutrition',
    'occupational therapy': 'occupational-therapy',
    'pharmacy': 'pharmacy',
    'philosophy': 'philosophy',
    'physical therapy': 'physical-therapy',
    'physics': 'physics',
    'political science': 'political-science',
    'psychology': 'psychology',
    'public health': 'public-health',
    'public relations': 'public-relations',
    'real estate': 'real-estate',
    'religious studies': 'religious-studies',
    'social work': 'social-work',
    'sociology': 'sociology',
    'software engineering': 'software-engineering',
    'speech pathology': 'speech-pathology',
    'sports management': 'sports-management',
    'supply chain management': 'supply-chain-management',
    'theater': 'theater',
    'veterinary medicine': 'veterinary-medicine',
    'web development': 'web-development'
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
  },
  
  // Ethnicity/Race mappings
  ethnicity: {
    'african-american': { label: 'African American', slug: 'african-american' },
    'asian': { label: 'Asian/Pacific Islander', slug: 'asian-pacific-islander' },
    'hispanic': { label: 'Hispanic/Latino', slug: 'hispanic' },
    'native-american': { label: 'Native American', slug: 'native-american' },
    'caucasian': { label: 'Caucasian', slug: 'caucasian' }
  },
  
  // Gender mappings
  gender: {
    'female': { label: 'Female', slug: 'female' },
    'male': { label: 'Male', slug: 'male' }
  },
  
  // Religion mappings
  religion: {
    'christian': { label: 'Christian', slug: 'christian' },
    'catholic': { label: 'Catholic', slug: 'catholic' },
    'jewish': { label: 'Jewish', slug: 'jewish' },
    'muslim': { label: 'Muslim', slug: 'muslim' },
    'buddhist': { label: 'Buddhist', slug: 'buddhist' },
    'hindu': { label: 'Hindu', slug: 'hindu' }
  },
  
  // Military affiliation mappings
  military: {
    'military-child': { label: 'Military Child/Dependent', slug: 'military-child' },
    'veteran': { label: 'Veteran', slug: 'veteran' },
    'active-duty': { label: 'Active Duty', slug: 'active-duty' },
    'rotc': { label: 'ROTC', slug: 'rotc' }
  },
  
  // SAT score mappings
  sat: {
    '1400-1600': { label: '1400-1600', slug: '1400-1600' },
    '1200-1399': { label: '1200-1399', slug: '1200-1399' },
    '1000-1199': { label: '1000-1199', slug: '1000-1199' },
    '800-999': { label: '800-999', slug: '800-999' }
  },
  
  // ACT score mappings
  act: {
    '32-36': { label: '32-36', slug: '32-36' },
    '28-31': { label: '28-31', slug: '28-31' },
    '24-27': { label: '24-27', slug: '24-27' },
    '20-23': { label: '20-23', slug: '20-23' }
  },
  
  // Athletic ability mappings
  athletic: {
    'football': { label: 'Football', slug: 'football' },
    'basketball': { label: 'Basketball', slug: 'basketball' },
    'baseball': { label: 'Baseball', slug: 'baseball' },
    'soccer': { label: 'Soccer', slug: 'soccer' },
    'track-and-field': { label: 'Track and Field', slug: 'track-and-field' },
    'swimming': { label: 'Swimming', slug: 'swimming' },
    'volleyball': { label: 'Volleyball', slug: 'volleyball' },
    'tennis': { label: 'Tennis', slug: 'tennis' },
    'golf': { label: 'Golf', slug: 'golf' },
    'wrestling': { label: 'Wrestling', slug: 'wrestling' }
  },
  
  // Disability mappings
  disability: {
    'disability': { label: 'Student with Disability', slug: 'disability' },
    'learning-disability': { label: 'Learning Disability', slug: 'learning-disability' }
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
  
  // By Ethnicity/Race
  if (searchParams.ethnicity) {
    const ethnicityData = SCHOLARSHIPS_COM_CONFIG.ethnicity[searchParams.ethnicity];
    if (ethnicityData) {
      links.push({
        label: `${ethnicityData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/race/${ethnicityData.slug}`,
        category: 'Ethnicity'
      });
    }
  }
  
  // By Gender
  if (searchParams.gender) {
    const genderData = SCHOLARSHIPS_COM_CONFIG.gender[searchParams.gender];
    if (genderData) {
      links.push({
        label: `${genderData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/gender/${genderData.slug}`,
        category: 'Gender'
      });
    }
  }
  
  // By Religion
  if (searchParams.religion) {
    const religionData = SCHOLARSHIPS_COM_CONFIG.religion[searchParams.religion];
    if (religionData) {
      links.push({
        label: `${religionData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/religion/${religionData.slug}`,
        category: 'Religion'
      });
    }
  }
  
  // By Military Affiliation
  if (searchParams.military) {
    const militaryData = SCHOLARSHIPS_COM_CONFIG.military[searchParams.military];
    if (militaryData) {
      links.push({
        label: `${militaryData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/military-affiliation/${militaryData.slug}`,
        category: 'Military'
      });
    }
  }
  
  // By SAT Score
  if (searchParams.sat) {
    const satData = SCHOLARSHIPS_COM_CONFIG.sat[searchParams.sat];
    if (satData) {
      links.push({
        label: `SAT ${satData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/sat-score/${satData.slug}`,
        category: 'SAT Score'
      });
    }
  }
  
  // By ACT Score
  if (searchParams.act) {
    const actData = SCHOLARSHIPS_COM_CONFIG.act[searchParams.act];
    if (actData) {
      links.push({
        label: `ACT ${actData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/act-score/${actData.slug}`,
        category: 'ACT Score'
      });
    }
  }
  
  // By Athletic Ability
  if (searchParams.athletic) {
    const athleticData = SCHOLARSHIPS_COM_CONFIG.athletic[searchParams.athletic];
    if (athleticData) {
      links.push({
        label: `${athleticData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/athletic-ability/${athleticData.slug}`,
        category: 'Athletic'
      });
    }
  }
  
  // By Disability
  if (searchParams.disability) {
    const disabilityData = SCHOLARSHIPS_COM_CONFIG.disability[searchParams.disability];
    if (disabilityData) {
      links.push({
        label: `${disabilityData.label} Scholarships`,
        url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/disability/${disabilityData.slug}`,
        category: 'Disability'
      });
    }
  }
  
  // By First Generation
  if (searchParams.firstGen) {
    links.push({
      label: 'First-Generation College Student Scholarships',
      url: `${baseUrl}/financial-aid/college-scholarships/scholarship-directory/special-attributes/first-generation`,
      category: 'First Generation'
    });
  }
  
  return links;
}
