class HubHeader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupListeners();
    this.updateUserInfo();
  }

  render() {
    const header = document.createElement('header');
    header.className = 'hub-header';
    header.setAttribute('role', 'banner');

    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.textContent = 'CADE HUB';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Buscar recursos...';
    searchInput.setAttribute('aria-label', 'Buscar recursos');
    this.searchInput = searchInput;

    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';

    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Alternar tema claro/escuro');
    themeToggle.setAttribute('type', 'button');
    themeToggle.textContent = '🌙';
    this.themeToggle = themeToggle;

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.setAttribute('aria-live', 'polite');
    this.userInfo = userInfo;

    userMenu.appendChild(themeToggle);
    userMenu.appendChild(userInfo);

    header.appendChild(logo);
    header.appendChild(searchInput);
    header.appendChild(userMenu);

    this.appendChild(header);
  }

  setupListeners() {
    this.searchInput.addEventListener('input', (e) => {
      const event = new CustomEvent('search', {
        detail: { query: e.target.value },
        bubbles: true,
      });
      this.dispatchEvent(event);
    });

    this.themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';

      const event = new CustomEvent('theme-changed', {
        detail: { theme: newTheme },
        bubbles: true,
      });
      this.dispatchEvent(event);
    });
  }

  async updateUserInfo() {
    try {
      const response = await fetch('/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        const userText = document.createElement('span');
        userText.textContent = user.name || user.email;

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.setAttribute('type', 'button');
        logoutBtn.setAttribute('aria-label', 'Fazer logout');
        logoutBtn.textContent = 'Sair';

        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem('token');
          location.reload();
        });

        this.userInfo.innerHTML = '';
        this.userInfo.appendChild(userText);
        this.userInfo.appendChild(logoutBtn);
      } else {
        const loginBtn = document.createElement('button');
        loginBtn.className = 'login-btn';
        loginBtn.setAttribute('type', 'button');
        loginBtn.textContent = 'Login';

        loginBtn.addEventListener('click', () => {
          const modal = document.getElementById('login-modal');
          if (modal) {
            modal.setAttribute('aria-hidden', 'false');
          }
        });

        this.userInfo.innerHTML = '';
        this.userInfo.appendChild(loginBtn);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      const loginBtn = document.createElement('button');
      loginBtn.className = 'login-btn';
      loginBtn.setAttribute('type', 'button');
      loginBtn.textContent = 'Login';

      loginBtn.addEventListener('click', () => {
        const modal = document.getElementById('login-modal');
        if (modal) {
          modal.setAttribute('aria-hidden', 'false');
        }
      });

      this.userInfo.innerHTML = '';
      this.userInfo.appendChild(loginBtn);
    }
  }
}

customElements.define('hub-header', HubHeader);
