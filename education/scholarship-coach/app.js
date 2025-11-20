// Scholarship Coach - Main Application
(function() {
  'use strict';
  
  // ===========================
  // State Management
  // ===========================
  let workspace = {
    version: 1,
    studentProfile: null,
    savedScholarships: [],
    toolkit: {
      resume: {
        education: '',
        awards: '',
        activities: '',
        employment: '',
        volunteering: '',
        skills: ''
      },
      essays: []
    }
  };
  
  let allScholarships = [];
  let filteredScholarships = [];
  
  // ===========================
  // Initialization
  // ===========================
  document.addEventListener('DOMContentLoaded', () => {
    loadScholarshipsData();
    setupEventListeners();
    
    // Set current year in footer
    document.getElementById('y').textContent = new Date().getFullYear();
  });
  
  // ===========================
  // Load Scholarship Data
  // ===========================
  async function loadScholarshipsData() {
    try {
      const response = await fetch('/data/scholarships.json');
      allScholarships = await response.json();
      filteredScholarships = [...allScholarships];
    } catch (error) {
      console.error('Error loading scholarships:', error);
      allScholarships = [];
      filteredScholarships = [];
    }
  }
  
  // ===========================
  // Event Listeners Setup
  // ===========================
  function setupEventListeners() {
    // Landing screen
    document.getElementById('startNewBtn').addEventListener('click', showOnboarding);
    document.getElementById('importBtn').addEventListener('click', triggerImport);
    
    // Onboarding
    document.getElementById('completeOnboardingBtn').addEventListener('click', completeOnboarding);
    document.getElementById('cancelOnboardingBtn').addEventListener('click', showLanding);
    
    // Main app
    document.getElementById('exportBtn').addEventListener('click', exportWorkspace);
    document.getElementById('importMainBtn').addEventListener('click', triggerImport);
    document.getElementById('closeReminder').addEventListener('click', hideExportReminder);
    
    // Import file input
    document.getElementById('importFileInput').addEventListener('change', handleImport);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        switchTab(tab);
      });
    });
    
    // Scholarships.com search
    document.getElementById('generateLinksBtn').addEventListener('click', generateScholarshipComLinks);
    
    // Saved scholarships filter
    document.getElementById('statusFilter').addEventListener('change', updateSavedList);
    
    // Toolkit navigation
    document.querySelectorAll('.toolkit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.target.dataset.tool;
        switchToolkitTool(tool);
      });
    });
    
    // Resume builder
    document.getElementById('previewResumeBtn').addEventListener('click', previewResume);
    document.getElementById('copyResumeBtn').addEventListener('click', copyResume);
    
    // Essay helper
    document.getElementById('essayPrompt').addEventListener('change', showEssayGuide);
    
    // Email templates
    document.querySelectorAll('.copy-template').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        copyEmailTemplate(template);
      });
    });
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('scholarshipModal').addEventListener('click', (e) => {
      if (e.target.id === 'scholarshipModal') closeModal();
    });
    
    // Auto-save toolkit content
    setupAutoSave();
  }
  
  // ===========================
  // Screen Navigation
  // ===========================
  function showLanding() {
    document.getElementById('landingScreen').style.display = 'block';
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
  }
  
  function showOnboarding() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
  }
  
  function showMainApp() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Initialize main app
    prepopulateScholarshipSearch();
    updateSavedList();
  }
  
  // ===========================
  // Onboarding
  // ===========================
  function completeOnboarding() {
    const profile = {
      gradeLevel: document.getElementById('gradeLevel').value,
      targetEnrollmentYear: parseInt(document.getElementById('targetYear').value) || null,
      country: document.getElementById('country').value,
      state: document.getElementById('state').value,
      gpa: parseFloat(document.getElementById('gpa').value) || null,
      testScores: {
        sat: parseInt(document.getElementById('sat').value) || null,
        act: parseInt(document.getElementById('act').value) || null
      },
      intendedMajors: document.getElementById('intendedMajors').value
        .split(',')
        .map(m => m.trim())
        .filter(m => m),
      financial: {
        needBased: document.getElementById('needBased').checked,
        incomeBand: document.getElementById('incomeBand').value,
        firstGen: document.getElementById('firstGen').checked
      },
      activities: Array.from(document.querySelectorAll('.activity-checkbox:checked'))
        .map(cb => cb.value),
      specialFlags: {
        militaryFamily: document.getElementById('militaryFamily').checked,
        disability: document.getElementById('disability').checked,
        ruralBackground: document.getElementById('ruralBackground').checked
      }
    };
    
    workspace.studentProfile = profile;
    showMainApp();
    showExportReminder();
  }
  
  // ===========================
  // Tab Navigation
  // ===========================
  function switchTab(tab) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    // Refresh content if needed
    if (tab === 'saved') {
      updateSavedList();
    }
  }
  
  // ===========================
  // Scholarships.com Search
  // ===========================
  function prepopulateScholarshipSearch() {
    if (!workspace.studentProfile) return;
    
    const profile = workspace.studentProfile;
    
    // Prepopulate residence state
    if (profile.state) {
      const stateSelect = document.getElementById('searchResidenceState');
      const normalizedState = profile.state.toUpperCase();
      if (stateSelect) {
        stateSelect.value = normalizedState;
      }
    }
    
    // Prepopulate school year based on grade level
    if (profile.gradeLevel) {
      const schoolYearSelect = document.getElementById('searchSchoolYear');
      const schoolYearKey = SCHOLARSHIPS_COM_CONFIG.gradeLevelToSchoolYear[profile.gradeLevel];
      if (schoolYearSelect && schoolYearKey) {
        schoolYearSelect.value = schoolYearKey;
      }
    }
    
    // Prepopulate GPA band
    if (profile.gpa) {
      const gpaBand = getGPABand(profile.gpa);
      if (gpaBand) {
        document.getElementById('searchGPABand').value = gpaBand;
      }
    }
    
    // Prepopulate major (first one if multiple)
    if (profile.intendedMajors && profile.intendedMajors.length > 0) {
      const majorSelect = document.getElementById('searchMajor');
      const firstMajor = profile.intendedMajors[0];
      // Try to find matching option
      for (let option of majorSelect.options) {
        if (option.value.toLowerCase() === firstMajor.toLowerCase()) {
          majorSelect.value = option.value;
          break;
        }
      }
    }
    
    // Prepopulate financial need
    if (profile.financial && profile.financial.needBased) {
      document.getElementById('searchFinancialNeed').checked = true;
    }
  }
  
  function generateScholarshipComLinks() {
    // Collect search parameters from form
    const searchParams = {
      residenceState: document.getElementById('searchResidenceState').value,
      schoolYear: document.getElementById('searchSchoolYear').value,
      gpaBand: document.getElementById('searchGPABand').value,
      major: document.getElementById('searchMajor').value,
      financialNeed: document.getElementById('searchFinancialNeed').checked,
      ethnicity: document.getElementById('searchEthnicity').value,
      gender: document.getElementById('searchGender').value,
      religion: document.getElementById('searchReligion').value,
      military: document.getElementById('searchMilitary').value,
      sat: document.getElementById('searchSAT').value,
      act: document.getElementById('searchACT').value,
      athletic: document.getElementById('searchAthletic').value,
      disability: document.getElementById('searchDisability').value,
      firstGen: document.getElementById('searchFirstGen').checked
    };
    
    // Generate links using config
    const links = generateScholarshipLinks(searchParams);
    
    // Display links
    displayScholarshipComLinks(links);
  }
  
  function displayScholarshipComLinks(links) {
    const container = document.getElementById('scholarshipLinks');
    const section = document.getElementById('scholarshipLinksSection');
    
    if (links.length === 0) {
      section.style.display = 'none';
      alert('Please select at least one search criterion to generate scholarship links.');
      return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = links.map(link => `
      <div class="scholarship-link-card">
        <div class="link-category">${link.category}</div>
        <div class="link-label">${link.label}</div>
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm">
          🔗 Search on Scholarships.com
        </a>
      </div>
    `).join('');
    
    // Scroll to links section
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  
  // ===========================
  // Scholarship Actions (for manually added scholarships)
  // ===========================
  // Note: These functions are no longer used for search but kept for
  // backward compatibility with manually added scholarships in saved lists
  
  function closeModal() {
    document.getElementById('scholarshipModal').classList.remove('active');
  }
  
  // ===========================
  // Saved Scholarships
  // ===========================
  function updateSavedList() {
    const container = document.getElementById('savedScholarships');
    const statsContainer = document.getElementById('savedStats');
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = workspace.savedScholarships;
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    // Calculate stats
    const totalSaved = workspace.savedScholarships.length;
    const totalPotential = workspace.savedScholarships.reduce((sum, saved) => {
      const scholarship = allScholarships.find(s => s.id === saved.scholarshipId);
      return sum + (scholarship ? scholarship.amountMax : 0);
    }, 0);
    
    const upcoming = workspace.savedScholarships.filter(saved => {
      const scholarship = allScholarships.find(s => s.id === saved.scholarshipId);
      if (!scholarship || !scholarship.deadline) return false;
      const daysUntil = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 14;
    }).length;
    
    statsContainer.innerHTML = `
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">${totalSaved}</div>
          <div class="stat-label">Saved Scholarships</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${totalPotential.toLocaleString()}</div>
          <div class="stat-label">Potential Awards</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${upcoming}</div>
          <div class="stat-label">Due in 14 Days</div>
        </div>
      </div>
    `;
    
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>No saved scholarships yet.</p>
          <p class="muted">Find scholarships on Scholarships.com using the Search tab, then manually add them here to track your applications.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = filtered.map((saved, index) => {
      const scholarship = allScholarships.find(s => s.id === saved.scholarshipId);
      if (!scholarship) return '';
      
      const deadline = scholarship.deadline ? new Date(scholarship.deadline) : null;
      const daysUntil = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
      
      return `
        <div class="saved-item">
          <div class="saved-header">
            <div>
              <h3 class="scholarship-title">${scholarship.title}</h3>
              <div class="scholarship-meta">
                <span>💰 $${scholarship.amountMin.toLocaleString()}${scholarship.amountMin !== scholarship.amountMax ? ` - $${scholarship.amountMax.toLocaleString()}` : ''}</span>
                ${deadline ? `<span>📅 ${deadline.toLocaleDateString()} ${daysUntil > 0 ? `(${daysUntil} days)` : '(Past due)'}</span>` : '<span>📅 Rolling deadline</span>'}
              </div>
            </div>
            <span class="status-badge status-${saved.status}">
              ${saved.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div class="saved-details">
            <label for="status-${index}"><strong>Status:</strong></label>
            <select id="status-${index}" class="form-control" onchange="scholarshipCoach.updateStatus('${saved.scholarshipId}', this.value)">
              <option value="not_started" ${saved.status === 'not_started' ? 'selected' : ''}>Not Started</option>
              <option value="in_progress" ${saved.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="submitted" ${saved.status === 'submitted' ? 'selected' : ''}>Submitted</option>
            </select>
          </div>
          
          <div class="tasks-checklist">
            <h4>Application Tasks:</h4>
            <label>
              <input type="checkbox" ${saved.tasks.essayDrafted ? 'checked' : ''} 
                onchange="scholarshipCoach.updateTask('${saved.scholarshipId}', 'essayDrafted', this.checked)" />
              Write essay
            </label>
            <label>
              <input type="checkbox" ${saved.tasks.recommendationRequested ? 'checked' : ''} 
                onchange="scholarshipCoach.updateTask('${saved.scholarshipId}', 'recommendationRequested', this.checked)" />
              Request recommendation letter
            </label>
            <label>
              <input type="checkbox" ${saved.tasks.transcriptRequested ? 'checked' : ''} 
                onchange="scholarshipCoach.updateTask('${saved.scholarshipId}', 'transcriptRequested', this.checked)" />
              Request transcript
            </label>
            <label>
              <input type="checkbox" ${saved.tasks.applicationSubmitted ? 'checked' : ''} 
                onchange="scholarshipCoach.updateTask('${saved.scholarshipId}', 'applicationSubmitted', this.checked)" />
              Submit application
            </label>
          </div>
          
          <div class="notes-section">
            <h4>Notes:</h4>
            <textarea class="form-control" rows="2" 
              placeholder="Add notes about this scholarship application..."
              onchange="scholarshipCoach.updateNotes('${saved.scholarshipId}', this.value)">${saved.notes}</textarea>
          </div>
          
          <div class="action-buttons">
            <a href="${scholarship.officialUrl}" target="_blank" class="btn-secondary btn-sm">🔗 View Official Page</a>
            <button class="btn-secondary btn-sm" onclick="scholarshipCoach.removeSaved('${saved.scholarshipId}')">
              🗑️ Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
  
  function updateStatus(scholarshipId, status) {
    const saved = workspace.savedScholarships.find(s => s.scholarshipId === scholarshipId);
    if (saved) {
      saved.status = status;
      updateSavedList();
      showExportReminder();
    }
  }
  
  function updateTask(scholarshipId, taskName, checked) {
    const saved = workspace.savedScholarships.find(s => s.scholarshipId === scholarshipId);
    if (saved) {
      saved.tasks[taskName] = checked;
      showExportReminder();
    }
  }
  
  function updateNotes(scholarshipId, notes) {
    const saved = workspace.savedScholarships.find(s => s.scholarshipId === scholarshipId);
    if (saved) {
      saved.notes = notes;
      showExportReminder();
    }
  }
  
  function removeSaved(scholarshipId) {
    if (!confirm('Are you sure you want to remove this scholarship from your saved list?')) {
      return;
    }
    
    workspace.savedScholarships = workspace.savedScholarships.filter(
      s => s.scholarshipId !== scholarshipId
    );
    updateSavedList();
    displayScholarships(); // Refresh search to show save button again
    showExportReminder();
  }
  
  // ===========================
  // Toolkit
  // ===========================
  function switchToolkitTool(tool) {
    // Update buttons
    document.querySelectorAll('.toolkit-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    // Update content
    document.querySelectorAll('.tool-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tool}Tool`).classList.add('active');
  }
  
  function setupAutoSave() {
    // Auto-save resume fields
    ['resumeEducation', 'resumeAwards', 'resumeActivities', 'resumeEmployment', 
     'resumeVolunteering', 'resumeSkills'].forEach(id => {
      const field = document.getElementById(id);
      field.addEventListener('change', () => {
        const key = id.replace('resume', '').toLowerCase();
        workspace.toolkit.resume[key] = field.value;
        showExportReminder();
      });
    });
    
    // Auto-save essay fields
    ['essayBrainstorm', 'essayIntro', 'essayBody', 'essayConclusion'].forEach(id => {
      const field = document.getElementById(id);
      field.addEventListener('change', saveEssay);
    });
  }
  
  function previewResume() {
    const resume = workspace.toolkit.resume;
    let preview = '';
    
    if (resume.education) preview += `<h3>Education</h3><p>${resume.education.replace(/\n/g, '<br>')}</p>`;
    if (resume.awards) preview += `<h3>Awards & Honors</h3><p>${resume.awards.replace(/\n/g, '<br>')}</p>`;
    if (resume.activities) preview += `<h3>Activities & Leadership</h3><p>${resume.activities.replace(/\n/g, '<br>')}</p>`;
    if (resume.employment) preview += `<h3>Employment</h3><p>${resume.employment.replace(/\n/g, '<br>')}</p>`;
    if (resume.volunteering) preview += `<h3>Volunteering</h3><p>${resume.volunteering.replace(/\n/g, '<br>')}</p>`;
    if (resume.skills) preview += `<h3>Skills</h3><p>${resume.skills.replace(/\n/g, '<br>')}</p>`;
    
    const modal = document.getElementById('scholarshipModal');
    document.getElementById('modalTitle').textContent = 'Résumé Preview';
    document.getElementById('modalBody').innerHTML = preview || '<p class="muted">Your résumé is empty. Add content in the fields above.</p>';
    modal.classList.add('active');
  }
  
  function copyResume() {
    const resume = workspace.toolkit.resume;
    let text = '';
    
    if (resume.education) text += `EDUCATION\n${resume.education}\n\n`;
    if (resume.awards) text += `AWARDS & HONORS\n${resume.awards}\n\n`;
    if (resume.activities) text += `ACTIVITIES & LEADERSHIP\n${resume.activities}\n\n`;
    if (resume.employment) text += `EMPLOYMENT\n${resume.employment}\n\n`;
    if (resume.volunteering) text += `VOLUNTEERING & COMMUNITY SERVICE\n${resume.volunteering}\n\n`;
    if (resume.skills) text += `SKILLS\n${resume.skills}\n\n`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Résumé copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy. Please try again.');
    });
  }
  
  function showEssayGuide() {
    const prompt = document.getElementById('essayPrompt').value;
    const guide = document.getElementById('essayGuide');
    
    if (!prompt) {
      guide.style.display = 'none';
      return;
    }
    
    const guides = {
      challenge: {
        title: 'Overcoming a Challenge or Adversity',
        questions: [
          'What was the specific challenge or obstacle?',
          'How did it affect you emotionally or practically?',
          'What actions did you take to overcome it?',
          'What did you learn from the experience?',
          'How has it shaped who you are today?'
        ]
      },
      major: {
        title: 'Why This Major/Career Path?',
        questions: [
          'When did you first become interested in this field?',
          'What experiences confirmed this interest?',
          'What specific aspects of the field excite you?',
          'What do you hope to accomplish in this career?',
          'How will you use your education to make an impact?'
        ]
      },
      community: {
        title: 'Giving Back to Your Community',
        questions: [
          'What community service or volunteer work have you done?',
          'Why is this cause important to you?',
          'What impact have you made?',
          'How will you continue serving others in the future?',
          'How does your education connect to community service?'
        ]
      },
      achievement: {
        title: 'Significant Achievement or Experience',
        questions: [
          'What was the achievement or experience?',
          'What made it significant to you?',
          'What challenges did you face along the way?',
          'What skills or qualities did you develop?',
          'How will this experience influence your future?'
        ]
      },
      leadership: {
        title: 'Leadership Experience',
        questions: [
          'Describe a specific leadership role you held',
          'What was your team or group trying to accomplish?',
          'What challenges did you face as a leader?',
          'How did you motivate or support others?',
          'What did you learn about leadership and yourself?'
        ]
      },
      diversity: {
        title: 'Contribution to Diversity',
        questions: [
          'What unique perspectives or experiences do you bring?',
          'How has your background shaped your worldview?',
          'How will you contribute to campus/program diversity?',
          'What have you learned from people different from you?',
          'How will diversity enhance your education?'
        ]
      }
    };
    
    const guideData = guides[prompt];
    document.getElementById('essayGuideTitle').textContent = guideData.title;
    document.getElementById('essayGuideQuestions').innerHTML = `
      <p class="muted">Consider these questions as you plan your essay:</p>
      <ul>
        ${guideData.questions.map(q => `<li>${q}</li>`).join('')}
      </ul>
    `;
    
    guide.style.display = 'block';
    
    // Load existing essay if present
    loadEssay(prompt);
  }
  
  function saveEssay() {
    const prompt = document.getElementById('essayPrompt').value;
    if (!prompt) return;
    
    const essay = {
      promptType: prompt,
      brainstormNotes: document.getElementById('essayBrainstorm').value,
      outline: {
        intro: document.getElementById('essayIntro').value,
        body: document.getElementById('essayBody').value,
        conclusion: document.getElementById('essayConclusion').value
      }
    };
    
    // Find existing essay or add new
    const index = workspace.toolkit.essays.findIndex(e => e.promptType === prompt);
    if (index >= 0) {
      workspace.toolkit.essays[index] = essay;
    } else {
      workspace.toolkit.essays.push(essay);
    }
    
    showExportReminder();
  }
  
  function loadEssay(prompt) {
    const essay = workspace.toolkit.essays.find(e => e.promptType === prompt);
    if (essay) {
      document.getElementById('essayBrainstorm').value = essay.brainstormNotes || '';
      document.getElementById('essayIntro').value = essay.outline.intro || '';
      document.getElementById('essayBody').value = essay.outline.body || '';
      document.getElementById('essayConclusion').value = essay.outline.conclusion || '';
    } else {
      document.getElementById('essayBrainstorm').value = '';
      document.getElementById('essayIntro').value = '';
      document.getElementById('essayBody').value = '';
      document.getElementById('essayConclusion').value = '';
    }
  }
  
  function copyEmailTemplate(template) {
    const templates = {
      recommendation: document.querySelectorAll('.template-item')[0].querySelector('.template-content').textContent,
      thankyou: document.querySelectorAll('.template-item')[1].querySelector('.template-content').textContent,
      clarification: document.querySelectorAll('.template-item')[2].querySelector('.template-content').textContent
    };
    
    navigator.clipboard.writeText(templates[template]).then(() => {
      alert('✅ Template copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy. Please try again.');
    });
  }
  
  // ===========================
  // Export/Import
  // ===========================
  function exportWorkspace() {
    const dataStr = JSON.stringify(workspace, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    const date = new Date().toISOString().split('T')[0];
    link.download = `scholarship-plan-${date}.json`;
    link.click();
    
    hideExportReminder();
    alert('✅ Your plan has been exported! Save this file in a safe place.');
  }
  
  function triggerImport() {
    document.getElementById('importFileInput').click();
  }
  
  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        // Basic validation
        if (!imported.version || !imported.studentProfile) {
          alert('❌ Invalid file format. Please select a valid scholarship plan JSON file.');
          return;
        }
        
        // Confirm import
        if (!confirm('This will replace your current plan with the imported data. Continue?')) {
          return;
        }
        
        // Import data
        workspace = imported;
        
        // Populate onboarding form if viewing that screen
        if (workspace.studentProfile) {
          populateOnboardingForm(workspace.studentProfile);
        }
        
        // Load toolkit data
        if (workspace.toolkit.resume) {
          Object.keys(workspace.toolkit.resume).forEach(key => {
            const id = 'resume' + key.charAt(0).toUpperCase() + key.slice(1);
            const field = document.getElementById(id);
            if (field) field.value = workspace.toolkit.resume[key];
          });
        }
        
        // Show main app
        showMainApp();
        
        alert('✅ Your plan has been imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Failed to import file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }
  
  function populateOnboardingForm(profile) {
    document.getElementById('gradeLevel').value = profile.gradeLevel || '';
    document.getElementById('targetYear').value = profile.targetEnrollmentYear || '';
    document.getElementById('country').value = profile.country || 'US';
    document.getElementById('state').value = profile.state || '';
    document.getElementById('gpa').value = profile.gpa || '';
    document.getElementById('sat').value = profile.testScores?.sat || '';
    document.getElementById('act').value = profile.testScores?.act || '';
    document.getElementById('intendedMajors').value = profile.intendedMajors?.join(', ') || '';
    document.getElementById('needBased').checked = profile.financial?.needBased || false;
    document.getElementById('incomeBand').value = profile.financial?.incomeBand || '';
    document.getElementById('firstGen').checked = profile.financial?.firstGen || false;
    
    // Activities
    document.querySelectorAll('.activity-checkbox').forEach(cb => {
      cb.checked = profile.activities?.includes(cb.value) || false;
    });
    
    // Special flags
    document.getElementById('militaryFamily').checked = profile.specialFlags?.militaryFamily || false;
    document.getElementById('disability').checked = profile.specialFlags?.disability || false;
    document.getElementById('ruralBackground').checked = profile.specialFlags?.ruralBackground || false;
  }
  
  function showExportReminder() {
    const reminder = document.getElementById('exportReminder');
    if (reminder) {
      reminder.style.display = 'flex';
    }
  }
  
  function hideExportReminder() {
    const reminder = document.getElementById('exportReminder');
    if (reminder) {
      reminder.style.display = 'none';
    }
  }
  
  // ===========================
  // Public API (for inline onclick handlers)
  // ===========================
  window.scholarshipCoach = {
    closeModal,
    updateStatus,
    updateTask,
    updateNotes,
    removeSaved
  };
})();
