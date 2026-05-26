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

// Módulos con roles que pueden acceder
const MODULOS = [
  {
    key: "crm",
    name: "CRM",
    desc: "Clientes, ventas, cobranzas, tareas",
    icon: "ti-users",
    color: "#4a7fd4",
    bg: "#eff4fd",
    url: "https://crm.tungs.com.ar",
    roles: ["directivo", "vendedor", "marketing"],
    estado: "activo"
  },
  {
    key: "erp",
    name: "ERP",
    desc: "Facturación, stock, compras, tesorería",
    icon: "ti-building-factory-2",
    color: "#16a34a",
    bg: "#f0fdf4",
    url: "https://erp.tungs.com.ar",
    roles: ["directivo", "administrativo", "contador"],
    estado: "activo"
  },
  {
    key: "operaciones",
    name: "Operaciones",
    desc: "Pedidos, despacho, entregas, devoluciones",
    icon: "ti-truck-delivery",
    color: "#0891b2",
    bg: "#ecfeff",
    url: "/operaciones",
    roles: ["directivo", "administrativo", "deposito", "repartidor"],
    estado: "activo"
  },
  {
    key: "cobranzas",
    name: "Cobranzas",
    desc: "Recibos, rendiciones, cartera pendiente",
    icon: "ti-cash",
    color: "#059669",
    bg: "#ecfdf5",
    url: "#",
    roles: ["directivo", "vendedor", "administrativo"],
    estado: "proximo"
  },
  {
    key: "catalogo",
    name: "Catálogo",
    desc: "Productos, fichas técnicas, listas de precio",
    icon: "ti-book",
    color: "#7c3aed",
    bg: "#f5f3ff",
    url: "#",
    roles: ["directivo", "vendedor", "deposito", "administrativo", "marketing"],
    estado: "proximo"
  },
  {
    key: "proveedores",
    name: "Proveedores",
    desc: "Gestión, scoring, órdenes de compra",
    icon: "ti-building-warehouse",
    color: "#b45309",
    bg: "#fffbeb",
    url: "#",
    roles: ["directivo", "administrativo"],
    estado: "proximo"
  },
  {
    key: "reclamos",
    name: "Reclamos",
    desc: "Gestión postventa, seguimiento, cierre",
    icon: "ti-message-report",
    color: "#dc2626",
    bg: "#fef2f2",
    url: "#",
    roles: ["directivo", "vendedor", "administrativo"],
    estado: "proximo"
  },
  {
    key: "tienda",
    name: "Tienda Web",
    desc: "Catálogo online, órdenes, portal cliente",
    icon: "ti-world",
    color: "#d97706",
    bg: "#fffbeb",
    url: "#",
    roles: ["directivo", "marketing", "administrativo"],
    estado: "futuro"
  },
  {
    key: "rrhh",
    name: "RRHH",
    desc: "Legajos, liquidaciones, empleados",
    icon: "ti-id-badge",
    color: "#0891b2",
    bg: "#ecfeff",
    url: "#",
    roles: ["directivo"],
    estado: "futuro"
  },
  {
    key: "okrs",
    name: "OKRs",
    desc: "Objetivos por área y persona",
    icon: "ti-target",
    color: "#7c3aed",
    bg: "#f5f3ff",
    url: "#",
    roles: ["directivo"],
    estado: "futuro"
  },
  {
    key: "kpis",
    name: "KPIs",
    desc: "Métricas del negocio en tiempo real",
    icon: "ti-chart-bar",
    color: "#059669",
    bg: "#ecfdf5",
    url: "#",
    roles: ["directivo"],
    estado: "activo"
  },
  {
    key: "capacitaciones",
    name: "Capacitaciones",
    desc: "Materiales, evaluaciones, progreso",
    icon: "ti-school",
    color: "#b45309",
    bg: "#fffbeb",
    url: "#",
    roles: ["directivo", "vendedor", "deposito", "administrativo", "marketing", "repartidor"],
    estado: "futuro"
  },
  {
    key: "agentes",
    name: "Agentes IA",
    desc: "Panel de control de automatizaciones",
    icon: "ti-robot",
    color: "#4a7fd4",
    bg: "#eff4fd",
    url: "#",
    roles: ["directivo"],
    estado: "proximo"
  },
  {
    key: "admin",
    name: "Administración",
    desc: "Usuarios, roles, permisos, auditoría",
    icon: "ti-shield-lock",
    color: "#dc2626",
    bg: "#fef2f2",
    url: "#",
    roles: ["directivo"],
    estado: "activo"
  },
]

