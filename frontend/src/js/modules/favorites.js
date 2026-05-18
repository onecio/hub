export async function addFavorite(resourceId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Não autenticado');
    }

    const response = await fetch('/api/v1/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        resource_id: resourceId,
      }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Já adicionado aos favoritos');
      }
      throw new Error(`Erro ao adicionar favorito: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em addFavorite:', error);
    throw error;
  }
}

export async function removeFavorite(resourceId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Não autenticado');
    }

    const response = await fetch(`/api/v1/favorites/${resourceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao remover favorito: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro em removeFavorite:', error);
    throw error;
  }
}

export async function getFavorites() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    const response = await fetch('/api/v1/users/me/favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar favoritos: ${response.status}`);
    }

    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Erro em getFavorites:', error);
    return [];
  }
}
