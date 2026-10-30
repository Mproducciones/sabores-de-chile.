function requireClient(client) {
  if (!client) throw new Error('Supabase no está configurado. La aplicación sigue en modo demostración.');
  return client;
}

function unwrap(result, context) {
  if (result.error) throw new Error(context + ': ' + result.error.message);
  return result.data;
}

export async function listPublishedRestaurants(client, { city, limit = 50 } = {}) {
  const db = requireClient(client);
  let query = db
    .from('restaurants')
    .select('id,name,slug,description,logo_url,cover_url,address,city,region,country_code')
    .eq('is_published', true)
    .order('name', { ascending: true })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 100));

  if (city) query = query.ilike('city', city);
  const data = unwrap(await query, 'No se pudieron cargar los restaurantes');
  return (data || []).map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description || '',
    logoUrl: restaurant.logo_url || null,
    coverUrl: restaurant.cover_url || null,
    address: restaurant.address || '',
    city: restaurant.city || '',
    region: restaurant.region || '',
    countryCode: restaurant.country_code || 'CL',
  }));
}

export async function getPublishedRestaurantBySlug(client, slug) {
  const db = requireClient(client);
  if (!String(slug || '').trim()) throw new Error('Debes indicar el identificador del restaurante.');

  const data = unwrap(await db
    .from('restaurants')
    .select('id,name,slug,description,logo_url,cover_url,address,city,region,country_code')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle(), 'No se pudo cargar el restaurante');

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    logoUrl: data.logo_url || null,
    coverUrl: data.cover_url || null,
    address: data.address || '',
    city: data.city || '',
    region: data.region || '',
    countryCode: data.country_code || 'CL',
  };
}

export async function listPublishedMenu(client, restaurantId) {
  const db = requireClient(client);
  if (!String(restaurantId || '').trim()) throw new Error('Debes indicar el restaurante para consultar su carta.');

  const data = unwrap(await db
    .from('menu_items')
    .select('id,restaurant_id,category_id,name,description,image_url,price_clp,preparation_minutes,is_available')
    .eq('restaurant_id', restaurantId)
    .eq('is_published', true)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true }), 'No se pudo cargar la carta');

  return (data || []).map((item) => ({
    id: item.id,
    restaurantId: item.restaurant_id,
    categoryId: item.category_id,
    name: item.name,
    description: item.description || '',
    imageUrl: item.image_url || null,
    price: item.price_clp,
    preparationMinutes: item.preparation_minutes,
    available: item.is_available,
  }));
}

export async function listMyRestaurants(client) {
  const db = requireClient(client);
  const userResult = await db.auth.getUser();
  if (userResult.error) throw new Error('No se pudo validar la sesión: ' + userResult.error.message);
  if (!userResult.data?.user) return [];

  const data = unwrap(await db
    .from('restaurant_members')
    .select('role,restaurants(id,name,slug,is_published)')
    .eq('user_id', userResult.data.user.id)
    .order('created_at', { ascending: true }), 'No se pudieron cargar tus restaurantes');

  return (data || []).filter((membership) => membership.restaurants).map((membership) => ({
    ...membership.restaurants,
    role: membership.role,
  }));
}
