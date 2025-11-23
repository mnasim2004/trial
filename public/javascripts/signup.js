// Multi-step form handler
let currentStep = 1;
const totalSteps = 3;
const formData = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing signup form');
  try {
    setupEventListeners();
    updateProgress();
    updateButtons();
    checkUsernameAvailability = debounce(checkUsernameAvailability, 500);
    console.log('Signup form initialized successfully');
  } catch (error) {
    console.error('Error initializing signup form:', error);
  }
});

// Also try on window load as fallback
window.addEventListener('load', function() {
  if (typeof currentStep === 'undefined' || currentStep === null) {
    console.log('Re-initializing on window load');
    try {
      setupEventListeners();
      updateProgress();
      updateButtons();
    } catch (error) {
      console.error('Error re-initializing:', error);
    }
  }
});

function setupEventListeners() {
  // Navigation buttons
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      nextStep(e);
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      prevStep();
    });
  }
  
  // Form inputs - only add listeners for fields that exist
  const usernameInput = document.getElementById('username');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const addressInput = document.getElementById('address');
  const pincodeInput = document.getElementById('pincode');
  const phoneInput = document.getElementById('phoneNumber');
  const passwordInput = document.getElementById('password');
  const photoInput = document.getElementById('photo');
  
  if (usernameInput) usernameInput.addEventListener('input', validateUsername);
  if (nameInput) nameInput.addEventListener('input', validateName);
  if (emailInput) emailInput.addEventListener('input', validateEmail);
  if (addressInput) addressInput.addEventListener('input', validateAddress);
  if (pincodeInput) pincodeInput.addEventListener('input', validatePincode);
  if (phoneInput) phoneInput.addEventListener('input', validatePhone);
  if (passwordInput) passwordInput.addEventListener('input', validatePassword);
  if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);
  
  // Password toggle
  const togglePassword = document.getElementById('toggle-password');
  if (togglePassword) {
    togglePassword.addEventListener('click', togglePasswordVisibility);
  }
  
  // Form submission
  document.getElementById('signup-form').addEventListener('submit', handleSubmit);
}

function nextStep(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  console.log('nextStep called, current step:', currentStep);
  
  const isValid = validateCurrentStep();
  console.log('Validation result:', isValid);
  
  if (isValid) {
    if (currentStep < totalSteps) {
      console.log('Moving to next step');
      hideStep(currentStep);
      currentStep++;
      showStep(currentStep);
      updateProgress();
      updateButtons();
      console.log('Now on step:', currentStep);
    } else {
      console.log('Already on last step');
    }
  } else {
    console.log('Validation failed');
    // Show error notification
    if (window.notifications) {
      window.notifications.error('Please fill all required fields correctly before proceeding.');
    } else {
      alert('Please fill all required fields correctly before proceeding.');
    }
  }
  return false;
}

// Make nextStep globally available
window.nextStep = nextStep;

function prevStep() {
  if (currentStep > 1) {
    hideStep(currentStep);
    currentStep--;
    showStep(currentStep);
    updateProgress();
    updateButtons();
  }
}

function showStep(step) {
  console.log('Showing step:', step);
  const stepElement = document.querySelector(`[data-step="${step}"]`);
  if (stepElement) {
    stepElement.classList.remove('hidden');
    const input = stepElement.querySelector('input, textarea');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
    console.log('Step', step, 'shown successfully');
  } else {
    console.error('Step element not found for step:', step);
  }
}

function hideStep(step) {
  console.log('Hiding step:', step);
  const stepElement = document.querySelector(`[data-step="${step}"]`);
  if (stepElement) {
    stepElement.classList.add('hidden');
    console.log('Step', step, 'hidden successfully');
  } else {
    console.error('Step element not found for step:', step);
  }
}

function updateProgress() {
  const percent = (currentStep / totalSteps) * 100;
  document.getElementById('current-step').textContent = currentStep;
  document.getElementById('progress-percent').textContent = percent.toFixed(1);
  document.getElementById('progress-bar').style.width = percent + '%';
}

function updateButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  
  if (prevBtn) prevBtn.classList.toggle('hidden', currentStep === 1);
  if (nextBtn) nextBtn.classList.toggle('hidden', currentStep === totalSteps);
  if (submitBtn) submitBtn.classList.toggle('hidden', currentStep !== totalSteps);
  
  console.log('Buttons updated - Step:', currentStep, 'Prev hidden:', currentStep === 1, 'Next hidden:', currentStep === totalSteps);
}

