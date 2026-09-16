import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'

const API_URL = "http://127.0.0.1:8000/query";

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
  }

  html, body, #root { height: 100%; overflow: hidden; }

  /* ─── Layout shell ─────────────────────────────────────── */
  .home-root {
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

  /* ─── HEADER ───────────────────────────────────────────── */
  .header {
    position: relative; z-index: 1000; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 60px;
    // background: rgba(0,0,0,0.80);
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

  /* online badge */
  .online-badge {
    display:flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:999px;
    background: rgba(7,114,237,0.08);
    border: 1px solid rgba(7,114,237,0.18);
    font-size:0.70rem; color:rgba(7,114,237,0.75); letter-spacing:0.4px;
  }
  .online-dot {
    width:6px; height:6px; border-radius:50%; background:var(--blue);
    animation: dot-pulse 2s ease-in-out infinite;
  }
  @keyframes dot-pulse {
    0%,100% { box-shadow:0 0 0 0 rgba(7,114,237,0.5); }
    50%      { box-shadow:0 0 0 4px rgba(7,114,237,0); }
  }

  /* profile */
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

  /* ─── MESSAGES AREA ────────────────────────────────────── */
  .chat-body {
    flex:1; overflow-y:auto; position:relative; z-index:1;
    padding:28px 0 16px;
    scroll-behavior: smooth;
  }
  .chat-body::-webkit-scrollbar { width:3px; }
  .chat-body::-webkit-scrollbar-track { background:transparent; }
  .chat-body::-webkit-scrollbar-thumb { background:rgba(7,114,237,0.22); border-radius:999px; }

  .messages-wrap {
    max-width: 780px; margin:0 auto; padding:0 20px;
    display:flex; flex-direction:column; gap:18px;
  }

  /* ── Empty / welcome state ── */
  .empty-state {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; min-height:340px; text-align:center;
  }
  .empty-icon {
    width:60px; height:60px; background:var(--blue-dim);
    border:1px solid rgba(7,114,237,0.28); border-radius:18px;
    display:flex; align-items:center; justify-content:center; margin-bottom:18px;
    animation: pulse-ring 3s ease-in-out infinite;
  }
  .empty-icon svg { width:28px; height:28px; color:var(--blue); }
  .empty-title {
    font-family:'Playfair Display',serif; font-size:1.55rem; font-weight:700;
    background:linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.5) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    margin-bottom:8px;
  }
  .empty-sub { font-size:0.82rem; color:var(--text-dim); line-height:1.6; max-width:320px; margin-bottom:26px; }

  /* quick-action chips */
  .quick-label {
    font-size:0.68rem; font-weight:600; letter-spacing:0.7px; text-transform:uppercase;
    color:rgba(7,114,237,0.5); margin-bottom:10px;
  }
  .chips-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; max-width:420px; }
  .chip-card {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:13px;
    background:var(--glass); border:1px solid var(--border);
    cursor:pointer; transition:all 0.2s; text-align:left;
    font-family:'DM Sans',sans-serif;
  }
  .chip-card:hover {
    background:var(--blue-dim); border-color:rgba(7,114,237,0.38);
    transform:translateY(-2px);
  }
  .chip-icon {
    width:32px; height:32px; border-radius:9px;
    background:rgba(7,114,237,0.08); border:1px solid rgba(7,114,237,0.15);
    display:flex; align-items:center; justify-content:center;
    font-size:1rem; flex-shrink:0; transition:all 0.2s;
  }
  .chip-card:hover .chip-icon { background:var(--blue-dim); border-color:rgba(7,114,237,0.35); }
  .chip-label { font-size:0.78rem; font-weight:500; color:rgba(255,255,255,0.68); line-height:1.2; }
  .chip-sub   { font-size:0.68rem; color:var(--text-dim); margin-top:2px; }

  /* ── Message rows ── */
  .message-row { display:flex; gap:10px; }
  .message-row.user { flex-direction:row-reverse; }

  .msg-avatar {
    width:30px; height:30px; border-radius:9px; flex-shrink:0; margin-top:2px;
    display:flex; align-items:center; justify-content:center;
  }
  .msg-avatar.ai {
    background:linear-gradient(135deg,#0560cc,#1a8aff);
    border:1px solid rgba(7,114,237,0.4);
    box-shadow:0 0 10px rgba(7,114,237,0.28);
  }
  .msg-avatar.ai svg { width:14px; height:14px; color:#fff; }
  .msg-avatar.user {
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.10);
    font-size:0.66rem; font-weight:600; color:rgba(255,255,255,0.6);
  }

  .msg-content { max-width:73%; display:flex; flex-direction:column; gap:3px; }
  .message-row.user .msg-content { align-items:flex-end; }

  .msg-sender {
    font-size:0.66rem; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;
    color:rgba(7,114,237,0.6); margin-left:2px;
  }

  .msg-bubble {
    padding:11px 15px; font-size:0.87rem; line-height:1.65;
    position:relative; word-break:break-word;
  }
  .msg-bubble.ai {
    background:rgba(255,255,255,0.044); border:1px solid rgba(255,255,255,0.08);
    border-radius:4px 14px 14px 14px; color:rgba(255,255,255,0.86);
    box-shadow:0 3px 18px rgba(0,0,0,0.28);
  }
  .msg-bubble.user {
    background:linear-gradient(135deg,#0560cc,#0772ed);
    border:1px solid rgba(7,114,237,0.45);
    border-radius:14px 4px 14px 14px; color:#fff;
    box-shadow:0 3px 18px rgba(7,114,237,0.22);
  }
  .msg-bubble strong { color:var(--blue-lite); font-weight:600; }
  .msg-time { font-size:0.63rem; color:var(--text-dim); padding:0 3px; }

  /* cursor blink in streaming */
  .stream-cursor {
    display:inline-block; width:2px; height:14px;
    background:var(--blue-lite); margin-left:2px; vertical-align:middle;
    animation:cursor-blink 0.55s steps(1) infinite;
  }
  @keyframes cursor-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

  /* error bubble */
  .msg-bubble.error {
    background:rgba(255,50,50,0.07); border:1px solid rgba(255,50,50,0.2);
    border-radius:4px 14px 14px 14px; color:#ffaaaa;
  }
  .msg-bubble.error strong { color:#ff6b6b; }

  /* ── Typing indicator ── */
  .typing-row { display:flex; align-items:center; gap:10px; }
  .typing-bubble {
    padding:12px 16px; display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,255,255,0.044); border:1px solid rgba(255,255,255,0.08);
    border-radius:4px 14px 14px 14px;
  }
  .typing-dot {
    width:6px; height:6px; border-radius:50%;
    background:rgba(7,114,237,0.7);
    animation:tdot 1.3s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes tdot {
    0%,60%,100% { transform:translateY(0); opacity:0.4; }
    30%          { transform:translateY(-6px); opacity:1; }
  }

  /* message enter animation */
  @keyframes msg-in {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .msg-enter { animation: msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

  /* ─── INPUT SECTION ────────────────────────────────────── */
  .input-section {
    position:relative; z-index:10; flex-shrink:0;
    padding:10px 20px 0;
    background:rgba(0,0,0,0.72); backdrop-filter:blur(20px);
    border-top:1px solid var(--border);
  }
  .input-wrap-outer { max-width:780px; margin:0 auto; }
  .input-container {
    display:flex; align-items:flex-end; gap:8px;
    background:rgba(255,255,255,0.038);
    border:1px solid rgba(255,255,255,0.09);
    border-radius:16px; padding:9px 9px 9px 15px;
    transition:border-color 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .input-container:focus-within {
    border-color:rgba(7,114,237,0.5);
    background:rgba(7,114,237,0.05);
    box-shadow:0 0 0 3px rgba(7,114,237,0.09), 0 8px 32px rgba(0,0,0,0.3);
  }
  .chat-textarea {
    flex:1; background:none; border:none; outline:none; resize:none;
    color:var(--white); font-family:'DM Sans',sans-serif;
    font-size:0.89rem; line-height:1.6;
    max-height:160px; min-height:24px; overflow-y:auto;
    scrollbar-width:none; padding:2px 0;
    -webkit-text-fill-color:var(--white);
  }
  .chat-textarea::-webkit-scrollbar { display:none; }
  .chat-textarea::placeholder {
    color:rgba(255,255,255,0.2); -webkit-text-fill-color:rgba(255,255,255,0.2);
  }

  /* send button */
  .send-btn {
    width:36px; height:36px; border-radius:11px; border:none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; flex-shrink:0;
    transition:all 0.22s cubic-bezier(0.22,1,0.36,1);
  }
  .send-btn:disabled {
    background:rgba(255,255,255,0.05); cursor:not-allowed;
  }
  .send-btn:disabled svg { color:rgba(255,255,255,0.18); }
  .send-btn.active {
    background:linear-gradient(135deg,#0560cc,#0772ed,#1a8aff);
    box-shadow:0 0 10px 2px rgba(7,114,237,0.38), 0 4px 18px rgba(7,114,237,0.3);
    animation:send-glow 2s ease-in-out infinite;
  }
  @keyframes send-glow {
    0%,100% { box-shadow:0 0 8px 2px rgba(7,114,237,0.32), 0 4px 18px rgba(7,114,237,0.25); }
    50%      { box-shadow:0 0 18px 6px rgba(7,114,237,0.55), 0 6px 26px rgba(7,114,237,0.42); }
  }
  .send-btn.active:hover { transform:scale(1.07) translateY(-1px); }
  .send-btn.active:active { transform:scale(0.95); }
  .send-btn svg { width:15px; height:15px; color:rgba(255,255,255,0.75); }
  .send-btn.active svg { color:#fff; }

  /* send spinner */
  .spin-ring {
    width:14px; height:14px; border-radius:50%;
    border:2px solid rgba(255,255,255,0.25); border-top-color:#fff;
    animation:spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ─── FOOTER ───────────────────────────────────────────── */
  .chat-footer {
    position:relative; z-index:10; flex-shrink:0;
    text-align:center; padding:9px 20px 14px;
    background:rgba(0,0,0,0.72); backdrop-filter:blur(20px);
  }
  .footer-hint { font-size:0.68rem; color:rgba(255,255,255,0.20); letter-spacing:0.3px; }
  .footer-hint kbd {
    display:inline-block; padding:1px 5px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10);
    border-radius:4px; font-family:'DM Sans',sans-serif;
    font-size:0.62rem; color:rgba(255,255,255,0.35); margin:0 2px;
  }
  .footer-sep { margin:0 7px; opacity:0.25; }
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
    z-index: 1001;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
`;


/* ── Icons ──────────────────────────────────────────────── */
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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

/* ── Helpers ─────────────────────────────────────────────── */
const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* Parse **bold** markdown into React nodes */
function RichText({ text }) {
  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
          ))
      )}
    </span>
  );
}

/* Token-by-token streaming illusion */
function StreamingText({ text, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    setDone(false);

    const next = () => {
      if (idxRef.current >= text.length) { setDone(true); onComplete?.(); return; }
      const chunk = Math.random() > 0.85 ? 3 : 1;
      setDisplayed(text.slice(0, idxRef.current + chunk));
      idxRef.current += chunk;
      setTimeout(next, 14 + (Math.random() > 0.92 ? Math.random() * 70 : 0));
    };
    const t = setTimeout(next, 60);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <span>
      <RichText text={displayed} />
      {!done && <span className="stream-cursor" />}
    </span>
  );
}

/* Quick action chip card */
function ChipCard({ icon, label, sub, onClick }) {
  return (
    <button className="chip-card" onClick={onClick}>
      <div className="chip-icon">{icon}</div>
      <div>
        <div className="chip-label">{label}</div>
        <div className="chip-sub">{sub}</div>
      </div>
    </button>
  );
}

/* Single message bubble */
function MessageBubble({ msg, isLast }) {
  const isUser = msg.role === "user";
  const isAI = msg.role === "ai";
  const isError = msg.role === "error";

  return (
    <div className={`message-row ${isUser ? "user" : "ai"} msg-enter`}>
      {/* Avatar */}
      <div className={`msg-avatar ${isUser ? "user" : "ai"}`}>
        {isAI || isError ? <CrossIcon /> : "JD"}
      </div>

      <div className="msg-content">
        {!isUser && (
          <div className="msg-sender">{isError ? "Error" : "Medico AI"}</div>
        )}
        <div className={`msg-bubble ${isError ? "error" : isUser ? "user" : "ai"}`}>
          {isAI && isLast && msg.streaming
            ? <StreamingText text={msg.text} />
            : <RichText text={msg.text} />
          }
        </div>
        <span className="msg-time">{msg.time}</span>
      </div>
    </div>
  );
}

/* ─── Typing indicator ─────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="typing-row msg-enter">
      <div className="msg-avatar ai"><CrossIcon /></div>
      <div>
        <div className="msg-sender" style={{ marginBottom: 4 }}>Medico AI</div>
        <div className="typing-bubble">
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

/* ─── Quick actions ────────────────────────────────────── */
const QUICK_ACTIONS = [
  { icon: "🗓️", label: "Book Appointment" },
  { icon: "🔍", label: "Find a Specialist" },
  { icon: "📋", label: "My Appointments" },
  { icon: "💊", label: "Health Query" },
];

const AI_RESPONSES = [
  "Sorry, I couldn't process that. Could you please rephrase?",
];

/* ─── Main Component ───────────────────────────────────── */
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);
  const profileRef = useRef(null);

  /* scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/users/me/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };
  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* auto-resize textarea */
  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
  };

  const sendMessage = async (override) => {
    const text = (override ?? input).trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now(), role: "user", text, time: getTime(), streaming: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    try {
      const { data } = await axios.post(API_URL, { question: text });
      const answer =
        data?.answer || data?.response || data?.reply ||
        (typeof data === "string" ? data : JSON.stringify(data));

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "ai", text: answer, time: getTime(), streaming: true,
      }]);
    } catch (err) {
      console.error("Error fetching AI response:", err);
      const fallback = AI_RESPONSES[0];
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: "ai", text: fallback, time: getTime(), streaming: true,
        }]);
      }, 900 + Math.random() * 600);
      return;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const hasText = input.trim().length > 0;
  const showEmpty = messages.length === 0;
  const navigate = useNavigate();

  const handleLogout = () => {
    // Placeholder for logout logic
    localStorage.removeItem("refresh_token"); // Example: clear refresh token
    localStorage.removeItem("access_token");  // Example: clear access token    
    setTimeout(() => navigate('/login'), 1000); // Redirect to login page 
    showToast();
  };
  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        {/* Background */}
        <div className="bg-blob bg-blob-1" /><div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" /><div className="bg-grid" />

        {/* ══ HEADER ══════════════════════════════════════ */}
        <header className="header">
          <div className="header-logo">
            <div className="logo-icon"><CrossIcon /></div>
            <span className="logo-text">Medico</span>
          </div>
          <div className="profile-area" ref={profileRef}>
            <button className="profile-btn" onClick={() => setProfileOpen(o => !o)}>
              <div className="profile-avatar">
                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
              </div>

              <span className="profile-name">
                {user?.name || "Loading..."}
              </span>
              <span className={`profile-chevron${profileOpen ? " open" : ""}`}>
                <ChevronIcon />
              </span>
            </button>

            <div className={`profile-dropdown${profileOpen ? " open" : ""}`}>
              <button className="dropdown-item"><EditIcon /> Edit Info</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </header>
        <div className={`toast${toast ? " show" : ""}`}>
          ✦ Logged out successfully! See you next time. ✦
        </div>
        {/* ══ MESSAGES ════════════════════════════════════ */}
        <main className="chat-body">
          <div className="messages-wrap">
            {showEmpty ? (
              <div className="empty-state">
                <div className="empty-icon"><CrossIcon /></div>
                <h2 className="empty-title">How can I help you today?</h2>
                <p className="empty-sub">
                  Ask me anything about booking appointments, finding specialists, or managing your health visits.
                </p>
                <p className="quick-label">Our Features</p>
                <div className="chips-grid">
                  {QUICK_ACTIONS.map(a => (
                    <ChipCard key={a.label} icon={a.icon} label={a.label} sub={a.sub}
                      onClick={() => sendMessage(a.q)} />
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
              ))
            )}

            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* ══ INPUT ═══════════════════════════════════════ */}
        <div className="input-section">
          <div className="input-wrap-outer">
            <div className="input-container">
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Ask about appointments, doctors, or health queries…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className={`send-btn${hasText ? " active" : ""}`}
                disabled={!hasText || isTyping}
                onClick={() => sendMessage()}
                aria-label="Send"
              >
                {isTyping
                  ? <div className="spin-ring" />
                  : <SendIcon />
                }
              </button>
            </div>
          </div>
        </div>

        {/* ══ FOOTER ══════════════════════════════════════ */}
        <footer className="chat-footer">
          <p className="footer-hint">
            Press <kbd>Enter</kbd> to send
            <span className="footer-sep">·</span>
            <kbd>Shift</kbd>+<kbd>Enter</kbd> for new line
            <span className="footer-sep">·</span>
            Medico AI — your wellness companion
          </p>
        </footer>

      </div>
    </>
  );
}