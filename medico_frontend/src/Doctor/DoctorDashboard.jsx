import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500;600&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --blue:      #0772ed;
    --blue-glow: rgba(7,114,237,0.45);
    --blue-dim:  rgba(7,114,237,0.13);
    --blue-soft: rgba(7,114,237,0.07);
    --blue-lite: #5ab0ff;
    --white:     #ffffff;
    --glass:     rgba(255,255,255,0.04);
    --border:    rgba(255,255,255,0.08);
    --text-dim:  rgba(255,255,255,0.35);
    --text-mid:  rgba(255,255,255,0.60);
    --bg:        #000000;
    --green:     #00d68f;
    --red:       #ff4d4d;
    --amber:     #ffaa00;
  }

  html, body, #root { height: 100%; overflow: hidden; }

  .admin-root {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    font-family: 'Lora', serif;
    color: var(--white);
    position: relative;
    overflow: hidden;
  }

  /* ─── Ambient blobs ────────────────────────────────────── */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(110px);
    opacity: 0.11;
    pointer-events: none;
    z-index: 0;
  }
  .bg-blob-1 { width:580px;height:580px;background:var(--blue);top:-180px;left:-130px;animation:bf1 14s ease-in-out infinite alternate; }
  .bg-blob-2 { width:380px;height:380px;background:var(--blue);bottom:-110px;right:-90px;animation:bf2 11s ease-in-out infinite alternate; }
  .bg-blob-3 { width:240px;height:240px;background:#3b9eff;top:42%;left:58%;animation:bf3 9s ease-in-out infinite alternate; }
  @keyframes bf1 { to { transform:translate(35px,45px); } }
  @keyframes bf2 { to { transform:translate(-25px,-35px); } }
  @keyframes bf3 { to { transform:translate(-50%,-50%) scale(1.2); } }
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(7,114,237,0.032) 1px, transparent 1px),
      linear-gradient(90deg, rgba(7,114,237,0.032) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* ─── HEADER ───────────────────────────────────────────── */
  .header {
    position: relative; z-index: 1000; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 60px;
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 0 rgba(7,114,237,0.10);
  }
  .header-logo { display:flex; align-items:center; gap:10px; }
  .logo-icon {
    width:34px; height:34px; border-radius:10px;
    background: var(--blue-dim);
    border: 1px solid rgba(7,114,237,0.32);
    display:flex; align-items:center; justify-content:center;
    animation: pulse-ring 3s ease-in-out infinite;
  }
  .logo-icon svg { width:17px; height:17px; color:var(--blue); }
  @keyframes pulse-ring {
    0%,100% { box-shadow:0 0 0 0 rgba(7,114,237,0.3); }
    50%      { box-shadow:0 0 0 6px rgba(7,114,237,0); }
  }
  .logo-text {
    font-family: 'Playfair Display', serif;
    font-size:1.25rem; font-weight:700;
    background: linear-gradient(135deg,#0772ed 0%,#5ab0ff 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    letter-spacing:-0.3px;
  }
  .logo-badge {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;
    color: rgba(7,114,237,0.75); background: rgba(7,114,237,0.10);
    border: 1px solid rgba(7,114,237,0.25); border-radius: 999px;
    padding: 3px 9px; margin-left: 2px;
  }
  .header-left { display:flex; align-items:center; gap:10px; }

  /* live-clock chip in header */
  .header-clock {
    display:flex; align-items:center; gap:7px;
    padding:6px 13px; border-radius:999px;
    background: rgba(0,214,143,0.08);
    border: 1px solid rgba(0,214,143,0.22);
    font-size:0.76rem; color: var(--green); font-weight:600; letter-spacing:0.3px;
    font-variant-numeric: tabular-nums;
  }
  .header-clock .dot {
    width:6px; height:6px; border-radius:50%; background:var(--green);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(0,214,143,0.5); }
    50%      { box-shadow:0 0 0 4px rgba(0,214,143,0); }
  }

  .profile-area { position:relative; }
  .profile-btn {
    display:flex; align-items:center; gap:9px;
    background: var(--glass); border:1px solid var(--border);
    border-radius:999px; padding:5px 13px 5px 5px;
    cursor:pointer; transition:border-color 0.2s, background 0.2s;
  }
  .profile-btn:hover { border-color:rgba(7,114,237,0.38); background:var(--blue-soft); }
  .profile-avatar {
    width:28px; height:28px; border-radius:50%;
    background:linear-gradient(135deg,#0560cc,#1a8aff);
    display:flex; align-items:center; justify-content:center;
    font-size:0.70rem; font-weight:600; color:#fff; flex-shrink:0;
  }
  .profile-name { font-size:0.80rem; font-weight:500; color:var(--text-mid); }
  .profile-chevron { color:var(--text-dim); display:flex; align-items:center; transition:transform 0.22s; }
  .profile-chevron.open { transform:rotate(180deg); }
  .profile-chevron svg { width:13px; height:13px; }

  .profile-dropdown {
    position:absolute; top:calc(100% + 8px); right:0; min-width:172px;
    background:rgba(8,8,8,0.94); backdrop-filter:blur(24px);
    border:1px solid var(--border); border-radius:14px; padding:5px;
    box-shadow:0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(7,114,237,0.09);
    opacity:0; transform:translateY(-8px) scale(0.97);
    pointer-events:none; transition:opacity 0.18s, transform 0.18s; z-index:200;
  }
  .profile-dropdown.open { opacity:1; transform:translateY(0) scale(1); pointer-events:all; }
  .dropdown-item {
    display:flex; align-items:center; gap:9px; padding:9px 11px; border-radius:9px;
    font-size:0.82rem; color:var(--text-mid); cursor:pointer;
    transition:background 0.14s, color 0.14s;
    border:none; background:none; width:100%; text-align:left; font-family:'Lora',serif;
  }
  .dropdown-item:hover { background:var(--blue-dim); color:var(--white); }
  .dropdown-item svg { width:14px; height:14px; color:var(--blue); flex-shrink:0; }
  .dropdown-item.danger:hover { background:rgba(255,60,60,0.09); color:#ff7070; }
  .dropdown-item.danger svg { color:#ff7070; }
  .dropdown-divider { height:1px; background:var(--border); margin:3px 5px; }

  .toast {
    position: fixed; top: 24px; left: 50%;
    transform: translateX(-50%) translateY(-80px);
    background: rgba(7,200,120,0.15); border: 1px solid rgba(7,200,120,0.35);
    backdrop-filter: blur(16px); border-radius: 12px; padding: 12px 22px;
    color: #5de8a8; font-size: 0.85rem; font-family: 'Lora', serif;
    z-index: 1001; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.error { background: rgba(255,60,60,0.12); border-color: rgba(255,60,60,0.3); color: #ff8a8a; }

  /* ─── BODY SPLIT ───────────────────────────────────────── */
  .admin-body { flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1; }

  .sidebar {
    width: 240px; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 4px;
    padding: 20px 12px;
    border-right: 1px solid var(--border);
    background: rgba(255,255,255,0.012);
    overflow-y: auto;
  }
  .sidebar-label {
    font-size: 0.66rem; font-weight: 600; letter-spacing: 0.7px; text-transform: uppercase;
    color: rgba(7,114,237,0.5); padding: 6px 12px 8px;
  }
  .sidebar-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 12px; border-radius: 11px;
    font-size: 0.85rem; font-weight: 500; color: var(--text-mid);
    cursor: pointer; border: 1px solid transparent; background: none;
    width: 100%; text-align: left; font-family: 'Lora', serif;
    transition: background 0.16s, color 0.16s, border-color 0.16s;
    position: relative;
  }
  .sidebar-item svg { width: 16px; height: 16px; flex-shrink: 0; color: rgba(255,255,255,0.4); transition: color 0.16s; }
  .sidebar-item:hover { background: var(--glass); color: var(--white); }
  .sidebar-item:hover svg { color: var(--blue-lite); }
  .sidebar-item.active {
    background: var(--blue-dim); border-color: rgba(7,114,237,0.32); color: #fff;
    box-shadow: 0 0 0 1px rgba(7,114,237,0.12) inset;
  }
  .sidebar-item.active svg { color: var(--blue); }
  .sidebar-count {
    margin-left: auto; font-size: 0.68rem; font-weight: 600;
    color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.06);
    border-radius: 999px; padding: 1px 7px;
  }
  .sidebar-item.active .sidebar-count { color: var(--blue-lite); background: rgba(7,114,237,0.15); }

  .content-panel { flex: 1; overflow-y: auto; padding: 28px 32px 40px; }
  .content-panel::-webkit-scrollbar { width: 4px; }
  .content-panel::-webkit-scrollbar-thumb { background: rgba(7,114,237,0.22); border-radius: 999px; }
  .content-inner { max-width: 980px; margin: 0 auto; }

  .panel-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; gap: 16px; flex-wrap: wrap; }
  .panel-title {
    font-family: 'Playfair Display', serif; font-size: 1.65rem; font-weight: 700;
    color: #fff; margin-bottom: 5px; letter-spacing: -0.3px;
  }
  .panel-sub { font-size: 0.80rem; color: var(--text-dim); }

  /* Stat cards */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 16px;
    padding: 18px 20px; position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--blue), transparent);
  }
  .stat-card.done::before { background: linear-gradient(90deg, transparent, var(--green), transparent); }
  .stat-card.pending::before { background: linear-gradient(90deg, transparent, var(--amber), transparent); }
  .stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: #fff; }
  .stat-icon { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 10px; background: var(--blue-dim); border: 1px solid rgba(7,114,237,0.25); display: flex; align-items: center; justify-content: center; }
  .stat-icon svg { width: 16px; height: 16px; color: var(--blue); }
  .stat-card.done .stat-icon { background: rgba(0,214,143,0.10); border-color: rgba(0,214,143,0.25); }
  .stat-card.done .stat-icon svg { color: var(--green); }
  .stat-card.pending .stat-icon { background: rgba(255,170,0,0.10); border-color: rgba(255,170,0,0.25); }
  .stat-card.pending .stat-icon svg { color: var(--amber); }

  /* States */
  .state-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 20px; text-align: center; color: var(--text-dim);
  }
  .state-icon {
    width: 46px; height: 46px; border-radius: 14px; background: var(--blue-dim);
    border: 1px solid rgba(7,114,237,0.25); display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .state-icon svg { width: 20px; height: 20px; color: var(--blue); }
  .state-title { font-size: 0.90rem; font-weight: 500; color: rgba(255,255,255,0.7); margin-bottom: 4px; }
  .state-sub { font-size: 0.78rem; max-width: 280px; }
  .state-icon.error { background: rgba(255,60,60,0.10); border-color: rgba(255,60,60,0.28); }
  .state-icon.error svg { color: #ff6b6b; }

  .spin-ring {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid rgba(7,114,237,0.2); border-top-color: var(--blue);
    animation: spin 0.7s linear infinite;
  }
  .spin-ring.small { width: 14px; height: 14px; border-width: 2px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Appointment cards ── */
  .appt-list { display: flex; flex-direction: column; gap: 10px; }
  .appt-card {
    display: flex; align-items: center; gap: 16px;
    background: var(--glass); border: 1px solid var(--border); border-radius: 15px;
    padding: 15px 18px; transition: border-color 0.18s, background 0.18s;
  }
  .appt-card.completed { border-color: rgba(0,214,143,0.22); background: rgba(0,214,143,0.03); }
  .appt-card.cancelled { border-color: rgba(255,60,60,0.20); background: rgba(255,60,60,0.03); opacity: 0.75; }
  .appt-slot {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    width: 64px; flex-shrink: 0; padding: 8px 4px; border-radius: 11px;
    background: rgba(7,114,237,0.08); border: 1px solid rgba(7,114,237,0.2);
  }
  .appt-slot-time { font-size: 0.82rem; font-weight: 700; color: var(--blue-lite); font-variant-numeric: tabular-nums; }
  .appt-slot-label { font-size: 0.58rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

  .appt-body { flex: 1; min-width: 0; }
  .appt-top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; flex-wrap: wrap; }
  .appt-name { font-size: 0.92rem; font-weight: 600; color: #fff; }
  .appt-meta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .appt-meta { font-size: 0.76rem; color: var(--text-dim); display: flex; align-items: center; gap: 5px; }
  .appt-meta svg { width: 12px; height: 12px; }
  .appt-id { font-size: 0.68rem; color: rgba(255,255,255,0.28); font-family: monospace; }

  .badge-pill {
    display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 999px;
    font-size: 0.64rem; font-weight: 600; letter-spacing: 0.3px;
  }
  .badge-pill.revisit { background: rgba(255,170,0,0.12); color: var(--amber); border: 1px solid rgba(255,170,0,0.28); }
  .badge-pill.new { background: rgba(7,114,237,0.10); color: var(--blue-lite); border: 1px solid rgba(7,114,237,0.25); }

  .appt-action { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  /* ── Status dropdown ── */
  .status-select-wrap { display: flex; align-items: center; gap: 8px; }
  .status-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    font-family: 'Lora', serif;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.2px;
    padding: 7px 30px 7px 13px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background-color: var(--glass);
    color: var(--text-mid);
    cursor: pointer;
    outline: none;
    min-width: 118px;
    text-align: left;
    transition: border-color 0.18s, background-color 0.18s, color 0.18s, opacity 0.18s;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23ffffff' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }
  .status-select:hover:not(:disabled) { border-color: rgba(7,114,237,0.4); }
  .status-select:focus { border-color: rgba(7,114,237,0.55); }
  .status-select:disabled { opacity: 0.55; cursor: not-allowed; }
  .status-select option { background: #0a0a0a; color: #fff; }

  .status-select.status-pending   { color: var(--amber); border-color: rgba(255,170,0,0.28); background-color: rgba(255,170,0,0.08); }
  .status-select.status-confirmed { color: var(--blue-lite); border-color: rgba(7,114,237,0.28); background-color: rgba(7,114,237,0.08); }
  .status-select.status-completed { color: var(--green); border-color: rgba(0,214,143,0.28); background-color: rgba(0,214,143,0.08); }
  .status-select.status-cancelled { color: #ff6b6b; border-color: rgba(255,60,60,0.28); background-color: rgba(255,60,60,0.08); }

  .status-saving-note { font-size: 0.68rem; color: var(--text-dim); white-space: nowrap; }

  /* ── Timer panel ── */
  .timer-wrap {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 50px 20px 42px;
  }
  .timer-ring {
    width: 220px; height: 220px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(circle at 50% 40%, rgba(7,114,237,0.10), transparent 70%);
    border: 1px solid rgba(0,214,143,0.28);
    box-shadow: 0 0 0 1px rgba(0,214,143,0.08), 0 0 50px rgba(0,214,143,0.10);
    position: relative;
    animation: ring-breathe 3.2s ease-in-out infinite;
  }
  @keyframes ring-breathe {
    0%,100% { box-shadow: 0 0 0 1px rgba(0,214,143,0.08), 0 0 40px rgba(0,214,143,0.08); }
    50%      { box-shadow: 0 0 0 1px rgba(0,214,143,0.16), 0 0 60px rgba(0,214,143,0.18); }
  }
  .timer-digits {
    font-family: 'Playfair Display', serif; font-size: 2.6rem; font-weight: 700; color: #fff;
    font-variant-numeric: tabular-nums; letter-spacing: 1px;
  }
  .timer-caption {
    display: flex; align-items: center; gap: 6px; margin-top: 8px;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--green);
  }
  .timer-caption .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: dot-pulse 2s ease-in-out infinite; }
  .timer-started {
    margin-top: 22px; font-size: 0.80rem; color: var(--text-dim); text-align: center;
  }
  .timer-started strong { color: rgba(255,255,255,0.75); font-weight: 500; }
  .timer-note {
    margin-top: 26px; max-width: 380px; text-align: center; font-size: 0.74rem; color: var(--text-dim);
    background: var(--glass); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }
  .timer-note svg { width: 14px; height: 14px; color: var(--blue-lite); flex-shrink: 0; margin-top: 1px; }
`;

/* ── Icons ──────────────────────────────────────────────── */
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const OverviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);
const ClockBigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const HourglassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3h14M5 21h14M6 3c0 5 12 5 12 9s-12 4-12 9M18 3c0 5-12 5-12 9s12 4 12 9" />
  </svg>
);
const UserSmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 16v-5M12 8h.01" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────── */
const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const formatHMS = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const formatClock12 = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* Session timer persistence — keeps counting across page refreshes instead
   of restarting, by storing the original start timestamp in localStorage. */
const SESSION_START_KEY = "doctor_session_start";

const getOrCreateSessionStart = () => {
  const stored = localStorage.getItem(SESSION_START_KEY);
  if (stored) {
    const parsed = new Date(stored);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const fresh = new Date();
  localStorage.setItem(SESSION_START_KEY, fresh.toISOString());
  return fresh;
};

/* Sort helper: appointments ordered by time slot ascending ("HH:MM" strings sort lexicographically fine) */
const sortBySlot = (list) =>
  [...list].sort((a, b) => {
    const ta = a.time || a.time_slot || a.slot || "";
    const tb = b.time || b.time_slot || b.slot || "";
    return ta.localeCompare(tb);
  });

/* Status dropdown options — value must match backend enum */
const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

/* Which transitions are allowed from a given current status:
   - PENDING   → Confirmed, Completed, or Cancelled are all selectable
   - CONFIRMED → only Completed is selectable
   - COMPLETED / CANCELLED → terminal, dropdown is fully disabled */
const isTerminalStatus = (status) =>
  status === "COMPLETED" || status === "CANCELLED";

const isOptionDisabled = (currentStatus, optionValue) => {
  if (optionValue === currentStatus) return false;
  if (currentStatus === "PENDING") return false;
  if (currentStatus === "CONFIRMED") return optionValue !== "COMPLETED";
  return true;
};

/* ── Sidebar config ─────────────────────────────────────── */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <OverviewIcon /> },
  { key: "appointments", label: "Appointments", icon: <CalendarIcon /> },
  { key: "timer", label: "Session Timer", icon: <ClockBigIcon /> },
];

/* ══════════════════════ Overview panel ═══════════════════ */
function OverviewPanel({ counts, elapsedSeconds }) {
  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Overview</h2>
          <p className="panel-sub">Your appointment summary for today.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon /></div>
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value">{counts.total ?? "—"}</div>
        </div>
        <div className="stat-card done">
          <div className="stat-icon"><CheckCircleIcon /></div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{counts.completed ?? "—"}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon"><HourglassIcon /></div>
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{counts.remaining ?? "—"}</div>
        </div>
      </div>
      <div className="timer-note">
        <ClockBigIcon />
        <span>You've been on duty for <strong style={{ color: "#fff" }}>{formatHMS(elapsedSeconds)}</strong> this session. See the Session Timer tab for the live clock.</span>
      </div>
    </div>
  );
}

/* ══════════════════════ Appointments panel ════════════════ */
function AppointmentsPanel({ onCountsChange }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [savingIds, setSavingIds] = useState({});

  // Fetch doctor's appointments
  useEffect(() => {
    let active = true;

    const fetchAppointments = async () => {
      setStatus("loading");

      try {
        const { data } = await axios.get(
          "http://127.0.0.1:8000/api/appointments/doctor/",
          authHeaders()
        );

        if (!active) return;

        const list = sortBySlot(
          Array.isArray(data) ? data : data?.results || []
        );

        setRows(list);
        setStatus(list.length ? "ready" : "empty");
      } catch (error) {
        console.error("Failed to load appointments:", error);

        if (active) {
          setStatus("error");
        }
      }
    };

    fetchAppointments();

    return () => {
      active = false;
    };
  }, []);

  // Keep Overview counts in sync
  useEffect(() => {
    if (status !== "ready" && status !== "empty") return;

    const completed = rows.filter(
      (row) => row.status === "COMPLETED"
    ).length;

    onCountsChange?.({
      total: rows.length,
      completed,
      remaining: rows.length - completed,
    });
  }, [rows, status, onCountsChange]);

  // Update appointment status — called whenever the doctor picks a new
  // value from the status dropdown (Pending / Confirmed / Completed / Cancelled).
  const updateAppointmentStatus = async (appointment, nextStatus) => {
    const id = appointment.id ?? appointment.appointment_id;

    if (!id) {
      console.error("Appointment ID not found:", appointment);
      return;
    }

    // No-op if nothing actually changed
    if (appointment.status === nextStatus) return;

    // Prevent duplicate requests while one is already in flight
    if (savingIds[id]) return;

    const previousStatus = appointment.status;

    // Show saving state
    setSavingIds((prev) => ({
      ...prev,
      [id]: true,
    }));

    // Optimistic update
    setRows((prev) =>
      prev.map((row) =>
        (row.id ?? row.appointment_id) === id
          ? {
            ...row,
            status: nextStatus,
          }
          : row
      )
    );

    try {
      // IMPORTANT:
      // PATCH uses /doctor/ because this matches
      // DoctorAppointmentsView.patch()
      const { data } = await axios.patch(
        "http://127.0.0.1:8000/api/appointments/doctor/",
        {
          appointment_id: id,
          status: nextStatus,
        },
        authHeaders()
      );

      console.log("Appointment status updated:", data);

      // Sync with backend response
      if (data?.appointment) {
        setRows((prev) =>
          prev.map((row) =>
            (row.id ?? row.appointment_id) === id
              ? {
                ...row,
                ...data.appointment,
              }
              : row
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to update appointment status:",
        error
      );

      // Rollback optimistic update
      setRows((prev) =>
        prev.map((row) =>
          (row.id ?? row.appointment_id) === id
            ? {
              ...row,
              status: previousStatus,
            }
            : row
        )
      );

      alert(
        error?.response?.data?.message ||
        "Failed to update appointment status."
      );
    } finally {
      setSavingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">
            Appointments
          </h2>

          <p className="panel-sub">
            Ordered by time slot. Use the dropdown to update a visit's status.
          </p>
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="state-box">
          <div
            className="spin-ring"
            style={{ marginBottom: 14 }}
          />

          <div className="state-title">
            Loading your appointments…
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="state-box">
          <div className="state-icon error">
            <CalendarIcon />
          </div>

          <div className="state-title">
            Couldn't load appointments
          </div>

          <p className="state-sub">
            Check that the appointments endpoint is reachable and try again.
          </p>
        </div>
      )}

      {/* Empty */}
      {status === "empty" && (
        <div className="state-box">
          <div className="state-icon">
            <CalendarIcon />
          </div>

          <div className="state-title">
            No appointments scheduled
          </div>

          <p className="state-sub">
            Bookings assigned to you will show up here, sorted by time slot.
          </p>
        </div>
      )}

      {/* Appointments */}
      {status === "ready" && (
        <div className="appt-list">
          {rows.map((a) => {
            const id =
              a.id ?? a.appointment_id;

            const isSaving = !!savingIds[id];

            const isRevisit =
              !!a.revisit;

            const currentStatus =
              a.status || "PENDING";

            return (
              <div
                className={`appt-card${currentStatus === "COMPLETED"
                  ? " completed"
                  : currentStatus === "CANCELLED"
                    ? " cancelled"
                    : ""
                  }`}
                key={id}
              >
                {/* Time Slot */}
                <div className="appt-slot">
                  <span className="appt-slot-time">
                    {a.appointment_time ||
                      a.time_slot ||
                      a.slot ||
                      "—"}
                  </span>

                  <span className="appt-slot-label">
                    Slot
                  </span>
                </div>

                {/* Appointment Information */}
                <div className="appt-body">
                  <div className="appt-top-row">
                    <span className="appt-name">
                      {a.patient_name ||
                        a.patient ||
                        "Unknown patient"}
                    </span>

                    <span
                      className={`badge-pill ${isRevisit
                        ? "revisit"
                        : "new"
                        }`}
                    >
                      {isRevisit
                        ? "Revisit"
                        : "New Patient"}
                    </span>
                  </div>

                  <div className="appt-meta-row">
                    <span className="appt-meta">
                      <UserSmIcon />
                      {a.gender || "—"}
                    </span>

                    <span className="appt-id">
                      ID #{id}
                    </span>
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="appt-action">
                  <div className="status-select-wrap">
                    {isSaving && (
                      <span className="status-saving-note">
                        Saving…
                      </span>
                    )}

                    <select
                      className={`status-select status-${currentStatus.toLowerCase()}`}
                      value={currentStatus}
                      disabled={
                        isSaving ||
                        isTerminalStatus(currentStatus)
                      }
                      onChange={(e) =>
                        updateAppointmentStatus(
                          a,
                          e.target.value
                        )
                      }
                    >
                      {STATUS_OPTIONS.map(
                        (opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={isOptionDisabled(
                              currentStatus,
                              opt.value
                            )}
                          >
                            {opt.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ Session Timer panel ═══════════════ */
function TimerPanel({ elapsedSeconds, sessionStart }) {
  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Session Timer</h2>
          <p className="panel-sub">Tracks how long you've been signed in this session.</p>
        </div>
      </div>

      <div className="timer-wrap">
        <div className="timer-ring">
          <div className="timer-digits">{formatHMS(elapsedSeconds)}</div>
          <div className="timer-caption"><span className="dot" /> On duty</div>
        </div>
        <div className="timer-started">
          Session started at <strong>{sessionStart ? formatClock12(sessionStart) : "—"}</strong>
        </div>
        <div className="timer-note">
          <InfoIcon />
          <span>This clock keeps running until you log out. Your working time for today is sent to the server automatically when you log out, and the timer resets to 00:00:00 the next time you sign in.</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ Main Component ════════════════════ */
export default function DoctorDashboard() {
  const [active, setActive] = useState("overview");
  const [doctor, setDoctor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", error: false });
  const [counts, setCounts] = useState({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const profileRef = useRef(null);
  const sessionStartRef = useRef(getOrCreateSessionStart());
  const navigate = useNavigate();

  /* fetch signed-in doctor's own profile for the header */
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/users/me/", authHeaders());
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };
    fetchDoctor();
  }, []);

  /* session timer — starts the moment this dashboard mounts. The start
     timestamp is persisted in localStorage (see getOrCreateSessionStart)
     so a page refresh keeps counting instead of resetting; it only resets
     to 00:00:00 once handleLogout clears SESSION_START_KEY and a fresh
     login creates a new start time. On logout, handleLogout POSTs the
     final duration to the working-time endpoint. */
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const showToast = (msg, error = false) => {
    setToast({ show: true, msg, error });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const handleLogout = async () => {
    const sessionEnd = new Date();

    const finalDurationSeconds = Math.floor(
      (sessionEnd.getTime() - sessionStartRef.current.getTime()) / 1000
    );

    // Backend expects HH:MM:SS, not ISO datetime
    const formatTimeOnly = (date) => {
      return date.toTimeString().slice(0, 8);
    };

    const payload = {
      start: formatTimeOnly(sessionStartRef.current),
      end: formatTimeOnly(sessionEnd),
      duration_seconds: finalDurationSeconds,
    };

    console.log("Session log payload:", payload);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/doctors/session-log/",
        payload,
        authHeaders()
      );

      console.log("Working time logged successfully");
    } catch (error) {
      console.error(
        "Session log error:",
        error.response?.data || error
      );

      // Don't prevent logout if session logging fails
    }finally{
      sessionStartRef.current = null;
    }

    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem(SESSION_START_KEY);

    showToast("Logged out successfully! See you next time.");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };


  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <div className="bg-blob bg-blob-1" /><div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" /><div className="bg-grid" />

        {/* ══ HEADER ══ */}
        <header className="header">
          <div className="header-left">
            <div className="header-logo">
              <div className="logo-icon"><CrossIcon /></div>
              <span className="logo-text">Medico</span>
            </div>
            <span className="logo-badge">Doctor</span>
          </div>

          <div className="header-left" style={{ gap: 14 }}>
            <div className="header-clock">
              <span className="dot" /> {formatHMS(elapsedSeconds)}
            </div>

            <div className="profile-area" ref={profileRef}>
              <button className="profile-btn" onClick={() => setProfileOpen((o) => !o)}>
                <div className="profile-avatar">{initialsOf(doctor?.name)}</div>
                <span className="profile-name">{doctor?.name ? `Dr. ${doctor.name}` : "Loading..."}</span>
                <span className={`profile-chevron${profileOpen ? " open" : ""}`}><ChevronIcon /></span>
              </button>
              <div className={`profile-dropdown${profileOpen ? " open" : ""}`}>
                <button className="dropdown-item"><EditIcon /> Edit Info</button>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}><LogoutIcon /> Logout</button>
              </div>
            </div>
          </div>
        </header>

        <div className={`toast${toast.show ? " show" : ""}${toast.error ? " error" : ""}`}>
          ✦ {toast.msg} ✦
        </div>

        {/* ══ SPLIT BODY ══ */}
        <div className="admin-body">
          <aside className="sidebar">
            <div className="sidebar-label">Dashboard</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`sidebar-item${active === item.key ? " active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                {item.icon}
                {item.label}
                {item.key === "appointments" && counts.remaining != null && (
                  <span className="sidebar-count">{counts.remaining}</span>
                )}
              </button>
            ))}
          </aside>

          <section className="content-panel">
            {active === "overview" && <OverviewPanel counts={counts} elapsedSeconds={elapsedSeconds} />}
            {active === "appointments" && <AppointmentsPanel onCountsChange={setCounts} />}
            {active === "timer" && <TimerPanel elapsedSeconds={elapsedSeconds} sessionStart={sessionStartRef.current} />}
          </section>
        </div>
      </div>
    </>
  );
}