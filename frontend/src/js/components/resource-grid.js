class ResourceGrid extends HTMLElement {
  constructor() {
    super();
    this.resources = [];
    this.favorites = new Set();
  }

  connectedCallback() {
    this.setAttribute('role', 'main');
  }

  set data(resources) {
    this.resources = resources;
    this.render();
  }

  set favoritesSet(favoriteIds) {
    this.favorites = new Set(favoriteIds);
    this.updateFavoriteStates();
  }

  render() {
    this.innerHTML = '';

    if (this.resources.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.setAttribute('role', 'status');
      emptyMsg.textContent = 'Nenhum recurso encontrado.';
      this.appendChild(emptyMsg);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'resource-grid';

    this.resources.forEach((resource) => {
      const card = document.createElement('a');
      card.className = 'resource-card';
      card.href = resource.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.setAttribute('role', 'article');

      const header = document.createElement('div');
      header.className = 'resource-card-header';

      const iconContainer = document.createElement('div');
      iconContainer.className = 'resource-card-icon';
      iconContainer.setAttribute('aria-hidden', 'true');

      if (resource.icon_svg) {
        const svg = document.createElement('div');
        svg.innerHTML = resource.icon_svg;
        iconContainer.appendChild(svg.firstElementChild || svg);
      } else {
        const placeholder = document.createElement('span');
        placeholder.textContent = '📄';
        iconContainer.appendChild(placeholder);
      }

      const titleContainer = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'resource-card-title';
      title.textContent = resource.name;
      titleContainer.appendChild(title);

      header.appendChild(iconContainer);
      header.appendChild(titleContainer);

      const body = document.createElement('div');
      body.className = 'resource-card-body';

      const description = document.createElement('p');
      description.className = 'resource-card-description';
      description.textContent = resource.description;

      body.appendChild(description);

      const footer = document.createElement('div');
      footer.className = 'resource-card-footer';

      const badges = document.createElement('div');
      badges.className = 'resource-card-badges';

      if (resource.is_new) {
        const newBadge = document.createElement('span');
        newBadge.className = 'badge new';
        newBadge.textContent = 'Novo';
        badges.appendChild(newBadge);
      }

      if (resource.is_external) {
        const externalBadge = document.createElement('span');
        externalBadge.className = 'badge';
        externalBadge.textContent = 'Externo';
        badges.appendChild(externalBadge);
      }

      footer.appendChild(badges);

      const favoriteBtn = document.createElement('button');
      favoriteBtn.className = 'favorite-btn';
      favoriteBtn.setAttribute('type', 'button');
      favoriteBtn.setAttribute('aria-label', `Adicionar ${resource.name} aos favoritos`);
      const isFavorited = this.favorites.has(resource.id);
      favoriteBtn.classList.toggle('active', isFavorited);
      favoriteBtn.textContent = isFavorited ? '❤️' : '🤍';

      favoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const event = new CustomEvent('favorite-toggled', {
          detail: {
            resourceId: resource.id,
            isFavorited: !isFavorited,
          },
          bubbles: true,
        });
        this.dispatchEvent(event);
      });

      footer.appendChild(favoriteBtn);
      body.appendChild(footer);

      card.appendChild(header);
      card.appendChild(body);

      grid.appendChild(card);
    });

    this.appendChild(grid);
  }

  updateFavoriteStates() {
    const buttons = this.querySelectorAll('.favorite-btn');
    buttons.forEach((btn, index) => {
      const resource = this.resources[index];
      if (resource) {
        const isFavorited = this.favorites.has(resource.id);
        btn.classList.toggle('active', isFavorited);
        btn.textContent = isFavorited ? '❤️' : '🤍';
        btn.setAttribute('aria-label',
          isFavorited
            ? `Remover ${resource.name} dos favoritos`
            : `Adicionar ${resource.name} aos favoritos`
        );
      }
    });
  }
}

customElements.define('resource-grid', ResourceGrid);
