import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

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
    font-family: 'DM Sans', sans-serif;
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

  /* ─── HEADER (same as Home.jsx) ────────────────────────── */
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
    border:none; background:none; width:100%; text-align:left; font-family:'DM Sans',sans-serif;
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
    color: #5de8a8; font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
    z-index: 1001; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.error { background: rgba(255,60,60,0.12); border-color: rgba(255,60,60,0.3); color: #ff8a8a; }

  /* ─── BODY SPLIT ───────────────────────────────────────── */
  .admin-body {
    flex: 1; display: flex; overflow: hidden; position: relative; z-index: 1;
  }

  /* ── Sidebar ── */
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
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
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
  .sidebar-divider { height: 1px; background: var(--border); margin: 10px 4px; }

  /* ── Content panel ── */
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

  /* Stat cards (Overview) */
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 16px;
    padding: 18px 20px; position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--blue), transparent);
  }
  .stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: #fff; }
  .stat-icon { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 10px; background: var(--blue-dim); border: 1px solid rgba(7,114,237,0.25); display: flex; align-items: center; justify-content: center; }
  .stat-icon svg { width: 16px; height: 16px; color: var(--blue); }

  /* Button */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px; border: none; border-radius: 11px;
    background: linear-gradient(135deg, #0560cc 0%, #0772ed 60%, #1a8aff 100%);
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
    cursor: pointer; box-shadow: 0 6px 22px rgba(7,114,237,0.32);
    transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(7,114,237,0.44); }
  .btn-primary:active:not(:disabled) { transform: translateY(1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary svg { width: 14px; height: 14px; }

  .btn-ghost {
    padding: 9px 15px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--glass); color: var(--text-mid); font-size: 0.80rem; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.16s;
  }
  .btn-ghost:hover { border-color: rgba(7,114,237,0.35); color: #fff; background: var(--blue-soft); }

  /* Table */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table thead th {
    text-align: left; font-size: 0.66rem; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;
    color: var(--text-dim); padding: 0 14px 10px; border-bottom: 1px solid var(--border);
  }
  .data-table tbody td {
    padding: 13px 14px; font-size: 0.83rem; color: rgba(255,255,255,0.82);
    border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle;
  }
  .data-table tbody tr { transition: background 0.15s; }
  .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
  .cell-primary { font-weight: 500; color: #fff; }
  .cell-dim { color: var(--text-dim); }

  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 999px; font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.3px;
  }
  .status-pill.confirmed { background: rgba(0,214,143,0.12); color: var(--green); border: 1px solid rgba(0,214,143,0.28); }
  .status-pill.pending   { background: rgba(255,170,0,0.12); color: var(--amber); border: 1px solid rgba(255,170,0,0.28); }
  .status-pill.cancelled { background: rgba(255,77,77,0.12); color: var(--red); border: 1px solid rgba(255,77,77,0.28); }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  .avatar-chip {
    width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg,#0560cc,#1a8aff);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.66rem; font-weight: 600; color: #fff; margin-right: 10px;
  }
  .row-flex { display: flex; align-items: center; }

  /* Session (Today) column pill */
  .session-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
    font-variant-numeric: tabular-nums;
    background: rgba(7,114,237,0.10); color: var(--blue-lite);
    border: 1px solid rgba(7,114,237,0.25);
  }
  .session-pill svg { width: 12px; height: 12px; flex-shrink: 0; }
  .session-pill.none { background: rgba(255,255,255,0.04); color: var(--text-dim); border-color: var(--border); }
  .session-pill.live { background: rgba(0,214,143,0.10); color: var(--green); border-color: rgba(0,214,143,0.28); }
  .session-pill .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: dot-pulse 2s ease-in-out infinite; }
  @keyframes dot-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,214,143,0.5); } 50% { box-shadow: 0 0 0 3px rgba(0,214,143,0); } }

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
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Form (New Doctor) */
  .form-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 28px; max-width: 620px;
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { margin-bottom: 16px; }
  .form-label {
    display: block; font-size: 0.70rem; font-weight: 500; letter-spacing: 0.7px; text-transform: uppercase;
    color: rgba(255,255,255,0.4); margin-bottom: 7px;
  }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10); border-radius: 11px; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.87rem; outline: none;
    transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
    -webkit-text-fill-color: #fff; appearance: none;
  }
  .form-textarea { resize: vertical; min-height: 70px; }
  .form-input::placeholder, .form-textarea::placeholder { color: rgba(255,255,255,0.22); -webkit-text-fill-color: rgba(255,255,255,0.22); }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: rgba(7,114,237,0.7); background: rgba(7,114,237,0.07); box-shadow: 0 0 0 3px rgba(7,114,237,0.10);
  }
  .form-select option { background: #0d1117; color: #fff; }

  /* Custom-styled select (chevron + polish) */
  .select-wrap { position: relative; }
  .select-wrap select.form-select {
    padding-right: 40px;
    cursor: pointer;
  }
  .select-wrap select.form-select:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .select-wrap::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    width: 8px;
    height: 8px;
    border-right: 1.6px solid rgba(122,175,255,0.65);
    border-bottom: 1.6px solid rgba(122,175,255,0.65);
    transform: translateY(-65%) rotate(45deg);
    pointer-events: none;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }
  .select-wrap:focus-within::after {
    border-color: var(--blue-lite);
  }
  .select-wrap select.form-select:disabled ~ .select-wrap::after,
  .select-wrap:has(select:disabled)::after {
    border-color: rgba(255,255,255,0.18);
  }

  .error-msg {
    background: rgba(255,60,60,0.10); border: 1px solid rgba(255,60,60,0.25); border-radius: 10px;
    padding: 10px 14px; color: #ff7070; font-size: 0.80rem; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }

  /* Education tag input */
  .tag-input-row { display: flex; gap: 8px; }
  .tag-input-row .form-input { flex: 1; }
  .tag-add-btn {
    flex-shrink: 0; width: 42px; height: 42px; border-radius: 11px; border: 1px solid rgba(7,114,237,0.3);
    background: var(--blue-dim); color: var(--blue-lite); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.16s;
  }
  .tag-add-btn:hover:not(:disabled) { background: rgba(7,114,237,0.22); border-color: rgba(7,114,237,0.5); }
  .tag-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .tag-add-btn svg { width: 16px; height: 16px; }
  .tag-hint {
    font-size: 0.68rem; color: var(--text-dim); margin-top: 7px;
  }
  .tag-hint.limit { color: var(--amber); }
  .tag-list {
    display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
  }
  .tag-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 8px 7px 13px; border-radius: 999px;
    background: rgba(7,114,237,0.09); border: 1px solid rgba(7,114,237,0.26);
    font-size: 0.80rem; color: #fff; font-weight: 500;
    animation: chip-in 0.22s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes chip-in { from { opacity: 0; transform: translateY(-4px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .tag-chip-remove {
    width: 18px; height: 18px; border-radius: 50%; border: none; cursor: pointer;
    background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: all 0.15s; padding: 0;
  }
  .tag-chip-remove:hover { background: rgba(255,60,60,0.25); color: #ff9d9d; }
  .tag-chip-remove svg { width: 10px; height: 10px; }

  /* Availability time range */
  .time-range-row { display: flex; align-items: flex-end; gap: 12px; }
  .time-field { flex: 1; }
  .time-input-wrap {
    position: relative; display: flex; align-items: center;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
    border-radius: 11px; padding: 0 14px; transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
  }
  .time-input-wrap:focus-within {
    border-color: rgba(7,114,237,0.7); background: rgba(7,114,237,0.07); box-shadow: 0 0 0 3px rgba(7,114,237,0.10);
  }
  .time-input-wrap svg { width: 15px; height: 15px; color: rgba(7,114,237,0.65); flex-shrink: 0; }
  .time-input {
    flex: 1; background: none; border: none; outline: none; color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 0.87rem; padding: 12px 8px;
    -webkit-text-fill-color: #fff; color-scheme: dark;
  }
  .time-sep {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 42px; color: var(--text-dim); font-size: 0.75rem; flex-shrink: 0;
  }
  .time-range-note {
    display: flex; align-items: center; gap: 6px; margin-top: 9px;
    font-size: 0.72rem; color: var(--text-dim);
  }
  .time-range-note.warn { color: var(--amber); }
  .time-range-note svg { width: 12px; height: 12px; flex-shrink: 0; }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0,0,0,0.68); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: overlay-in 0.2s ease both;
  }
  @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }
  .modal-card {
    width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto;
    background: rgba(10,10,12,0.92); backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.10); border-radius: 20px;
    padding: 26px 26px 24px;
    box-shadow: 0 0 0 1px rgba(7,114,237,0.15), 0 40px 100px rgba(0,0,0,0.7);
    animation: modal-in 0.28s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes modal-in { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; gap: 12px; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .modal-sub { font-size: 0.78rem; color: var(--text-dim); }
  .modal-close {
    width: 30px; height: 30px; border-radius: 9px; border: 1px solid var(--border);
    background: var(--glass); color: var(--text-mid); cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .modal-close:hover { border-color: rgba(255,60,60,0.3); color: #ff7070; background: rgba(255,60,60,0.08); }
  .modal-close svg { width: 14px; height: 14px; }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-actions .btn-primary { flex: 1; justify-content: center; }
  .modal-actions .btn-ghost { flex-shrink: 0; }

  .select-hint { font-size: 0.68rem; color: var(--text-dim); margin-top: 6px; }
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
const StethoscopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v6a4 4 0 0 0 8 0V4M8 18a4 4 0 0 0 4-4v-2" />
    <circle cx="19" cy="18" r="2.5" />
  </svg>
);
const AddDoctorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);
const UsersIconSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" />
    <path d="M16 3.5a4 4 0 0 1 0 7.8M22 21c0-3.2-2.1-5.8-5-6.7" />
  </svg>
);
const ClockIconSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SmallXIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const GradCapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
  </svg>
);
const AlertIconSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────── */
const initialsOf = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

/* Turns a duration in seconds into a compact "2h 15m" / "45m" / "—" label
   for table cells (not the full HH:MM:SS used on the doctor's own timer). */
const formatDurationShort = (totalSeconds) => {
  if (totalSeconds == null || isNaN(totalSeconds)) return null;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h <= 0 && m <= 0) return "<1m";
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
};

