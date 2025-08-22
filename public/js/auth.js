class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this.init();
  }

  init() {
    this.updateUI();
    this.bindEvents();
  }

  bindEvents() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('loginModal');
      });
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('registerModal');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    if (closeLoginModal) {
      closeLoginModal.addEventListener('click', () => {
        this.hideModal('loginModal');
      });
    }

    if (closeRegisterModal) {
      closeRegisterModal.addEventListener('click', () => {
        this.hideModal('registerModal');
      });
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      this.clearAlert(modalId.replace('Modal', 'Alert'));
    }
  }

  updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (this.isAuthenticated()) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (registerBtn) registerBtn.classList.add('hidden');
      if (userInfo) userInfo.classList.remove('hidden');
      if (userName && this.user) {
        userName.textContent = `こんにちは、${this.user.name}さん`;
      }
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (registerBtn) registerBtn.classList.remove('hidden');
      if (userInfo) userInfo.classList.add('hidden');
    }
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const alertElement = document.getElementById('loginAlert');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        this.updateUI();
        this.hideModal('loginModal');
        this.showAlert(alertElement, data.message, 'success');
        location.reload();
      } else {
        this.showAlert(alertElement, data.error, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showAlert(alertElement, 'ログイン中にエラーが発生しました', 'error');
    }
  }

  async handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const alertElement = document.getElementById('registerAlert');

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.showAlert(alertElement, data.message + ' ログインしてください。', 'success');
        setTimeout(() => {
          this.hideModal('registerModal');
          this.showModal('loginModal');
        }, 2000);
      } else {
        this.showAlert(alertElement, data.error, 'error');
      }
    } catch (error) {
      console.error('Register error:', error);
      this.showAlert(alertElement, '登録中にエラーが発生しました', 'error');
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    this.updateUI();
    location.reload();
  }

  isAuthenticated() {
    return this.token && this.user;
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  showAlert(element, message, type) {
    if (element) {
      element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
  }

  clearAlert(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
    }
  }
}

// グローバルなAuthManagerインスタンス
window.authManager = new AuthManager();