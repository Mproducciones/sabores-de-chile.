import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, Plus, Minus, Utensils, Clock, Leaf, ArrowRight, Menu, X, Box, ChefHat } from 'lucide-react';
import './style.css';
import AdminApp from './admin.jsx';

const dishes = [
 {id:1,name:'Pastel de choclo',category:'Tradición chilena',price:10990,desc:'Pino de vacuno, pollo, huevo y aceituna bajo una suave cubierta de choclo.',tag:'Favorito',emoji:'🌽'},
 {id:2,name:'Salmón a la plancha',category:'Del mar',price:13990,desc:'Salmón dorado, papas rústicas y verduras de estación.',tag:'Fresco',emoji:'🐟'},
 {id:3,name:'Empanadas de pino',category:'Para compartir',price:6990,desc:'Dos empanadas horneadas con pino tradicional y masa dorada.',tag:'Hecho en casa',emoji:'🥟'},
 {id:4,name:'Cazuela de vacuno',category:'Tradición chilena',price:9990,desc:'Caldo casero con carne, zapallo, choclo, papa y cilantro.',tag:'Casero',emoji:'🍲'},
 {id:5,name:'Ensalada de la huerta',category:'Fresco y ligero',price:7990,desc:'Hojas frescas, tomates, palta y aliño cítrico.',tag:'Vegetariano',emoji:'🥗'},
 {id:6,name:'Sopaipillas pasadas',category:'Algo dulce',price:4490,desc:'Sopaipillas tibias con chancaca especiada.',tag:'Dulce final',emoji:'🍯'}
];
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
function App(){
 const [cart,setCart]=useState({});
 const [category,setCategory]=useState('Todo');
 const [search,setSearch]=useState('');
 const [showCart,setShowCart]=useState(false);
 const [notice,setNotice]=useState('');
 const categories=['Todo',...new Set(dishes.map(d=>d.category))];
 const filtered=useMemo(()=>dishes.filter(d=>(category==='Todo'||d.category===category)&&(d.name+' '+d.desc).toLowerCase().includes(search.toLowerCase())),[category,search]);
 const count=Object.values(cart).reduce((a,b)=>a+b,0);
 const total=dishes.reduce((s,d)=>s+d.price*(cart[d.id]||0),0);
 const add=(id)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
 const change=(id,delta)=>setCart(c=>({...c,[id]:Math.max(0,(c[id]||0)+delta)}));
 return <div className="app">
  <header className="topbar"><a className="brand" href="#"><span className="brandmark"><Utensils size={20}/></span><span>sabores<span className="brand-light"> de chile</span><small>COCINA CON ORIGEN</small></span></a><nav><a href="#carta">La carta</a><a href="#historia">Nuestra cocina</a><a href="#visitanos">Visítanos</a></nav><button className="cart-button" onClick={()=>setShowCart(true)}><ShoppingBag size={18}/><span>Tu pedido</span><b>{count}</b></button><button className="mobile-menu" aria-label="Abrir carrito" onClick={()=>setShowCart(true)}><ShoppingBag/></button></header>
  <main>
   <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> COCINA CHILENA CONTEMPORÁNEA</div><h1>Lo nuestro,<br/><em>hecho memorable.</em></h1><p>Sabores honestos, ingredientes de temporada y recetas que nos conectan con casa.</p><a className="primary" href="#carta">Explorar la carta <ArrowRight size={17}/></a><div className="hero-meta"><span><Clock size={16}/> Preparación al momento</span><span><Leaf size={16}/> Ingredientes de estación</span></div></div><div className="hero-image"><div className="image-wash"/><div className="hero-stamp"><span>COCINA</span><strong>con<br/>identidad</strong><span>DESDE CHILE</span></div><div className="hero-caption">Una mesa. Muchas historias.</div></div></section>
   <section className="intro" id="historia"><span className="section-kicker">EL SABOR DE ENCONTRARNOS</span><p>Recetas de siempre, miradas nuevas.<br/><strong>Un lugar para compartir lo que somos.</strong></p><span className="intro-mark">✳</span></section>
   <section className="menu-section" id="carta"><div className="section-heading"><div><span className="section-kicker">PREPARADO CON CARIÑO</span><h2>La carta</h2></div><span className="menu-count">{filtered.length} preparaciones</span></div><div className="toolbar"><div className="categories">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar un plato"/></label></div><div className="dish-grid">{filtered.map((d,i)=><article className="dish-card" key={d.id}><div className={'dish-art art-'+d.id}><span className="dish-emoji">{d.emoji}</span><span className="dish-tag">{d.tag}</span><span className="art-index">0{i+1}</span></div><div className="dish-info"><div className="dish-category">{d.category}</div><div className="dish-title-row"><h3>{d.name}</h3><strong>{money(d.price)}</strong></div><p>{d.desc}</p><div className="dish-actions"><span className="model-note"><Box size={14}/> Vista 3D próximamente</span><button className="add-button" onClick={()=>add(d.id)} aria-label={'Agregar '+d.name}><Plus size={18}/> Agregar</button></div></div></article>)}</div></section>
   <section className="experience"><div><span className="section-kicker">UNA EXPERIENCIA QUE EVOLUCIONA</span><h2>La tecnología al servicio<br/>de la buena mesa.</h2><p>Estamos preparando una carta interactiva con modelos 3D, pedidos QR y una experiencia más simple desde tu teléfono.</p></div><div className="experience-icon"><ChefHat size={42}/><span>BUEN PROVECHO</span></div></section>
   <section className="visit" id="visitanos"><span className="section-kicker">TE ESPERAMOS</span><h2>Siempre hay lugar<br/><em>para una buena historia.</em></h2><a href="#carta" className="primary">Elegir algo rico <ArrowRight size={17}/></a></section>
  </main><footer><a className="brand footer-brand" href="#"><span className="brandmark"><Utensils size={18}/></span><span>sabores<span className="brand-light"> de chile</span><small>COCINA CON ORIGEN</small></span></a><span>Una celebración de la cocina chilena.</span><span>© 2026 Sabores de Chile</span></footer>
  {showCart&&<div className="overlay" onClick={()=>setShowCart(false)}><aside className="cart-panel" onClick={e=>e.stopPropagation()}><div className="cart-head"><div><span className="section-kicker">TU EXPERIENCIA</span><h2>Tu pedido <span>({count})</span></h2></div><button className="icon-button" onClick={()=>setShowCart(false)} aria-label="Cerrar"><X/></button></div>{count===0?<div className="empty-cart"><ShoppingBag size={32}/><h3>Tu mesa está esperando</h3><p>Agrega tus preparaciones favoritas para verlas aquí.</p><button className="primary" onClick={()=>setShowCart(false)}>Volver a la carta</button></div>:<><div className="cart-lines">{dishes.filter(d=>cart[d.id]).map(d=><div className="cart-line" key={d.id}><span className="line-emoji">{d.emoji}</span><div className="line-info"><strong>{d.name}</strong><span>{money(d.price)}</span><div className="quantity"><button onClick={()=>change(d.id,-1)}><Minus size={13}/></button><b>{cart[d.id]}</b><button onClick={()=>change(d.id,1)}><Plus size={13}/></button></div></div><strong>{money(d.price*cart[d.id])}</strong></div>)}</div><div className="cart-total"><span>Total estimado</span><strong>{money(total)}</strong></div><p className="demo-note">Demostración: el pedido aún no se envía a una cocina ni se guarda en un sistema de ventas.</p><button className="primary full" onClick={()=>setNotice('Esta versión es una demostración. Próximamente conectaremos el pedido con el restaurante.')}>Continuar pedido <ArrowRight size={17}/></button>{notice&&<p className="notice">{notice}</p>}</>}</aside></div>}
 </div>
}
createRoot(document.getElementById('root')).render(window.location.pathname.startsWith('/admin') ? <AdminApp/> : <App/>);
