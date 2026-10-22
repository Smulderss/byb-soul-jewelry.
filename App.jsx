import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUpRight, Check, ChevronDown, CircleAlert,
  Gem, Heart, ImagePlus, Instagram, LoaderCircle, LockKeyhole, LogOut,
  Menu, PackageCheck, Pencil, Plus, Search, ShoppingBag, Sparkles, Trash2,
  Upload, X
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabase.js";

const money = (value) => new Intl.NumberFormat("es-CL", {
  style: "currency", currency: "CLP", maximumFractionDigits: 0
}).format(Number(value || 0));

const blankProduct = { name: "", price: "", description: "", category: "", available: true, image_url: "" };

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return <div className={`notice ${notice.type || "info"}`} role="status">
    {notice.type === "error" ? <CircleAlert size={18}/> : <Check size={18}/>}
    <span>{notice.text}</span>
    <button className="icon-button" onClick={onClose} aria-label="Cerrar aviso"><X size={16}/></button>
  </div>;
}

function Brand({ compact = false }) {
  return <a className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="ByB Soul Jewelry inicio">
    <span className="brand-mark"><Gem size={compact ? 21 : 25} strokeWidth={1.25}/></span>
    <span className="brand-wording"><strong>ByB Soul</strong><span>JEWELRY</span></span>
  </a>;
}

function SetupMessage() {
  return <main className="setup-screen">
    <div className="setup-card">
      <div className="setup-icon"><Gem size={30}/></div>
      <p className="eyebrow">BYB SOUL JEWELRY</p>
      <h1>Tu colección merece brillar.</h1>
      <p>La aplicación ya está preparada. Para guardar productos, fotos y cambios entre dispositivos, falta conectar tu proyecto de Supabase.</p>
      <div className="setup-steps">
        <span><b>01</b> Crea un proyecto en Supabase.</span>
        <span><b>02</b> Ejecuta el archivo <code>supabase/schema.sql</code>.</span>
        <span><b>03</b> Copia las credenciales en <code>.env</code>.</span>
      </div>
      <p className="setup-small">Encontrarás la guía completa en README.md. Por seguridad, no compartas la clave service_role ni la contraseña de tu cuenta.</p>
    </div>
  </main>;
}

