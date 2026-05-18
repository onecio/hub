// Bootstrap da aplicação HUB Institucional - Fase 4
import { fetchCategories } from './modules/categories.js';
import { fetchResources } from './modules/resources.js';
import { getFavorites, addFavorite, removeFavorite } from './modules/favorites.js';

const state = {
  categories: [],
  resources: [],
  favorites: new Set(),
  currentCategory: 'all',
  currentSearch: '',
  isAuthenticated: false,
};

async function init() {
  // Restaurar tema
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Verificar health
  try {
    const response = await fetch('/health');
    if (!response.ok) throw new Error('Health check failed');
  } catch (error) {
    console.error('Backend indisponível:', error);
    showError('Serviço temporariamente indisponível.');
    return;
  }

  // Carregar categorias
  state.categories = await fetchCategories();

  // Carregar recursos iniciais
  await loadResources('all', '');

  // Verificar autenticação
  await checkAuth();

  // Setup event listeners
  setupEventListeners();
}

async function loadResources(category, search) {
  const { resources } = await fetchResources(
    category !== 'all' ? category : null,
    search || null,
    20,
    0
  );

  state.resources = resources;
  state.currentCategory = category;
  state.currentSearch = search;

  // Atualizar grid com favoritos já carregados
  updateResourceGrid();
}

function updateResourceGrid() {
  const grid = document.getElementById('resources');
  if (grid) {
    grid.data = state.resources;
    grid.favoritesSet = Array.from(state.favorites);
  }
}

async function checkAuth() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      state.isAuthenticated = false;
      return;
    }

    const response = await fetch('/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      state.isAuthenticated = true;

      // Carregar favoritos
      const favorites = await getFavorites();
      state.favorites = new Set(favorites.map(f => f.id));
      updateResourceGrid();
    } else {
      localStorage.removeItem('token');
      state.isAuthenticated = false;
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    state.isAuthenticated = false;
  }
}

function setupEventListeners() {
  const header = document.getElementById('header');
  const categories = document.getElementById('categories');
  const resources = document.getElementById('resources');
  const loginModal = document.getElementById('login-modal');

  // Renderizar categorias
  if (categories) {
    categories.data = state.categories;
  }

  // Renderizar recursos iniciais
  if (resources) {
    resources.data = state.resources;
  }

  // Event: search
  if (header) {
    header.addEventListener('search', async (e) => {
      const query = e.detail.query;
      await loadResources(state.currentCategory, query);
    });
  }

  // Event: category-selected
  if (categories) {
    categories.addEventListener('category-selected', async (e) => {
      const categoryId = e.detail.categoryId;
      await loadResources(categoryId, state.currentSearch);
    });
  }

  // Event: favorite-toggled
  if (resources) {
    resources.addEventListener('favorite-toggled', async (e) => {
      const { resourceId, isFavorited } = e.detail;

      if (!state.isAuthenticated) {
        // Abrir login modal
        if (loginModal) {
          loginModal.open();
        }
        return;
      }

      try {
        if (isFavorited) {
          await addFavorite(resourceId);
          state.favorites.add(resourceId);
        } else {
          await removeFavorite(resourceId);
          state.favorites.delete(resourceId);
        }
        updateResourceGrid();
      } catch (error) {
        console.error('Erro ao atualizar favorito:', error);
      }
    });
  }

  // Event: login-submitted
  if (loginModal) {
    loginModal.addEventListener('login-submitted', async (e) => {
      const { email, password } = e.detail;

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          loginModal.showError(error.message || 'Falha ao fazer login');
          return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);

        loginModal.close();
        await checkAuth();

        // Atualizar header
        const headerEl = document.getElementById('header');
        if (headerEl) {
          headerEl.updateUserInfo();
        }
      } catch (error) {
        console.error('Erro no login:', error);
        loginModal.showError('Erro ao fazer login. Tente novamente.');
      }
    });
  }
}

function showError(message) {
  const main = document.querySelector('main');
  if (main) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;
    main.insertAdjacentElement('afterbegin', errorDiv);
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', init);

// Se document já foi carregado
if (document.readyState !== 'loading') {
  init();
}
