export async function fetchResources(category = null, search = null, limit = 20, offset = 0) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.append('category', category);
    }
    if (search) {
      params.append('search', search);
    }
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const url = `/api/v1/resources?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar recursos: ${response.status}`);
    }

    const data = await response.json();
    return {
      resources: data.resources || [],
      total: data.total || 0,
      limit: data.limit || limit,
      offset: data.offset || offset,
    };
  } catch (error) {
    console.error('Erro em fetchResources:', error);
    return {
      resources: [],
      total: 0,
      limit,
      offset,
    };
  }
}

export async function fetchResourceById(id) {
  try {
    const response = await fetch(`/api/v1/resources/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar recurso: ${response.status}`);
    }

    const data = await response.json();
    return data.resource || null;
  } catch (error) {
    console.error('Erro em fetchResourceById:', error);
    return null;
  }
}