// Validation functions
function validateCurrentStep() {
  let allValid = true;
  
  switch(currentStep) {
    case 1: 
      // Check if all required fields have values
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const address = document.getElementById('address')?.value.trim();
      const pincode = document.getElementById('pincode')?.value.trim();
      const phone = document.getElementById('phoneNumber')?.value.trim();
      
      if (!name || !email || !address || !pincode || !phone) {
        allValid = false;
        console.log('Step 1: Missing required fields');
        if (window.notifications) {
          window.notifications.error('Please fill all fields in Step 1');
        } else {
          alert('Please fill all fields in Step 1');
        }
      } else {
        // Now do full validation
        allValid = validateName(true) && validateEmail(true) && validateAddress(true) && validatePincode(true) && validatePhone(true);
      }
      break;
    case 2: 
      const username = document.getElementById('username')?.value.trim();
      const password = document.getElementById('password')?.value;
      
      if (!username || !password) {
        allValid = false;
        console.log('Step 2: Missing required fields');
        if (window.notifications) {
          window.notifications.error('Please fill username and password');
        } else {
          alert('Please fill username and password');
        }
      } else {
        // Now do full validation
        allValid = validateUsername(true) && validatePassword(true);
      }
      break;
    case 3: 
      // Photo is optional, so always valid
      allValid = true;
      break;
    default: 
      return true;
  }
  
  return allValid;
}

function validateUsername(submit = false) {
  const input = document.getElementById('username');
  if (!input) return true;
  
  const value = input.value.trim();
  const errorDiv = document.getElementById('username-error');
  
  // Length check
  const lengthOk = value.length >= 3 && value.length <= 20;
  updateCriteria('username-length', lengthOk);
  
  // Format check
  const formatOk = /^[a-zA-Z0-9_]+$/.test(value);
  updateCriteria('username-format', formatOk);
  
  if (!submit && value.length > 2) {
    checkUsernameAvailability(value);
  }
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Username is required');
      return false;
    }
    if (!lengthOk) {
      showError(errorDiv, 'Username must be 3-20 characters');
      return false;
    }
    if (!formatOk) {
      showError(errorDiv, 'Username can only contain letters, numbers, and underscores');
      return false;
    }
    hideError(errorDiv);
    formData.username = value;
    return true;
  }
  
  if (value && lengthOk && formatOk) {
    hideError(errorDiv);
  }
  return true;
}

function validateName(submit = false) {
  const input = document.getElementById('name');
  if (!input) return true;
  
  const value = input.value.trim();
  const errorDiv = document.getElementById('name-error');
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Name is required');
      return false;
    }
    if (value.length < 2) {
      showError(errorDiv, 'Name must be at least 2 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      showError(errorDiv, 'Name can only contain letters and spaces');
      return false;
    }
    hideError(errorDiv);
    formData.name = value;
    return true;
  }
  return true;
}

function validateEmail(submit = false) {
  const input = document.getElementById('email');
  if (!input) return true;
  
  const value = input.value.trim();
  const errorDiv = document.getElementById('email-error');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      showError(errorDiv, 'Please enter a valid email address');
      return false;
    }
    hideError(errorDiv);
    formData.email = value;
    return true;
  }
  return true;
}

function validateAddress(submit = false) {
  const input = document.getElementById('address');
  if (!input) return true;
  
  const value = input.value.trim();
  const errorDiv = document.getElementById('address-error');
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Address is required');
      return false;
    }
    if (value.length < 5) {
      showError(errorDiv, 'Address must be at least 5 characters');
      return false;
    }
    hideError(errorDiv);
    formData.address = value;
    return true;
  }
  return true;
}

function validatePincode(submit = false) {
  const input = document.getElementById('pincode');
  if (!input) return true;
  
  const value = input.value.trim();
  const errorDiv = document.getElementById('pincode-error');
  const pincodeRegex = /^\d{4,10}$/;
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Pin code is required');
      return false;
    }
    if (!pincodeRegex.test(value)) {
      showError(errorDiv, 'Pin code must be 4-10 digits');
      return false;
    }
    hideError(errorDiv);
    formData.pincode = value;
    return true;
  }
  return true;
}

function validatePhone(submit = false) {
  const input = document.getElementById('phoneNumber');
  if (!input) return true;
  
  const value = input.value.trim().replace(/[\s\-\(\)]/g, '');
  const errorDiv = document.getElementById('phoneNumber-error');
  const phoneRegex = /^\+?\d{10,15}$/;
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Phone number is required');
      return false;
    }
    if (!phoneRegex.test(value)) {
      showError(errorDiv, 'Please enter a valid phone number (10-15 digits)');
      return false;
    }
    hideError(errorDiv);
    formData.phoneNumber = value;
    return true;
  }
  return true;
}