const QUICK_ACCESS: Record<string, { icon: string; label: string }[]> = {
  directivo:     [{ icon:"ti-chart-bar", label:"Resumen del día" },{ icon:"ti-trending-up", label:"Ventas del día" },{ icon:"ti-cash", label:"Posición financiera" },{ icon:"ti-trophy", label:"Ranking vendedores" }],
  vendedor:      [{ icon:"ti-checklist", label:"Mis tareas" },{ icon:"ti-search", label:"Buscar cliente" },{ icon:"ti-package", label:"Nuevo pedido" },{ icon:"ti-receipt", label:"Nuevo recibo" }],
  administrativo:[{ icon:"ti-file-invoice", label:"Facturación pendiente" },{ icon:"ti-package", label:"Stock en tiempo real" },{ icon:"ti-truck", label:"Entregas del día" },{ icon:"ti-cash", label:"Cobranzas del día" }],
  deposito:      [{ icon:"ti-package", label:"Stock actual" },{ icon:"ti-arrow-down", label:"Recepciones" },{ icon:"ti-arrow-up", label:"Despachos del día" },{ icon:"ti-alert-triangle", label:"Stock crítico" }],
  repartidor:    [{ icon:"ti-map", label:"Mi ruta hoy" },{ icon:"ti-truck", label:"Mis entregas" },{ icon:"ti-camera", label:"Confirmar entrega" },{ icon:"ti-arrow-back", label:"Devoluciones" }],
  marketing:     [{ icon:"ti-radar", label:"Oportunidades nuevas" },{ icon:"ti-brand-whatsapp", label:"Contactar prospecto" },{ icon:"ti-chart-bar", label:"Pipeline" },{ icon:"ti-filter", label:"Segmentar clientes" }],
  contador:      [{ icon:"ti-file-invoice", label:"Libro IVA" },{ icon:"ti-chart-line", label:"P&L del mes" },{ icon:"ti-building-bank", label:"Posición bancaria" },{ icon:"ti-calendar", label:"Vencimientos" }],
}

