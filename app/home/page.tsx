"use client"
import { useEffect, useState } from "react"

interface Notif {
  id: number
  tipo: string
  titulo: string
  cuerpo: string
  creado_at: string
  leido: boolean
}

const TIPO_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  urgente:     { color: "#dc2626", bg: "#fef2f2", label: "Urgente" },
  importante:  { color: "#d97706", bg: "#fffbeb", label: "Importante" },
  informativa: { color: "#0891b2", bg: "#ecfeff", label: "Informativa" },
}

const AREAS = [
  { key:"crm",     name:"CRM",              desc:"Clientes, ventas, cobranzas, tareas",  icon:"ti-users",             color:"#5b8de8", bg:"#eff4fd", url:"https://crm.tungs.com.ar" },
  { key:"erp",     name:"ERP",              desc:"Pedidos, stock, compras, facturación",  icon:"ti-building-factory-2", color:"#16a34a", bg:"#f0fdf4", url:"https://erp.tungs.com.ar" },
  { key:"tienda",  name:"Tienda Web",        desc:"Catálogo, órdenes online, portal",     icon:"ti-world",             color:"#d97706", bg:"#fffbeb", url:"#" },
  { key:"apps",    name:"Aplicaciones",      desc:"WhatsApp, IA, automatizaciones",       icon:"ti-bolt",              color:"#7c3aed", bg:"#f5f3ff", url:"#" },
  { key:"admin",   name:"Administración",    desc:"Usuarios, roles, permisos, auditoría", icon:"ti-shield-lock",       color:"#dc2626", bg:"#fef2f2", url:"#" },
  { key:"oportunidades", name:"Oportunidades", desc:"Prospectos del agente, contacto WhatsApp", icon:"ti-radar", color:"#059669", bg:"#ecfdf5", url:"/oportunidades" },
  { key:"resumen", name:"Resumen Ejecutivo", desc:"Lo más saliente del día",              icon:"ti-chart-bar",         color:"#0891b2", bg:"#ecfeff", url:"#" },
]

const QUICK_ACCESS: Record<string, { icon: string; label: string }[]> = {
  directivo:     [{ icon:"ti-chart-bar", label:"Resumen ejecutivo" },{ icon:"ti-trending-up", label:"Ventas del día" },{ icon:"ti-cash", label:"Posición financiera" },{ icon:"ti-trophy", label:"Ranking vendedores" }],
  vendedor:      [{ icon:"ti-checklist", label:"Mis tareas del día" },{ icon:"ti-search", label:"Buscar cliente" },{ icon:"ti-package", label:"Nuevo pedido" },{ icon:"ti-file-text", label:"Nueva cotización" }],
  administrativo:[{ icon:"ti-file-text", label:"Nueva cotización" },{ icon:"ti-package", label:"Stock en tiempo real" },{ icon:"ti-truck", label:"Entregas del día" },{ icon:"ti-receipt", label:"Facturación pendiente" }],
  repartidor:    [{ icon:"ti-map", label:"Mi ruta hoy" },{ icon:"ti-truck", label:"Mis entregas" },{ icon:"ti-camera", label:"Confirmar entrega" },{ icon:"ti-arrow-back", label:"Devoluciones" }],
  deposito:      [{ icon:"ti-package", label:"Stock actual" },{ icon:"ti-arrow-down", label:"Recepciones" },{ icon:"ti-arrow-up", label:"Despachos del día" },{ icon:"ti-alert-triangle", label:"Stock crítico" }],
  marketing:     [{ icon:"ti-radar", label:"Oportunidades nuevas" },{ icon:"ti-brand-whatsapp", label:"Contactar prospecto" },{ icon:"ti-chart-bar", label:"Pipeline" },{ icon:"ti-filter", label:"Filtrar por rubro" }],
  contador:      [{ icon:"ti-file-invoice", label:"Libro IVA" },{ icon:"ti-chart-line", label:"P&L del mes" },{ icon:"ti-building-bank", label:"Posición bancaria" },{ icon:"ti-calendar", label:"Vencimientos" }],
}