function Catalog({ onAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [notice, setNotice] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const whatsapp = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

  useEffect(() => {
    let live = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("products")
        .select("id,name,price,description,category,image_url,available,created_at")
        .eq("available", true).order("created_at", { ascending: false });
      if (!live) return;
      if (error) setNotice({ type: "error", text: "No se pudieron cargar los productos. Revisa la conexión con Supabase." });
      else setProducts(data || []);
      setLoading(false);
    }
    load();
    const channel = supabase.channel("catalog-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();
    return () => { live = false; supabase.removeChannel(channel); };
  }, []);

  const categories = useMemo(() => ["Todos", ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const filtered = useMemo(() => products.filter(p => {
    const matchesQuery = `${p.name} ${p.description || ""} ${p.category || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "Todos" || p.category === category);
  }), [products, query, category]);

  const askProduct = (p) => {
    const message = `Hola, me interesa ${p.name} (${money(p.price)}). ¿Me das más información?`;
    if (whatsapp) window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    else setNotice({ type: "info", text: "Para activar las consultas por WhatsApp, configura VITE_WHATSAPP_NUMBER en el archivo .env." });
  };

  return <div className="site-shell">
    <div className="announcement"><Sparkles size={14}/> Pequeños detalles, recuerdos para siempre <span>✦</span></div>
    <header className="site-header">
      <Brand/>
      <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
        <a href="#coleccion" onClick={() => setMobileMenu(false)}>Colección</a>
        <a href="#nosotros" onClick={() => setMobileMenu(false)}>Nuestra esencia</a>
        <a href="#contacto" onClick={() => setMobileMenu(false)}>Contacto</a>
      </nav>
      <div className="header-actions">
        <button className="admin-link" onClick={onAdmin}><LockKeyhole size={16}/> Administración</button>
        <button className="mobile-menu" onClick={() => setMobileMenu(v => !v)} aria-label="Abrir menú">{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-line"/> JOYAS CON ALMA</p>
        <h1>Tu esencia,<br/><em>en cada detalle.</em></h1>
        <p className="hero-description">Piezas que cuentan historias, celebran quién eres y acompañan esos momentos que se quedan contigo.</p>
        <a className="primary-button" href="#coleccion">Descubrir colección <ArrowDown size={17}/></a>
        <div className="hero-signature"><span className="signature-line"/> Hecho para brillar contigo</div>
      </div>
      <div className="hero-art" aria-label="Composición decorativa de joyería">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-sun"></div>
        <div className="hero-gem"><Gem size={116} strokeWidth={0.7}/></div>
        <span className="hero-side-note">SOULFUL · TIMELESS · YOU</span>
        <span className="hero-number">01 / THE COLLECTION</span>
      </div>
      <div className="hero-bottom"><span>01</span><div></div><span>02</span><div></div><span>03</span></div>
    </section>

    <section className="promise-strip">
      <div><Gem/><span><strong>Detalles con intención</strong><small>Piezas elegidas con cariño</small></span></div>
      <div><Heart/><span><strong>Tu estilo, tu historia</strong><small>Encuentra tu próximo favorito</small></span></div>
      <div><PackageCheck/><span><strong>Atención cercana</strong><small>Te ayudamos a elegir</small></span></div>
    </section>

    <section id="coleccion" className="collection section-wrap">
      <div className="section-heading">
        <div><p className="eyebrow">DESCUBRE TU FAVORITA</p><h2>La colección <em>ByB</em></h2></div>
        <p>Una joya puede ser pequeña.<br/>Lo que te hace sentir, no.</p>
      </div>
      <div className="catalog-tools">
        <div className="category-tabs" role="group" aria-label="Filtrar por categoría">
          {categories.map(c => <button key={c} className={category === c ? "category-active" : ""} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar una joya..." aria-label="Buscar productos"/></label>
      </div>
      {loading ? <div className="loading-state"><LoaderCircle className="spin" size={25}/><span>Preparando la colección…</span></div> :
        filtered.length ? <div className="product-grid">
          {filtered.map((p, i) => <article className="product-card" key={p.id}>
            <button className="product-image" onClick={() => askProduct(p)} aria-label={`Consultar por ${p.name}`}>
              {p.image_url ? <img src={p.image_url} alt={p.name} loading={i > 3 ? "lazy" : "eager"}/> : <span className="image-placeholder"><Gem size={42}/><small>BYB SOUL</small></span>}
              <span className="image-view">Ver pieza <ArrowUpRight size={15}/></span>
            </button>
            <div className="product-info">
              <div className="product-topline"><span>{p.category || "JOYERÍA"}</span><span className="available-dot">Disponible</span></div>
              <h3>{p.name}</h3>
              {p.description && <p>{p.description}</p>}
              <div className="product-bottom"><strong>{money(p.price)}</strong><button onClick={() => askProduct(p)} aria-label={`Consultar por ${p.name}`}><ShoppingBag size={17}/></button></div>
            </div>
          </article>)}
        </div> : <div className="empty-state"><Gem size={31}/><h3>{products.length ? "No encontramos esa joya" : "Pronto brillarán nuevas piezas"}</h3><p>{products.length ? "Prueba con otra búsqueda o categoría." : "Estamos preparando la colección. Vuelve a visitarnos pronto."}</p></div>
      }
    </section>

    <section id="nosotros" className="essence">
      <div className="essence-symbol"><Gem size={66} strokeWidth={0.8}/><span>♡</span></div>
      <div><p className="eyebrow">NUESTRA ESENCIA</p><h2>Más que una joya.<br/><em>Un pedacito de ti.</em></h2><p>En ByB Soul Jewelry creemos que los detalles hablan. Por eso cada pieza está aquí para acompañar tu manera única de sentir, expresarte y brillar.</p><a href="#coleccion" className="text-link">Encuentra la tuya <ArrowUpRight size={16}/></a></div>
    </section>

    <section id="contacto" className="contact-band"><div><p className="eyebrow">ESTAMOS AQUÍ PARA TI</p><h2>¿Ya encontraste <em>tu joya?</em></h2><p>Escríbenos y te ayudamos con los detalles de tu próxima favorita.</p></div><button className="light-button" onClick={() => whatsapp ? window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hola, quiero consultar por las joyas de ByB Soul Jewelry.")}`, "_blank", "noopener,noreferrer") : setNotice({type:"info",text:"Configura tu número de WhatsApp en el archivo .env para activar este botón."})}>Hablemos <ArrowUpRight size={17}/></button></section>

    <footer className="site-footer"><Brand compact/><p>Joyas elegidas con alma.</p><div className="footer-right"><span>© {new Date().getFullYear()} ByB Soul Jewelry</span><button onClick={onAdmin}>Acceso privado</button></div></footer>
    <Notice notice={notice} onClose={() => setNotice(null)}/>
  </div>;
}

function Admin({ onExit }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankProduct);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) setNotice({ type: "error", text: "No se pudieron cargar los productos. Comprueba que tu usuario esté autorizado como administrador." });
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { if (session) loadProducts(); }, [session]);

  const openNew = () => { setEditing("new"); setForm(blankProduct); setFile(null); setPreview(""); };
  const openEdit = (p) => { setEditing(p.id); setForm({ name:p.name, price:String(p.price), description:p.description || "", category:p.category || "", available:p.available, image_url:p.image_url || "" }); setFile(null); setPreview(p.image_url || ""); };
  const closeEditor = () => { setEditing(null); setFile(null); setPreview(""); };
  const handleFile = (f) => { if (!f) return; if (!f.type.startsWith("image/")) { setNotice({type:"error",text:"Selecciona un archivo de imagen."}); return; } if (f.size > 8 * 1024 * 1024) { setNotice({type:"error",text:"La imagen debe pesar menos de 8 MB."}); return; } setFile(f); setPreview(URL.createObjectURL(f)); };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === "" || Number(form.price) < 0) {
      setNotice({type:"error",text:"Ingresa un nombre y un precio válido."}); return;
    }
    setSaving(true); setNotice(null);
    let image_url = form.image_url || null;
    try {
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("catalog-images").upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("catalog-images").getPublicUrl(path);
        image_url = data.publicUrl;
      }
      const payload = {
        name: form.name.trim(), price: Math.round(Number(form.price)),
        description: form.description.trim() || null, category: form.category.trim() || null,
        available: Boolean(form.available), image_url
      };
      const result = editing === "new"
        ? await supabase.from("products").insert(payload)
        : await supabase.from("products").update(payload).eq("id", editing);
      if (result.error) throw result.error;
      setNotice({type:"success",text:editing === "new" ? "Producto agregado al catálogo." : "Cambios guardados correctamente."});
      closeEditor(); await loadProducts();
    } catch (err) {
      setNotice({type:"error",text:err?.message?.includes("row-level security") ? "No tienes permisos de administrador. Sigue el paso de autorización del README." : `No se pudo guardar el producto. ${err?.message || ""}`});
    } finally { setSaving(false); }
  };

  const toggleAvailability = async (p) => {
    const { error } = await supabase.from("products").update({available: !p.available}).eq("id", p.id);
    if (error) setNotice({type:"error",text:"No se pudo cambiar la disponibilidad. Verifica tus permisos."});
    else { setNotice({type:"success",text:p.available ? "Producto ocultado del catálogo público." : "Producto publicado nuevamente."}); loadProducts(); }
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`¿Eliminar definitivamente “${p.name}”? Esta acción no se puede deshacer. Para ocultarlo sin borrarlo, usa disponibilidad.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) setNotice({type:"error",text:"No se pudo eliminar el producto."});
    else { setNotice({type:"success",text:"Producto eliminado."}); loadProducts(); }
  };

  const filtered = products.filter(p => {
    const matchFilter = filter === "Todos" || (filter === "Disponibles" && p.available) || (filter === "No disponibles" && !p.available);
    return matchFilter && `${p.name} ${p.category || ""}`.toLowerCase().includes(search.toLowerCase());
  });

  if (authLoading) return <div className="admin-loading"><LoaderCircle className="spin"/> Comprobando sesión…</div>;

  if (!session) return <div className="login-page">
    <header className="login-header"><Brand/><button className="back-link" onClick={onExit}><ArrowLeft size={16}/> Volver al catálogo</button></header>
    <div className="login-layout">
      <div className="login-art"><div className="login-art-orbit"></div><Gem size={90} strokeWidth={0.75}/><p>YOUR COLLECTION.<br/><em>YOUR STORY.</em></p></div>
      <form className="login-card" onSubmit={async e => {
        e.preventDefault(); setAuthLoading(true); setNotice(null);
        const { error } = await supabase.auth.signInWithPassword({email, password});
        if (error) setNotice({type:"error",text:"No se pudo iniciar sesión. Revisa el correo y la contraseña."});
        setAuthLoading(false);
      }}>
        <p className="eyebrow">ESPACIO PRIVADO</p><h1>Hola de nuevo.</h1><p className="login-subtitle">Ingresa para cuidar cada detalle de tu colección.</p>
        <label>Correo electrónico<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.cl" required autoComplete="username"/></label>
        <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" required autoComplete="current-password"/></label>
        <button className="primary-button login-submit" type="submit" disabled={authLoading}>{authLoading ? <LoaderCircle className="spin"/> : <LockKeyhole size={16}/>} Iniciar sesión</button>
        <p className="login-help">El acceso se crea desde el panel de Supabase. No hay registro público.</p>
        <Notice notice={notice} onClose={() => setNotice(null)}/>
      </form>
    </div>
  </div>;

  return <div className="admin-shell">
    <aside className="admin-sidebar"><Brand/><div className="admin-side-label">GESTIÓN DE TIENDA</div><div className="side-current"><PackageCheck size={18}/> Productos</div><div className="sidebar-note"><Gem size={20}/><p>Tu colección,<br/>siempre en orden.</p></div><button className="side-back" onClick={onExit}><ArrowLeft size={16}/> Ver catálogo</button></aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><p className="eyebrow">BYB SOUL JEWELRY</p><h1>Tu colección</h1></div><button className="logout-button" onClick={async () => { await supabase.auth.signOut(); onExit(); }}><LogOut size={16}/> Cerrar sesión</button></header>
      <div className="admin-welcome"><div><h2>Hola, qué bueno verte.</h2><p>Administra tus piezas, precios y disponibilidad desde aquí.</p></div><button className="primary-button" onClick={openNew}><Plus size={17}/> Agregar producto</button></div>
      <div className="stats-row"><div className="stat-card"><span>Total de productos</span><strong>{products.length}</strong><small>En tu inventario</small></div><div className="stat-card"><span>Disponibles</span><strong>{products.filter(p=>p.available).length}</strong><small>Visibles al público</small></div><div className="stat-card"><span>No disponibles</span><strong>{products.filter(p=>!p.available).length}</strong><small>Guardados para después</small></div></div>
      <section className="inventory-panel">
        <div className="inventory-heading"><div><h2>Inventario</h2><p>Los cambios se guardan en tu base de datos.</p></div><label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto…"/></label></div>
        <div className="inventory-filters">{["Todos","Disponibles","No disponibles"].map(f=><button key={f} onClick={()=>setFilter(f)} className={filter===f?"filter-active":""}>{f}</button>)}</div>
        {loading ? <div className="loading-state"><LoaderCircle className="spin"/> Cargando inventario…</div> :
          filtered.length ? <div className="inventory-list">{filtered.map(p=><div className={`inventory-item ${!p.available?"is-unavailable":""}`} key={p.id}>
            <div className="inventory-product-image">{p.image_url ? <img src={p.image_url} alt=""/> : <Gem size={25}/>}</div>
            <div className="inventory-product-details"><strong>{p.name}</strong><span>{p.category || "Sin categoría"}</span><b>{money(p.price)}</b></div>
            <span className={`status-pill ${p.available?"status-on":"status-off"}`}><span></span>{p.available?"Disponible":"No disponible"}</span>
            <div className="inventory-actions"><button title={p.available?"Ocultar producto":"Volver a publicar"} onClick={()=>toggleAvailability(p)}>{p.available?<ArrowDown size={17}/>:<ArrowUpRight size={17}/>}<span>{p.available?"Ocultar":"Publicar"}</span></button><button title="Editar producto" onClick={()=>openEdit(p)}><Pencil size={17}/><span>Editar</span></button><button title="Eliminar definitivamente" className="delete-action" onClick={()=>deleteProduct(p)}><Trash2 size={17}/></button></div>
          </div>)}</div> : <div className="empty-inventory"><Gem size={28}/><h3>{products.length?"No hay resultados":"Tu primera joya empieza aquí"}</h3><p>{products.length?"Prueba con otro filtro o búsqueda.":"Agrega un producto para comenzar a construir tu catálogo."}</p>{!products.length&&<button className="primary-button" onClick={openNew}><Plus size={16}/> Agregar producto</button>}</div>
        }
      </section>
    </main>
    <Notice notice={notice} onClose={()=>setNotice(null)}/>
    {editing !== null && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeEditor();}}>
      <form className="product-editor" onSubmit={saveProduct}>
        <header className="editor-header"><div><p className="eyebrow">{editing==="new"?"NUEVA PIEZA":"ACTUALIZAR PIEZA"}</p><h2>{editing==="new"?"Agregar producto":"Editar producto"}</h2></div><button type="button" className="icon-button" onClick={closeEditor} aria-label="Cerrar"><X/></button></header>
        <div className="editor-body">
          <label className="upload-zone">
            {preview ? <img className="upload-preview" src={preview} alt="Vista previa del producto"/> : <span className="upload-placeholder"><ImagePlus size={30}/><strong>Sube la foto de tu joya</strong><small>JPG, PNG o WEBP · máximo 8 MB</small></span>}
            <span className="upload-action"><Upload size={15}/> {preview?"Cambiar fotografía":"Elegir fotografía"}</span>
            <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files?.[0])}/>
          </label>
          <label>Nombre del producto<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ej. Aros Aurora" required maxLength={120}/></label>
          <div className="form-two-col"><label>Precio (CLP)<input type="number" min="0" step="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="12990" required/></label><label>Categoría<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Ej. Aros"/></label></div>
          <label>Descripción<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Materiales, tamaño, detalles especiales…" rows={3} maxLength={1000}/></label>
          <label className="availability-toggle"><span><strong>Disponible para clientes</strong><small>Si lo desactivas, no aparecerá en el catálogo público.</small></span><input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/><span className="toggle-ui"></span></label>
        </div>
        <footer className="editor-footer"><button type="button" className="secondary-button" onClick={closeEditor}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving?<LoaderCircle className="spin" size={17}/>:<Check size={17}/>} {saving?"Guardando…":"Guardar producto"}</button></footer>
      </form>
    </div>}
  </div>;
}

export default function App() {
  const [admin, setAdmin] = useState(window.location.pathname.startsWith("/admin"));
  useEffect(() => {
    const onPop = () => setAdmin(window.location.pathname.startsWith("/admin"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (toAdmin) => {
    const path = toAdmin ? "/admin" : "/";
    window.history.pushState({}, "", path);
    setAdmin(toAdmin);
    window.scrollTo(0, 0);
  };
  if (!isSupabaseConfigured) return <SetupMessage/>;
  return admin ? <Admin onExit={() => navigate(false)}/> : <Catalog onAdmin={() => navigate(true)}/>;
}
