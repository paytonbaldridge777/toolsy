// GPA Calculator - Main Application Logic
(function() {
  'use strict';

  // ============================================================================
  // SCHOOL CONFIGURATIONS
  // ============================================================================
  
  const schoolsConfig = {
    'custom': {
      name: 'Custom/Other',
      description: 'Define your own grade-to-GPA mappings',
      type: 'custom',
      scale: {}
    },
    'standard-4.0': {
      name: 'Standard 4.0 Scale (Unweighted)',
      description: 'Traditional A=4.0, B=3.0, C=2.0, D=1.0, F=0.0',
      type: 'letter',
      scale: {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
      },
      levels: {
        'Regular': 0,
        'Honors': 0,
        'AP': 0,
        'IB': 0
      }
    },
    'standard-weighted': {
      name: 'Standard Weighted Scale',
      description: 'Regular courses: A=4.0, Honors: +0.5, AP/IB: +1.0',
      type: 'letter',
      scale: {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
      },
      levels: {
        'Regular': 0,
        'Honors': 0.5,
        'AP': 1.0,
        'IB': 1.0
      }
    },
    'percentage-90': {
      name: 'Percentage Scale (90/80/70/60)',
      description: 'A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: 0-59',
      type: 'percentage',
      scale: {
        'A': { min: 90, max: 100, gpa: 4.0 },
        'B': { min: 80, max: 89, gpa: 3.0 },
        'C': { min: 70, max: 79, gpa: 2.0 },
        'D': { min: 60, max: 69, gpa: 1.0 },
        'F': { min: 0, max: 59, gpa: 0.0 }
      },
      levels: {
        'Regular': 0,
        'Honors': 0.5,
        'AP': 1.0,
        'IB': 1.0
      }
    },
    'percentage-93': {
      name: 'Percentage Scale (93/85/77/70)',
      description: 'A: 93-100, B: 85-92, C: 77-84, D: 70-76, F: 0-69',
      type: 'percentage',
      scale: {
        'A': { min: 93, max: 100, gpa: 4.0 },
        'B': { min: 85, max: 92, gpa: 3.0 },
        'C': { min: 77, max: 84, gpa: 2.0 },
        'D': { min: 70, max: 76, gpa: 1.0 },
        'F': { min: 0, max: 69, gpa: 0.0 }
      },
      levels: {
        'Regular': 0,
        'Honors': 0.5,
        'AP': 1.0,
        'IB': 1.0
      }
    },
    'ib-7-point': {
      name: 'IB 7-Point Scale',
      description: 'IB scale: 7=4.0, 6=3.5, 5=3.0, 4=2.5, 3=2.0, 2=1.5, 1=1.0',
      type: 'numeric',
      scale: {
        '7': 4.0,
        '6': 3.5,
        '5': 3.0,
        '4': 2.5,
        '3': 2.0,
        '2': 1.5,
        '1': 1.0
      },
      levels: {
        'Standard': 0,
        'Higher Level': 0.5
      }
    }
  };

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  let state = {
    selectedSchool: 'standard-4.0',
    calcType: 'high-school',
    courses: [],
    customScale: {},
    currentView: 'weighted',
    cumulativeData: {
      currentGPA: 0,
      completedCredits: 0
    }
  };

  // ============================================================================
  // DOM ELEMENTS
  // ============================================================================
  
  const elements = {
    schoolSelect: document.getElementById('schoolSelect'),
    calcType: document.getElementById('calcType'),
    customScaleContainer: document.getElementById('customScaleContainer'),
    customScaleInputs: document.getElementById('customScaleInputs'),
    addCustomGrade: document.getElementById('addCustomGrade'),
    scaleDescription: document.getElementById('scaleDescription'),
    coursesBody: document.getElementById('coursesBody'),
    addCourse: document.getElementById('addCourse'),
    clearCourses: document.getElementById('clearCourses'),
    levelHeader: document.getElementById('levelHeader'),
    creditsHeader: document.getElementById('creditsHeader'),
    toggleWeighted: document.getElementById('toggleWeighted'),
    toggleUnweighted: document.getElementById('toggleUnweighted'),
    termGPA: document.getElementById('termGPA'),
    termGPAPercent: document.getElementById('termGPAPercent'),
    totalCredits: document.getElementById('totalCredits'),
    cumulativeGPA: document.getElementById('cumulativeGPA'),
    cumulativeGPAPercent: document.getElementById('cumulativeGPAPercent'),
    explanationText: document.getElementById('explanationText'),
    currentGPA: document.getElementById('currentGPA'),
    completedCredits: document.getElementById('completedCredits'),
    futureCredits: document.getElementById('futureCredits'),
    targetGPA: document.getElementById('targetGPA'),
    calculateWhatIf: document.getElementById('calculateWhatIf'),
    whatIfResults: document.getElementById('whatIfResults'),
    whatIfNotice: document.getElementById('whatIfNotice'),
    whatIfExamples: document.getElementById('whatIfExamples')
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  function init() {
    // Set up event listeners
    elements.schoolSelect.addEventListener('change', handleSchoolChange);
    elements.calcType.addEventListener('change', handleCalcTypeChange);
    elements.addCustomGrade.addEventListener('click', addCustomGradeRow);
    elements.addCourse.addEventListener('click', addCourseRow);
    elements.clearCourses.addEventListener('click', clearAllCourses);
    elements.toggleWeighted.addEventListener('click', () => setView('weighted'));
    elements.toggleUnweighted.addEventListener('click', () => setView('unweighted'));
    elements.calculateWhatIf.addEventListener('click', calculateWhatIf);

    // Initialize with default school - set dropdown to match state
    elements.schoolSelect.value = state.selectedSchool;
    updateScaleInfo();
    addCourseRow();
    addCourseRow();
    addCourseRow();
    calculateGPA();
  }

  // ============================================================================
  // SCHOOL/SCALE MANAGEMENT
  // ============================================================================
  
  function handleSchoolChange() {
    state.selectedSchool = elements.schoolSelect.value;
    updateScaleInfo();
    updateCourseLevels();
    calculateGPA();
  }

  function handleCalcTypeChange() {
    state.calcType = elements.calcType.value;
    elements.creditsHeader.textContent = state.calcType === 'college' ? 'Credit Hours' : 'Credits';
    calculateGPA();
  }

  function updateScaleInfo() {
    const config = schoolsConfig[state.selectedSchool];
    
    if (state.selectedSchool === 'custom') {
      elements.customScaleContainer.style.display = 'block';
      elements.scaleDescription.innerHTML = '<em>Configure your custom scale below</em>';
      if (Object.keys(state.customScale).length === 0) {
        initializeCustomScale();
      }
    } else {
      elements.customScaleContainer.style.display = 'none';
      elements.scaleDescription.textContent = config.description;
    }
  }

  function initializeCustomScale() {
    state.customScale = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };
    renderCustomScaleInputs();
  }

  function addCustomGradeRow() {
    const gradeName = prompt('Enter grade name (e.g., A+, B-, 90-100):');
    if (gradeName && gradeName.trim()) {
      state.customScale[gradeName.trim()] = 0.0;
      renderCustomScaleInputs();
    }
  }

  function renderCustomScaleInputs() {
    elements.customScaleInputs.innerHTML = '';
    
    Object.keys(state.customScale).forEach(grade => {
      const row = document.createElement('div');
      row.className = 'custom-scale-row';
      
      row.innerHTML = `
        <div class="form-group">
          <label>Grade Name</label>
          <input type="text" class="form-control" value="${grade}" data-grade="${grade}" data-field="name" />
        </div>
        <div class="form-group">
          <label>GPA Value</label>
          <input type="number" class="form-control" step="0.01" min="0" max="5" value="${state.customScale[grade]}" data-grade="${grade}" data-field="value" />
        </div>
        <div class="form-group">
          <label>Weight Bonus</label>
          <input type="number" class="form-control" step="0.1" min="0" max="2" value="0" placeholder="Optional" data-grade="${grade}" data-field="weight" />
        </div>
        <button type="button" class="btn-danger" onclick="window.gpaApp.removeCustomGrade('${grade}')">Remove</button>
      `;
      
      elements.customScaleInputs.appendChild(row);
    });

    // Add event listeners for custom scale inputs
    elements.customScaleInputs.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', handleCustomScaleInput);
    });
  }

  function handleCustomScaleInput(e) {
    const grade = e.target.dataset.grade;
    const field = e.target.dataset.field;
    
    if (field === 'name') {
      const newName = e.target.value.trim();
      if (newName && newName !== grade) {
        state.customScale[newName] = state.customScale[grade];
        delete state.customScale[grade];
        renderCustomScaleInputs();
      }
    } else if (field === 'value') {
      state.customScale[grade] = parseFloat(e.target.value) || 0;
    }
    
    calculateGPA();
  }

  function removeCustomGrade(grade) {
    delete state.customScale[grade];
    renderCustomScaleInputs();
    calculateGPA();
  }

  // ============================================================================
  // COURSE MANAGEMENT
  // ============================================================================
  
  function addCourseRow() {
    const courseId = Date.now() + Math.random();
    const course = {
      id: courseId,
      name: '',
      grade: '',
      level: 'Regular',
      credits: state.calcType === 'college' ? 3 : 1
    };
    
    state.courses.push(course);
    renderCourseRow(course);
    calculateGPA();
  }

  function renderCourseRow(course) {
    const row = document.createElement('tr');
    row.dataset.courseId = course.id;
    
    const config = schoolsConfig[state.selectedSchool];
    const levels = state.selectedSchool === 'custom' 
      ? ['Regular', 'Honors', 'AP', 'IB'] 
      : Object.keys(config.levels || {});
    
    row.innerHTML = `
      <td>
        <input type="text" class="form-control" placeholder="Course name" value="${course.name}" data-field="name" />
      </td>
      <td>
        <input type="text" class="form-control" placeholder="${getGradePlaceholder()}" value="${course.grade}" data-field="grade" />
      </td>
      <td>
        <select class="form-control" data-field="level">
          ${levels.map(level => `<option value="${level}" ${course.level === level ? 'selected' : ''}>${level}</option>`).join('')}
        </select>
      </td>
      <td>
        <input type="number" class="form-control" step="0.5" min="0" max="10" value="${course.credits}" data-field="credits" />
      </td>
      <td>
        <button type="button" class="btn-danger" data-action="remove">Remove</button>
      </td>
    `;
    
    // Add event listeners
    row.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', (e) => updateCourse(course.id, e));
    });
    
    row.querySelector('[data-action="remove"]').addEventListener('click', () => removeCourse(course.id));
    
    elements.coursesBody.appendChild(row);
  }

  function getGradePlaceholder() {
    const config = schoolsConfig[state.selectedSchool];
    if (!config) return 'e.g., A, B+';
    
    if (state.selectedSchool === 'custom') return 'Enter grade';
    if (config.type === 'percentage') return 'e.g., 95';
    if (config.type === 'numeric') return 'e.g., 7';
    return 'e.g., A, B+';
  }

  function updateCourse(courseId, event) {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;
    
    const field = event.target.dataset.field;
    const value = event.target.value;
    
    if (field === 'credits') {
      course[field] = parseFloat(value) || 0;
    } else {
      course[field] = value;
    }
    
    calculateGPA();
  }

  function removeCourse(courseId) {
    state.courses = state.courses.filter(c => c.id !== courseId);
    const row = document.querySelector(`tr[data-course-id="${courseId}"]`);
    if (row) row.remove();
    calculateGPA();
  }

  function clearAllCourses() {
    if (confirm('Are you sure you want to clear all courses?')) {
      state.courses = [];
      elements.coursesBody.innerHTML = '';
      addCourseRow();
      addCourseRow();
      addCourseRow();
      calculateGPA();
    }
  }

  function updateCourseLevels() {
    const config = schoolsConfig[state.selectedSchool];
    const levels = state.selectedSchool === 'custom' 
      ? ['Regular', 'Honors', 'AP', 'IB'] 
      : Object.keys(config.levels || {});
    
    document.querySelectorAll('select[data-field="level"]').forEach(select => {
      const currentValue = select.value;
      select.innerHTML = levels.map(level => 
        `<option value="${level}" ${currentValue === level ? 'selected' : ''}>${level}</option>`
      ).join('');
    });
  }

  // ============================================================================
  // GPA CALCULATIONS
  // ============================================================================
  
  function calculateGPA() {
    const validCourses = state.courses.filter(c => c.grade && c.grade.trim());
    
    if (validCourses.length === 0) {
      resetResults();
      return;
    }

    const weighted = calculateGPAByType(validCourses, true);
    const unweighted = calculateGPAByType(validCourses, false);
    
    displayResults(weighted, unweighted);
  }

  function calculateGPAByType(courses, includeWeights) {
    const config = schoolsConfig[state.selectedSchool];
    let totalPoints = 0;
    let totalCredits = 0;
    let validCoursesCount = 0;

    courses.forEach(course => {
      const gradeValue = getGradeValue(course.grade, course.level, includeWeights);
      
      if (gradeValue !== null) {
        const credits = parseFloat(course.credits) || 1;
        
        if (state.calcType === 'college') {
          // College: weight by credit hours
          totalPoints += gradeValue * credits;
          totalCredits += credits;
        } else {
          // High school: equal weight per course
          totalPoints += gradeValue;
          validCoursesCount++;
        }
      }
    });

    if (state.calcType === 'college') {
      return {
        gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
        totalCredits: totalCredits,
        coursesCount: courses.length
      };
    } else {
      return {
        gpa: validCoursesCount > 0 ? totalPoints / validCoursesCount : 0,
        totalCredits: validCoursesCount,
        coursesCount: validCoursesCount
      };
    }
  }

  function getGradeValue(grade, level, includeWeights) {
    const config = schoolsConfig[state.selectedSchool];
    
    if (state.selectedSchool === 'custom') {
      return state.customScale[grade] !== undefined ? state.customScale[grade] : null;
    }

    let baseValue = null;

    if (config.type === 'letter') {
      const scaleValue = config.scale[grade.toUpperCase()];
      baseValue = scaleValue !== undefined ? scaleValue : null;
    } else if (config.type === 'percentage') {
      const numGrade = parseFloat(grade);
      if (isNaN(numGrade)) return null;
      
      for (const [letter, range] of Object.entries(config.scale)) {
        if (numGrade >= range.min && numGrade <= range.max) {
          baseValue = range.gpa;
          break;
        }
      }
    } else if (config.type === 'numeric') {
      const scaleValue = config.scale[grade];
      baseValue = scaleValue !== undefined ? scaleValue : null;
    }

    if (baseValue === null) return null;

    // Apply level weight if weighted calculation
    if (includeWeights && config.levels && config.levels[level] !== undefined) {
      return baseValue + config.levels[level];
    }

    return baseValue;
  }

  function displayResults(weighted, unweighted) {
    const current = state.currentView === 'weighted' ? weighted : unweighted;
    
    elements.termGPA.textContent = current.gpa.toFixed(2);
    elements.termGPAPercent.textContent = `(${gpaToPercentage(current.gpa).toFixed(1)}%)`;
    elements.totalCredits.textContent = current.totalCredits.toFixed(1);

    // Calculate cumulative GPA if previous data exists
    const prevGPA = parseFloat(elements.currentGPA.value) || 0;
    const prevCredits = parseFloat(elements.completedCredits.value) || 0;
    
    let cumulativeGPA = current.gpa;
    if (prevGPA > 0 && prevCredits > 0) {
      const totalPoints = (prevGPA * prevCredits) + (current.gpa * current.totalCredits);
      const totalCredits = prevCredits + current.totalCredits;
      cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
    }
    
    elements.cumulativeGPA.textContent = cumulativeGPA.toFixed(2);
    elements.cumulativeGPAPercent.textContent = `(${gpaToPercentage(cumulativeGPA).toFixed(1)}%)`;

    updateExplanation(current);
  }

  function resetResults() {
    elements.termGPA.textContent = '—';
    elements.termGPAPercent.textContent = '';
    elements.totalCredits.textContent = '—';
    elements.cumulativeGPA.textContent = '—';
    elements.cumulativeGPAPercent.textContent = '';
    elements.explanationText.innerHTML = '<em>Add courses with grades to see results.</em>';
  }

  function gpaToPercentage(gpa) {
    // Approximate conversion: 4.0 = 100%, 3.0 = 85%, 2.0 = 75%, 1.0 = 65%
    if (gpa >= 4.0) return 100;
    if (gpa >= 3.0) return 85 + ((gpa - 3.0) * 15);
    if (gpa >= 2.0) return 75 + ((gpa - 2.0) * 10);
    if (gpa >= 1.0) return 65 + ((gpa - 1.0) * 10);
    return 60 * gpa;
  }

  function updateExplanation(result) {
    const config = schoolsConfig[state.selectedSchool];
    const isWeighted = state.currentView === 'weighted';
    
    let explanation = `<p>Your ${isWeighted ? 'weighted' : 'unweighted'} term GPA is calculated `;
    
    if (state.calcType === 'college') {
      explanation += `by multiplying each course grade by its credit hours, summing the results, and dividing by total credit hours (${result.totalCredits.toFixed(1)}).`;
    } else {
      explanation += `by averaging the grade point values of all ${result.coursesCount} courses equally.`;
    }
    
    if (isWeighted && config.levels && Object.keys(config.levels).length > 0) {
      explanation += ' Course level bonuses are applied to weighted grades.';
    }
    
    explanation += '</p>';
    
    elements.explanationText.innerHTML = explanation;
  }

  function setView(view) {
    state.currentView = view;
    
    if (view === 'weighted') {
      elements.toggleWeighted.classList.add('active');
      elements.toggleUnweighted.classList.remove('active');
    } else {
      elements.toggleWeighted.classList.remove('active');
      elements.toggleUnweighted.classList.add('active');
    }
    
    calculateGPA();
  }

  // ============================================================================
  // WHAT-IF PLANNER
  // ============================================================================
  
  function calculateWhatIf() {
    const currentGPA = parseFloat(elements.currentGPA.value);
    const completedCredits = parseFloat(elements.completedCredits.value);
    const futureCredits = parseFloat(elements.futureCredits.value);
    const targetGPA = parseFloat(elements.targetGPA.value);

    // Validation
    if (isNaN(currentGPA) || isNaN(completedCredits) || isNaN(futureCredits) || isNaN(targetGPA)) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if (currentGPA < 0 || currentGPA > 5) {
      alert('Current GPA must be between 0 and 5.');
      return;
    }

    if (targetGPA < 0 || targetGPA > 5) {
      alert('Target GPA must be between 0 and 5.');
      return;
    }

    if (completedCredits < 0 || futureCredits <= 0) {
      alert('Credits must be positive numbers.');
      return;
    }

    // Calculate required GPA
    const currentPoints = currentGPA * completedCredits;
    const totalCreditsAfter = completedCredits + futureCredits;
    const targetPoints = targetGPA * totalCreditsAfter;
    const requiredPoints = targetPoints - currentPoints;
    const requiredGPA = requiredPoints / futureCredits;

    // Display results
    elements.whatIfResults.style.display = 'block';

    if (requiredGPA > 5.0) {
      elements.whatIfNotice.className = 'notice error';
      elements.whatIfNotice.innerHTML = `
        <strong>Target Not Achievable</strong>
        <p>Your target GPA of ${targetGPA.toFixed(2)} is not achievable even with perfect grades (4.0+) in all future courses. You would need a ${requiredGPA.toFixed(2)} GPA next term, which exceeds the maximum.</p>
        <p>Consider adjusting your target or taking more credit hours.</p>
      `;
      elements.whatIfExamples.innerHTML = '';
    } else if (requiredGPA < 0) {
      elements.whatIfNotice.className = 'notice success';
      elements.whatIfNotice.innerHTML = `
        <strong>Target Already Exceeded!</strong>
        <p>Your current GPA of ${currentGPA.toFixed(2)} already exceeds your target of ${targetGPA.toFixed(2)}. Great job!</p>
      `;
      elements.whatIfExamples.innerHTML = '';
    } else {
      elements.whatIfNotice.className = 'notice success';
      elements.whatIfNotice.innerHTML = `
        <strong>Required Next Term GPA: ${requiredGPA.toFixed(2)}</strong>
        <p>To reach your target cumulative GPA of ${targetGPA.toFixed(2)}, you need to earn an average GPA of ${requiredGPA.toFixed(2)} in your next ${futureCredits} credits.</p>
        ${requiredGPA > 4.0 ? '<p class="warn"><strong>Note:</strong> This requires weighted grades above 4.0 (Honors/AP courses).</p>' : ''}
      `;

      // Generate example grade mixes
      generateGradeMixExamples(requiredGPA, futureCredits);
    }
  }

  function generateGradeMixExamples(targetGPA, totalCredits) {
    const examples = [];
    
    // Calculate different grade combinations that average to target GPA
    const gradeValues = [
      { name: 'A (4.0)', value: 4.0 },
      { name: 'A- (3.7)', value: 3.7 },
      { name: 'B+ (3.3)', value: 3.3 },
      { name: 'B (3.0)', value: 3.0 },
      { name: 'B- (2.7)', value: 2.7 },
      { name: 'C+ (2.3)', value: 2.3 },
      { name: 'C (2.0)', value: 2.0 }
    ];

    // Try to generate realistic examples
    if (targetGPA >= 3.7) {
      const aCount = Math.ceil(totalCredits * 0.8);
      const bCount = totalCredits - aCount;
      examples.push({ grades: [{ count: aCount, name: 'A (4.0)' }, { count: bCount, name: 'B+ (3.3)' }] });
    } else if (targetGPA >= 3.3) {
      const aCount = Math.ceil(totalCredits * 0.5);
      const bCount = totalCredits - aCount;
      examples.push({ grades: [{ count: aCount, name: 'A (4.0)' }, { count: bCount, name: 'B (3.0)' }] });
    } else if (targetGPA >= 3.0) {
      const bCount = Math.ceil(totalCredits * 0.7);
      const cCount = totalCredits - bCount;
      examples.push({ grades: [{ count: bCount, name: 'B (3.0)' }, { count: cCount, name: 'C+ (2.3)' }] });
    } else {
      examples.push({ grades: [{ count: totalCredits, name: `Average ${targetGPA.toFixed(1)} GPA` }] });
    }

    // Render examples
    let html = '<h3>Example Grade Combinations:</h3>';
    examples.forEach((example, idx) => {
      html += '<div class="grade-mix-item">';
      html += example.grades.map(g => `${g.count} course${g.count > 1 ? 's' : ''} with ${g.name}`).join(' + ');
      html += '</div>';
    });

    html += '<p class="muted" style="margin-top: 12px;">These are approximate examples. The exact mix depends on your specific courses and grading scale.</p>';
    
    elements.whatIfExamples.innerHTML = html;
  }

  // ============================================================================
  // EXPOSE PUBLIC API
  // ============================================================================
  
  window.gpaApp = {
    removeCustomGrade: removeCustomGrade
  };

  // ============================================================================
  // START APPLICATION
  // ============================================================================
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
