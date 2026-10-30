import { describe, expect, it } from 'vitest';
import {
  calculateCartTotal,
  filterRestaurants,
  hasUniqueRestaurantIds,
  normalizeCart,
  readFavorites,
  writeFavorites,
} from '../src/domain/restaurant.js';

const restaurants = [
  { id: 1, name: 'La Mesa Chilena', type: 'Cocina chilena', offer: 'Favoritos', tags: ['Chilena'] },
  { id: 2, name: 'Pizzería Napoli', type: 'Pizzas', offer: 'Para compartir', tags: ['Pizzas'] },
  { id: 3, name: 'Verde Vivo', type: 'Vegetariano', offer: 'Opciones frescas', tags: ['Veggie'] },
];

describe('restaurant discovery', () => {
  it('filters categories without case sensitivity', () => {
    expect(filterRestaurants(restaurants, 'pIzZaS').map((item) => item.id)).toEqual([2]);
  });

  it('searches restaurant name, type, offer and tags', () => {
    expect(filterRestaurants(restaurants, 'Todo', 'frescas').map((item) => item.id)).toEqual([3]);
    expect(filterRestaurants(restaurants, 'Todo', 'chilena').map((item) => item.id)).toEqual([1]);
  });

  it('returns all restaurants when category and query are empty', () => {
    expect(filterRestaurants(restaurants)).toHaveLength(3);
  });

  it('detects duplicate restaurant identifiers', () => {
    expect(hasUniqueRestaurantIds(restaurants)).toBe(true);
    expect(hasUniqueRestaurantIds([...restaurants, { ...restaurants[0] }])).toBe(false);
  });
});

describe('cart calculations', () => {
  const menu = [{ id: 1, price: 2990 }, { id: 2, price: 5000 }];

  it('removes invalid ids and invalid quantities from a cart', () => {
    expect(normalizeCart({ 1: 2, 2: 0, 3: 4, 4: -1, 5: 1.5 }, [1, 2])).toEqual({ 1: 2 });
  });

  it('calculates the total only from valid positive quantities', () => {
    expect(calculateCartTotal(menu, { 1: 2, 2: 1, 3: 99, 1.5: 10 })).toBe(10980);
  });

  it('returns zero for an empty cart', () => {
    expect(calculateCartTotal(menu, {})).toBe(0);
  });
});

describe('demo favorites persistence', () => {
  it('saves unique integer ids', () => {
    const data = new Map();
    const storage = { setItem: (key, value) => data.set(key, value), getItem: (key) => data.get(key) };
    expect(writeFavorites(storage, [1, 1, 2, '3'])).toBe(true);
    expect(JSON.parse(data.get('sabores-favorites-demo'))).toEqual([1, 2]);
  });

  it('handles malformed storage safely', () => {
    const storage = { getItem: () => '{invalid json' };
    expect(readFavorites(storage)).toEqual([]);
  });

  it('handles storage being unavailable', () => {
    expect(readFavorites(null)).toEqual([]);
    expect(writeFavorites(null, [1])).toBe(true);
  });
});
