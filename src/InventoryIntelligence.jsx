import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Bell, Check, Clock3, Leaf, Plus, Search, ShoppingBag, Sparkles, Trash2, TrendingDown } from 'lucide-react';

const seed = [
  { id: 1, name: 'Paltas', category: 'Verduras', qty: 3, unit: 'kg', min: 5, days: 1, cost: 2600 },
  { id: 2, name: 'Cebollas', category: 'Verduras', qty: 7, unit: 'kg', min: 8, days: 2, cost: 900 },
  { id: 3, name: 'Papas', category: 'Verduras', qty: 18, unit: 'kg', min: 10, days: 6, cost: 850 },
  { id: 4, name: 'Salmón', category: 'Pescadería', qty: 4.5, unit: 'kg', min: 3, days: 3, cost: 8900 },
  { id: 5, name: 'Tomates', category: 'Verduras', qty: 6, unit: 'kg', min: 5, days: 2, cost: 1400 },
  { id: 6, name: 'Crema', category: 'Lácteos', qty: 2, unit: 'L', min: 3, days: 1, cost: 2200 },
];

const money = n => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
const urgency = item => item.days <= 1 ? 'urgent' : item.days <= 3 ? 'soon' : item.qty < item.min ? 'low' : 'ok';

export default function InventoryIntelligence() {
  const [items, setItems] = useState(seed);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [draft, setDraft] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newDays, setNewDays] = useState('3');
  const [message, setMessage] = useState('');
  const [adjustments, setAdjustments] = useState({});
  const suggestions = useMemo(() => items.filter(i => i.days <= 3 || i.qty < i.min || i.qty >= i.min * 1.6), [items]);
  const visible = useMemo(() => items.filter(i => {
    const matches = i.name.toLowerCase().includes(search.toLowerCase());
    const status = urgency(i);
    return matches && (filter === 'Todos' || (filter === 'Por madurar' && i.days <= 3) || (filter === 'Stock bajo' && (i.qty < i.min || status === 'urgent')));
  }), [items, search, filter]);
  const totals = useMemo(() => ({
    urgent: items.filter(i => i.days <= 1).length,
    low: items.filter(i => i.qty < i.min).length,
    value: items.reduce((sum, i) => sum + i.qty * i.cost, 0),
    suggested: suggestions.length
  }), [items, suggestions]);
  const adjust = (id, delta) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, Math.round((i.qty + delta) * 10) / 10) } : i));
    setMessage('Existencia ajustada en esta demostración local.');
  };
  const makeDraft = item => {
    const discount = item.days <= 1 ? 20 : item.days <= 3 ? 15 : 10;
    setDraft({ name: 'Oferta para ' + item.name.toLowerCase(), ingredient: item.name, discount, reason: item.days <= 3 ? 'Priorizar rotación: calidad estimada en ' + item.days + (item.days === 1 ? ' día' : ' días') : 'Stock por encima del nivel objetivo', qty: item.qty, unit: item.unit });
  };
  const addItem = () => {
    if (!newName.trim() || Number(newQty) < 0 || Number(newDays) < 0) return;
    setItems(prev => [...prev, { id: Math.max(0, ...prev.map(i => i.id)) + 1, name: newName.trim(), category: 'Nuevo ingrediente', qty: Number(newQty), unit: 'kg', min: 2, days: Number(newDays), cost: 0 }]);
    setNewName(''); setNewQty('1'); setNewDays('3'); setShowAdd(false);
    setMessage('Ingrediente agregado a la demostración local.');
  };
  return <div className="inventory-intel">
    <style>{`
      .inventory-intel{color:#222b25}.ii-sub{color:#758078;margin:-8px 0 22px;font-size:14px}.ii-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}.ii-stat,.ii-panel{background:#fff;border:1px solid #e9ece8;border-radius:16px;padding:18px}.ii-stat span{display:block;color:#7a837d;font-size:12px}.ii-stat strong{display:block;font-size:25px;letter-spacing:-.6px;margin:7px 0 4px}.ii-stat small{color:#7a837d}.ii-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:18px 0}.ii-search{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e4e8e3;border-radius:10px;padding:10px 12px;min-width:220px;flex:1}.ii-search input{border:0;outline:0;min-width:0;width:100%;font:inherit}.ii-select,.ii-input{border:1px solid #e2e7e1;border-radius:9px;padding:9px 10px;background:#fff;color:#29332c;font:inherit}.ii-btn{border:1px solid #dce4db;background:#fff;border-radius:10px;padding:10px 13px;display:inline-flex;align-items:center;gap:7px;cursor:pointer;color:#29382d;font-weight:600}.ii-btn-primary{background:#214b37;color:#fff;border-color:#214b37}.ii-btn:disabled{opacity:.4;cursor:not-allowed}.ii-table-wrap{overflow-x:auto}.ii-table{width:100%;border-collapse:collapse;min-width:720px}.ii-table th{text-align:left;font-size:11px;color:#858d87;text-transform:uppercase;letter-spacing:.06em;padding:13px 10px;border-bottom:1px solid #edf0ec}.ii-table td{padding:15px 10px;border-bottom:1px solid #f0f2ef;font-size:13px}.ii-ingredient{font-weight:700}.ii-muted{color:#858d87;font-size:12px;margin-top:4px}.ii-level{height:5px;background:#edf0ec;border-radius:99px;overflow:hidden;min-width:72px;margin-top:7px}.ii-level span{display:block;height:100%;background:#568265;border-radius:99px}.ii-badge{display:inline-flex;align-items:center;gap:5px;border-radius:99px;padding:5px 8px;font-size:11px;font-weight:700;white-space:nowrap}.ii-urgent{background:#fff0ed;color:#b63d2f}.ii-soon{background:#fff5df;color:#91651b}.ii-low{background:#fce9e8;color:#b63d2f}.ii-ok{background:#eaf5ec;color:#2e6b43}.ii-qty{display:flex;align-items:center;gap:8px}.ii-qty button{width:26px;height:26px;border-radius:7px;border:1px solid #e0e5df;background:#fff;display:grid;place-items:center;cursor:pointer}.ii-suggestions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.ii-suggestion{border:1px solid #e8ece7;border-radius:13px;padding:15px;display:flex;align-items:flex-start;gap:12px}.ii-suggestion-icon{width:38px;height:38px;border-radius:11px;background:#edf5ed;display:grid;place-items:center;color:#356b46;flex-shrink:0}.ii-suggestion h3{margin:0 0 5px;font-size:14px}.ii-suggestion p{margin:0 0 12px;color:#7b847d;font-size:12px;line-height:1.45}.ii-suggestion .ii-btn{padding:8px 10px;font-size:12px}.ii-note{display:flex;gap:9px;align-items:flex-start;background:#f5f8f3;border-radius:12px;padding:13px 15px;color:#526456;font-size:12px;margin:16px 0}.ii-draft{border:1px solid #cddfce;background:#f6faf5;border-radius:14px;padding:18px;margin-top:16px}.ii-draft h3{margin:0 0 8px}.ii-draft p{color:#657368;font-size:13px}.ii-add-form{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.ii-toast{margin:12px 0;color:#3b7147;font-size:13px}.ii-empty{padding:28px;text-align:center;color:#7c857e;font-size:13px}@media(max-width:900px){.ii-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ii-suggestions{grid-template-columns:1fr}}@media(max-width:520px){.ii-stats{gap:8px}.ii-stat{padding:13px}.ii-stat strong{font-size:21px}.ii-panel{padding:13px}.ii-toolbar{align-items:stretch}.ii-search{min-width:100%}.ii-select{flex:1}}
    `}</style>
    <div className="page-title-row"><div><div className="admin-eyebrow">ABASTECIMIENTO</div><h1>Inventario inteligente</h1><p>Anticipa mermas, controla existencias y convierte ingredientes urgentes en promociones sugeridas.</p></div><button className="ii-btn ii-btn-primary" onClick={() => setShowAdd(v => !v)}><Plus size={16}/> Nuevo ingrediente</button></div>
    <p className="ii-sub">Datos de ejemplo editables localmente; aún no se sincronizan con un servidor ni con proveedores.</p>
    <div className="ii-stats">
      <div className="ii-stat"><span>Ingredientes registrados</span><strong>{items.length}</strong><small>en esta vista</small></div>
      <div className="ii-stat"><span>Prioridad de frescura</span><strong>{totals.urgent}</strong><small>calidad estimada ≤ 1 día</small></div>
      <div className="ii-stat"><span>Stock bajo</span><strong>{totals.low}</strong><small>por debajo del mínimo</small></div>
      <div className="ii-stat"><span>Valor de referencia</span><strong>{money(totals.value)}</strong><small>costo unitario ilustrativo</small></div>
    </div>
    {showAdd && <div className="ii-panel"><h3 style={{marginTop:0}}>Registrar ingrediente</h3><div className="ii-add-form"><input className="ii-input" placeholder="Nombre (ej. champiñones)" value={newName} onChange={e=>setNewName(e.target.value)}/><label className="ii-muted">Cantidad (kg)<br/><input className="ii-input" type="number" min="0" value={newQty} onChange={e=>setNewQty(e.target.value)}/></label><label className="ii-muted">Días estimados hasta perder calidad<br/><input className="ii-input" type="number" min="0" value={newDays} onChange={e=>setNewDays(e.target.value)}/></label><button className="ii-btn ii-btn-primary" onClick={addItem}>Agregar</button></div></div>}
    <div className="ii-toolbar"><label className="ii-search"><Search size={16}/><input placeholder="Buscar ingrediente..." value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="ii-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>Todos</option><option>Por madurar</option><option>Stock bajo</option></select><span className="ii-muted">{visible.length} ingredientes visibles</span></div>
    <section className="ii-panel"><div className="card-head"><div><h2>Existencias y frescura</h2><p>Ajusta cantidades y registra señales de rotación de forma manual.</p></div></div><div className="ii-table-wrap"><table className="ii-table"><thead><tr><th>Ingrediente</th><th>Existencia</th><th>Mínimo</th><th>Frescura estimada</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{visible.map(item=>{const status=urgency(item);const pct=Math.min(100,Math.round(item.qty/Math.max(item.min,0.1)*100));return <tr key={item.id}><td><div className="ii-ingredient">{item.name}</div><div className="ii-muted">{item.category} · costo ref. {money(item.cost)}/{item.unit}</div></td><td><div className="ii-qty"><button aria-label={'Restar '+item.name} onClick={()=>adjust(item.id,-1)}><ArrowDown size={13}/></button><b>{item.qty} {item.unit}</b><button aria-label={'Sumar '+item.name} onClick={()=>adjust(item.id,1)}><ArrowUp size={13}/></button></div><div className="ii-level"><span style={{width:pct+'%'}}/></div></td><td><input className="ii-input" style={{width:78}} type="number" min="0" value={item.min} onChange={e=>setItems(prev=>prev.map(i=>i.id===item.id?{...i,min:Math.max(0,Number(e.target.value))}:i))}/></td><td><b>{item.days} {item.days===1?'día':'días'}</b><div className="ii-muted">estimación manual</div></td><td><span className={'ii-badge ii-'+status}>{status==='urgent'?'Usar hoy':status==='soon'?'Rotación prioritaria':status==='low'?'Reponer':'En rango'}</span></td><td><button className="ii-btn" onClick={()=>makeDraft(item)}><Sparkles size={14}/> Sugerir oferta</button></td></tr>})}</tbody></table>{visible.length===0&&<div className="ii-empty">No hay ingredientes que coincidan con esos filtros.</div>}</div></section>
    <div className="ii-note"><AlertTriangle size={17}/><span>La fecha de pérdida de calidad es una estimación ingresada por el equipo, no una predicción automática de seguridad alimentaria. Verifica lote, almacenamiento y fecha del proveedor antes de ofrecer un producto.</span></div>
    <section className="ii-panel"><div className="card-head"><div><h2>Oportunidades de rotación</h2><p>{suggestions.length} sugerencias calculadas según frescura y nivel de stock.</p></div><span className="ii-badge ii-soon"><TrendingDown size={13}/> Reducir mermas</span></div><div className="ii-suggestions">{suggestions.map(item=><article className="ii-suggestion" key={item.id}><span className="ii-suggestion-icon"><Leaf size={19}/></span><div style={{flex:1,minWidth:0}}><h3>{item.name}: {item.days<=3?'priorizar venta':'revisar sobrestock'}</h3><p>{item.qty} {item.unit} disponibles · {item.days<=3?'calidad estimada en '+item.days+' '+(item.days===1?'día':'días'):'stock sobre objetivo'}. Revisa platos del menú que utilicen este ingrediente.</p><button className="ii-btn" onClick={()=>makeDraft(item)}><Sparkles size={14}/> Preparar borrador</button></div></article>)}</div></section>
    {draft&&<section className="ii-draft"><div className="card-head"><div><span className="admin-eyebrow">BORRADOR · NO PUBLICADO</span><h2 style={{margin:'5px 0'}}>{draft.name}</h2></div><button className="ii-btn" onClick={()=>setDraft(null)}>Cerrar</button></div><p>Ingrediente: <b>{draft.ingredient}</b> · Disponibilidad de referencia: {draft.qty} {draft.unit}</p><p>Motivo: {draft.reason}. Descuento sugerido para revisión: <b>{draft.discount}%</b>.</p><label style={{display:'block',fontSize:13,marginBottom:7}}>Nombre visible de la oferta<input className="ii-input" style={{display:'block',width:'100%',marginTop:6,boxSizing:'border-box'}} value={draft.name} onChange={e=>setDraft(prev=>({...prev,name:e.target.value}))}/></label><button className="ii-btn ii-btn-primary" onClick={()=>{setMessage('Borrador preparado. No cambia precios ni se publica a clientes.');setDraft(null)}}><Check size={15}/> Confirmar borrador local</button></section>}
    {message&&<div className="ii-toast" role="status"><Check size={15} style={{verticalAlign:'middle',marginRight:6}}/>{message}</div>}
  </div>;
}
