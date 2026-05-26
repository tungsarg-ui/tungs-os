"use client"
import { useEffect, useState } from "react"

const ERP_URL = "https://erp.tungs.com.ar"

const COLUMNAS = [
  { key: "nuevo",            label: "Nuevo",             color: "#4a7fd4", bg: "#eff4fd", roles: ["directivo","vendedor","administrativo","deposito"] },
  { key: "aprobado_credito", label: "Aprobado",          color: "#059669", bg: "#ecfdf5", roles: ["directivo","administrativo"] },
  { key: "rechazado",        label: "Rechazado",         color: "#dc2626", bg: "#fef2f2", roles: ["directivo","administrativo"] },
  { key: "en_proceso",       label: "En proceso",        color: "#d97706", bg: "#fffbeb", roles: ["directivo","administrativo","deposito"] },
  { key: "listo",            label: "Listo",             color: "#7c3aed", bg: "#f5f3ff", roles: ["directivo","administrativo","deposito"] },
  { key: "despachado",       label: "Despachado",        color: "#0891b2", bg: "#ecfeff", roles: ["directivo","administrativo","deposito","vendedor"] },
  { key: "entregado",        label: "Entregado",         color: "#15803d", bg: "#dcfce7", roles: ["directivo","administrativo","vendedor"] },
]

const ACCIONES: Record<string, { label: string; estados: string[]; roles: string[] }[]> = {
  nuevo:            [{ label: "Aprobar crédito", estados: ["aprobado_credito"], roles: ["directivo","administrativo"] },
                     { label: "Rechazar",        estados: ["rechazado"],        roles: ["directivo","administrativo"] }],
  aprobado_credito: [{ label: "Iniciar armado",  estados: ["en_proceso"],      roles: ["directivo","deposito"] }],
  en_proceso:       [{ label: "Marcar listo",    estados: ["listo"],           roles: ["directivo","deposito"] }],
  listo:            [{ label: "Despachar",       estados: ["despachado"],      roles: ["directivo","deposito","administrativo"] }],
  despachado:       [{ label: "Confirmar entrega", estados: ["entregado"],    roles: ["directivo","deposito","vendedor"] }],
}

interface Pedido {
  id: number
  numero: number
  cliente_nombre: string
  vendedor_nombre: string
  estado: string
  total: number
  modalidad_entrega: string
  fecha: string
  total_items: number
  created_at: string
}

