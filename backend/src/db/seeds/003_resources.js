import { deterministicId } from '../../utils/id.js';

function catId(slug) {
  return deterministicId(`category:${slug}`);
}

const resources = [
  // Institucional
  { slug: 'sei', name: 'SEI', description: 'Sistema Eletrônico de Informações do CADE', url: 'https://sei.cade.gov.br', category: 'institucional', order_index: 1, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'intranet-cade', name: 'Intranet CADE', description: 'Portal intranet institucional', url: 'https://intranet.cade.gov.br', category: 'institucional', order_index: 2, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'wiki-cade', name: 'Wiki CADE', description: 'Base de conhecimento interno', url: 'https://wiki.cade.gov.br', category: 'institucional', order_index: 3, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'normas-cade', name: 'Portal de Normas CADE', description: 'Normas, portarias e resoluções', url: 'https://normas.cade.gov.br', category: 'institucional', order_index: 4 },
  { slug: 'bi-cade', name: 'BI CADE', description: 'Business Intelligence e painéis analíticos', url: 'https://bi.cade.gov.br', category: 'institucional', order_index: 5, requires_auth: 1, visibility: 'privileged' },
  { slug: 'ponto-eletronico', name: 'Sistema de Ponto Eletrônico', description: 'Registro e controle de ponto', url: 'https://ponto.cade.gov.br', category: 'institucional', order_index: 6, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'scdp', name: 'SCDP', description: 'Sistema de Concessão de Diárias e Passagens', url: 'https://www.scdp.gov.br', category: 'institucional', order_index: 7, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'sougov', name: 'SouGov', description: 'Portal do servidor público federal', url: 'https://sougov.servidor.gov.br', category: 'institucional', order_index: 8 },
  { slug: 'portal-servidor', name: 'Portal do Servidor', description: 'Serviços e benefícios para servidores', url: 'https://servidor.gov.br', category: 'institucional', order_index: 9 },

  // Produtividade
  { slug: 'microsoft-365', name: 'Microsoft 365', description: 'Outlook, Teams, OneDrive, SharePoint', url: 'https://microsoft365.com', category: 'produtividade', order_index: 1 },
  { slug: 'google-workspace', name: 'Google Workspace', description: 'Gmail, Meet, Drive, Docs', url: 'https://workspace.google.com', category: 'produtividade', order_index: 2 },

  // Governo Federal
  { slug: 'gov-br', name: 'gov.br', description: 'Portal de serviços do Governo Federal', url: 'https://www.gov.br', category: 'governo', order_index: 1 },
  { slug: 'dou', name: 'Diário Oficial da União', description: 'Publicações oficiais do governo', url: 'https://www.in.gov.br', category: 'governo', order_index: 2 },
  { slug: 'servicos-gov', name: 'Portal de Serviços', description: 'servicos.gov.br — carta de serviços ao cidadão', url: 'https://www.servicos.gov.br', category: 'governo', order_index: 3 },
  { slug: 'transparencia', name: 'Portal da Transparência', description: 'Dados abertos sobre gastos públicos', url: 'https://transparencia.gov.br', category: 'governo', order_index: 4 },
  { slug: 'compras-gov', name: 'Compras.gov.br', description: 'Compras governamentais — ComprasNet', url: 'https://www.compras.gov.br', category: 'governo', order_index: 5 },
  { slug: 'siape', name: 'SIAPE', description: 'Sistema Integrado de Administração de Pessoal', url: 'https://www.siapenet.gov.br', category: 'governo', order_index: 6, requires_auth: 1, visibility: 'authenticated' },
  { slug: 'siorg', name: 'SIORG', description: 'Sistema de Informações Organizacionais do Governo', url: 'https://siorg.gestao.gov.br', category: 'governo', order_index: 7 },

  // Segurança e Privacidade
  { slug: 'anpd', name: 'ANPD', description: 'Autoridade Nacional de Proteção de Dados', url: 'https://www.gov.br/anpd', category: 'seguranca', order_index: 1 },
  { slug: 'centro-excelencia-privacidade', name: 'Centro de Excelência em Privacidade e Segurança', description: 'Referências e boas práticas — gov.br', url: 'https://www.gov.br/governodigital/pt-br/seguranca-e-protecao-de-dados', category: 'seguranca', order_index: 2 },
  { slug: 'ppsi', name: 'PPSI — MGI/SGD', description: 'Programa de Privacidade e Segurança da Informação', url: 'https://www.gov.br/mgi/pt-br/assuntos/governanca-digital/seguranca-da-informacao', category: 'seguranca', order_index: 3 },
  { slug: 'ctir-gov', name: 'CTIR Gov', description: 'Centro de Tratamento de Incidentes de Redes', url: 'https://www.gov.br/ctir', category: 'seguranca', order_index: 4 },
  { slug: 'gsi-pr', name: 'GSI/PR', description: 'Gabinete de Segurança Institucional', url: 'https://www.gov.br/gsi', category: 'seguranca', order_index: 5 },

  // Financeiro (bancos)
  { slug: 'banco-brasil', name: 'Banco do Brasil', description: 'Internet banking — folha de pagamento', url: 'https://www.bb.com.br', category: 'financeiro', order_index: 1 },
  { slug: 'caixa', name: 'Caixa Econômica Federal', description: 'Internet banking — folha de pagamento', url: 'https://www.caixa.gov.br', category: 'financeiro', order_index: 2 },
  { slug: 'bradesco', name: 'Bradesco', description: 'Internet banking', url: 'https://www.bradesco.com.br', category: 'financeiro', order_index: 3 },
  { slug: 'itau', name: 'Itaú', description: 'Internet banking', url: 'https://www.itau.com.br', category: 'financeiro', order_index: 4 },
  { slug: 'santander', name: 'Santander', description: 'Internet banking', url: 'https://www.santander.com.br', category: 'financeiro', order_index: 5 },
];

export function seed(db) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO resources
       (id, name, slug, description, url, category_id, order_index,
        status, is_external, requires_auth, visibility)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?)`,
  );

  for (const r of resources) {
    insert.run(
      deterministicId(`resource:${r.slug}`),
      r.name,
      r.slug,
      r.description,
      r.url,
      catId(r.category),
      r.order_index,
      r.requires_auth ?? 0,
      r.visibility ?? 'all',
    );
  }
}
