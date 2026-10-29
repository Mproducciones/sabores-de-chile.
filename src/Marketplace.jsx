import React, { useMemo, useState } from 'react';
import { Search, MapPin, Heart, Star, Clock3, ArrowRight, Utensils, SlidersHorizontal, Tag } from 'lucide-react';
import './marketplace.css';

const places = [
  { id: 1, name: 'La Mesa Chilena', type: 'Cocina chilena', rating: '4,8', time: '20–35 min', offer: 'Favoritos de la casa', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85', tags: ['Chilena', 'Casera'] },
  { id: 2, name: 'Costa & Fuego', type: 'Mar y parrilla', rating: '4,7', time: '25–40 min', offer: 'Menú del día', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85', tags: ['Mariscos', 'Parrilla'] },
  { id: 3, name: 'Verde Vivo', type: 'Fresco y vegetariano', rating: '4,9', time: '15–30 min', offer: 'Opciones frescas', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85', tags: ['Veggie', 'Fresco'] },
  { id: 4, name: 'La Buena Masa', type: 'Horno y tradición', rating: '4,6', time: '20–35 min', offer: 'Para compartir', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85', tags: ['Empanadas', 'Casera'] }
];
const categories = ['Todo', 'Chilena', 'Mariscos', 'Veggie', 'Empanadas'];
export default function Marketplace() {
  const [category, setCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const filtered = useMemo(() => places.filter(p => (category === 'Todo' || p.tags.includes(category)) && (p.name + ' ' + p.type + ' ' + p.offer).toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main className="market-page">
    <header className="market-topbar">
      <a className="market-brand" href="/"><span className="market-brand-mark"><Utensils size={19}/></span><span>sabores <i>de chile</i><small>DESCUBRE · ELIGE · DISFRUTA</small></span></a>
      <div className="market-location"><MapPin size={15}/><span><small>ENTREGANDO EN</small><b>Rancagua, Chile</b></span></div>
      <a className="market-local-link" href="/restaurante?local=La%20Mesa%20Chilena">Ver carta de ejemplo <ArrowRight size={15}/></a>
    </header>
    <section className="market-hero">
      <div className="market-hero-copy"><span className="market-eyebrow"><i/> SABORES CERCA DE TI</span><h1>Hoy se come<br/><em>algo especial.</em></h1><p>Encuentra restaurantes, descubre nuevos favoritos y aprovecha promociones preparadas para ti.</p><label className="market-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca un restaurante o algo rico"/><SlidersHorizontal size={17}/></label><div className="market-benefits"><span><Clock3 size={15}/> Opciones cerca de ti</span><span><Tag size={15}/> Promociones del día</span></div></div>
      <div className="market-hero-photo"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90" alt="Mesa con comida fresca"/><div className="market-photo-note"><small>UNA BUENA MESA</small><b>Empieza por<br/>lo que se te antoja.</b></div><span className="market-photo-index">01 / SABORES</span></div>
    </section>
    <section className="market-listing"><div className="market-heading"><div><span className="market-eyebrow">HECHO PARA TU ANTOJO</span><h2>Descubre restaurantes</h2><p>Explora las cartas y encuentra tu próxima comida favorita.</p></div><span className="market-result-count">{filtered.length} locales de muestra</span></div>
      <nav className="market-categories" aria-label="Filtrar restaurantes">{categories.map(c => <button key={c} className={category===c?'active':''} onClick={() => setCategory(c)}>{c}</button>)}</nav>
      <div className="market-grid">{filtered.map((p, i) => <article className="market-card" key={p.id}><a href={"/restaurante?local="+encodeURIComponent(p.name)} className="market-card-photo"><img src={p.image} alt={p.type} loading="lazy"/><span className="market-card-number">0{i+1}</span><button type="button" aria-label={favorites.includes(p.id)?'Quitar de favoritos':'Guardar favorito'} className={'market-favorite '+(favorites.includes(p.id)?'saved':'')} onClick={e => {e.preventDefault();setFavorites(v=>v.includes(p.id)?v.filter(id=>id!==p.id):[...v,p.id])}}><Heart size={17} fill={favorites.includes(p.id)?'currentColor':'none'}/></button><span className="market-photo-tag">{p.offer}</span></a><div className="market-card-body"><span className="market-card-type">{p.type}</span><div className="market-card-title"><h3>{p.name}</h3><span><Star size={13} fill="currentColor"/>{p.rating}</span></div><div className="market-card-meta"><span><Clock3 size={14}/>{p.time}</span><span><MapPin size={14}/>Rancagua</span></div><a className="market-open" href={"/restaurante?local="+encodeURIComponent(p.name)}><span>Explorar carta</span><ArrowRight size={16}/></a></div></article>)}</div>
      {filtered.length===0&&<div className="market-empty"><Search size={25}/><h3>No encontramos coincidencias</h3><p>Prueba otra búsqueda o selecciona “Todo”.</p><button onClick={()=>{setCategory('Todo');setQuery('')}}>Limpiar filtros</button></div>}
    </section>
    <section className="market-promo"><div><span className="market-eyebrow">PROMOCIONES CON SENTIDO</span><h2>Algo rico, en el<br/><em>momento perfecto.</em></h2><p>Los restaurantes podrán destacar combos y ofertas según su menú, disponibilidad e ingredientes por utilizar.</p></div><div className="market-promo-image"><img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85" alt="Comida recién preparada"/><span><Tag size={15}/> Promociones del día</span></div></section>
    <footer className="market-footer"><a className="market-brand" href="/"><span className="market-brand-mark"><Utensils size={18}/></span><span>sabores <i>de chile</i><small>DESCUBRE · ELIGE · DISFRUTA</small></span></a><span>Una plataforma para descubrir y apoyar la cocina local.</span><a href="/plantillas">Ver plantillas del producto</a></footer>
    <p className="market-disclaimer">Prototipo visual con restaurantes, valoraciones y fotografías de muestra. No hay disponibilidad, promociones ni pedidos reales conectados.</p>
  </main>;
}