export default function Operaciones() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [rol, setRol] = useState("vendedor")
  const [usuario, setUsuario] = useState<any>(null)
  const [modalPedido, setModalPedido] = useState<Pedido | null>(null)
  const [nota, setNota] = useState("")
  const [accionPendiente, setAccionPendiente] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("tungs_token")
    const userData = localStorage.getItem("tungs_user")
    if (!token || !userData) { window.location.href = "/"; return }
    const u = JSON.parse(userData)
    setUsuario(u)
    setRol(u.rol || "vendedor")
    cargarPedidos(token)
  }, [])

  async function cargarPedidos(token?: string) {
    const tk = token || localStorage.getItem("tungs_token")
    setCargando(true)
    try {
      const res = await fetch(`${ERP_URL}/api/erp/pedidos?limit=200`, {
        headers: { Authorization: `Bearer ${tk}` }
      })
      const data = await res.json()
      if (data.ok) setPedidos(data.data || [])
      else setError(data.error || "Error cargando pedidos")
    } catch { setError("Error de conexión") }
    setCargando(false)
  }

  async function cambiarEstado(pedidoId: number, nuevoEstado: string, notaTexto: string) {
    const tk = localStorage.getItem("tungs_token")
    const res = await fetch(`${ERP_URL}/api/erp/pedidos/${pedidoId}/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, nota: notaTexto })
    })
    const data = await res.json()
    if (data.ok) {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
      setModalPedido(null)
      setNota("")
      setAccionPendiente("")
    }
  }

  const columnasVisibles = COLUMNAS.filter(c => c.roles.includes(rol))

  function fmtMoney(n: number) {
    return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 })
  }

  function fmtFecha(iso: string) {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
  }

  const modalidadIcon: Record<string, string> = {
    local: "🏠", zona: "🚚", retira: "🏭"
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #1a2a44; --bg: #f2f5fb; --surface: #fff;
          --t1: #1a2a44; --t2: #4a6080; --t3: #7090b8;
          --border: #e5e7eb; --blue: #4a7fd4;
          --sans: 'Plus Jakarta Sans', sans-serif;
          --mono: 'DM Mono', monospace;
        }
        html, body { height: 100%; font-family: var(--sans); background: var(--bg); -webkit-font-smoothing: antialiased; }
        .header { position: sticky; top: 0; z-index: 50; background: var(--surface); border-bottom: 1px solid var(--border); height: 52px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; }
        .header-title { font-size: 14px; font-weight: 700; color: var(--t1); display: flex; align-items: center; gap: 8px; }
        .header-actions { display: flex; gap: 8px; align-items: center; }
        .btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 600; color: var(--t1); cursor: pointer; font-family: var(--sans); transition: all .15s; }
        .btn-primary { background: var(--blue); color: #fff; border-color: var(--blue); }
        .btn:hover { background: #f2f5fb; }
        .btn-primary:hover { background: #3a6fc4; }
        .kanban { display: flex; gap: 12px; padding: 16px 20px; overflow-x: auto; min-height: calc(100vh - 52px); align-items: flex-start; }
        .columna { flex-shrink: 0; width: 260px; background: var(--surface); border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column; max-height: calc(100vh - 84px); }
        .col-header { padding: 12px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; border-radius: 12px 12px 0 0; }
        .col-title { font-size: 11px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; }
        .col-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
        .col-body { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .pedido-card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px; cursor: pointer; transition: all .15s; }
        .pedido-card:hover { border-color: var(--blue); background: #eff4fd; }
        .pedido-num { font-size: 10px; font-weight: 700; color: var(--t3); font-family: var(--mono); margin-bottom: 4px; }
        .pedido-cliente { font-size: 13px; font-weight: 600; color: var(--t1); margin-bottom: 2px; line-height: 1.3; }
        .pedido-vendedor { font-size: 11px; color: var(--t3); margin-bottom: 8px; }
        .pedido-footer { display: flex; align-items: center; justify-content: space-between; }
        .pedido-monto { font-size: 12px; font-weight: 700; color: var(--t1); font-family: var(--mono); }
        .pedido-meta { display: flex; align-items: center; gap: 6px; }
        .pedido-chip { font-size: 10px; color: var(--t3); background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; }
        .empty-col { padding: 20px; text-align: center; color: var(--t3); font-size: 12px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: var(--surface); border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(26,42,68,.15); }
        .modal-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: var(--t3); display: block; margin-bottom: 4px; }
        .field span { font-size: 13px; font-weight: 500; color: var(--t1); }
        .accion-btn { padding: 9px 16px; border-radius: 8px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; font-family: var(--sans); transition: all .15s; }
        textarea { width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 13px; font-family: var(--sans); resize: none; outline: none; color: var(--t1); }
        textarea:focus { border-color: var(--blue); }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div className="header-title">
          <span style={{ fontSize: "16px" }}>⚙️</span>
          Operaciones
          <span style={{ fontSize: "11px", color: "#7090b8", fontWeight: 400 }}>— Tablero de pedidos</span>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => cargarPedidos()}>↻ Actualizar</button>
          <button className="btn" onClick={() => window.location.href = "/"}>← Volver</button>
        </div>
      </div>

      {/* KANBAN */}
      {cargando ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#7090b8", fontSize: "13px" }}>
          Cargando pedidos...
        </div>
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#dc2626", fontSize: "13px" }}>{error}</div>
      ) : (
        <div className="kanban">
          {columnasVisibles.map(col => {
            const pedidosCol = pedidos.filter(p => p.estado === col.key)
            return (
              <div key={col.key} className="columna">
                <div className="col-header" style={{ background: col.bg }}>
                  <span className="col-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="col-badge" style={{ background: col.color + "20", color: col.color }}>
                    {pedidosCol.length}
                  </span>
                </div>
                <div className="col-body">
                  {pedidosCol.length === 0 ? (
                    <div className="empty-col">Sin pedidos</div>
                  ) : pedidosCol.map(p => (
                    <div key={p.id} className="pedido-card" onClick={() => setModalPedido(p)}>
                      <div className="pedido-num">#{String(p.numero).padStart(4, "0")} · {fmtFecha(p.created_at)}</div>
                      <div className="pedido-cliente">{p.cliente_nombre || "—"}</div>
                      <div className="pedido-vendedor">{p.vendedor_nombre || "—"}</div>
                      <div className="pedido-footer">
                        <span className="pedido-monto">{fmtMoney(p.total)}</span>
                        <div className="pedido-meta">
                          <span className="pedido-chip">{modalidadIcon[p.modalidad_entrega] || "📦"} {p.modalidad_entrega}</span>
                          <span className="pedido-chip">{p.total_items} ítem{Number(p.total_items) !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DETALLE / ACCIÓN */}
      {modalPedido && (
        <div className="modal-overlay" onClick={() => { setModalPedido(null); setNota(""); setAccionPendiente(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a2a44" }}>
                  Pedido #{String(modalPedido.numero).padStart(4, "0")}
                </div>
                <div style={{ fontSize: "12px", color: "#7090b8", marginTop: "2px" }}>
                  {modalPedido.cliente_nombre}
                </div>
              </div>
              <button onClick={() => { setModalPedido(null); setNota(""); setAccionPendiente(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#7090b8" }}>✕</button>
            </div>

            <div className="modal-body">
              <div className="field-row">
                <div className="field"><label>Vendedor</label><span>{modalPedido.vendedor_nombre}</span></div>
                <div className="field"><label>Total</label><span style={{ fontFamily: "var(--mono)", color: "#1a2a44" }}>{fmtMoney(modalPedido.total)}</span></div>
                <div className="field"><label>Entrega</label><span>{modalPedido.modalidad_entrega}</span></div>
                <div className="field"><label>Fecha</label><span>{fmtFecha(modalPedido.created_at)}</span></div>
              </div>

              {/* Acciones disponibles para este rol y estado */}
              {!accionPendiente && ACCIONES[modalPedido.estado]?.filter(a => a.roles.includes(rol)).map((accion, i) => (
                <button key={i} className="accion-btn"
                  onClick={() => setAccionPendiente(accion.estados[0])}
                  style={{ background: accion.estados[0] === "rechazado" ? "#fef2f2" : "#eff4fd", color: accion.estados[0] === "rechazado" ? "#dc2626" : "#4a7fd4", border: `1px solid ${accion.estados[0] === "rechazado" ? "#fecaca" : "#bfdbfe"}` }}>
                  {accion.label}
                </button>
              ))}

              {accionPendiente && (
                <>
                  <div style={{ fontSize: "12px", color: "#7090b8" }}>
                    Confirmás mover a <strong style={{ color: "#1a2a44" }}>{COLUMNAS.find(c => c.key === accionPendiente)?.label}</strong>
                  </div>
                  <textarea rows={3} placeholder="Nota opcional..." value={nota} onChange={e => setNota(e.target.value)} />
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => { setModalPedido(null); setNota(""); setAccionPendiente(""); }}>Cerrar</button>
              {accionPendiente && (
                <button className="btn btn-primary" onClick={() => cambiarEstado(modalPedido.id, accionPendiente, nota)}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
