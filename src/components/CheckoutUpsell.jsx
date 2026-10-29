import React from 'react';
import { Plus } from 'lucide-react';

/**
 * Contextual add-on suggestions for the demo checkout.
 * The parent supplies real menu items and an add handler.
 * This component does not claim availability or submit an order.
 */
export default function CheckoutUpsell({ items, money, onAdd }) {
  if (!items?.length) return null;
  return (
    <section className="checkout-upsell" aria-label="Complementa tu pedido">
      <div className="upsell-heading">
        <span className="section-kicker">UN EXTRA PARA DISFRUTAR</span>
        <strong>¿Lo acompañamos con algo más?</strong>
      </div>
      <div className="upsell-items">
        {items.slice(0, 2).map((item) => (
          <article className="upsell-item" key={item.id}>
            <span className="upsell-emoji" aria-hidden="true">{item.emoji}</span>
            <div className="upsell-copy">
              <strong>{item.name}</strong>
              <span>{money(item.price)}</span>
            </div>
            <button type="button" className="upsell-add" onClick={() => onAdd(item.id)} aria-label={'Agregar ' + item.name + ' al pedido'}>
              <Plus size={16} />
            </button>
          </article>
        ))}
      </div>
      <p className="demo-note">Sugerencias de la carta demostrativa; disponibilidad por confirmar.</p>
    </section>
  );
}
