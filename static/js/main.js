// General App Interactivity
class AppManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEvents();
        this.setupRippleEffects();
        this.setupResponsive();
        this.setupPasswordToggle();
    }

    setupGlobalEvents() {
        // Add hover effects to form inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', this.onInputFocus.bind(this));
            input.addEventListener('blur', this.onInputBlur.bind(this));
        });

        // Add click ripple effect to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', this.addRippleEffect.bind(this));
        });
    }

    onInputFocus(e) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 5px 15px rgba(230, 0, 0, 0.2)';
    }

    onInputBlur(e) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
    }

    addRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupRippleEffects() {
        // Add ripple effect CSS dynamically
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupPasswordToggle() {
        // Add password visibility toggle to login page
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.onclick = () => this.togglePassword(input, toggleBtn);
            
            // Insert toggle button after input
            const container = input.parentElement;
            container.appendChild(toggleBtn);
        });
    }

    togglePassword(input, toggleBtn) {
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        // Change icon
        if (type === 'text') {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    setupResponsive() {
        // Handle responsive navigation
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        mediaQuery.addListener(this.handleMobileNav.bind(this));
        this.handleMobileNav(mediaQuery);
    }

    handleMobileNav(mediaQuery) {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        if (mediaQuery.matches) {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
        }
    }

    // Utility functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async apiCall(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
}

// Initialize app manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.appManager = new AppManager();
});

// Global utility functions
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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}