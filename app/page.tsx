"use client"
import { useState, useEffect } from "react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Si ya tiene token válido, redirigir
    const token = localStorage.getItem("tungs_token")
    const user = localStorage.getItem("tungs_user")
    if (token && user) window.location.href = "/home"
  }, [])

  async function handleLogin() {
    if (!email || !password) { setError("Completá usuario y contraseña"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("https://crm.tungs.com.ar/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Credenciales incorrectas"); setLoading(false); return }
      localStorage.setItem("tungs_token", data.token)
      localStorage.setItem("tungs_user", JSON.stringify(data.user))
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect")
      if (redirect === "erp") {
        window.location.href = "https://erp.tungs.com.ar?token=" + data.token
      } else {
        window.location.href = "/home"
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold-1: #fab12e;
          --gold-2: #fbbb4a;
          --gold-3: #fcd288;
          --navy: #1a2a44;
          --navy-2: #243752;
          --navy-3: #2e4568;
          --surface: #ffffff;
          --bg: #f2f5fb;
          --t1: #1a2a44;
          --t2: #4a6080;
          --t3: #8aa0b8;
          --border: #dde5f0;
          --blue: #4a7fd4;
          --blue-light: rgba(74,127,212,0.12);
          --error: #dc2626;
          --error-bg: #fef2f2;
          --error-border: #fecaca;
          --mono: 'DM Mono', monospace;
          --sans: 'Plus Jakarta Sans', sans-serif;
        }

        html, body {
          height: 100%;
          font-family: var(--sans);
          background: var(--bg);
          -webkit-font-smoothing: antialiased;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(74,127,212,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(250,177,46,0.05) 0%, transparent 50%);
        }

        .login-card {
          width: 100%;
          max-width: 900px;
          min-height: 520px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(26,42,68,0.08), 0 20px 60px rgba(26,42,68,0.12), 0 0 0 1px rgba(26,42,68,0.06);
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s forwards;
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* PANEL IZQUIERDO */
        .login-left {
          flex: 1;
          background: var(--navy);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 48px;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 30%, rgba(74,127,212,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 80%, rgba(250,177,46,0.08) 0%, transparent 50%);
        }

        .login-left-grid {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .login-left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .login-logo {
          width: 180px;
          height: auto;
          margin-bottom: 28px;
          filter: drop-shadow(0 8px 24px rgba(250,177,46,0.3));
        }

        .login-divider {
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,0.2);
          margin-bottom: 16px;
        }

        .login-tagline {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          text-align: center;
          line-height: 1.8;
        }

        .login-version {
          position: absolute;
          bottom: 24px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          font-family: var(--mono);
          letter-spacing: 0.5px;
        }

        /* PANEL DERECHO */
        .login-right {
          flex: 1.1;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 52px;
        }

        .login-form {
          width: 100%;
          max-width: 320px;
        }

        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--t1);
          letter-spacing: -0.4px;
          margin-bottom: 6px;
        }

        .login-subtitle {
          font-size: 13px;
          color: var(--t3);
          font-weight: 400;
          margin-bottom: 32px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--t2);
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 11px 14px;
          font-size: 13.5px;
          font-family: var(--sans);
          color: var(--t1);
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .form-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(74,127,212,0.12);
        }

        .form-input::placeholder {
          color: var(--t3);
        }

        .pass-wrap {
          position: relative;
        }

        .pass-wrap .form-input {
          padding-right: 42px;
        }

        .pass-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--t3);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s;
        }

        .pass-toggle:hover { color: var(--t2); }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          border-radius: 8px;
          color: var(--error);
          font-size: 12.5px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          margin-top: 8px;
          background: linear-gradient(135deg, var(--gold-1) 0%, var(--gold-2) 60%, var(--gold-3) 100%);
          color: var(--navy);
          font-family: var(--sans);
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(250,177,46,0.35);
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(250,177,46,0.45);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-forgot {
          display: block;
          text-align: center;
          margin-top: 16px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--blue);
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .login-forgot:hover { opacity: 0.75; }

        .login-ssl {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          padding: 10px 14px;
          background: rgba(74,127,212,0.06);
          border: 1px solid rgba(74,127,212,0.12);
          border-radius: 8px;
          font-size: 11px;
          color: var(--t3);
          letter-spacing: 0.2px;
        }

        .login-ssl svg { flex-shrink: 0; }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(26,42,68,0.2);
          border-top-color: var(--navy);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
          .login-card { border-radius: 16px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* IZQUIERDA */}
          <div className="login-left">
            <div className="login-left-grid" />
            <div className="login-left-content">
              <svg className="login-logo" viewBox="0 0 239 204" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <g>
                  <path d="M189.734,153.363l-0,-5.552c-0,-6.132 -4.97,-11.102 -11.103,-11.102l0,-0.002l-22.206,0c-6.132,0 -11.102,4.972 -11.102,11.103l-0,22.208c-0,6.132 4.97,11.102 11.102,11.102c12.887,-0.057 20.154,-7.534 22.206,-9.174l0,9.174l11.103,0l-0,-22.206l-16.655,-0l-0,8.327l5.552,0l0,2.775l-22.206,0l0,-22.206l22.206,-0l0,5.553l11.103,-0Z" fill="white"/>
                  <g>
                    <path d="M227.72,136.71l-22.946,-0c-5.926,-0 -10.731,4.805 -10.731,10.732l0,0.33l33.307,22.205l-22.206,0l-0,-11.061l-11.101,-0l0,11.471c0,5.929 4.805,10.734 10.731,10.734l22.946,-0c5.929,-0 10.733,-4.805 10.733,-10.734l-0,-0.568l-33.008,-22.007l33.008,0l-0,-0.37c-0,-5.927 -4.804,-10.732 -10.733,-10.732" fill="white"/>
                    <path d="M233.835,144.88l-6.484,1.54l-0,12.496l11.102,-0l-0,-11.23l-4.618,-2.806Z" fill="white"/>
                  </g>
                  <path d="M58.985,181.12c12.887,-0.059 20.154,-7.534 22.207,-9.175l-0,9.175l11.102,0l-0,-44.411l-11.102,0l-0,33.307l-22.207,0l0,-33.308l-11.102,-0l-0,33.31c-0,6.132 4.97,11.102 11.102,11.102" fill="white"/>
                  <path d="M129.91,136.708c-12.885,0.059 -20.154,7.535 -22.205,9.175l0,-9.174l-11.102,0l-0,44.411l11.102,0l0,-33.307l22.205,-0l0,33.307l11.103,0l-0,-33.31c-0,-6.131 -4.971,-11.102 -11.103,-11.102" fill="white"/>
                  <path d="M44.411,136.88l-44.411,-0l-0,11.102l16.655,0l0,33.138l11.102,-0l0,-33.138l16.654,0l0,-11.102Z" fill="white"/>
                </g>
                <g>
                  <path d="M129.659,4.843l32.533,32.531c5.791,5.793 5.791,15.181 0,20.97l-32.533,32.533c-5.791,5.791 -15.179,5.791 -20.97,0l-32.531,-32.533c-5.791,-5.789 -5.791,-15.177 0,-20.97l32.531,-32.531c5.791,-5.791 15.179,-5.791 20.97,0" fill="url(#goldGrad)"/>
                  <path d="M106.793,47.757c-0,-6.895 5.59,-12.483 12.483,-12.483c6.897,-0 12.485,5.588 12.485,12.483c0,6.895 -5.588,12.485 -12.485,12.485c-6.893,0 -12.483,-5.59 -12.483,-12.485" fill="#1e1c1a"/>
                </g>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0.102043,-77.741,77.741,0.102043,119.175,78.241)">
                    <stop offset="0" stopColor="#fab12e"/>
                    <stop offset="0.6" stopColor="#fbbb4a"/>
                    <stop offset="0.81" stopColor="#fcd288"/>
                    <stop offset="1" stopColor="#feeac7"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="login-divider" />
              <div className="login-tagline">
                TUNGS OS
                <span style={{fontSize:"9px",opacity:0.6,letterSpacing:"1.5px"}}>Insumos y Herramientas Industriales</span>
              </div>
            </div>
            <div className="login-version">© 2026 TUNGS S.A.® — Todos los derechos reservados</div>
          </div>

          {/* DERECHA */}
          <div className="login-right">
            <div className="login-form">
              <div className="login-title">Iniciar sesión</div>
              <div className="login-subtitle">Ingresá tus credenciales para acceder al sistema</div>

              {error && (
                <div className="login-error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="usuario@tungs.com.ar"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="pass-wrap">
                  <input
                    className="form-input"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKey}
                    autoComplete="current-password"
                  />
                  <button className="pass-toggle" onClick={() => setShowPass(!showPass)} type="button" tabIndex={-1}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button className="login-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <><span className="spinner" />Verificando...</> : "Ingresar al sistema"}
              </button>

              <a href="#" className="login-forgot">¿Olvidaste tu contraseña?</a>

              <div className="login-ssl">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Conexión segura — SSL/TLS cifrado extremo a extremo
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
