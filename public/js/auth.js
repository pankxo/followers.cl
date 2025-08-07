// Authentication JavaScript
class AuthManager {
    constructor() {
        this.initAuthForms();
    }

    initAuthForms() {
        // Login form handler
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form handler
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Form switcher
        const authSwitchers = document.querySelectorAll('.auth-switcher');
        authSwitchers.forEach(switcher => {
            switcher.addEventListener('click', this.switchAuthMode.bind(this));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            showLoading();
            const response = await apiCall('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (response.token) {
                // Redirect to dashboard or previous page
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('redirect') || '/';
                window.location.href = redirectTo;
            }
        } catch (error) {
            this.showAuthError(error.message);
        } finally {
            hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validate password confirmation
        if (data.password !== data.confirmPassword) {
            this.showAuthError('Las contraseñas no coinciden');
            return;
        }

        delete data.confirmPassword;

        try {
            showLoading();
            const response = await apiCall('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (response.token) {
                window.location.href = '/';
            }
        } catch (error) {
            this.showAuthError(error.message);
        } finally {
            hideLoading();
        }
    }

    switchAuthMode(e) {
        e.preventDefault();
        const loginForm = document.getElementById('login-section');
        const registerForm = document.getElementById('register-section');

        if (loginForm && registerForm) {
            loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
            registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
        }
    }

    showAuthError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.auth-error');
        existingErrors.forEach(error => error.remove());

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger auth-error';
        errorDiv.textContent = message;

        // Insert error message
        const authCard = document.querySelector('.auth-card');
        if (authCard) {
            authCard.insertBefore(errorDiv, authCard.firstChild);
        }
    }

    // Check if user needs to login for certain actions
    requireAuth() {
        return new Promise((resolve, reject) => {
            fetch('/api/auth/me')
                .then(response => {
                    if (response.ok) {
                        resolve(true);
                    } else {
                        // Redirect to login with current page as redirect
                        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                        window.location.href = `/login?redirect=${currentUrl}`;
                        reject(false);
                    }
                })
                .catch(() => {
                    const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                    window.location.href = `/login?redirect=${currentUrl}`;
                    reject(false);
                });
        });
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for use in other modules
window.AuthManager = AuthManager;