export default function Home() {
  const [user, setUser] = useState<{ nombre: string; rol: string } | null>(null)
  const [greeting, setGreeting] = useState("Buenos días")
  const [fecha, setFecha] = useState("")
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("tungs_token")
    const userData = localStorage.getItem("tungs_user")
    if (!token || !userData) { window.location.href = "/"; return }
    setUser(JSON.parse(userData))
    const h = new Date().getHours()
    setGreeting(h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches")
    setFecha(new Date().toLocaleString("es-AR", { weekday: "long", day: "numeric", month: "long" }))

    fetch("https://crm.tungs.com.ar/api/notificaciones", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setNotifs(data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  async function acusar(id: number) {
    const token = localStorage.getItem("tungs_token")
    await fetch(`https://crm.tungs.com.ar/api/notificaciones/${id}/leer`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n))
  }

  function logout() {
    localStorage.removeItem("tungs_token")
    localStorage.removeItem("tungs_user")
    window.location.href = "/"
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }

  const pendientes = notifs.filter(n => !n.leido).length
  const todasLeidas = !cargando && pendientes === 0
  const rol = user?.rol || "vendedor"
  const nombre = user?.nombre || ""
  
  const quick = QUICK_ACCESS[rol] || QUICK_ACCESS.vendedor

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e5e7eb", height: "58px", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.svg" alt="TUNGS" style={{ height: "34px" }} />
          <span style={{ fontSize: "10px", color: "#9ca3af", background: "#f7f8fa", padding: "2px 8px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>Enterprise V1.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setDrawerOpen(true)} style={{ position: "relative", background: "none", border: "1px solid #e5e7eb", borderRadius: "10px", width: "38px", height: "38px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
            <i className="ti ti-bell" style={{ fontSize: "18px" }} />
            {pendientes > 0 && <span style={{ position: "absolute", top: "5px", right: "5px", width: "8px", height: "8px", background: "#dc2626", borderRadius: "50%", border: "1.5px solid #fff" }} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 5px", borderRadius: "11px", border: "1px solid #e5e7eb", background: "#f7f8fa" }}>
            
            <div>
              <div style={{ fontSize: "12px", fontWeight: 400, color: "#111827" }}>{nombre}</div>
              <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "capitalize" }}>{rol}</div>
            </div>
          </div>
          <button onClick={logout} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "transparent", fontSize: "12px", color: "#6b7280", cursor: "pointer" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "36px 28px 60px", maxWidth: "960px", margin: "0 auto" }}>

        {/* SALUDO */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>{greeting},</div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>{nombre}</div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px", textTransform: "capitalize" }}>{fecha}</div>
        </div>

        {/* CARGANDO */}
        {cargando && (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "13px" }}>
            <i className="ti ti-loader" style={{ fontSize: "24px", display: "block", marginBottom: "8px" }} />
            Verificando notificaciones...
          </div>
        )}

        {/* BLOQUEO */}
        {!cargando && pendientes > 0 && (
          <div style={{ marginBottom: "28px", padding: "16px 20px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
            <i className="ti ti-lock" style={{ fontSize: "20px", color: "#dc2626", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#991b1b" }}>Tenés {pendientes} notificación{pendientes > 1 ? "es" : ""} sin leer</div>
              <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "2px" }}>Leé y confirmá todas para acceder al sistema.</div>
            </div>
            <button onClick={() => setDrawerOpen(true)} style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Ver notificaciones</button>
          </div>
        )}

        {/* ACCESOS RAPIDOS */}
        {todasLeidas && (
          <>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Accesos rápidos</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "36px" }}>
              {quick.map((q, i) => (
                <button key={i} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: "#374151", cursor: "pointer" }}>
                  <i className={`ti ${q.icon}`} style={{ fontSize: "15px" }} />
                  {q.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* AREAS */}
        {!cargando && (
          <>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>Áreas del sistema</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
              {AREAS.map(area => (
                <div key={area.key}
                  onClick={() => { if (!todasLeidas || area.url === "#") return; if (area.url.startsWith("/")) { window.location.href = area.url; } else { const token = localStorage.getItem("tungs_token"); window.location.href = area.url + (token ? "?token=" + token : ""); } }}
                  style={{ background: "#fff", border: `1px solid ${todasLeidas ? "#e5e7eb" : "#f3f4f6"}`, borderRadius: "16px", padding: "28px 22px 24px", cursor: todasLeidas ? "pointer" : "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", opacity: todasLeidas ? 1 : 0.45, transition: "all .2s", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: todasLeidas ? area.bg : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`ti ${area.icon}`} style={{ fontSize: "28px", color: todasLeidas ? area.color : "#9ca3af" }} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{area.name}</div>
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>{area.desc}</div>
                  {!todasLeidas && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}>
                      <i className="ti ti-lock" style={{ fontSize: "22px", color: "#d1d5db" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* DRAWER */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "420px", height: "100%", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Notificaciones</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  {pendientes > 0 ? `${pendientes} sin leer — confirmá todas para continuar` : "Todo al día ✓"}
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "20px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {notifs.map(n => {
                const cfg = TIPO_CONFIG[n.tipo] || TIPO_CONFIG.informativa
                return (
                  <div key={n.id} style={{ marginBottom: "12px", padding: "16px", background: n.leido ? "#fafafa" : "#fff", border: `1px solid ${n.leido ? "#f3f4f6" : cfg.color + "40"}`, borderRadius: "12px", borderLeft: `3px solid ${n.leido ? "#e5e7eb" : cfg.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{cfg.label}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>{formatFecha(n.creado_at)}</span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: n.leido ? "#6b7280" : "#111827", marginBottom: "4px" }}>{n.titulo}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.5, marginBottom: n.leido ? "0" : "12px" }}>{n.cuerpo}</div>
                    {!n.leido && (
                      <button onClick={() => acusar(n.id)} style={{ width: "100%", padding: "8px", background: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <i className="ti ti-check" style={{ fontSize: "14px" }} />
                        Leído y entendido
                      </button>
                    )}
                    {n.leido && (
                      <div style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-circle-check" style={{ fontSize: "13px" }} />
                        Confirmado
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {todasLeidas && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={() => setDrawerOpen(false)} style={{ width: "100%", padding: "10px", background: "#5b8de8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Acceder al sistema →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
