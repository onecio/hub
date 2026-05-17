// Bootstrap da aplicação HUB Institucional
// Fase 5: inicialização de roteamento, autenticação, componentes Web Components
import { api } from './api.js';

async function init() {
  // Verificar disponibilidade do backend antes de renderizar
  try {
    await api.get('/health');
  } catch {
    document.getElementById('app')?.replaceChildren(
      Object.assign(document.createElement('p'), {
        textContent: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
        className: 'error-state',
      })
    );
    return;
  }

  // Fase 5: carregar módulo de roteamento e renderizar página inicial
  document.getElementById('app')?.replaceChildren(
    Object.assign(document.createElement('p'), {
      textContent: 'HUB Institucional — Fase 1 (scaffold). Implementação completa na Fase 5.',
    })
  );
}

init();