function validatePassword(submit = false) {
  const input = document.getElementById('password');
  if (!input) return true;
  
  const value = input.value;
  const errorDiv = document.getElementById('password-error');
  
  const hasCapital = /[A-Z]/.test(value);
  const hasSpecial = /[!@#$%^&*()\-_=+{};:,<.>?`~]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasLength = value.length >= 8;
  
  updateCriteria('pwd-capital', hasCapital);
  updateCriteria('pwd-special', hasSpecial);
  updateCriteria('pwd-number', hasNumber);
  updateCriteria('pwd-length', hasLength);
  
  if (submit) {
    if (!value) {
      showError(errorDiv, 'Password is required');
      return false;
    }
    if (!hasCapital || !hasSpecial || !hasNumber || !hasLength) {
      showError(errorDiv, 'Password does not meet all requirements');
      return false;
    }
    hideError(errorDiv);
    formData.password = value;
    return true;
  }
  return true;
}

function validatePhoto(submit = false) {
  const input = document.getElementById('photo');
  if (!input) return true;
  
  const file = input.files[0];
  const errorDiv = document.getElementById('photo-error');
  
  // Photo is optional, so if no file, it's valid
  if (!file) {
    return true;
  }
  
  if (submit) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (file.size > maxSize) {
      showError(errorDiv, 'File size must be less than 10MB');
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      showError(errorDiv, 'Please upload a valid image file (JPG, PNG, or GIF)');
      return false;
    }
    hideError(errorDiv);
  }
  return true;
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  const fileName = document.getElementById('file-name');
  if (file) {
    fileName.textContent = file.name;
    fileName.classList.remove('hidden');
  } else {
    fileName.classList.add('hidden');
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('password');
  const icon = document.getElementById('eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
  }
}

async function checkUsernameAvailability(username) {
  // This would typically check with the server
  // For now, we'll just show a loading state
  const availableIcon = document.querySelector('#username-available .criteria-icon');
  if (availableIcon) {
    availableIcon.textContent = '⏳';
  }
  // In a real app, you'd make an API call here
  // For now, assume it's available if it passes format checks
  setTimeout(() => {
    if (availableIcon) {
      availableIcon.textContent = '✅';
    }
  }, 500);
}

function updateCriteria(id, isValid) {
  const element = document.getElementById(id);
  if (element) {
    const icon = element.querySelector('.criteria-icon');
    if (icon) {
      icon.textContent = isValid ? '✅' : '❌';
      element.classList.toggle('text-green-600', isValid);
      element.classList.toggle('text-gray-600', !isValid);
    }
  }
}

function showError(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError(errorDiv) {
  errorDiv.classList.add('hidden');
}

function handleSubmit(e) {
  e.preventDefault();
  
  // Validate all steps
  // Step 1: Personal details
  if (!validateName(true) || !validateEmail(true) || !validateAddress(true) || !validatePincode(true) || !validatePhone(true)) {
    hideStep(currentStep);
    currentStep = 1;
    showStep(currentStep);
    updateProgress();
    updateButtons();
    return;
  }
  
  // Step 2: Credentials
  if (!validateUsername(true) || !validatePassword(true)) {
    hideStep(currentStep);
    currentStep = 2;
    showStep(currentStep);
    updateProgress();
    updateButtons();
    return;
  }
  
  // Step 3: Photo (optional, but validate if provided)
  if (!validatePhoto(true)) {
    hideStep(currentStep);
    currentStep = 3;
    showStep(currentStep);
    updateProgress();
    updateButtons();
    return;
  }
  
  // All validations passed, submit the form via AJAX
  submitForm();
}

async function submitForm() {
  const form = document.getElementById('signup-form');
  const formData = new FormData(form);
  const submitBtn = document.getElementById('submit-btn');
  const nextBtn = document.getElementById('next-btn');
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="flex items-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Account...</span>';
  
  try {
    const response = await fetch('/users/profile', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Success - show notification and redirect
      if (window.notifications) {
        window.notifications.success(data.message || 'Account created successfully!');
      }
      setTimeout(() => {
        window.location.href = '/users/signin?registered=true';
      }, 1500);
    } else {
      // Error - show notification
      if (window.notifications) {
        window.notifications.error(data.error || 'An error occurred. Please try again.');
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Complete Sign Up ✓';
    }
  } catch (error) {
    console.error('Error:', error);
    if (window.notifications) {
      window.notifications.error('Network error. Please check your connection and try again.');
    }
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Complete Sign Up ✓';
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

