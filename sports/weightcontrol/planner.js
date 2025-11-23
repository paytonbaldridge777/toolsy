// Weight Control Planner JavaScript
// Handles all calculations, API calls, and UI interactions

// ============================================================================
// GLOBAL STATE
// ============================================================================
let rulesData = null;
let docsData = null;
let currentPlan = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Load rules and docs
  await loadData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('deadlineDate').setAttribute('min', today);
});

async function loadData() {
  try {
    const [rulesResponse, docsResponse] = await Promise.all([
      fetch('/sports/weightcontrol/data/rules.json'),
      fetch('/sports/weightcontrol/data/docs.json')
    ]);
    
    rulesData = await rulesResponse.json();
    docsData = await docsResponse.json();
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error loading configuration data. Please refresh the page.');
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  // Navigation
  document.getElementById('startPlanBtn').addEventListener('click', showFormScreen);
  document.getElementById('backToLandingBtn').addEventListener('click', showLandingScreen);
  
  // Step navigation
  document.getElementById('nextStep1Btn').addEventListener('click', () => navigateToStep(2));
  document.getElementById('nextStep2Btn').addEventListener('click', () => navigateToStep(3));
  document.getElementById('backStep2Btn').addEventListener('click', () => navigateToStep(1));
  document.getElementById('backStep3Btn').addEventListener('click', () => navigateToStep(2));
  
  // Generate plan
  document.getElementById('generatePlanBtn').addEventListener('click', generatePlan);
  
  // Medical conditions toggle
  document.getElementById('medicalConditions').addEventListener('change', (e) => {
    const detailsGroup = document.getElementById('medicalDetailsGroup');
    detailsGroup.style.display = e.target.value === 'yes' ? 'block' : 'none';
  });
  
  // Results actions
  document.getElementById('startOverBtn').addEventListener('click', showLandingScreen);
  document.getElementById('printPlanBtn').addEventListener('click', () => window.print());
  document.getElementById('exportJsonBtn').addEventListener('click', exportPlanJson);
}

// ============================================================================
// SCREEN NAVIGATION
// ============================================================================
function showLandingScreen() {
  document.getElementById('landingScreen').style.display = 'block';
  document.getElementById('formScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'none';
  window.scrollTo(0, 0);
}

function showFormScreen() {
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('formScreen').style.display = 'block';
  document.getElementById('resultsScreen').style.display = 'none';
  navigateToStep(1);
  window.scrollTo(0, 0);
}

function showResultsScreen() {
  document.getElementById('landingScreen').style.display = 'none';
  document.getElementById('formScreen').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'block';
  window.scrollTo(0, 0);
}

function navigateToStep(stepNumber) {
  // Validate current step before moving forward
  if (stepNumber > 1 && !validateStep(stepNumber - 1)) {
    return;
  }
  
  // Hide all steps
  document.querySelectorAll('.form-step').forEach(step => {
    step.style.display = 'none';
  });
  
  // Show target step
  document.getElementById(`step${stepNumber}`).style.display = 'block';
  
  // Update progress bar
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const num = index + 1;
    if (num < stepNumber) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (num === stepNumber) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
  
  window.scrollTo(0, 0);
}

function validateStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  const requiredFields = step.querySelectorAll('[required]');
  
  for (const field of requiredFields) {
    if (!field.value) {
      field.focus();
      alert(`Please fill in all required fields before continuing.`);
      return false;
    }
  }
  
  // Additional validation for step 1
  if (stepNumber === 1) {
    const currentWeight = parseFloat(document.getElementById('currentWeight').value);
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const deadlineDate = new Date(document.getElementById('deadlineDate').value);
    const today = new Date();
    
    if (targetWeight >= currentWeight) {
      alert('Target weight must be less than current weight for a weight loss plan.');
      return false;
    }
    
    if (deadlineDate <= today) {
      alert('Target date must be in the future.');
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// PLAN GENERATION
// ============================================================================
async function generatePlan() {
  if (!validateStep(3)) {
    return;
  }
  
  // Collect all form data
  const formData = collectFormData();
  
  // Show loading state
  showResultsScreen();
  document.getElementById('planSummary').innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Generating your personalized plan...</p></div>';
  
  try {
    // Calculate plan
    const plan = await calculatePlan(formData);
    currentPlan = plan;
    
    // Render results
    renderPlanSummary(plan);
    renderWarnings(plan);
    renderNutritionTargets(plan);
    await renderMealPlan(plan);
    renderWorkoutGuidance(plan);
    renderReferenceLibrary(plan);
  } catch (error) {
    console.error('Error generating plan:', error);
    document.getElementById('planSummary').innerHTML = '<p class="error">Error generating plan. Please try again.</p>';
  }
}

function collectFormData() {
  return {
    // Step 1
    sport: document.getElementById('sport').value,
    age: parseInt(document.getElementById('age').value),
    sex: document.getElementById('sex').value,
    height: parseFloat(document.getElementById('height').value),
    currentWeight: parseFloat(document.getElementById('currentWeight').value),
    targetWeight: parseFloat(document.getElementById('targetWeight').value),
    deadlineDate: document.getElementById('deadlineDate').value,
    bodyFatPct: document.getElementById('bodyFatPct').value ? parseFloat(document.getElementById('bodyFatPct').value) : null,
    
    // Step 2
    trainingDays: parseInt(document.getElementById('trainingDays').value),
    trainingIntensity: document.getElementById('trainingIntensity').value,
    weighInWindow: document.getElementById('weighInWindow').value,
    
    // Step 3
    medicalConditions: document.getElementById('medicalConditions').value === 'yes',
    medicalDetails: document.getElementById('medicalDetails').value,
    injuries: document.getElementById('injuries').value,
    cutHistory: document.getElementById('cutHistory').value,
    dietaryStyle: document.getElementById('dietaryStyle').value,
    allergies: document.getElementById('allergies').value.split(',').map(s => s.trim()).filter(s => s),
    dislikedFoods: document.getElementById('dislikedFoods').value.split(',').map(s => s.trim()).filter(s => s),
    mealsPerDay: parseInt(document.getElementById('mealsPerDay').value)
  };
}

// ============================================================================
// CALCULATIONS
// ============================================================================
async function calculatePlan(formData) {
  const sportRules = rulesData.sports[formData.sport];
  const generalRules = rulesData.general;
  const youthRules = rulesData.youth_overrides;
  
  const isYouth = formData.age < youthRules.applies_if_age_under;
  
  // 1. Calculate TDEE
  let tdee;
  if (formData.bodyFatPct && generalRules.tdee_formula_alt_if_bf_known === 'cunningham') {
    tdee = calculateCunninghamTDEE(formData);
  } else {
    tdee = calculateMifflinStJeorTDEE(formData);
  }
  
  // Apply activity multiplier
  const activityMultiplier = getActivityMultiplier(formData.trainingDays, formData.trainingIntensity);
  tdee *= activityMultiplier;
  
  // 2. Calculate required weekly loss
  const weightToLose = formData.currentWeight - formData.targetWeight;
  const deadline = new Date(formData.deadlineDate);
  const today = new Date();
  const weeksAvailable = Math.max(1, (deadline - today) / (7 * 24 * 60 * 60 * 1000));
  const requiredWeeklyLoss = weightToLose / weeksAvailable;
  const requiredWeeklyLossPct = (requiredWeeklyLoss / formData.currentWeight) * 100;
  
  // 3. Determine safe weekly loss cap
  let maxWeeklyLossPct = sportRules.max_weekly_loss_pct;
  if (isYouth) {
    maxWeeklyLossPct = Math.min(maxWeeklyLossPct, youthRules.max_weekly_loss_pct);
  }
  
  const safeWeeklyLoss = (maxWeeklyLossPct / 100) * formData.currentWeight;
  const actualWeeklyLoss = Math.min(requiredWeeklyLoss, safeWeeklyLoss);
  const adjustedTimeline = weightToLose / actualWeeklyLoss;
  
  // 4. Calculate daily calorie target
  const weeklyDeficit = actualWeeklyLoss * 3500; // 3500 cal per lb
  const dailyDeficit = weeklyDeficit / 7;
  let targetCalories = tdee - dailyDeficit;
  
  // Apply calorie floors
  const minCalories = formData.sex === 'male' ? generalRules.min_calories_male : generalRules.min_calories_female;
  if (isYouth) {
    const youthMinCalories = tdee * youthRules.min_calories_multiplier_of_tdee;
    targetCalories = Math.max(targetCalories, youthMinCalories, minCalories);
  } else {
    targetCalories = Math.max(targetCalories, minCalories);
  }
  
  // 5. Calculate macros
  const macros = calculateMacros(formData, sportRules, targetCalories);
  
  // 6. Generate warnings
  const warnings = generateWarnings(formData, sportRules, youthRules, isYouth, requiredWeeklyLossPct, maxWeeklyLossPct);
  
  // 7. Collect relevant doc refs
  const docRefs = [...new Set([
    ...generalRules.doc_refs,
    ...sportRules.doc_refs,
    ...(isYouth ? youthRules.doc_refs : [])
  ])];
  
  return {
    formData,
    sportRules,
    isYouth,
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros,
    weightToLose: weightToLose.toFixed(1),
    weeksAvailable: weeksAvailable.toFixed(1),
    requiredWeeklyLoss: requiredWeeklyLoss.toFixed(1),
    safeWeeklyLoss: safeWeeklyLoss.toFixed(1),
    actualWeeklyLoss: actualWeeklyLoss.toFixed(1),
    adjustedTimeline: adjustedTimeline.toFixed(1),
    warnings,
    docRefs
  };
}

function calculateMifflinStJeorTDEE(formData) {
  const weight_kg = formData.currentWeight * 0.453592;
  const height_cm = formData.height * 2.54;
  
  if (formData.sex === 'male') {
    return (10 * weight_kg) + (6.25 * height_cm) - (5 * formData.age) + 5;
  } else {
    return (10 * weight_kg) + (6.25 * height_cm) - (5 * formData.age) - 161;
  }
}

function calculateCunninghamTDEE(formData) {
  const weight_kg = formData.currentWeight * 0.453592;
  const lbm_kg = weight_kg * (1 - formData.bodyFatPct / 100);
  return 500 + (22 * lbm_kg);
}

function getActivityMultiplier(trainingDays, intensity) {
  // Conservative multipliers
  if (trainingDays === 0) return 1.2;
  
  const baseMultipliers = {
    light: 1.375,
    moderate: 1.55,
    high: 1.725
  };
  
  let multiplier = baseMultipliers[intensity] || 1.55;
  
  // Adjust for training days
  if (trainingDays <= 2) multiplier -= 0.1;
  if (trainingDays >= 6) multiplier += 0.1;
  
  return Math.max(1.2, Math.min(2.0, multiplier));
}

function calculateMacros(formData, sportRules, targetCalories) {
  // Protein
  const proteinGPerLb = sportRules.protein_g_lb;
  const proteinG = Math.round(formData.currentWeight * proteinGPerLb);
  const proteinCal = proteinG * 4;
  
  // Fat floor
  const fatFloorPct = sportRules.fat_floor_pct_calories;
  const fatMinCal = targetCalories * (fatFloorPct / 100);
  const fatG = Math.round(fatMinCal / 9);
  const fatCal = fatG * 9;
  
  // Carbs fill remainder
  const carbCal = targetCalories - proteinCal - fatCal;
  const carbG = Math.round(Math.max(0, carbCal / 4));
  
  return {
    protein: proteinG,
    carbs: carbG,
    fat: fatG,
    proteinPct: Math.round((proteinCal / targetCalories) * 100),
    carbsPct: Math.round((carbCal / targetCalories) * 100),
    fatPct: Math.round((fatCal / targetCalories) * 100)
  };
}

function generateWarnings(formData, sportRules, youthRules, isYouth, requiredPct, maxPct) {
  const warnings = [];
  
  // Timeline warning
  if (requiredPct > maxPct) {
    warnings.push(`Your deadline requires losing ${requiredPct.toFixed(1)}% of body weight per week, which exceeds the safe limit of ${maxPct}%. The plan has been adjusted to a safer timeline.`);
  }
  
  // Youth warnings
  if (isYouth) {
    warnings.push('Youth athlete safety protocols are in effect. No dehydration strategies, higher calorie floors, and limited weekly weight loss.');
  }
  
  // Sport-specific warnings
  if (sportRules.warnings) {
    warnings.push(...sportRules.warnings);
  }
  
  // Medical conditions
  if (formData.medicalConditions) {
    warnings.push('You indicated medical conditions. Please consult your physician before starting this plan.');
  }
  
  // Severe cut history
  if (formData.cutHistory === 'severe') {
    warnings.push('Based on your history of severe cuts, please work closely with a sports dietitian to avoid repeating past issues.');
  }
  
  // Weigh-in window warnings
  if (formData.weighInWindow === 'same_day' || formData.weighInWindow === '2h') {
    if (sportRules.dehydration_allowed_adult && !isYouth) {
      warnings.push('Short weigh-in window detected. Water cutting is strongly discouraged. Focus on gradual weight loss instead.');
    }
  }
  
  return warnings;
}

// ============================================================================
// MEAL PLAN GENERATION
// ============================================================================
async function renderMealPlan(plan) {
  const mealPlanDiv = document.getElementById('mealPlan');
  
  // For now, generate a simple template-based meal plan
  // In a full implementation, this would call Spoonacular API via proxy
  const mealPlan = generateTemplateMealPlan(plan);
  
  let html = '';
  mealPlan.forEach((day, index) => {
    html += `
      <div class="meal-day">
        <div class="day-header">Day ${index + 1}</div>
        <div class="meal-grid">
    `;
    
    day.meals.forEach(meal => {
      html += `
        <div class="meal-card">
          <div class="meal-type">${meal.type}</div>
          <div class="meal-name">${meal.name}</div>
          <div class="meal-macros">
            <span class="meal-macro">🔥 ${meal.calories} cal</span>
            <span class="meal-macro">💪 ${meal.protein}g protein</span>
            <span class="meal-macro">🍞 ${meal.carbs}g carbs</span>
            <span class="meal-macro">🥑 ${meal.fat}g fat</span>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  mealPlanDiv.innerHTML = html;
}

function generateTemplateMealPlan(plan) {
  const { targetCalories, macros, formData } = plan;
  const mealsPerDay = formData.mealsPerDay;
  
  // Distribute calories across meals
  const caloriesPerMeal = Math.round(targetCalories / mealsPerDay);
  const proteinPerMeal = Math.round(macros.protein / mealsPerDay);
  const carbsPerMeal = Math.round(macros.carbs / mealsPerDay);
  const fatPerMeal = Math.round(macros.fat / mealsPerDay);
  
  const mealTemplates = {
    breakfast: [
      { name: 'Oatmeal with Berries and Protein Powder', modifier: 1.0 },
      { name: 'Egg White Omelet with Vegetables', modifier: 1.0 },
      { name: 'Greek Yogurt Parfait with Granola', modifier: 1.0 },
      { name: 'Whole Grain Toast with Peanut Butter', modifier: 1.0 },
      { name: 'Protein Pancakes with Fruit', modifier: 1.0 }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad with Quinoa', modifier: 1.0 },
      { name: 'Turkey and Avocado Wrap', modifier: 1.0 },
      { name: 'Salmon with Brown Rice and Broccoli', modifier: 1.0 },
      { name: 'Lean Beef Stir-Fry with Vegetables', modifier: 1.0 },
      { name: 'Tuna Poke Bowl', modifier: 1.0 }
    ],
    dinner: [
      { name: 'Grilled Chicken Breast with Sweet Potato', modifier: 1.0 },
      { name: 'Baked Fish with Roasted Vegetables', modifier: 1.0 },
      { name: 'Turkey Meatballs with Pasta', modifier: 1.0 },
      { name: 'Lean Steak with Asparagus', modifier: 1.0 },
      { name: 'Shrimp and Vegetable Skewers', modifier: 1.0 }
    ],
    snack: [
      { name: 'Protein Shake', modifier: 0.5 },
      { name: 'Apple with Almond Butter', modifier: 0.5 },
      { name: 'Cottage Cheese with Berries', modifier: 0.5 },
      { name: 'Rice Cakes with Hummus', modifier: 0.5 },
      { name: 'Trail Mix (portion controlled)', modifier: 0.5 }
    ]
  };
  
  // Adjust for dietary preferences
  if (formData.dietaryStyle === 'vegan' || formData.dietaryStyle === 'vegetarian') {
    // Replace meat-based options with plant-based
    mealTemplates.lunch = [
      { name: 'Tofu and Vegetable Buddha Bowl', modifier: 1.0 },
      { name: 'Lentil Curry with Brown Rice', modifier: 1.0 },
      { name: 'Black Bean and Sweet Potato Burrito Bowl', modifier: 1.0 },
      { name: 'Chickpea Salad Sandwich', modifier: 1.0 },
      { name: 'Quinoa and Roasted Vegetable Bowl', modifier: 1.0 }
    ];
    mealTemplates.dinner = [
      { name: 'Tempeh Stir-Fry with Vegetables', modifier: 1.0 },
      { name: 'Lentil Pasta with Marinara', modifier: 1.0 },
      { name: 'Black Bean Burger with Sweet Potato Fries', modifier: 1.0 },
      { name: 'Tofu Scramble with Vegetables', modifier: 1.0 },
      { name: 'Veggie and Bean Chili', modifier: 1.0 }
    ];
  }
  
  // Generate 7-day plan
  const weekPlan = [];
  for (let day = 0; day < 7; day++) {
    const dayMeals = [];
    
    if (mealsPerDay === 3) {
      dayMeals.push(createMeal('Breakfast', mealTemplates.breakfast[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Lunch', mealTemplates.lunch[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Dinner', mealTemplates.dinner[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
    } else if (mealsPerDay === 4) {
      dayMeals.push(createMeal('Breakfast', mealTemplates.breakfast[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Lunch', mealTemplates.lunch[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Snack', mealTemplates.snack[day % 5], caloriesPerMeal * 0.5, proteinPerMeal * 0.5, carbsPerMeal * 0.5, fatPerMeal * 0.5));
      dayMeals.push(createMeal('Dinner', mealTemplates.dinner[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
    } else {
      dayMeals.push(createMeal('Breakfast', mealTemplates.breakfast[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Snack 1', mealTemplates.snack[day % 5], caloriesPerMeal * 0.5, proteinPerMeal * 0.5, carbsPerMeal * 0.5, fatPerMeal * 0.5));
      dayMeals.push(createMeal('Lunch', mealTemplates.lunch[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
      dayMeals.push(createMeal('Snack 2', mealTemplates.snack[(day + 2) % 5], caloriesPerMeal * 0.5, proteinPerMeal * 0.5, carbsPerMeal * 0.5, fatPerMeal * 0.5));
      dayMeals.push(createMeal('Dinner', mealTemplates.dinner[day % 5], caloriesPerMeal, proteinPerMeal, carbsPerMeal, fatPerMeal));
    }
    
    weekPlan.push({ meals: dayMeals });
  }
  
  return weekPlan;
}

function createMeal(type, template, calories, protein, carbs, fat) {
  return {
    type,
    name: template.name,
    calories: Math.round(calories * template.modifier),
    protein: Math.round(protein * template.modifier),
    carbs: Math.round(carbs * template.modifier),
    fat: Math.round(fat * template.modifier)
  };
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================
function renderPlanSummary(plan) {
  const html = `
    <div class="plan-summary-grid">
      <div class="summary-item">
        <div class="summary-label">Sport</div>
        <div class="summary-value">${plan.sportRules.label}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Weight to Lose</div>
        <div class="summary-value">${plan.weightToLose}<span class="summary-unit">lbs</span></div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Safe Weekly Loss</div>
        <div class="summary-value">${plan.actualWeeklyLoss}<span class="summary-unit">lbs/week</span></div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Timeline</div>
        <div class="summary-value">${plan.adjustedTimeline}<span class="summary-unit">weeks</span></div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Daily Calories</div>
        <div class="summary-value">${plan.targetCalories}<span class="summary-unit">kcal</span></div>
      </div>
      <div class="summary-item">
        <div class="summary-label">TDEE</div>
        <div class="summary-value">${plan.tdee}<span class="summary-unit">kcal</span></div>
      </div>
    </div>
  `;
  
  document.getElementById('planSummary').innerHTML = html;
}

function renderWarnings(plan) {
  const warningsCard = document.getElementById('warningsCard');
  const warningsList = document.getElementById('warningsList');
  
  if (plan.warnings.length === 0) {
    warningsCard.style.display = 'none';
    return;
  }
  
  warningsCard.style.display = 'block';
  
  let html = '<div class="warning-list">';
  plan.warnings.forEach(warning => {
    html += `<div class="warning-item">⚠️ ${warning}</div>`;
  });
  html += '</div>';
  
  warningsList.innerHTML = html;
}

function renderNutritionTargets(plan) {
  const html = `
    <div class="nutrition-grid">
      <div class="nutrition-item">
        <div class="nutrition-value">${plan.targetCalories}</div>
        <div class="nutrition-label">Calories</div>
      </div>
      <div class="nutrition-item">
        <div class="nutrition-value">${plan.macros.protein}g</div>
        <div class="nutrition-label">Protein (${plan.macros.proteinPct}%)</div>
      </div>
      <div class="nutrition-item">
        <div class="nutrition-value">${plan.macros.carbs}g</div>
        <div class="nutrition-label">Carbs (${plan.macros.carbsPct}%)</div>
      </div>
      <div class="nutrition-item">
        <div class="nutrition-value">${plan.macros.fat}g</div>
        <div class="nutrition-label">Fat (${plan.macros.fatPct}%)</div>
      </div>
    </div>
  `;
  
  document.getElementById('nutritionTargets').innerHTML = html;
}

function renderWorkoutGuidance(plan) {
  const { sportRules, formData, isYouth } = plan;
  
  let guidance = '';
  
  // Sport-specific guidance
  switch (sportRules.category) {
    case 'combat':
      guidance = `
        <div class="workout-week">
          <div class="workout-day">
            <div class="workout-day-name">Monday - Technical Training</div>
            <div class="workout-description">Focus on technique and skill work. Keep intensity moderate to preserve energy while in deficit.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Tuesday - Conditioning</div>
            <div class="workout-description">High-intensity intervals (3-5 rounds, 3-5 min each). Shorter sessions during cut phase.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Wednesday - Strength Maintenance</div>
            <div class="workout-description">Full-body strength session. Focus on maintaining key lifts with slightly reduced volume.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Thursday - Active Recovery</div>
            <div class="workout-description">Light drilling, mobility work, or low-intensity cardio.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Friday - Sparring/Live Training</div>
            <div class="workout-description">Controlled intensity. Listen to your body and scale back if feeling depleted.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Weekend - Rest or Light Activity</div>
            <div class="workout-description">Prioritize recovery. Optional light cardio or mobility work.</div>
          </div>
        </div>
        <p class="muted" style="margin-top: 16px;">Adjust volume and intensity based on how you feel. Recovery is crucial during a calorie deficit.</p>
      `;
      break;
      
    case 'strength':
      guidance = `
        <div class="workout-week">
          <div class="workout-day">
            <div class="workout-day-name">Monday - Main Lift Focus (Squat/Deadlift)</div>
            <div class="workout-description">Prioritize intensity over volume. Keep sets at competition weight or slightly below.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Tuesday - Accessory Work</div>
            <div class="workout-description">Target weak points with 15% reduced volume compared to maintenance phase.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Wednesday - Recovery</div>
            <div class="workout-description">Light movement, stretching, or complete rest.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Thursday - Main Lift Focus (Bench)</div>
            <div class="workout-description">Maintain technique and intensity. Reduce volume if needed.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Friday - Supplemental Work</div>
            <div class="workout-description">Address weak points and maintain muscle mass with accessory lifts.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Weekend - Rest</div>
            <div class="workout-description">Full recovery. Nutrition and sleep are priorities.</div>
          </div>
        </div>
        <p class="muted" style="margin-top: 16px;">Strength preservation is key. Don't chase PRs during a cut—focus on maintaining current strength.</p>
      `;
      break;
      
    case 'endurance':
      guidance = `
        <div class="workout-week">
          <div class="workout-day">
            <div class="workout-day-name">Monday - Key Workout #1</div>
            <div class="workout-description">Maintain your most important quality session. Fuel properly before and after.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Tuesday - Easy Recovery</div>
            <div class="workout-description">Low intensity, conversational pace. Focus on time over distance.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Wednesday - Moderate Effort</div>
            <div class="workout-description">Steady state at moderate intensity. Keep fueled throughout.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Thursday - Easy Recovery</div>
            <div class="workout-description">Very easy effort. Active recovery only.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Friday - Key Workout #2</div>
            <div class="workout-description">Second quality session. Prioritize carb intake around this session.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Saturday - Long Slow Distance</div>
            <div class="workout-description">Extended aerobic session at easy pace. Fuel during longer efforts.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Sunday - Rest or Very Easy</div>
            <div class="workout-description">Complete rest or short, very easy recovery session.</div>
          </div>
        </div>
        <p class="muted" style="margin-top: 16px;">Endurance athletes must maintain adequate carbohydrate intake. Fuel your key sessions properly—don't train in a depleted state.</p>
      `;
      break;
      
    case 'aesthetic':
      guidance = `
        <div class="workout-week">
          <div class="workout-day">
            <div class="workout-day-name">Monday - Upper Push</div>
            <div class="workout-description">Chest, shoulders, triceps. 3-4 exercises, 3-4 sets each.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Tuesday - Lower Body</div>
            <div class="workout-description">Quads, hamstrings, glutes. Keep intensity high, volume moderate.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Wednesday - Cardio + Core</div>
            <div class="workout-description">20-30 min moderate intensity cardio. Core work.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Thursday - Upper Pull + Arms</div>
            <div class="workout-description">Back, biceps. Maintain muscle-building focus despite deficit.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Friday - Lower Body</div>
            <div class="workout-description">Second leg day. Can reduce volume from Tuesday if needed.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Saturday - Optional Cardio</div>
            <div class="workout-description">20-30 min low-impact cardio or rest.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Sunday - Rest</div>
            <div class="workout-description">Complete recovery day.</div>
          </div>
        </div>
        <p class="muted" style="margin-top: 16px;">Maintain training intensity to preserve muscle. Reduce volume if recovery becomes an issue.</p>
      `;
      break;
      
    default:
      guidance = `
        <div class="workout-week">
          <div class="workout-day">
            <div class="workout-day-name">Monday - Resistance Training</div>
            <div class="workout-description">Full-body or upper body focus. 45-60 minutes.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Tuesday - Cardio</div>
            <div class="workout-description">30-40 minutes moderate intensity. Walking, cycling, or swimming.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Wednesday - Active Recovery</div>
            <div class="workout-description">Light activity, yoga, or rest.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Thursday - Resistance Training</div>
            <div class="workout-description">Full-body or lower body focus. 45-60 minutes.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Friday - Cardio</div>
            <div class="workout-description">30-40 minutes. Mix of steady state and intervals.</div>
          </div>
          <div class="workout-day">
            <div class="workout-day-name">Weekend - Rest or Light Activity</div>
            <div class="workout-description">Optional light activity or complete rest.</div>
          </div>
        </div>
        <p class="muted" style="margin-top: 16px;">Balance resistance training to preserve muscle with cardio for additional calorie burn.</p>
      `;
  }
  
  document.getElementById('workoutGuidance').innerHTML = guidance;
}

function renderReferenceLibrary(plan) {
  const relevantDocs = docsData.filter(doc => plan.docRefs.includes(doc.id));
  
  let html = '<div class="doc-list">';
  
  relevantDocs.forEach(doc => {
    html += `
      <div class="doc-item">
        <div class="doc-info">
          <div class="doc-title">${doc.title}</div>
          <div class="doc-summary">${doc.summary}</div>
          <div class="doc-tags">
            ${doc.sport_tags.slice(0, 3).map(tag => `<span class="doc-tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="doc-actions">
          <button class="doc-btn" onclick="alert('PDF viewing not implemented in this demo')">View</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  document.getElementById('referenceLibrary').innerHTML = html;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================
function exportPlanJson() {
  if (!currentPlan) return;
  
  const dataStr = JSON.stringify(currentPlan, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `weight-control-plan-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}
