import { describe, expect, it } from 'vitest';
import {
  getPublishedRestaurantBySlug,
  listMyRestaurants,
  listPublishedMenu,
  listPublishedRestaurants,
} from '../src/data/restaurantRepository.js';

function fakeClient({ rows = [], single = null, user = null, error = null } = {}) {
  const calls = [];
  const query = {
    select(value) { calls.push(['select', value]); return this; },
    eq(key, value) { calls.push(['eq', key, value]); return this; },
    ilike(key, value) { calls.push(['ilike', key, value]); return this; },
    order(key, options) { calls.push(['order', key, options]); return this; },
    limit(value) { calls.push(['limit', value]); return this; },
    maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve({ data: single, error }); },
    then(resolve, reject) { return Promise.resolve({ data: rows, error }).then(resolve, reject); },
  };
  return {
    calls,
    from(table) { calls.push(['from', table]); return query; },
    auth: { getUser: async () => ({ data: { user }, error: null }) },
  };
}

describe('restaurant data repository', () => {
  it('lists only published restaurants and maps database fields', async () => {
    const client = fakeClient({ rows: [{
      id: 'r1', name: 'La Mesa', slug: 'la-mesa', city: 'Rancagua',
      country_code: 'CL', logo_url: null, cover_url: null,
    }] });
    const result = await listPublishedRestaurants(client, { city: 'Rancagua', limit: 500 });
    expect(result[0]).toMatchObject({ id: 'r1', slug: 'la-mesa', city: 'Rancagua' });
    expect(client.calls).toContainEqual(['eq', 'is_published', true]);
    expect(client.calls).toContainEqual(['ilike', 'city', 'Rancagua']);
    expect(client.calls).toContainEqual(['limit', 100]);
  });

  it('returns null when a restaurant slug is not published or does not exist', async () => {
    const client = fakeClient({ single: null });
    await expect(getPublishedRestaurantBySlug(client, 'no-existe')).resolves.toBeNull();
    expect(client.calls).toContainEqual(['eq', 'slug', 'no-existe']);
    expect(client.calls).toContainEqual(['eq', 'is_published', true]);
  });

  it('scopes menu queries to one restaurant and public availability', async () => {
    const client = fakeClient({ rows: [{
      id: 'm1', restaurant_id: 'r1', name: 'Empanada', price_clp: 2500,
      is_available: true, is_published: true,
    }] });
    const result = await listPublishedMenu(client, 'r1');
    expect(result[0]).toMatchObject({ id: 'm1', restaurantId: 'r1', price: 2500 });
    expect(client.calls).toContainEqual(['eq', 'restaurant_id', 'r1']);
    expect(client.calls).toContainEqual(['eq', 'is_published', true]);
    expect(client.calls).toContainEqual(['eq', 'is_available', true]);
  });

  it('returns only restaurants assigned to the authenticated user', async () => {
    const client = fakeClient({ user: { id: 'user-1' }, rows: [{
      role: 'owner',
      restaurants: { id: 'r1', name: 'La Mesa', slug: 'la-mesa', is_published: false },
    }] });
    const result = await listMyRestaurants(client);
    expect(result).toEqual([{ id: 'r1', name: 'La Mesa', slug: 'la-mesa', is_published: false, role: 'owner' }]);
    expect(client.calls).toContainEqual(['eq', 'user_id', 'user-1']);
  });

  it('returns no memberships without an authenticated user', async () => {
    const client = fakeClient();
    await expect(listMyRestaurants(client)).resolves.toEqual([]);
    expect(client.calls.some(([kind]) => kind === 'from')).toBe(false);
  });

  it('fails clearly when Supabase is not configured', async () => {
    await expect(listPublishedRestaurants(null)).rejects.toThrow('Supabase no está configurado');
  });
});
