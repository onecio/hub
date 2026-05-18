class CategoryFilter extends HTMLElement {
  constructor() {
    super();
    this.categories = [];
    this.activeCategory = null;
  }

  connectedCallback() {
    this.setAttribute('role', 'tablist');
  }

  set data(categories) {
    this.categories = categories;
    this.render();
  }

  render() {
    this.innerHTML = '';

    const filterContainer = document.createElement('div');
    filterContainer.className = 'category-filter';

    // Botão "Todos"
    const allBtn = document.createElement('button');
    allBtn.className = 'category-filter-btn active';
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', 'true');
    allBtn.setAttribute('data-category', 'all');
    allBtn.textContent = 'Todos';

    allBtn.addEventListener('click', () => {
      this.setActive('all');
      const event = new CustomEvent('category-selected', {
        detail: { categoryId: 'all' },
        bubbles: true,
      });
      this.dispatchEvent(event);
    });

    filterContainer.appendChild(allBtn);
    this.activeBtn = allBtn;

    // Botões de categorias
    this.categories.forEach((category) => {
      const btn = document.createElement('button');
      btn.className = 'category-filter-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('data-category', category.id);
      btn.textContent = category.name;

      btn.addEventListener('click', () => {
        this.setActive(category.id);
        const event = new CustomEvent('category-selected', {
          detail: { categoryId: category.id },
          bubbles: true,
        });
        this.dispatchEvent(event);
      });

      filterContainer.appendChild(btn);
    });

    this.appendChild(filterContainer);
  }

  setActive(categoryId) {
    document.querySelectorAll('.category-filter-btn').forEach((btn) => {
      const isActive = btn.getAttribute('data-category') === categoryId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    this.activeCategory = categoryId;
  }
}

customElements.define('category-filter', CategoryFilter);