const ESTADO_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  activo:  { label: "Activo",   color: "#15803d", bg: "#dcfce7" },
  proximo: { label: "Próximo",  color: "#b45309", bg: "#fef9c3" },
  futuro:  { label: "Futuro",   color: "#6b7280", bg: "#f3f4f6" },
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
      .then(data => { setNotifs(Array.isArray(data) ? data : []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  async function acusar(id: number) {
    const token = localStorage.getItem("tungs_token")
    await fetch(`https://crm.tungs.com.ar/api/notificaciones/${id}/leer`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
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

  function abrirModulo(url: string, estado: string) {
    if (!todasLeidas || estado === "futuro") return
    if (estado === "proximo") return
    const token = localStorage.getItem("tungs_token")
    if (url.startsWith("/")) { window.location.href = url; return }
    window.location.href = url + (token ? "?token=" + token : "")
  }

  const pendientes = notifs.filter(n => !n.leido).length
  const todasLeidas = !cargando && pendientes === 0
  const rol = user?.rol || "vendedor"
  const nombre = user?.nombre || ""
  const quick = QUICK_ACCESS[rol] || QUICK_ACCESS.vendedor

  // Filtrar módulos por rol
  const modulosDelRol = MODULOS.filter(m => m.roles.includes(rol))

  // Agrupar por estado
  const modulosActivos = modulosDelRol.filter(m => m.estado === "activo")
  const modulosProximos = modulosDelRol.filter(m => m.estado === "proximo")
  const modulosFuturos = modulosDelRol.filter(m => m.estado === "futuro")

  return (
    <div style={{ minHeight: "100vh", background: "#f2f5fb", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e5e7eb", height: "56px", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.svg" alt="TUNGS" style={{ height: "32px" }} />
          <div style={{ width: "1px", height: "20px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#4a7fd4", letterSpacing: "0.5px" }}>TUNGS OS</span>
          <span style={{ fontSize: "10px", color: "#9ca3af", background: "#f2f5fb", padding: "2px 7px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>1.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setDrawerOpen(true)} style={{ position: "relative", background: "none", border: "1px solid #e5e7eb", borderRadius: "9px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a6080" }}>
            <i className="ti ti-bell" style={{ fontSize: "17px" }} />
            {pendientes > 0 && <span style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px", background: "#dc2626", borderRadius: "50%", border: "1.5px solid #fff" }} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px 5px 10px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f2f5fb" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#4a7fd4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff" }}>
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a2a44" }}>{nombre}</div>
              <div style={{ fontSize: "10px", color: "#7090b8", textTransform: "capitalize" }}>{rol}</div>
            </div>
          </div>
          <button onClick={logout} style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "transparent", fontSize: "12px", color: "#7090b8", cursor: "pointer", fontWeight: 500 }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "32px 28px 60px", maxWidth: "1080px", margin: "0 auto" }}>

        {/* SALUDO */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", color: "#7090b8", fontWeight: 500 }}>{greeting},</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#1a2a44", marginTop: "2px", letterSpacing: "-0.3px" }}>{nombre}</div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px", textTransform: "capitalize" }}>{fecha}</div>
        </div>

        {/* CARGANDO */}
        {cargando && (
          <div style={{ textAlign: "center", padding: "48px", color: "#7090b8", fontSize: "13px" }}>
            <i className="ti ti-loader-2" style={{ fontSize: "22px", display: "block", marginBottom: "10px" }} />
            Verificando acceso...
          </div>
        )}

        {/* BLOQUEO por notificaciones */}
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
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7090b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "10px" }}>Accesos rápidos</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
              {quick.map((q, i) => (
                <button key={i} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "7px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", fontWeight: 500, color: "#1a2a44", cursor: "pointer", transition: "all .15s" }}>
                  <i className={`ti ${q.icon}`} style={{ fontSize: "14px", color: "#4a7fd4" }} />
                  {q.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* MÓDULOS ACTIVOS */}
        {!cargando && modulosActivos.length > 0 && (
          <>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7090b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "12px" }}>Disponible ahora</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", marginBottom: "28px" }}>
              {modulosActivos.map(m => (
                <ModuloCard key={m.key} modulo={m} habilitado={todasLeidas} onClick={() => abrirModulo(m.url, m.estado)} />
              ))}
            </div>
          </>
        )}

        {/* MÓDULOS PRÓXIMOS */}
        {!cargando && modulosProximos.length > 0 && (
          <>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7090b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "12px" }}>En desarrollo</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", marginBottom: "28px" }}>
              {modulosProximos.map(m => (
                <ModuloCard key={m.key} modulo={m} habilitado={false} onClick={() => {}} />
              ))}
            </div>
          </>
        )}

        {/* MÓDULOS FUTUROS */}
        {!cargando && modulosFuturos.length > 0 && (
          <>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7090b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "12px" }}>Próximamente</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", marginBottom: "28px" }}>
              {modulosFuturos.map(m => (
                <ModuloCard key={m.key} modulo={m} habilitado={false} onClick={() => {}} />
              ))}
            </div>
          </>
        )}

      </main>

      {/* DRAWER NOTIFICACIONES */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "400px", height: "100%", background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(26,42,68,0.12)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a2a44" }}>Notificaciones</div>
                <div style={{ fontSize: "12px", color: "#7090b8", marginTop: "2px" }}>
                  {pendientes > 0 ? `${pendientes} sin confirmar — necesitás leerlas todas` : "Todo al día"}
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7090b8", fontSize: "20px" }}>
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {notifs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#7090b8", fontSize: "13px" }}>
                  <i className="ti ti-bell-off" style={{ fontSize: "24px", display: "block", marginBottom: "8px", opacity: 0.5 }} />
                  Sin notificaciones
                </div>
              )}
              {notifs.map(n => {
                const cfg = TIPO_CONFIG[n.tipo] || TIPO_CONFIG.informativa
                return (
                  <div key={n.id} style={{ marginBottom: "10px", padding: "14px 16px", background: n.leido ? "#fafafa" : "#fff", border: `1px solid ${n.leido ? "#f3f4f6" : cfg.color + "30"}`, borderRadius: "10px", borderLeft: `3px solid ${n.leido ? "#e5e7eb" : cfg.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{cfg.label}</span>
                      <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "auto" }}>{formatFecha(n.creado_at)}</span>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: n.leido ? "#6b7280" : "#1a2a44", marginBottom: "4px" }}>{n.titulo}</div>
                    <div style={{ fontSize: "12px", color: "#7090b8", lineHeight: 1.5, marginBottom: n.leido ? "0" : "12px" }}>{n.cuerpo}</div>
                    {!n.leido && (
                      <button onClick={() => acusar(n.id)} style={{ width: "100%", padding: "8px", background: "#1a2a44", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
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

            {todasLeidas && notifs.length > 0 && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={() => setDrawerOpen(false)} style={{ width: "100%", padding: "10px", background: "#4a7fd4", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
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

// Componente de card de módulo
function ModuloCard({ modulo, habilitado, onClick }: { modulo: any; habilitado: boolean; onClick: () => void }) {
  const badge = ESTADO_BADGE[modulo.estado]
  const activo = habilitado && modulo.estado === "activo"

  return (
    <div
      onClick={activo ? onClick : undefined}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "20px 18px 18px",
        cursor: activo ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        opacity: modulo.estado === "futuro" ? 0.55 : 1,
        transition: "all .15s",
        position: "relative",
      }}
    >
      {/* Badge de estado */}
      {modulo.estado !== "activo" && (
        <span style={{
          position: "absolute", top: "12px", right: "12px",
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.5px",
          color: badge.color, background: badge.bg,
          padding: "2px 7px", borderRadius: "20px", textTransform: "uppercase"
        }}>{badge.label}</span>
      )}

      {/* Ícono */}
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        background: activo ? modulo.bg : "#f2f5fb",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <i className={`ti ${modulo.icon}`} style={{ fontSize: "24px", color: activo ? modulo.color : "#9ca3af" }} />
      </div>

      {/* Texto */}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a2a44", marginBottom: "3px" }}>{modulo.name}</div>
        <div style={{ fontSize: "11.5px", color: "#7090b8", lineHeight: 1.5 }}>{modulo.desc}</div>
      </div>

      {/* Indicador activo */}
      {activo && (
        <div style={{ position: "absolute", bottom: "14px", right: "14px" }}>
          <i className="ti ti-arrow-right" style={{ fontSize: "14px", color: modulo.color }} />
        </div>
      )}
    </div>
  )
}


