// Toast Notification System
class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create notification container if it doesn't exist
    if (!document.getElementById('notification-container')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-3';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('notification-container');
    }
  }

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    const id = 'notification-' + Date.now();
    notification.id = id;
    
    const colors = {
      success: {
        bg: 'bg-green-500',
        icon: '✓',
        border: 'border-green-600'
      },
      error: {
        bg: 'bg-red-500',
        icon: '✕',
        border: 'border-red-600'
      },
      warning: {
        bg: 'bg-yellow-500',
        icon: '⚠',
        border: 'border-yellow-600'
      },
      info: {
        bg: 'bg-blue-500',
        icon: 'ℹ',
        border: 'border-blue-600'
      }
    };

    const color = colors[type] || colors.info;

    notification.className = `${color.bg} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 ${color.border} flex items-center space-x-3 min-w-[300px] max-w-md transform transition-all duration-300 translate-x-full opacity-0`;
    
    notification.innerHTML = `
      <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold">
        ${color.icon}
      </div>
      <div class="flex-1">
        <p class="font-medium">${message}</p>
      </div>
      <button onclick="this.parentElement.remove()" class="flex-shrink-0 text-white hover:text-gray-200 focus:outline-none">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    `;

    this.container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
      notification.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification);
      }, duration);
    }

    return notification;
  }

  remove(notification) {
    notification.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }
}

// Initialize notification system
const notifications = new NotificationSystem();

// Make it globally available
window.notifications = notifications;

// Check for URL parameters and show notifications
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('error')) {
    notifications.error(decodeURIComponent(urlParams.get('error')));
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  if (urlParams.get('success')) {
    notifications.success(decodeURIComponent(urlParams.get('success')));
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  if (urlParams.get('registered')) {
    notifications.success('Account created successfully! Please sign in.');
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

