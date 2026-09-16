import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import login from "./Login";


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
    padding: 40px 16px;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.18;
    pointer-events: none;
  }
  .blob-1 {
    width: 520px; height: 520px;
    background: #0772ed;
    top: -140px; left: -120px;
    animation: blobDrift1 10s ease-in-out infinite alternate;
  }
  .blob-2 {
    width: 380px; height: 380px;
    background: #0772ed;
    bottom: -100px; right: -80px;
    animation: blobDrift2 12s ease-in-out infinite alternate;
  }
  .blob-3 {
    width: 220px; height: 220px;
    background: #3b9eff;
    top: 55%; left: 50%;
    transform: translate(-50%, -50%);
    animation: blobDrift3 8s ease-in-out infinite alternate;
  }

  @keyframes blobDrift1 {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px,40px) scale(1.08); }
  }
  @keyframes blobDrift2 {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(-20px,-30px) scale(1.05); }
  }
  @keyframes blobDrift3 {
    from { transform: translate(-50%,-50%) scale(1); }
    to   { transform: translate(-50%,-50%) scale(1.15); }
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

  /* Glass Card */
  .glass-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 480px;
    padding: 48px 44px 40px;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(28px) saturate(160%);
    -webkit-backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 24px;
    box-shadow:
      0 0 0 1px rgba(7,114,237,0.15),
      0 32px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.08);
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
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

  /* Icon */
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
    0%,100% { box-shadow: 0 0 0 0 rgba(7,114,237,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(7,114,237,0); }
  }
  .medico-icon svg { width: 26px; height: 26px; color: #0772ed; }

  /* Heading */
  .heading-wrap {
    text-align: center;
    margin-bottom: 28px;
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
  }

  /* Divider */
  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
  .divider-dot  { width: 4px; height: 4px; border-radius: 50%; background: rgba(7,114,237,0.5); }

  /* Two-column row */
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* Form group */
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block;
    font-size: 0.70rem;
    font-weight: 500;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.38);
    margin-bottom: 7px;
  }

  /* Input wrapper */
  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 13px;
    color: rgba(7,114,237,0.6);
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .input-icon svg { width: 16px; height: 16px; }

  /* Shared input style */
  .form-input, .form-select {
    width: 100%;
    padding: 12px 13px 12px 40px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 12px;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.90rem;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    -webkit-text-fill-color: #ffffff;
    appearance: none;
    -webkit-appearance: none;
  }
  .form-input::placeholder {
    color: rgba(255,255,255,0.22);
    -webkit-text-fill-color: rgba(255,255,255,0.22);
  }
  .form-input:focus, .form-select:focus {
    border-color: rgba(7,114,237,0.7);
    background: rgba(7,114,237,0.07);
    box-shadow: 0 0 0 3px rgba(7,114,237,0.12);
  }

  /* Select – custom dropdown arrow */
  .select-wrap {
    position: relative;
  }
  .select-wrap .input-icon { z-index: 1; }
  .form-select {
    padding-right: 36px;
    cursor: pointer;
    background-image: none;
  }
  .form-select option {
    background: #0d1117;
    color: #ffffff;
  }
  .select-arrow {
    position: absolute;
    right: 13px;
    pointer-events: none;
    color: rgba(7,114,237,0.55);
    display: flex;
    align-items: center;
  }
  .select-arrow svg { width: 14px; height: 14px; }

  /* Unselected placeholder option */
  .form-select.placeholder-selected {
    -webkit-text-fill-color: rgba(255,255,255,0.22);
    color: rgba(255,255,255,0.22);
  }

  /* Password toggle */
  .toggle-pw {
    position: absolute;
    right: 13px;
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
  .toggle-pw svg { width: 16px; height: 16px; }

  /* Password strength bar */
  .strength-bar-wrap {
    display: flex;
    gap: 5px;
    margin-top: 7px;
  }
  .strength-seg {
    flex: 1; height: 3px; border-radius: 999px;
    background: rgba(255,255,255,0.08);
    transition: background 0.35s;
  }
  .strength-seg.active-weak   { background: #ff4d4d; }
  .strength-seg.active-fair   { background: #ffaa00; }
  .strength-seg.active-good   { background: #0772ed; }
  .strength-seg.active-strong { background: #00d68f; }
  .strength-label {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.28);
    margin-top: 4px;
    text-align: right;
    letter-spacing: 0.4px;
    min-height: 14px;
  }

  /* Error message */
  .error-msg {
    background: rgba(255,60,60,0.10);
    border: 1px solid rgba(255,60,60,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    color: #ff7070;
    font-size: 0.79rem;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Submit */
  .btn-register {
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
    margin-top: 6px;
  }
  .btn-register::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-register:hover:not(:disabled)::before { opacity: 1; }
  .btn-register:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 36px rgba(7,114,237,0.5);
  }
  .btn-register:active:not(:disabled) { transform: translateY(1px); }
  .btn-register:disabled { opacity: 0.65; cursor: not-allowed; }

  .spinner {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Bottom */
  .bottom-row {
    text-align: center;
    margin-top: 20px;
  }
  .bottom-text { font-size: 0.80rem; color: rgba(255,255,255,0.30); }
  .link {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.80rem;
    color: rgba(7,114,237,0.85);
    text-decoration: none;
    transition: color 0.2s;
    padding: 0;
  }
  .link:hover { color: #5ab0ff; text-decoration: underline; }

  /* Toast */
  .toast {
    position: fixed;
    top: 24px; left: 50%;
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
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  /* Step indicator */
  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 22px;
  }
  .step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    transition: all 0.3s;
  }
  .step-dot.active {
    width: 22px;
    border-radius: 999px;
    background: #0772ed;
  }
  .step-dot.done {
    background: rgba(7,114,237,0.45);
  }
`;

// ── Icons ─────────────────────────────────────────────────────
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const AgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h2m-2 4h5" />
  </svg>
);
const GenderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="14" r="5" />
    <path d="M19 5l-5.4 5.4M19 5h-4m4 0v4" />
  </svg>
);
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
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

// ── Password strength ─────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
};
const segClass = (idx, score) => {
  if (idx >= score) return "strength-seg";
  const map = ["", "active-weak", "active-fair", "active-good", "active-strong"];
  return `strength-seg ${map[score]}`;
};

// ── API ─────────────────────────────────────────────────
// Endpoint + payload shape aligned to backend: POST /api/users/register/
// Expected body: { name, email, age, gender, password }
const registerUser = (payload) =>
  axios.post("http://127.0.0.1:8000/api/users/register/", payload);

// Maps the internal short gender codes (used for the <select> value)
// to the full words the backend expects.
const GENDER_LABELS = {
  M: "Male",
  F: "Female",
  O: "Other",
};

// ── Component ─────────────────────────────────────────────────
export default function Register() {
  const [form, setForm] = useState({
    name: "", age: "", gender: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(form.password);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3200);
  };

  // Which step dots are active (purely visual — 3 conceptual sections)
  const filledStep1 = form.name && form.age && form.gender;
  const filledStep2 = form.email;
  const filledStep3 = form.password && form.confirmPassword;
  const stepScore = [filledStep1, filledStep2, filledStep3].filter(Boolean).length;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.age || form.age < 1 || form.age > 120) return "Please enter a valid age (1–120).";
    if (!form.gender) return "Please select a gender.";
    if (!form.email || !EMAIL_RE.test(form.email)) return "Please enter a valid email address.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        age: Number(form.age),
        gender: GENDER_LABELS[form.gender] || form.gender,
        password: form.password,
      });
      showToast();
      setTimeout(() => navigate('/login'), 1000); // ✅ redirect

    } catch (err) {
      // ✅ Show real backend errors
      if (err.response?.data) {
        const data = err.response.data;
        const msg = typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Registration failed. Please try again.';
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

      {/* Toast */}
      <div className={`toast${toast ? " show" : ""}`}>
        ✦ Account created! Welcome to Medico.
      </div>

      <div className="medico-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />

        <div className="glass-card">
          <div className="card-accent" />

          {/* Icon */}
          <div className="medico-icon">
            <CrossIcon />
          </div>

          {/* Heading */}
          <div className="heading-wrap">
            <h1 className="medico-title"><span>Medico</span></h1>
            <p className="medico-sub">Create your account and start your wellness journey</p>
          </div>

          {/* Step dots */}
          <div className="step-indicator">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`step-dot${i === stepScore - 1 ? " active" : i < stepScore ? " done" : ""
                  }`}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <div className="divider-dot" />
            <div className="divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Row 1: Name + Age */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon"><UserIcon /></span>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <div className="input-wrap">
                  <span className="input-icon"><AgeIcon /></span>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Your age"
                    value={form.age}
                    onChange={set("age")}
                  />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="input-wrap select-wrap">
                <span className="input-icon"><GenderIcon /></span>
                <select
                  className={`form-select${!form.gender ? " placeholder-selected" : ""}`}
                  value={form.gender}
                  onChange={set("gender")}
                >
                  <option value="" disabled hidden>Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                <span className="select-arrow"><ChevronIcon /></span>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email ID</label>
              <div className="input-wrap">
                <span className="input-icon"><EmailIcon /></span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  className="form-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  style={{ paddingRight: "40px" }}
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

              {/* Strength bar */}
              {form.password && (
                <>
                  <div className="strength-bar-wrap">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={segClass(i, strength.score)} />
                    ))}
                  </div>
                  <div className="strength-label">{strength.label}</div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon"><ShieldIcon /></span>
                <input
                  className="form-input"
                  type={showCPw ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  autoComplete="new-password"
                  style={{
                    paddingRight: "40px",
                    borderColor:
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? "rgba(255,60,60,0.5)"
                        : form.confirmPassword && form.password === form.confirmPassword
                          ? "rgba(0,214,143,0.5)"
                          : undefined,
                  }}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowCPw(!showCPw)}
                  aria-label={showCPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showCPw} />
                </button>
              </div>
              {/* Match hint */}
              {form.confirmPassword && (
                <div className="strength-label" style={{
                  color: form.password === form.confirmPassword
                    ? "rgba(0,214,143,0.7)"
                    : "rgba(255,80,80,0.7)",
                }}>
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="error-msg">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button className="btn-register" type="submit" disabled={loading}>
              {loading ? (
                <><div className="spinner" /> Creating account…</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="bottom-row">
            <span className="bottom-text">Already have an account? </span>
            <button type="button" className="link" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}