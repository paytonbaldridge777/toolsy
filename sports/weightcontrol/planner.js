 Weight Control Planner JavaScript (Clean Rewrite)
// Preserves original functionality, fixes timeline confirm handling,
// and removes dietary restriction inputs (dietaryStyle/allergies/etc.)

// ============================================================================
// CONSTANTS
// ============================================================================
const CALORIES_PER_LB = 3500;
const LBS_TO_KG = 0.453592;
const INCHES_TO_CM = 2.54;
const CUNNINGHAM_BASE = 500;
const CUNNINGHAM_MULTIPLIER = 22;

// ============================================================================
// GLOBAL STATE
// ============================================================================
let rulesData = null;
let docsData = null;
let currentPlan = null;

// timeline choice state
let useAdjustedDeadline = false;  // user accepted adjusted date via OK
let ignoreSafetyCaps = false;     // user canceled warning + wants aggressive timeline

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  setupEventListeners();

  const todayStr = new Date().toISOString().split("T")[0];
  const deadlineInput = document.getElementById("deadlineDate");
  if (deadlineInput) deadlineInput.setAttribute("min", todayStr);
});

async function loadData() {
  try {
    const [rulesResponse, docsResponse] = await Promise.all([
      fetch("/sports/weightcontrol/data/rules.json"),
      fetch("/sports/weightcontrol/data/docs.json"),
    ]);

    if (!rulesResponse.ok || !docsResponse.ok) {
      throw new Error("Failed to load configuration files");
    }

    rulesData = await rulesResponse.json();
    docsData = await docsResponse.json();
  } catch (err) {
    console.error("Error loading data:", err);
    alert("Error loading configuration data. Please refresh the page.");
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  // Screen nav
  document.getElementById("startPlanBtn")?.addEventListener("click", showFormScreen);
  document.getElementById("backToLandingBtn")?.addEventListener("click", showLandingScreen);

  // Step nav
  document.getElementById("nextStep1Btn")?.addEventListener("click", () => navigateToStep(2));
  document.getElementById("nextStep2Btn")?.addEventListener("click", () => navigateToStep(3));
  document.getElementById("backStep2Btn")?.addEventListener("click", () => navigateToStep(1));
  document.getElementById("backStep3Btn")?.addEventListener("click", () => navigateToStep(2));

  // Generate plan
  document.getElementById("generatePlanBtn")?.addEventListener("click", generatePlan);

  // Medical details toggle
  const medicalSelect = document.getElementById("medicalConditions");
  medicalSelect?.addEventListener("change", (e) => {
    const detailsGroup = document.getElementById("medicalDetailsGroup");
    if (detailsGroup) {
      detailsGroup.style.display = e.target.value === "yes" ? "block" : "none";
    }
  });

  // Result actions
  document.getElementById("startOverBtn")?.addEventListener("click", showLandingScreen);
  document.getElementById("printPlanBtn")?.addEventListener("click", () => window.print());
  document.getElementById("exportJsonBtn")?.addEventListener("click", exportPlanJson);
}

// ============================================================================
// SCREEN NAVIGATION
// ============================================================================
function showLandingScreen() {
  document.getElementById("landingScreen").style.display = "block";
  document.getElementById("formScreen").style.display = "none";
  document.getElementById("resultsScreen").style.display = "none";
  window.scrollTo(0, 0);
}

function showFormScreen() {
  document.getElementById("landingScreen").style.display = "none";
  document.getElementById("formScreen").style.display = "block";
  document.getElementById("resultsScreen").style.display = "none";
  navigateToStep(1);
  window.scrollTo(0, 0);
}

function showResultsScreen() {
  document.getElementById("landingScreen").style.display = "none";
  document.getElementById("formScreen").style.display = "none";
  document.getElementById("resultsScreen").style.display = "block";
  window.scrollTo(0, 0);
}

function navigateToStep(stepNumber) {
  if (stepNumber > 1 && !validateStep(stepNumber - 1)) return;

  document.querySelectorAll(".form-step").forEach((s) => (s.style.display = "none"));
  document.getElementById(`step${stepNumber}`).style.display = "block";

  document.querySelectorAll(".progress-step").forEach((node, i) => {
    const num = i + 1;
    node.classList.toggle("completed", num < stepNumber);
    node.classList.toggle("active", num === stepNumber);
    if (num > stepNumber) node.classList.remove("completed", "active");
  });

  window.scrollTo(0, 0);
}

// ============================================================================
// VALIDATION + YOUTH TIMELINE CONFIRM
// ============================================================================
function validateStep(stepNumber) {
  const step = document.getElementById(`step${stepNumber}`);
  if (!step) return false;

  // Required field validation
  const requiredFields = step.querySelectorAll("[required]");
  for (const field of requiredFields) {
    if (!field.value) {
      field.focus();
      const label =
        field.closest(".form-group")?.querySelector("label")?.textContent || "this field";
      alert(`Please fill in ${label} before continuing.`);
      return false;
    }
  }

  // Step 1 special validation + youth safety prompt
  if (stepNumber === 1) {
    useAdjustedDeadline = false;
    ignoreSafetyCaps = false;

    const currentWeight = parseFloat(document.getElementById("currentWeight").value);
    const targetWeight = parseFloat(document.getElementById("targetWeight").value);

    const deadlineInput = document.getElementById("deadlineDate");
    const deadlineDate = new Date(deadlineInput.value);

    const today = new Date();
    const age = parseInt(document.getElementById("age").value, 10);
    const sport = document.getElementById("sport").value;

    if (Number.isNaN(currentWeight) || Number.isNaN(targetWeight)) {
      alert("Please enter valid weight values.");
      return false;
    }

    if (targetWeight >= currentWeight) {
      alert("Target weight must be less than current weight for a weight-loss plan.");
      return false;
    }

    if (!(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime()) || deadlineDate <= today) {
      alert("Target date must be in the future.");
      return false;
    }

    // Youth timeline safety check
    const hasRules =
      age < 18 &&
      rulesData &&
      sport &&
      rulesData.sports?.[sport] &&
      rulesData.youth_overrides;

    if (hasRules) {
      const weightToLose = currentWeight - targetWeight;
      const daysAvailable = Math.max(
        1,
        Math.round((deadlineDate - today) / (24 * 60 * 60 * 1000))
      );

      const requiredDailyLoss = weightToLose / daysAvailable;
      const requiredDailyPct = (requiredDailyLoss / currentWeight) * 100;

      const youthWeeklyPct = rulesData.youth_overrides.max_weekly_loss_pct;
      const youthSafeDailyPct = youthWeeklyPct / 7;

      const safeDaysNeeded = weightToLose / (youthSafeDailyPct / 100 * currentWeight);
      const newDeadline = new Date(today.getTime() + safeDaysNeeded * 24 * 60 * 60 * 1000);

      if (requiredDailyPct > youthSafeDailyPct) {
        const ok = confirm(
          `Warning: Your entered timeline requires a weight cut exceeding safe daily limits (${requiredDailyPct.toFixed(
            2
          )}% per day, safe limit: ${youthSafeDailyPct.toFixed(
            2
          )}%).\n\nIt is recommended to adjust the timeline to ${newDeadline.toDateString()}.\n\nPress OK to accept the adjusted timeline (recommended), or CANCEL to proceed with your current timeline after acknowledging risks.`
        );

        if (ok) {
          deadlineInput.value = newDeadline.toISOString().split("T")[0];
          useAdjustedDeadline = true;
          ignoreSafetyCaps = false;
        } else {
          alert("Acknowledged risks. Proceeding with your original timeline.");
          useAdjustedDeadline = false;
          ignoreSafetyCaps = true;
        }
      }
    }
  }

  return true;
}

// ============================================================================
// PLAN GENERATION
// ============================================================================
async function generatePlan() {
  if (!validateStep(3)) return;

  const formData = collectFormData();

  // ensure deadline/flags reflect latest state
  formData.deadlineDate = document.getElementById("deadlineDate").value;
  formData.ignoreSafetyCaps = ignoreSafetyCaps;
  formData.useAdjustedDeadline = useAdjustedDeadline;

  showResultsScreen();
  document.getElementById("planSummary").innerHTML =
    '<div class="loading"><div class="loading-spinner"></div><p>Generating your personalized plan...</p></div>';

  try {
    const plan = await calculatePlan(formData);
    currentPlan = plan;

    renderPlanSummary(plan);
    renderWarnings(plan);
    renderNutritionTargets(plan);
    await renderMealPlan(plan);
    renderWorkoutGuidance(plan);
    renderReferenceLibrary(plan);
  } catch (err) {
    console.error("Error generating plan:", err);
    document.getElementById("planSummary").innerHTML =
      '<p class="error">Error generating plan. Please try again.</p>';
  }
}

// ============================================================================
// FORM DATA
// ============================================================================
function collectFormData() {
  return {
    // Step 1
    sport: document.getElementById("sport").value,
    age: parseInt(document.getElementById("age").value, 10),
    sex: document.getElementById("sex").value,
    height: parseFloat(document.getElementById("height").value),
    currentWeight: parseFloat(document.getElementById("currentWeight").value),
    targetWeight: parseFloat(document.getElementById("targetWeight").value),
    deadlineDate: document.getElementById("deadlineDate").value,
    bodyFatPct: document.getElementById("bodyFatPct").value
      ? parseFloat(document.getElementById("bodyFatPct").value)
      : null,
    youthSafetyOverride: document.getElementById("youthSafetyOverride").checked,

    // Step 2
    trainingDays: parseInt(document.getElementById("trainingDays").value, 10),
    trainingIntensity: document.getElementById("trainingIntensity").value,
    weighInWindow: document.getElementById("weighInWindow").value,

    // Step 3
    medicalConditions: document.getElementById("medicalConditions").value === "yes",
    medicalDetails: document.getElementById("medicalDetails").value,
    injuries: document.getElementById("injuries").value,
    cutHistory: document.getElementById("cutHistory").value,

    mealsPerDay: parseInt(document.getElementById("mealsPerDay").value, 10),

    // injected later
    ignoreSafetyCaps: false,
    useAdjustedDeadline: false,
  };
}

// ============================================================================
// CORE CALCULATIONS
// ============================================================================
async function calculatePlan(formData) {
  const sportRules = rulesData.sports[formData.sport];
  const generalRules = rulesData.general;
  const youthRules = rulesData.youth_overrides;

  const isYouth = formData.age < youthRules.applies_if_age_under;
  const applyYouthRules = isYouth && !formData.youthSafetyOverride;

  // 1) TDEE
  let tdee;
  if (formData.bodyFatPct && generalRules.tdee_formula_alt_if_bf_known === "cunningham") {
    tdee = calculateCunninghamTDEE(formData);
  } else {
    tdee = calculateMifflinStJeorTDEE(formData);
  }

  const activityMultiplier = getActivityMultiplier(
    formData.trainingDays,
    formData.trainingIntensity
  );
  tdee *= activityMultiplier;

  // 2) User-required weekly loss
  const weightToLose = formData.currentWeight - formData.targetWeight;
  const deadline = new Date(formData.deadlineDate);
  const today = new Date();
  const weeksAvailable = Math.max(1, (deadline - today) / (7 * 24 * 60 * 60 * 1000));

  const requiredWeeklyLoss = weightToLose / weeksAvailable;
  const requiredWeeklyLossPct = (requiredWeeklyLoss / formData.currentWeight) * 100;

  // 3) Safe cap %
  let maxWeeklyLossPct = sportRules.max_weekly_loss_pct;
  if (applyYouthRules) {
    maxWeeklyLossPct = Math.min(maxWeeklyLossPct, youthRules.max_weekly_loss_pct);
  }

  // 4) Safe cap -> lbs/week
  const safeWeeklyLoss = (maxWeeklyLossPct / 100) * formData.currentWeight;

  // 5) Actual weekly loss depends on Cancel/OK
  const actualWeeklyLoss = formData.ignoreSafetyCaps
    ? requiredWeeklyLoss
    : Math.min(requiredWeeklyLoss, safeWeeklyLoss);

  const adjustedTimeline = weightToLose / actualWeeklyLoss;

  // 6) Calories
  const weeklyDeficit = actualWeeklyLoss * CALORIES_PER_LB;
  const dailyDeficit = weeklyDeficit / 7;

  let targetCalories = tdee - dailyDeficit;

  const minCalories =
    formData.sex === "male" ? generalRules.min_calories_male : generalRules.min_calories_female;

  if (applyYouthRules) {
    const youthMinCalories = tdee * youthRules.min_calories_multiplier_of_tdee;
    targetCalories = Math.max(targetCalories, youthMinCalories, minCalories);
  } else {
    targetCalories = Math.max(targetCalories, minCalories);
  }

  // 7) Macros + warnings + docs
  const macros = calculateMacros(formData, sportRules, targetCalories);

  const warnings = generateWarnings(
    formData,
    sportRules,
    youthRules,
    isYouth,
    applyYouthRules,
    requiredWeeklyLossPct,
    maxWeeklyLossPct
  );

  const docRefs = [
    ...new Set([
      ...generalRules.doc_refs,
      ...sportRules.doc_refs,
      ...(isYouth ? youthRules.doc_refs : []),
    ]),
  ];

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
    docRefs,
  };
}