/* ── Sidebar config ─────────────────────────────────────── */
const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: <OverviewIcon /> },
  { key: "appointments", label: "Appointments", icon: <CalendarIcon /> },
  { key: "doctors", label: "Doctors", icon: <StethoscopeIcon /> },
  { key: "new-doctor", label: "New Doctor", icon: <AddDoctorIcon /> },
];

/* ══════════════════════ Overview panel ═══════════════════ */
function OverviewPanel({ counts }) {
  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Overview</h2>
          <p className="panel-sub">A quick snapshot of what's happening across Medico.</p>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon /></div>
          <div className="stat-label">Total Appointments</div>
          <div className="stat-value">{counts.appointments ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><StethoscopeIcon /></div>
          <div className="stat-label">Active Doctors</div>
          <div className="stat-value">{counts.doctors ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><UsersIconSm /></div>
          <div className="stat-label">Registered Patients</div>
          <div className="stat-value">{counts.patients ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ New Appointment modal ═════════════ */
function NewAppointmentModal({ onClose, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorsStatus, setDoctorsStatus] = useState("idle"); // idle | loading | ready | empty | error

  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    department: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch doctors for the chosen department only after one is picked
  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      setDoctorsStatus("idle");
      return;
    }
    let active = true;
    const fetchDoctorsByDept = async () => {
      setDoctorsStatus("loading");
      try {
        const { data } = await axios.get(
          `http://127.0.0.1:8000/api/doctors/?specialization=${encodeURIComponent(form.department)}`,
          authHeaders()
        );
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.results || [];
        setDoctors(list);
        setDoctorsStatus(list.length ? "ready" : "empty");
      } catch {
        if (active) setDoctorsStatus("error");
      }
    };
    fetchDoctorsByDept();
    return () => { active = false; };
  }, [form.department]);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((p) => {
      // changing department invalidates a previously-picked doctor
      if (field === "department") return { ...p, department: value, doctor_id: "" };
      // changing doctor or date invalidates a previously-picked time slot
      if (field === "doctor_id" || field === "appointment_date") {
        return { ...p, [field]: value, appointment_time: "" };
      }
      return { ...p, [field]: value };
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Currently selected doctor object, so we can read their working hours
  const selectedDoctor = doctors.find((d) => String(d.id) === String(form.doctor_id));

  // "HH:MM" -> minutes since midnight, and back, to make slicing easy
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const toHHMM = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  const formatLabel = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  // Build the list of bookable start-times from the doctor's working window
  const generateSlots = (doctor) => {
    if (!doctor?.available_from || !doctor?.available_to || !doctor?.slot_duration) return [];
    const start = toMinutes(doctor.available_from);
    const end = toMinutes(doctor.available_to);
    const duration = Number(doctor.slot_duration);
    if (!duration || duration <= 0 || end <= start) return [];

    const slots = [];
    for (let t = start; t + duration <= end; t += duration) {
      slots.push(toHHMM(t));
    }
    return slots;
  };

  const availableSlots = selectedDoctor ? generateSlots(selectedDoctor) : [];

  // TODO: cross-reference availableSlots against already-booked appointments
  // for this doctor + appointment_date once a real availability-check
  // endpoint exists, so already-taken slots (blocked by the model's
  // unique_doctor_appointment_slot constraint) can be filtered out or
  // shown disabled instead of only surfacing as a submit-time error.

  // Fairly permissive phone check — loosen/tighten to match your patient_phone format
  const isValidPhone = (val) => /^[0-9+\-\s()]{7,15}$/.test(val.trim());
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const validate = () => {
    if (!form.patient_name.trim()) return "Patient name is required.";
    if (!form.patient_phone.trim()) return "Phone number is required.";
    if (!isValidPhone(form.patient_phone)) return "Enter a valid phone number.";
    if (form.patient_email.trim() && !isValidEmail(form.patient_email)) return "Enter a valid email address.";
    if (!form.department) return "Please select a department.";
    if (!form.doctor_id) return "Please select a doctor.";
    if (!form.appointment_date) return "Please select an appointment date.";
    if (form.appointment_date < todayStr) return "Appointment date can't be in the past.";
    if (!form.appointment_time) return "Please select an appointment time.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/appointments/book/",
        {
          patient_name: form.patient_name.trim(),
          patient_phone: form.patient_phone.trim(),
          patient_email: form.patient_email.trim() || null,
          doctor: form.doctor_id,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          reason: form.reason.trim() || null,
        },
        authHeaders()
      );
      onBooked?.();
    } catch (err) {
      console.log("BOOKING ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      if (err.response?.data) {
        const data = err.response.data;

        let msg = "Could not book appointment.";

        if (typeof data === "string") {
          msg = data;
        }
        // DRF raises the unique_doctor_appointment_slot constraint violation
        // as a non_field_errors entry, not tied to any specific field
        else if (data.non_field_errors) {
          msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        }
        else if (data.message) {
          msg = data.message;
        }
        else if (data.appointment_time) {
          msg = Array.isArray(data.appointment_time) ? data.appointment_time[0] : data.appointment_time;
        }
        else if (data.detail) {
          msg = data.detail;
        }
        else if (typeof data === "object") {
          msg = Object.values(data)
            .flat(Infinity)
            .filter(Boolean)
            .join(" ");
        }

        setError(msg);
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-title">New Appointment</div>
            <div className="modal-sub">Book a slot and route it to the right doctor.</div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><SmallXIcon /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <input className="form-input" placeholder="Full name" value={form.patient_name} onChange={set("patient_name")} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="e.g. 9876543210" value={form.patient_phone} onChange={set("patient_phone")} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input className="form-input" type="email" placeholder="patient@example.com" value={form.patient_email} onChange={set("patient_email")} />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <div className="select-wrap">
                <select
                  className="form-select"
                  value={form.department}
                  onChange={set("department")}
                >
                  <option value="" disabled hidden>Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor</label>
              <div className="select-wrap">
                <select
                  className="form-select"
                  value={form.doctor_id}
                  onChange={set("doctor_id")}
                  disabled={!form.department || doctorsStatus !== "ready"}
                >
                  <option value="" disabled hidden>
                    {!form.department
                      ? "Pick a department first"
                      : doctorsStatus === "loading"
                        ? "Loading doctors…"
                        : doctorsStatus === "empty"
                          ? "No doctors in this department"
                          : doctorsStatus === "error"
                            ? "Couldn't load doctors"
                            : "Select doctor"}
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}{d.experience != null ? ` — ${d.experience} yrs exp` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {form.department && doctorsStatus === "empty" && (
                <p className="select-hint">No doctors found in this department.</p>
              )}
              {form.department && doctorsStatus === "error" && (
                <p className="select-hint" style={{ color: "#ff8a8a" }}>Couldn't load doctors — check the doctors endpoint.</p>
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input
                className="form-input"
                type="date"
                min={todayStr}
                value={form.appointment_date}
                onChange={set("appointment_date")}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Time</label>
              <div className="select-wrap">
                <select
                  className="form-select"
                  value={form.appointment_time}
                  onChange={set("appointment_time")}
                  disabled={!form.doctor_id || !form.appointment_date || availableSlots.length === 0}
                >
                  <option value="" disabled hidden>
                    {!form.doctor_id
                      ? "Pick a doctor first"
                      : !form.appointment_date
                        ? "Pick a date first"
                        : availableSlots.length === 0
                          ? "No slots available"
                          : "Select time"}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{formatLabel(slot)}</option>
                  ))}
                </select>
              </div>
              {form.doctor_id && form.appointment_date && availableSlots.length === 0 && (
                <p className="select-hint">This doctor has no configured availability.</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for visit (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Briefly describe the reason for the appointment…"
              value={form.reason}
              onChange={set("reason")}
            />
          </div>

          {error && <div className="error-msg"><span>⚠</span> {error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
/* ══════════════════════ Appointments panel ════════════════ */
function AppointmentsPanel() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error | empty
  const [showModal, setShowModal] = useState(false);

  const fetchAppointments = async () => {
    setStatus("loading");
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/appointments/admin/", authHeaders());
      const list = Array.isArray(data) ? data : data?.results || [];
      setRows(list);
      setStatus(list.length ? "ready" : "empty");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus("loading");
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/appointments/admin/", authHeaders());
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.results || [];
        setRows(list);
        setStatus(list.length ? "ready" : "empty");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => { active = false; };
  }, []);

  const handleBooked = () => {
    setShowModal(false);
    fetchAppointments(); // refresh the list with the newly booked appointment
  };

  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Appointments</h2>
          <p className="panel-sub">All appointments booked across the platform.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon /> New Appointment
        </button>
      </div>

      {status === "loading" && (
        <div className="state-box"><div className="spin-ring" style={{ marginBottom: 14 }} />
          <div className="state-title">Loading appointments…</div>
        </div>
      )}

      {status === "error" && (
        <div className="state-box">
          <div className="state-icon error"><CalendarIcon /></div>
          <div className="state-title">Couldn't load appointments</div>
          <p className="state-sub">Check that the appointments endpoint is reachable and try again.</p>
        </div>
      )}

      {status === "empty" && (
        <div className="state-box">
          <div className="state-icon"><CalendarIcon /></div>
          <div className="state-title">No appointments yet</div>
          <p className="state-sub">Bookings made by patients will show up here.</p>
        </div>
      )}

      {status === "ready" && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={a.id ?? i}>
                <td>
                  <div className="row-flex">
                    <div className="avatar-chip">{initialsOf(a.patient_name || a.patient)}</div>
                    <span className="cell-primary">{a.patient_name || a.patient || "—"}</span>
                  </div>
                </td>
                <td>{a.doctor_name || a.doctor || "—"}</td>
                <td className="cell-dim">{a.appointment_date || "—"}</td>
                <td className="cell-dim">{a.appointment_time || a.slot || "—"}</td>
                <td>
                  <span className={`status-pill ${(a.status || "pending").toLowerCase()}`}>
                    <span className="status-dot" />{a.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <NewAppointmentModal onClose={() => setShowModal(false)} onBooked={handleBooked} />
      )}
    </div>
  );
}

/* ══════════════════════ Doctors panel ═════════════════════ */
function DoctorsPanel({ onAddDoctor }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const fetchDoctors = async () => {
      setStatus("loading");

      try {
        const [doctorsRes, sessionsRes] = await Promise.allSettled([
          axios.get(
            "http://127.0.0.1:8000/api/doctors/list/",
            authHeaders()
          ),
          axios.get(
            "http://127.0.0.1:8000/api/doctors/sessions/summary/",
            authHeaders()
          ),
        ]);

        if (!active) return;

        // -----------------------------
        // Doctors API
        // -----------------------------
        if (doctorsRes.status !== "fulfilled") {
          setStatus("error");
          return;
        }

        const doctorList = Array.isArray(doctorsRes.value.data)
          ? doctorsRes.value.data
          : doctorsRes.value.data?.results || [];

        // -----------------------------
        // Sessions API
        // -----------------------------
        const sessionList =
          sessionsRes.status === "fulfilled"
            ? Array.isArray(sessionsRes.value.data)
              ? sessionsRes.value.data
              : sessionsRes.value.data?.results || []
            : [];

        // Map session data using doctor_id
        const sessionByDoctorId = new Map(
          sessionList.map((session) => [
            String(session.doctor_id),
            session,
          ])
        );

        // -----------------------------
        // Merge doctors + sessions
        // -----------------------------
        const merged = doctorList.map((doctor) => {
          const session = sessionByDoctorId.get(
            String(doctor.id)
          );

          return {
            ...doctor,

            // From summary API
            session_minutes: session?.total_minutes ?? null,
            session_time: session?.total_time ?? null,
          };
        });

        setRows(merged);
        setStatus(merged.length ? "ready" : "empty");

      } catch (error) {
        console.error("Failed to load doctors:", error);

        if (active) {
          setStatus("error");
        }
      }
    };

    fetchDoctors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="content-inner">

      {/* HEADER */}
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Doctors</h2>

          <p className="panel-sub">
            Everyone currently registered as a specialist.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onAddDoctor}
        >
          <AddDoctorIcon />
          New Doctor
        </button>
      </div>


      {/* LOADING */}
      {status === "loading" && (
        <div className="state-box">
          <div
            className="spin-ring"
            style={{ marginBottom: 14 }}
          />

          <div className="state-title">
            Loading doctors…
          </div>
        </div>
      )}


      {/* ERROR */}
      {status === "error" && (
        <div className="state-box">

          <div className="state-icon error">
            <StethoscopeIcon />
          </div>

          <div className="state-title">
            Couldn't load doctors
          </div>

          <p className="state-sub">
            Check that the doctors endpoint is reachable
            and try again.
          </p>

        </div>
      )}


      {/* EMPTY */}
      {status === "empty" && (
        <div className="state-box">

          <div className="state-icon">
            <StethoscopeIcon />
          </div>

          <div className="state-title">
            No doctors added yet
          </div>

          <p className="state-sub">
            Use "New Doctor" to add the first specialist
            to Medico.
          </p>

        </div>
      )}


      {/* TABLE */}
      {status === "ready" && (
        <table className="data-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Experience</th>
              <th>Session (Today)</th>
            </tr>
          </thead>

          <tbody>

            {rows.map((doctor, i) => {

              const sessionTime = doctor.session_time;

              return (
                <tr
                  key={doctor.id ?? i}
                >

                  {/* NAME */}
                  <td>
                    <div className="row-flex">

                      <div className="avatar-chip">
                        {initialsOf(doctor.name)}
                      </div>

                      <span className="cell-primary">
                        {doctor.name || "—"}
                      </span>

                    </div>
                  </td>


                  {/* SPECIALIZATION */}
                  <td>
                    {doctor.specialization ||
                      doctor.specialty ||
                      "—"}
                  </td>


                  {/* EMAIL */}
                  <td className="cell-dim">
                    {doctor.email || "—"}
                  </td>


                  {/* PHONE */}
                  <td className="cell-dim">
                    {doctor.phone ||
                      doctor.mobile ||
                      "—"}
                  </td>


                  {/* EXPERIENCE */}
                  <td className="cell-dim">
                    {doctor.experience
                      ? `${doctor.experience} yrs`
                      : "—"}
                  </td>


                  {/* SESSION */}
                  <td>

                    {sessionTime ? (

                      <span className="session-pill">

                        <ClockIconSm />

                        {sessionTime}

                      </span>

                    ) : (

                      <span className="session-pill none">
                        —
                      </span>

                    )}

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>
      )}

    </div>
  );
}



/* ══════════════════════ New Doctor panel ══════════════════ */
const MAX_EDUCATION = 10;
const departments = [
  "Cardiology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "ENT",
  "General Medicine",
  "Ophthalmology",
  "Psychiatry",
  "Urology",
  "Nephrology",
  "Pulmonology",
  "Gastroenterology",
];
function NewDoctorPanel({ onCreated }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialization: "", experience: "", bio: "",
    password: "", available_from: "", available_to: "",
    slot_duration: "15",
  });
  const [education, setEducation] = useState([]);
  const [eduInput, setEduInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const addEducation = () => {
    const val = eduInput.trim();
    if (!val || education.length >= MAX_EDUCATION) return;
    if (education.some((e) => e.toLowerCase() === val.toLowerCase())) { setEduInput(""); return; }
    setEducation((prev) => [...prev, val]);
    setEduInput("");
  };

  const removeEducation = (idx) => {
    setEducation((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEduKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEducation();
    }
  };

  const validate = () => {
    if (!form.name.trim()) return "Doctor's name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.specialization.trim()) return "Specialization is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (education.length === 0) return "Add at least one degree under Education.";
    if (!form.available_from || !form.available_to) return "Set both a start and end time for availability.";
    if (form.available_from >= form.available_to) return "Available-from time must be earlier than available-to time.";
    if (!form.slot_duration || Number(form.slot_duration) <= 0) return "Slot duration must be a positive number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/doctors/register/",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          specialization: form.specialization.trim(),
          experience: form.experience ? Number(form.experience) : undefined,
          bio: form.bio.trim(),
          education,
          available_from: form.available_from,
          available_to: form.available_to,
          slot_duration: Number(form.slot_duration),
          password: form.password,
        },
        authHeaders()
      );
      console.log("Available From:", form.available_from);
      console.log("Available To:", form.available_to);

      console.log({
        available_from: form.available_from,
        available_to: form.available_to,
        slot_duration: form.slot_duration,
      });
      // Reset the form back to blank defaults after a successful create.
      // (Not an edit form, so there's no fetched record to repopulate from —
      // populating from an undefined `data` here was what caused the
      // controlled -> uncontrolled input warning.)
      setForm({
        name: "", email: "", phone: "", specialization: "", experience: "", bio: "",
        password: "", available_from: "", available_to: "",
        slot_duration: "15",
      });
      setEducation([]);
      onCreated?.();
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const msg = typeof data === "object" ? Object.values(data).flat().join(" ") : "Could not add doctor.";
        setError(msg);
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const eduLimitReached = education.length >= MAX_EDUCATION;

  return (
    <div className="content-inner">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">New Doctor</h2>
          <p className="panel-sub">Add a new specialist to the Medico network.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Dr. Full name" value={form.name} onChange={set("name")} />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <div className="select-wrap">
              <select
                className="form-select"
                value={form.specialization}
                onChange={set("specialization")}
              >
                <option value="" disabled hidden>Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="doctor@example.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Experience (years)</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 8" value={form.experience} onChange={set("experience")} />
          </div>
          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">Slot Duration (mins)</label>
            <input className="form-input" type="number" min="1" placeholder="e.g. 15" value={form.slot_duration} onChange={set("slot_duration")} />
          </div>
        </div>

        {/* Education — chip list input */}
        <div className="form-group">
          <label className="form-label">Education</label>
          <div className="tag-input-row">
            <input
              className="form-input"
              placeholder={eduLimitReached ? "Maximum of 10 degrees reached" : "e.g. MBBS — press Enter to add"}
              value={eduInput}
              onChange={(e) => setEduInput(e.target.value)}
              onKeyDown={handleEduKeyDown}
              disabled={eduLimitReached}
            />
            <button
              type="button"
              className="tag-add-btn"
              onClick={addEducation}
              disabled={!eduInput.trim() || eduLimitReached}
              aria-label="Add degree"
            >
              <PlusIcon />
            </button>
          </div>
          <p className={`tag-hint${eduLimitReached ? " limit" : ""}`}>
            {eduLimitReached ? "You've reached the 10-degree limit." : `${education.length}/${MAX_EDUCATION} degrees added · press Enter or comma to add`}
          </p>

          {education.length > 0 && (
            <div className="tag-list">
              {education.map((deg, i) => (
                <span className="tag-chip" key={`${deg}-${i}`}>
                  <GradCapIcon />
                  {deg}
                  <button
                    type="button"
                    className="tag-chip-remove"
                    onClick={() => removeEducation(i)}
                    aria-label={`Remove ${deg}`}
                  >
                    <SmallXIcon />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Availability — time range */}
        <div className="form-group">
          <label className="form-label">Availability</label>
          <div className="time-range-row">
            <div className="time-field">
              <div className="time-input-wrap">
                <ClockIconSm />
                <input
                  className="time-input"
                  type="time"
                  value={form.available_from}
                  onChange={set("available_from")}
                  aria-label="Available from"
                />
              </div>
            </div>
            <div className="time-sep">to</div>
            <div className="time-field">
              <div className="time-input-wrap">
                <ClockIconSm />
                <input
                  className="time-input"
                  type="time"
                  value={form.available_to}
                  onChange={set("available_to")}
                  aria-label="Available to"
                />
              </div>
            </div>
          </div>
          {form.available_from && form.available_to && form.available_from >= form.available_to ? (
            <div className="time-range-note warn"><AlertIconSm /> End time must be later than the start time.</div>
          ) : (
            <div className="time-range-note"><ClockIconSm /> Patients will only be able to book within this window.</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Bio (optional)</label>
          <textarea className="form-textarea" placeholder="Short professional summary…" value={form.bio} onChange={set("bio")} />
        </div>

        {error && <div className="error-msg"><span>⚠</span> {error}</div>}

        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Adding doctor…" : "Add Doctor"}
        </button>
      </form>
    </div>
  );
}


/* ══════════════════════ Main Component ════════════════════ */
export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [admin, setAdmin] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", error: false });
  const [counts, setCounts] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await axios.get("http://127.0.0.1:8000/api/users/me/", authHeaders());
        setAdmin(data);
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [aRes, dRes] = await Promise.allSettled([
          axios.get("http://127.0.0.1:8000/api/appointments/admin/", authHeaders()),
          axios.get("http://127.0.0.1:8000/api/doctors/list/", authHeaders()),
        ]);
        const aList = aRes.status === "fulfilled" ? (Array.isArray(aRes.value.data) ? aRes.value.data : aRes.value.data?.results || []) : null;
        const dList = dRes.status === "fulfilled" ? (Array.isArray(dRes.value.data) ? dRes.value.data : dRes.value.data?.results || []) : null;
        setCounts({ appointments: aList?.length, doctors: dList?.length });
      } catch {
        /* silently keep dashes on overview if counts fail */
      }
    };
    fetchCounts();
  }, [refreshKey]);

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

  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    showToast("Logged out successfully! See you next time.");
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleDoctorCreated = () => {
    showToast("Doctor added successfully!");
    setRefreshKey((k) => k + 1);
    setActive("doctors");
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
            <span className="logo-badge">Admin</span>
          </div>

          <div className="profile-area" ref={profileRef}>
            <button className="profile-btn" onClick={() => setProfileOpen((o) => !o)}>
              <div className="profile-avatar">{initialsOf(admin?.name)}</div>
              <span className="profile-name">{admin?.name || "Loading..."}</span>
              <span className={`profile-chevron${profileOpen ? " open" : ""}`}><ChevronIcon /></span>
            </button>
            <div className={`profile-dropdown${profileOpen ? " open" : ""}`}>
              <button className="dropdown-item"><EditIcon /> Edit Info</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}><LogoutIcon /> Logout</button>
            </div>
          </div>
        </header>

        <div className={`toast${toast.show ? " show" : ""}${toast.error ? " error" : ""}`}>
          ✦ {toast.msg} ✦
        </div>

        {/* ══ SPLIT BODY ══ */}
        <div className="admin-body">
          <aside className="sidebar">
            <div className="sidebar-label">Manage</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`sidebar-item${active === item.key ? " active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                {item.icon}
                {item.label}
                {item.key === "appointments" && counts.appointments != null && (
                  <span className="sidebar-count">{counts.appointments}</span>
                )}
                {item.key === "doctors" && counts.doctors != null && (
                  <span className="sidebar-count">{counts.doctors}</span>
                )}
              </button>
            ))}
          </aside>

          <section className="content-panel">
            {active === "overview" && <OverviewPanel counts={counts} />}
            {active === "appointments" && <AppointmentsPanel key={`appt-${refreshKey}`} />}
            {active === "doctors" && <DoctorsPanel key={`doc-${refreshKey}`} onAddDoctor={() => setActive("new-doctor")} />}
            {active === "new-doctor" && <NewDoctorPanel onCreated={handleDoctorCreated} />}
          </section>
        </div>
      </div>
    </>
  );
}