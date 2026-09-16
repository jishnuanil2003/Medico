import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import register from "./Register";


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .medico-root {
    min-height: 100vh;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.18;
    pointer-events: none;
  }
  .blob-1 {
    width: 520px;
    height: 520px;
    background: #0772ed;
    top: -140px;
    left: -120px;
    animation: blobDrift1 10s ease-in-out infinite alternate;
  }
  .blob-2 {
    width: 380px;
    height: 380px;
    background: #0772ed;
    bottom: -100px;
    right: -80px;
    animation: blobDrift2 12s ease-in-out infinite alternate;
  }
  .blob-3 {
    width: 220px;
    height: 220px;
    background: #3b9eff;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: blobDrift3 8s ease-in-out infinite alternate;
  }

  @keyframes blobDrift1 {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 40px) scale(1.08); }
  }
  @keyframes blobDrift2 {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(-20px, -30px) scale(1.05); }
  }
  @keyframes blobDrift3 {
    from { transform: translate(-50%, -50%) scale(1); }
    to   { transform: translate(-50%, -50%) scale(1.15); }
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(7,114,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(7,114,237,0.04) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none;
  }

  .glass-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    padding: 52px 44px 44px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(28px) saturate(160%);
    -webkit-backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 24px;
    box-shadow:
      0 0 0 1px rgba(7,114,237,0.15),
      0 32px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.08);
    animation: cardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card-accent {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 72px; height: 3px;
    background: linear-gradient(90deg, transparent, #0772ed, transparent);
    border-radius: 999px;
  }

  .medico-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; height: 48px;
    background: rgba(7,114,237,0.15);
    border: 1px solid rgba(7,114,237,0.35);
    border-radius: 14px;
    margin: 0 auto 22px;
    animation: iconPulse 3s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(7,114,237,0.3); }
    50%       { box-shadow: 0 0 0 8px rgba(7,114,237,0); }
  }

  .medico-icon svg {
    width: 26px; height: 26px;
    color: #0772ed;
  }

  .heading-wrap {
    text-align: center;
    margin-bottom: 32px;
  }
  .medico-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.6rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 10px;
  }
  .medico-title span {
    background: linear-gradient(135deg, #0772ed 0%, #5ab0ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .medico-sub {
    font-size: 0.82rem;
    font-weight: 300;
    color: rgba(255,255,255,0.46);
    letter-spacing: 0.35px;
    line-height: 1.55;
    max-width: 300px;
    margin: 0 auto;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }
  .divider-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(7,114,237,0.5);
  }

  .form-group {
    margin-bottom: 18px;
  }
  .form-label {
    display: block;
    font-size: 0.70rem;
    font-weight: 500;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.38);
    margin-bottom: 7px;
  }
  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    color: rgba(7,114,237,0.6);
    display: flex;
    align-items: center;
  }
  .input-icon svg {
    width: 17px; height: 17px;
  }
  .form-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    -webkit-text-fill-color: #ffffff;
  }
  .form-input::placeholder {
    color: rgba(255,255,255,0.22);
    -webkit-text-fill-color: rgba(255,255,255,0.22);
  }
  .form-input:focus {
    border-color: rgba(7,114,237,0.7);
    background: rgba(7,114,237,0.07);
    box-shadow: 0 0 0 3px rgba(7,114,237,0.12);
  }

  .toggle-pw {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    padding: 0;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: rgba(7,114,237,0.8); }
  .toggle-pw svg { width: 17px; height: 17px; }

  .form-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 26px;
    margin-top: -6px;
  }
  .link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    color: rgba(7,114,237,0.85);
    text-decoration: none;
    transition: color 0.2s;
    padding: 0;
  }
  .link:hover { color: #5ab0ff; text-decoration: underline; }

  .error-msg {
    background: rgba(255,60,60,0.10);
    border: 1px solid rgba(255,60,60,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    color: #ff7070;
    font-size: 0.80rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-login {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #0560cc 0%, #0772ed 60%, #1a8aff 100%);
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.3px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
    box-shadow: 0 6px 28px rgba(7,114,237,0.38);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-login::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-login:hover:not(:disabled)::before { opacity: 1; }
  .btn-login:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 36px rgba(7,114,237,0.5);
  }
  .btn-login:active:not(:disabled) { transform: translateY(1px); }
  .btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

  .spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .bottom-row {
    text-align: center;
    margin-top: 22px;
  }
  .bottom-text {
    font-size: 0.80rem;
    color: rgba(255,255,255,0.30);
  }

  .toast {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(-80px);
    background: rgba(7,200,120,0.15);
    border: 1px solid rgba(7,200,120,0.35);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    padding: 12px 22px;
    color: #5de8a8;
    font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    z-index: 999;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
`;

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = ({ off }) =>
  off ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const loginUser = (email, password) =>
  axios.post("http://127.0.0.1:8000/api/users/login/", { email, password });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password);

      // TEMP DEBUG: open the console after logging in to see the exact shape
      // your backend returns (is role under res.data.user.role, res.data.role,
      // "ADMIN"/"admin"/"Admin"?). Adjust the extraction below once confirmed.
      console.log("Full login response:", res.data);

      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);

      // Previously this referenced `user` without ever defining it -- a
      // ReferenceError swallowed by the catch block below, which is why
      // nothing was redirecting. Pull `user` from the response instead.
      const user = res.data.user;
      console.log("User role:", user?.role);

      localStorage.setItem("user", JSON.stringify(user));

      showToast();

      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else if (user?.role === "DOCTOR") {
        navigate("/doctor");
      } else {
        navigate("/");
      }

    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const msg = typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Login failed. Please try again.';
        setError(msg);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className={`toast${toast ? " show" : ""}`}>
        ✦ Welcome back! Redirecting to your dashboard…
      </div>

      <div className="medico-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />

        <div className="glass-card">
          <div className="card-accent" />

          <div className="medico-icon">
            <CrossIcon />
          </div>

          <div className="heading-wrap">
            <h1 className="medico-title">
              <span>Medico</span>
            </h1>
            <p className="medico-sub">
              Book your appointment today for your wellness tomorrow
            </p>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <div className="divider-dot" />
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email ID</label>
              <div className="input-wrap">
                <span className="input-icon"><EmailIcon /></span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  className="form-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: "42px" }}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPw} />
                </button>
              </div>
            </div>

            <div className="form-row">
              <button type="button" className="link">Forgot password?</button>
            </div>

            {error && (
              <div className="error-msg">
                <span>⚠</span> {error}
              </div>
            )}

            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? (
                <><div className="spinner" /> Signing in…</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="bottom-row">
            <span className="bottom-text">Don't have an account? </span>
            <button type="button" className="link" style={{ fontSize: "0.80rem" }} onClick={() => navigate("/register")}>
              Create new account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}