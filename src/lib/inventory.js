import { isSupabaseConfigured, supabase } from './supabase.js';

export { isSupabaseConfigured };

export async function getInventoryWorkspace() {
  if (!isSupabaseConfigured) return { mode: 'demo', user: null, restaurant: null, items: [] };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return { mode: 'auth-required', user: null, restaurant: null, items: [] };

  const { data: memberships, error: memberError } = await supabase
    .from('restaurant_members')
    .select('role, restaurant:restaurants(id,name)')
    .order('created_at', { ascending: true });
  if (memberError) throw memberError;
  const membership = (memberships || []).find(row => row.restaurant);
  if (!membership) return { mode: 'onboarding', user, restaurant: null, items: [] };

  const restaurant = membership.restaurant;
  const { data: rows, error: itemError } = await supabase
    .from('inventory_items')
    .select('id,name,category,quantity,unit,minimum_quantity,freshness_days,unit_cost')
    .eq('restaurant_id', restaurant.id)
    .order('name');
  if (itemError) throw itemError;
  return {
    mode: 'connected',
    user,
    restaurant: { ...restaurant, role: membership.role },
    items: (rows || []).map(row => ({
      id: row.id, name: row.name, category: row.category,
      qty: Number(row.quantity), unit: row.unit, min: Number(row.minimum_quantity),
      days: Number(row.freshness_days), cost: Number(row.unit_cost),
    })),
  };
}

export async function signInInventory(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpInventory(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.');
}

export async function signOutInventory() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createInventoryRestaurant(name) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Inicia sesión antes de crear el restaurante.');
  const { error } = await supabase.from('restaurants').insert({ name: name.trim(), owner_id: user.id });
  if (error) throw error;
}

export async function createInventoryItem(restaurantId, item) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase.from('inventory_items').insert({
    restaurant_id: restaurantId, name: item.name.trim(), category: item.category || 'General',
    quantity: Number(item.qty), unit: item.unit || 'kg', minimum_quantity: Number(item.min ?? 0),
    freshness_days: Number(item.days ?? 7), unit_cost: Number(item.cost ?? 0), created_by: user?.id,
  }).select('id,name,category,quantity,unit,minimum_quantity,freshness_days,unit_cost').single();
  if (error) throw error;
  return { id: data.id, name: data.name, category: data.category, qty: Number(data.quantity), unit: data.unit, min: Number(data.minimum_quantity), days: Number(data.freshness_days), cost: Number(data.unit_cost) };
}

export async function updateInventoryItem(restaurantId, item, previousQty) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { error } = await supabase.from('inventory_items').update({
    quantity: Number(item.qty), minimum_quantity: Number(item.min),
    freshness_days: Number(item.days), unit_cost: Number(item.cost), category: item.category,
  }).eq('id', item.id).eq('restaurant_id', restaurantId);
  if (error) throw error;
  if (Number(item.qty) !== Number(previousQty)) {
    const { error: movementError } = await supabase.from('inventory_movements').insert({
      restaurant_id: restaurantId, inventory_item_id: item.id, actor_id: user?.id,
      movement_type: 'adjustment', quantity_delta: Number(item.qty) - Number(previousQty),
      quantity_after: Number(item.qty), note: 'Ajuste desde el panel de inventario',
    });
    if (movementError) throw movementError;
  }
}

export async function createInventoryPromotionDraft(restaurantId, draft) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase.from('promotion_drafts').insert({
    restaurant_id: restaurantId, ingredient_name: draft.ingredient, title: draft.name,
    suggested_discount: Number(draft.discount), reason: draft.reason, created_by: user?.id,
  }).select('id').single();
  if (error) throw error;
  return data.id;
}
