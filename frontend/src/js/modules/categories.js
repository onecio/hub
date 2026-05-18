export async function fetchCategories() {
  try {
    const response = await fetch('/api/v1/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar categorias: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Erro em fetchCategories:', error);
    return [];
  }
}