// ============================================================================
// TDEE HELPERS
// ============================================================================
function calculateMifflinStJeorTDEE(formData) {
  const weightKg = formData.currentWeight * LBS_TO_KG;
  const heightCm = formData.height * INCHES_TO_CM;

  if (formData.sex === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * formData.age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * formData.age - 161;
}

function calculateCunninghamTDEE(formData) {
  const weightKg = formData.currentWeight * LBS_TO_KG;
  const lbmKg = weightKg * (1 - formData.bodyFatPct / 100);
  return CUNNINGHAM_BASE + CUNNINGHAM_MULTIPLIER * lbmKg;
}

function getActivityMultiplier(trainingDays, intensity) {
  if (trainingDays === 0) return 1.2;

  const base = { light: 1.375, moderate: 1.55, high: 1.725 };
  let mult = base[intensity] || 1.55;

  if (trainingDays <= 2) mult -= 0.1;
  if (trainingDays >= 6) mult += 0.1;

  return Math.max(1.2, Math.min(2.0, mult));
}

// ============================================================================
// MACROS + WARNINGS
// ============================================================================
function calculateMacros(formData, sportRules, targetCalories) {
  const proteinGPerLb = sportRules.protein_g_lb;
  const proteinG = Math.round(formData.currentWeight * proteinGPerLb);
  const proteinCal = proteinG * 4;

  const fatFloorPct = sportRules.fat_floor_pct_calories;
  const fatMinCal = targetCalories * (fatFloorPct / 100);
  const fatG = Math.round(fatMinCal / 9);
  const fatCal = fatG * 9;

  const carbCal = targetCalories - proteinCal - fatCal;
  const carbG = Math.round(Math.max(0, carbCal / 4));

  return {
    protein: proteinG,
    carbs: carbG,
    fat: fatG,
    proteinPct: Math.round((proteinCal / targetCalories) * 100),
    carbsPct: Math.round((carbCal / targetCalories) * 100),
    fatPct: Math.round((fatCal / targetCalories) * 100),
  };
}

function generateWarnings(
  formData,
  sportRules,
  youthRules,
  isYouth,
  applyYouthRules,
  requiredPct,
  maxPct
) {
  const warnings = [];

  if (requiredPct > maxPct) {
    warnings.push(
      `Your deadline requires losing ${requiredPct.toFixed(
        1
      )}% of body weight per week, which exceeds the safe limit of ${maxPct}%. ` +
        `The plan has been adjusted to a safer timeline.`
    );
  }

  if (isYouth && applyYouthRules) {
    warnings.push(
      "Youth athlete safety protocols are in effect. No dehydration strategies, higher calorie floors, and limited weekly weight loss."
    );
  } else if (isYouth && !applyYouthRules) {
    warnings.push(
      "⚠️ YOUTH SAFETY OVERRIDE ACTIVE: You have chosen to override youth safety restrictions. Please consult with your physician, parents/guardians, and coach before proceeding. Aggressive weight cutting can negatively impact growth, development, and long-term health."
    );
  }

  if (sportRules.warnings) warnings.push(...sportRules.warnings);

  if (formData.medicalConditions) {
    warnings.push("You indicated medical conditions. Please consult your physician before starting this plan.");
  }

  if (formData.cutHistory === "severe") {
    warnings.push(
      "Based on your history of severe cuts, please work closely with a sports dietitian to avoid repeating past issues."
    );
  }

  if (formData.weighInWindow === "same_day" || formData.weighInWindow === "2h") {
    if (sportRules.dehydration_allowed_adult && !isYouth) {
      warnings.push(
        "Short weigh-in window detected. Water cutting is strongly discouraged. Focus on gradual weight loss instead."
      );
    }
  }

  return warnings;
}

// ============================================================================
// MEAL PLAN (NO DIETARY PARAMS)
// ============================================================================
async function fetchMealOptions(mealType, targetCalories) {
  const calorieRange = Math.round(targetCalories * 0.15);

  const params = new URLSearchParams({
    type: mealType,
    minCalories: Math.round(targetCalories - calorieRange),
    maxCalories: Math.round(targetCalories + calorieRange),
    number: 10,
    addRecipeInformation: true,
    fillIngredients: true,
    addRecipeNutrition: true,
  });

  const url = `https://kitmodo.pages.dev/api/spoonacular/recipes/complexSearch?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Proxy error: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Error fetching meal options:", err);
    return [];
  }
}

async function generateApiMealPlan(plan) {
  const { targetCalories, macros, formData } = plan;
  const mealsPerDay = formData.mealsPerDay;

  const caloriesPerMeal = Math.round(targetCalories / mealsPerDay);

  let mealTypes = [];
  if (mealsPerDay === 3) mealTypes = ["breakfast", "lunch", "dinner"];
  else if (mealsPerDay === 4) mealTypes = ["breakfast", "lunch", "snack", "dinner"];
  else mealTypes = ["breakfast", "snack", "lunch", "snack", "dinner"];

  const weekPlan = [];

  for (let day = 0; day < 7; day++) {
    const dayMeals = [];

    for (let mealIdx = 0; mealIdx < mealTypes.length; mealIdx++) {
      const mealType = mealTypes[mealIdx];
      const mealCals = mealType === "snack" ? caloriesPerMeal * 0.5 : caloriesPerMeal;

      const options = await fetchMealOptions(mealType, mealCals);

      const mealOptions = options.slice(0, 5).map((recipe) => {
        const nutrients = recipe.nutrition?.nutrients || [];
        const calories = nutrients.find((n) => n.name === "Calories")?.amount || mealCals;
        const protein = nutrients.find((n) => n.name === "Protein")?.amount || 0;
        const carbs = nutrients.find((n) => n.name === "Carbohydrates")?.amount || 0;
        const fat = nutrients.find((n) => n.name === "Fat")?.amount || 0;

        return {
          name: recipe.title,
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
          sourceUrl: recipe.sourceUrl || recipe.spoonacularSourceUrl || null,
        };
      });

      while (mealOptions.length < 5) {
        mealOptions.push({
          name: `${mealType[0].toUpperCase() + mealType.slice(1)} Option ${mealOptions.length + 1}`,
          calories: Math.round(mealCals),
          protein: Math.round((macros.protein / mealsPerDay) * (mealType === "snack" ? 0.5 : 1)),
          carbs: Math.round((macros.carbs / mealsPerDay) * (mealType === "snack" ? 0.5 : 1)),
          fat: Math.round((macros.fat / mealsPerDay) * (mealType === "snack" ? 0.5 : 1)),
          sourceUrl: null,
        });
      }

      dayMeals.push({
        type: mealType[0].toUpperCase() + mealType.slice(1),
        options: mealOptions,
        selectedIndex: 0,
      });
    }

    weekPlan.push({ meals: dayMeals });
  }

  if (currentPlan) currentPlan.mealPlanData = weekPlan;
  return weekPlan;
}

async function renderMealPlan(plan) {
  const mealPlanDiv = document.getElementById("mealPlan");
  if (!mealPlanDiv) return;

  try {
    mealPlanDiv.innerHTML =
      '<div class="loading"><div class="loading-spinner"></div><p>Fetching personalized meal options from nutrition database...</p></div>';

    const mealPlan = await generateApiMealPlan(plan);

    let html = "";
    mealPlan.forEach((day, dayIndex) => {
      html += `
        <div class="meal-day">
          <div class="day-header">Day ${dayIndex + 1}</div>
          <div class="meal-grid">
      `;

      day.meals.forEach((meal, mealIndex) => {
        const uniqueId = `day${dayIndex}_meal${mealIndex}`;
        html += `
          <div class="meal-card">
            <div class="meal-type">${meal.type}</div>
            <div class="meal-selector">
              <label for="${uniqueId}">Select Meal:</label>
              <select id="${uniqueId}" class="meal-dropdown" data-day="${dayIndex}" data-meal="${mealIndex}">
                ${meal.options
                  .map(
                    (option, optIndex) => `
                  <option value="${optIndex}" ${optIndex === meal.selectedIndex ? "selected" : ""}>
                    ${option.name}
                  </option>`
                  )
                  .join("")}
              </select>
            </div>
            <div id="${uniqueId}_details" class="meal-details">
              ${renderMealDetails(meal.options[meal.selectedIndex])}
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

    document.querySelectorAll(".meal-dropdown").forEach((dropdown) => {
      dropdown.addEventListener("change", (e) => {
        const day = parseInt(e.target.dataset.day, 10);
        const mealIdx = parseInt(e.target.dataset.meal, 10);
        const optionIdx = parseInt(e.target.value, 10);
        const detailsDiv = document.getElementById(`${e.target.id}_details`);

        if (
          currentPlan?.mealPlanData?.[day]?.meals?.[mealIdx]?.options?.[optionIdx] &&
          detailsDiv
        ) {
          const selectedMeal = currentPlan.mealPlanData[day].meals[mealIdx].options[optionIdx];
          detailsDiv.innerHTML = renderMealDetails(selectedMeal);
          currentPlan.mealPlanData[day].meals[mealIdx].selectedIndex = optionIdx;
        }
      });
    });
  } catch (err) {
    console.error("Failed to fetch meal plan from API:", err);
    mealPlanDiv.innerHTML = `
      <div class="error-card">
        <h3>⚠️ Unable to Generate Meal Plan</h3>
        <p><strong>The nutrition API service is currently unavailable.</strong></p>
        <p>Please try again later or contact support if the problem persists.</p>
      </div>
    `;
  }
}

