class LoginModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const content = document.createElement('div');
    content.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h2');
    title.id = 'modal-title';
    title.textContent = 'Fazer Login';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Fechar modal');
    closeBtn.textContent = '✕';

    closeBtn.addEventListener('click', () => {
      this.close();
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    const form = document.createElement('form');
    form.className = 'modal-form';
    form.setAttribute('novalidate', '');

    // Email field
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';

    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'login-email';
    emailLabel.textContent = 'Email';

    const emailInput = document.createElement('input');
    emailInput.id = 'login-email';
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.placeholder = 'seu@email.com';
    emailInput.setAttribute('autocomplete', 'email');

    const emailError = document.createElement('div');
    emailError.className = 'error';
    emailError.setAttribute('role', 'alert');

    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    emailGroup.appendChild(emailError);

    // Password field
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';

    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'login-password';
    passwordLabel.textContent = 'Senha';

    const passwordInput = document.createElement('input');
    passwordInput.id = 'login-password';
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.required = true;
    passwordInput.placeholder = 'Sua senha';
    passwordInput.setAttribute('autocomplete', 'current-password');

    const passwordError = document.createElement('div');
    passwordError.className = 'error';
    passwordError.setAttribute('role', 'alert');

    passwordGroup.appendChild(passwordLabel);
    passwordGroup.appendChild(passwordInput);
    passwordGroup.appendChild(passwordError);

    // General error
    const generalError = document.createElement('div');
    generalError.className = 'error';
    generalError.setAttribute('role', 'alert');
    this.generalError = generalError;

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'modal-submit';
    submitBtn.textContent = 'Entrar';
    this.submitBtn = submitBtn;

    form.appendChild(emailGroup);
    form.appendChild(passwordGroup);
    form.appendChild(generalError);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validação client-side
      let isValid = true;

      if (!email) {
        emailError.textContent = 'Email é obrigatório';
        isValid = false;
      } else if (!this.isValidEmail(email)) {
        emailError.textContent = 'Email inválido';
        isValid = false;
      } else {
        emailError.textContent = '';
      }

      if (!password) {
        passwordError.textContent = 'Senha é obrigatória';
        isValid = false;
      } else {
        passwordError.textContent = '';
      }

      if (isValid) {
        this.generalError.textContent = '';
        this.submitBtn.disabled = true;

        const event = new CustomEvent('login-submitted', {
          detail: { email, password },
          bubbles: true,
        });
        this.dispatchEvent(event);
      }
    });

    content.appendChild(header);
    content.appendChild(form);
    modal.appendChild(content);

    this.appendChild(modal);
    this.modal = modal;
    this.form = form;
    this.emailInput = emailInput;
    this.passwordInput = passwordInput;
  }

  setupListeners() {
    this.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    });
  }

  open() {
    this.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.setAttribute('aria-hidden', 'true');
    this.form.reset();
    this.generalError.textContent = '';
    this.submitBtn.disabled = false;
  }

  showError(message) {
    this.generalError.textContent = message;
    this.submitBtn.disabled = false;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

customElements.define('login-modal', LoginModal);
