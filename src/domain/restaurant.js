export function filterRestaurants(places, category = 'Todo', query = '') {
  const normalizedQuery = String(query).trim().toLocaleLowerCase('es-CL');
  const normalizedCategory = String(category).trim().toLocaleLowerCase('es-CL');

  return places.filter((place) => {
    const categoryMatches = normalizedCategory === 'todo'
      || (place.tags || []).some((tag) => tag.toLocaleLowerCase('es-CL') === normalizedCategory)
      || [place.type, place.name].some((value) => String(value || '').toLocaleLowerCase('es-CL').includes(normalizedCategory));

    const searchable = [place.name, place.type, place.offer, ...(place.tags || [])]
      .join(' ')
      .toLocaleLowerCase('es-CL');

    return categoryMatches && searchable.includes(normalizedQuery);
  });
}

export function getUniqueRestaurantIds(places) {
  return places.map((place) => place.id);
}

export function hasUniqueRestaurantIds(places) {
  const ids = getUniqueRestaurantIds(places);
  return ids.every((id, index) => ids.indexOf(id) === index);
}

export function readFavorites(storage, key = 'sabores-favorites-demo') {
  try {
    const parsed = JSON.parse(storage?.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

export function writeFavorites(storage, favorites, key = 'sabores-favorites-demo') {
  try {
    storage?.setItem(key, JSON.stringify([...new Set(favorites.filter(Number.isInteger))]));
    return true;
  } catch {
    return false;
  }
}

export function normalizeCart(cart, validIds) {
  const valid = new Set(validIds);
  return Object.fromEntries(
    Object.entries(cart || {})
      .map(([id, quantity]) => [Number(id), Number(quantity)])
      .filter(([id, quantity]) => valid.has(id) && Number.isInteger(quantity) && quantity > 0)
      .map(([id, quantity]) => [id, quantity])
  );
}

export function calculateCartTotal(items, cart) {
  return items.reduce((total, item) => {
    const quantity = Number(cart?.[item.id] || 0);
    return total + item.price * (Number.isInteger(quantity) && quantity > 0 ? quantity : 0);
  }, 0);
}