function renderMealDetails(meal) {
  return `
    <div class="meal-name">${meal.name}</div>
    <div class="meal-macros">
      <span class="meal-macro">🔥 ${meal.calories} cal</span>
      <span class="meal-macro">💪 ${meal.protein}g protein</span>
      <span class="meal-macro">🍞 ${meal.carbs}g carbs</span>
      <span class="meal-macro">🥑 ${meal.fat}g fat</span>
    </div>
    ${
      meal.sourceUrl
        ? `<div class="meal-link"><a href="${meal.sourceUrl}" target="_blank" rel="noopener">View Recipe →</a></div>`
        : ""
    }
  `;
}

// ============================================================================
// RENDERING (your existing functions assumed present elsewhere)
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
  document.getElementById("planSummary").innerHTML = html;
}

function renderWarnings(plan) {
  const warningsCard = document.getElementById("warningsCard");
  const warningsList = document.getElementById("warningsList");
  if (plan.warnings.length === 0) {
    warningsCard.style.display = "none";
    return;
  }
  warningsCard.style.display = "block";
  warningsList.innerHTML =
    '<div class="warning-list">' +
    plan.warnings.map((w) => `<div class="warning-item">⚠️ ${w}</div>`).join("") +
    "</div>";
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
  document.getElementById("nutritionTargets").innerHTML = html;
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
