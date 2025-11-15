// Header Component Initialization
(function() {
  'use strict';
  
  // Load header HTML
  async function loadHeader() {
    try {
      const response = await fetch('/components/header.html');
      if (!response.ok) throw new Error('Failed to load header');
      const html = await response.text();
      const headerPlaceholder = document.getElementById('header-placeholder');
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
        initializeHeader();
      }
    } catch (error) {
      console.error('Error loading header:', error);
    }
  }
  
  // Initialize header functionality
  function initializeHeader() {
    // Navigation dropdown
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isActive);
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Close menu when clicking a nav item
      navMenu.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const logo = document.getElementById('logo');
    const root = document.documentElement;
    
    if (themeToggle && themeIcon && logo) {
      // Check for saved theme preference or default to 'dark'
      const currentTheme = localStorage.getItem('theme') || 'dark';
      root.setAttribute('data-theme', currentTheme);
      updateThemeAssets(currentTheme);
      
      themeToggle.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeAssets(newTheme);
      });
    }
    
    function updateThemeAssets(theme) {
      if (theme === 'dark') {
        logo.src = '/images/dark-logo.png';
        themeIcon.src = '/images/dark-icon.png';
      } else {
        logo.src = '/images/light-logo.png';
        themeIcon.src = '/images/light-icon.png';
      }
    }
  }
  
  // Load header when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
