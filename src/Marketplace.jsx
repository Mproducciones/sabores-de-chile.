import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Heart, Star, Clock3, ArrowRight, Utensils, SlidersHorizontal, Tag, Home, Compass, TicketPercent, UserRound, Pizza, Fish, Leaf, Coffee } from 'lucide-react';
import './marketplace.css';
import { filterRestaurants, readFavorites, writeFavorites } from './domain/restaurant.js';

const places = [
  { id: 1, name: 'La Mesa Chilena', type: 'Cocina chilena', rating: '4,8', time: '20–35 min', offer: 'Favoritos de la casa', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85', tags: ['Chilena', 'Casera'] },
  { id: 2, name: 'Costa & Fuego', type: 'Mar y parrilla', rating: '4,7', time: '25–40 min', offer: 'Menú del día', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85', tags: ['Mariscos', 'Parrilla'] },
  { id: 3, name: 'Verde Vivo', type: 'Fresco y vegetariano', rating: '4,9', time: '15–30 min', offer: 'Opciones frescas', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85', tags: ['Veggie', 'Fresco'] },
  { id: 4, name: 'La Buena Masa', type: 'Horno y tradición', rating: '4,6', time: '20–35 min', offer: 'Para compartir', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85', tags: ['Empanadas', 'Casera'] },
  { id: 5, name: 'Burger House', type: 'Hamburguesas', rating: '4,5', time: '20–30 min', offer: 'Combos de la casa', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85', tags: ['Hamburguesas'] },
  { id: 6, name: 'Pizzería Napoli', type: 'Pizzas', rating: '4,4', time: '25–40 min', offer: 'Pizza para compartir', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85', tags: ['Pizzas'] },
];
const categories = ['Todo', 'Chilena', 'Hamburguesas', 'Pizzas', 'Mariscos', 'Veggie', 'Empanadas'];
export default function Marketplace() {
  const [category, setCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState(() => readFavorites(typeof window === 'undefined' ? null : window.localStorage));
  useEffect(() => { writeFavorites(window.localStorage, favorites); }, [favorites]);
  const filtered = useMemo(() => filterRestaurants(places, category, query), [category, query]);
  return <main className="market-page">
    <header className="market-topbar">
      <a className="market-brand" href="/"><span className="market-brand-mark"><Utensils size={19}/></span><span>sabores <i>de chile</i><small>DESCUBRE · ELIGE · DISFRUTA</small></span></a>
      <div className="market-location"><MapPin size={15}/><span><small>ENTREGANDO EN</small><b>Rancagua, Chile</b></span></div>
      <a className="market-local-link" href="/restaurante?local=La%20Mesa%20Chilena">Ver carta de ejemplo <ArrowRight size={15}/></a>
    </header>
    <section className="market-hero">
      <div className="market-hero-copy"><span className="market-eyebrow"><i/> SABORES CERCA DE TI</span><h1>Sabores<br/><em>de Chile.</em></h1><p>Los sabores que te gustan, directo a tu mesa.</p><label className="market-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca un restaurante o algo rico"/><SlidersHorizontal size={17}/></label><div className="market-benefits"><span><Clock3 size={15}/> Opciones cerca de ti</span><span><Tag size={15}/> Promociones del día</span></div></div>
      <div className="market-hero-photo"><img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=90" alt="Mesa con comida fresca"/><div className="market-photo-note"><small>UNA BUENA MESA</small><b>Empieza por<br/>lo que se te antoja.</b></div><span className="market-photo-index">01 / SABORES</span></div>
    </section>
    <section className="market-home-categories" aria-label="Categorías">
      <a href="#explorar" onClick={()=>setCategory('Todo')}><span><Utensils size={21}/></span><small>Todos</small></a>
      <a href="#explorar" onClick={()=>setCategory('Chilena')}><span><Coffee size={21}/></span><small>Chilenos</small></a>
      <a href="#explorar" onClick={()=>setCategory('Hamburguesas')}><span><Utensils size={21}/></span><small>Hamburguesas</small></a>
      <a href="#explorar" onClick={()=>setCategory('Pizzas')}><span><Pizza size={21}/></span><small>Pizzas y más</small></a>
      <a href="#explorar" onClick={()=>setCategory('Veggie')}><span><Leaf size={21}/></span><small>Frescos</small></a>
    </section>
    <section className="market-home-promo" id="promociones">
      <div className="market-home-promo-head"><strong>Promociones de hoy</strong><a href="#explorar">Ver todas <ArrowRight size={14}/></a></div>
      <a className="market-home-promo-card" href="/restaurante?local=La%20Buena%20Masa">
        <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85" alt="Empanadas recién horneadas"/>
        <span className="market-home-promo-copy"><b>Empanadas tradicionales</b><small>Desde $2.990</small><em>Ver menú <ArrowRight size={13}/></em></span>
      </a>
    </section>
    <section className="market-listing" id="explorar"><div className="market-heading"><div><span className="market-eyebrow">CERCA DE TI</span><h2>Descubre restaurantes</h2><p>Explora las cartas y encuentra tu próxima comida favorita.</p></div><span className="market-result-count">{filtered.length} locales de muestra</span></div>
      <nav className="market-categories" aria-label="Filtrar restaurantes">{categories.map(c => <button key={c} className={category===c?'active':''} onClick={() => setCategory(c)}>{c}</button>)}</nav>
      <div className="market-grid">{filtered.map((p, i) => <article className="market-card" key={p.id}><a href={"/restaurante?local="+encodeURIComponent(p.name)} className="market-card-photo"><img src={p.image} alt={p.type} loading="lazy"/><span className="market-card-number">0{i+1}</span><button type="button" aria-label={favorites.includes(p.id)?'Quitar de favoritos':'Guardar favorito'} className={'market-favorite '+(favorites.includes(p.id)?'saved':'')} onClick={e => {e.preventDefault();setFavorites(v=>v.includes(p.id)?v.filter(id=>id!==p.id):[...v,p.id])}}><Heart size={17} fill={favorites.includes(p.id)?'currentColor':'none'}/></button><span className="market-photo-tag">{p.offer}</span></a><div className="market-card-body"><span className="market-card-type">{p.type}</span><div className="market-card-title"><h3>{p.name}</h3><span><Star size={13} fill="currentColor"/>{p.rating}</span></div><div className="market-card-meta"><span><Clock3 size={14}/>{p.time}</span><span><MapPin size={14}/>Rancagua</span></div><a className="market-open" href={"/restaurante?local="+encodeURIComponent(p.name)}><span>Explorar carta</span><ArrowRight size={16}/></a></div></article>)}</div>
      {filtered.length===0&&<div className="market-empty"><Search size={25}/><h3>No encontramos coincidencias</h3><p>Prueba otra búsqueda o selecciona “Todo”.</p><button onClick={()=>{setCategory('Todo');setQuery('')}}>Limpiar filtros</button></div>}
    </section>
    <footer className="market-footer"><a className="market-brand" href="/"><span className="market-brand-mark"><Utensils size={18}/></span><span>sabores <i>de chile</i><small>DESCUBRE · ELIGE · DISFRUTA</small></span></a><span>Una plataforma para descubrir y apoyar la cocina local.</span><a href="/plantillas">Ver plantillas del producto</a></footer>
    <nav className="market-mobile-nav" aria-label="Navegación principal"><a className="current" href="/"><Home size={20}/><span>Inicio</span></a><a href="#explorar"><Compass size={20}/><span>Explorar</span></a><a href="#promociones"><TicketPercent size={20}/><span>Ofertas</span></a><a href="/admin"><UserRound size={20}/><span>Mi cuenta</span></a></nav>
    <p className="market-disclaimer">Prototipo visual con restaurantes, valoraciones y fotografías de muestra. No hay disponibilidad, promociones ni pedidos reales conectados.</p>
  </main>;
}
