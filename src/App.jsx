import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart
} from "recharts";

// ─── Design System ────────────────────────────────────────────────────────────
const T = {
  ink: "#0a0a0f",
  inkMid: "#1a1a2e",
  inkLight: "#2d2d4a",
  surface: "#f4f3ef",
  surfaceDark: "#e8e6df",
  surfaceDeep: "#d4d1c6",
  cream: "#faf9f5",
  gold: "#c9922a",
  goldLight: "#f5e6c8",
  goldBright: "#e8a935",
  teal: "#1a7a6e",
  tealLight: "#e0f2ef",
  tealBright: "#22a898",
  coral: "#c94a2a",
  coralLight: "#fde8e3",
  amber: "#c97a1a",
  amberLight: "#fef3e0",
  violet: "#5a3a8a",
  violetLight: "#ede5f5",
  slate: "#4a5568",
  slateLight: "#718096",
  white: "#ffffff",
  border: "#d8d5cb",
  borderLight: "#ebe9e1",
};

const STATUS = {
  NEW: { color: T.slate, bg: "#eef0f4", label: "New" },
  IN_PROGRESS: { color: T.teal, bg: T.tealLight, label: "In Progress" },
  RESOLVED: { color: "#2d7a47", bg: "#e4f5ec", label: "Resolved" },
  CLOSED: { color: T.ink, bg: T.surfaceDark, label: "Closed" },
  Submitted: { color: T.violet, bg: T.violetLight, label: "Submitted" },
  Assigned: { color: T.amber, bg: T.amberLight, label: "Assigned" },
  "In Progress": { color: T.teal, bg: T.tealLight, label: "In Progress" },
  Resolved: { color: "#2d7a47", bg: "#e4f5ec", label: "Resolved" },
  Closed: { color: T.ink, bg: T.surfaceDark, label: "Closed" },
  Reopened: { color: T.coral, bg: T.coralLight, label: "Reopened" },
  Delayed: { color: T.coral, bg: T.coralLight, label: "Delayed" },
};

const PRIORITY = {
  HIGH: { color: T.coral, label: "HIGH", weight: 3 },
  MEDIUM: { color: T.amber, label: "MED", weight: 2 },
  LOW: { color: T.teal, label: "LOW", weight: 1 },
};

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = ["Traffic Police","Electricity Board","Water Board","Roads Department","Swachh Bharat"];
const CATEGORIES = ["Road Damage","Streetlight Failure","Garbage Issue","Water Supply","Other"];

const SEED_COMPLAINTS = [
  { id:"CMP-001", citizenId:"c1", title:"Pothole on Anna Salai near Gemini flyover", category:"Road Damage", department:"Roads Department", status:"Resolved", location:"Anna Salai, Chennai", lat:13.0569, lng:80.2425, description:"Large pothole causing accidents near the Gemini flyover signal.", createdAt:"2026-01-10T09:00:00Z", updatedAt:"2026-01-15T14:00:00Z", remarks:"Filled and resurfaced on Jan 15.", resolutionTime:5, priority:"MEDIUM", escalationLevel:0, upvotes:12, slaDueAt:"2026-01-20T09:00:00Z" },
  { id:"CMP-002", citizenId:"c1", title:"Streetlight not working – Anna Nagar West", category:"Streetlight Failure", department:"Electricity Board", status:"In Progress", location:"Anna Nagar, Chennai", lat:13.0900, lng:80.2101, description:"Three consecutive streetlights are off since two weeks.", createdAt:"2026-01-20T10:30:00Z", updatedAt:"2026-01-22T11:00:00Z", remarks:"Technician dispatched.", resolutionTime:null, priority:"HIGH", escalationLevel:1, upvotes:8, slaDueAt:"2026-01-27T10:30:00Z" },
  { id:"CMP-003", citizenId:"c2", title:"Overflowing garbage bins – Big Bazaar St", category:"Garbage Issue", department:"Swachh Bharat", status:"Assigned", location:"Big Bazaar Street, Coimbatore", lat:11.0168, lng:76.9558, description:"Bins not collected for 5 days, waste spilling on road.", createdAt:"2026-01-25T08:00:00Z", updatedAt:"2026-01-25T12:00:00Z", remarks:"", resolutionTime:null, priority:"HIGH", escalationLevel:2, upvotes:24, slaDueAt:"2026-01-30T08:00:00Z" },
  { id:"CMP-004", citizenId:"c2", title:"No water supply – Arumbakkam", category:"Water Supply", department:"Water Board", status:"Resolved", location:"Arumbakkam, Chennai", lat:13.0732, lng:80.2070, description:"Water supply disrupted for 3 days in Block C.", createdAt:"2026-01-18T07:00:00Z", updatedAt:"2026-01-20T16:00:00Z", remarks:"Pipe repaired. Supply restored.", resolutionTime:2, priority:"HIGH", escalationLevel:0, upvotes:31, slaDueAt:"2026-01-25T07:00:00Z" },
  { id:"CMP-005", citizenId:"c3", title:"Traffic signal malfunction – Meenambakkam", category:"Other", department:"Traffic Police", status:"Delayed", location:"Meenambakkam, Chennai", lat:12.9941, lng:80.1709, description:"Signal stuck on red for over 10 minutes causing jam.", createdAt:"2026-01-05T15:00:00Z", updatedAt:"2026-01-05T15:00:00Z", remarks:"", resolutionTime:null, priority:"HIGH", escalationLevel:3, upvotes:47, slaDueAt:"2026-01-12T15:00:00Z" },
  { id:"CMP-006", citizenId:"c3", title:"Road crack near school – Madurai Bypass", category:"Road Damage", department:"Roads Department", status:"Submitted", location:"Madurai Bypass, Madurai", lat:9.9252, lng:78.1198, description:"Wide crack on the road near children's school, danger for kids.", createdAt:"2026-02-01T09:00:00Z", updatedAt:"2026-02-01T09:00:00Z", remarks:"", resolutionTime:null, priority:"HIGH", escalationLevel:1, upvotes:19, slaDueAt:"2026-02-08T09:00:00Z" },
  { id:"CMP-007", citizenId:"c1", title:"Power outage – entire street, Trichy", category:"Streetlight Failure", department:"Electricity Board", status:"Resolved", location:"Woraiyur, Tiruchirappalli", lat:10.8505, lng:78.6837, description:"Full street without power after storm damage.", createdAt:"2026-01-28T20:00:00Z", updatedAt:"2026-01-29T08:00:00Z", remarks:"Lines repaired overnight.", resolutionTime:0.5, priority:"HIGH", escalationLevel:0, upvotes:36, slaDueAt:"2026-02-04T20:00:00Z" },
  { id:"CMP-008", citizenId:"c2", title:"Drain overflow – market area, Salem", category:"Water Supply", department:"Water Board", status:"In Progress", location:"Shevapet Market, Salem", lat:11.6643, lng:78.1460, description:"Storm drain overflowing into market. Sewage smell unbearable.", createdAt:"2026-02-05T10:00:00Z", updatedAt:"2026-02-06T09:00:00Z", remarks:"Team on site.", resolutionTime:null, priority:"MEDIUM", escalationLevel:0, upvotes:15, slaDueAt:"2026-02-12T10:00:00Z" },
  { id:"CMP-009", citizenId:"c3", title:"Illegal garbage dumping – Pondicherry ECR", category:"Garbage Issue", department:"Swachh Bharat", status:"Closed", location:"ECR, Puducherry", lat:11.9416, lng:79.8083, description:"Illegal dumping site growing on highway shoulder near Puducherry.", createdAt:"2026-01-12T11:00:00Z", updatedAt:"2026-01-16T10:00:00Z", remarks:"Site cleared and fined violator.", resolutionTime:4, priority:"MEDIUM", escalationLevel:0, upvotes:9, slaDueAt:"2026-01-19T11:00:00Z" },
  { id:"CMP-010", citizenId:"c1", title:"Broken divider – Vellore NH332", category:"Road Damage", department:"Roads Department", status:"Assigned", location:"NH332, Vellore", lat:12.9165, lng:79.1325, description:"Divider broken after truck collision, safety hazard at night.", createdAt:"2026-02-08T14:00:00Z", updatedAt:"2026-02-09T10:00:00Z", remarks:"Contractor assigned.", resolutionTime:null, priority:"MEDIUM", escalationLevel:0, upvotes:11, slaDueAt:"2026-02-15T14:00:00Z" },
  { id:"CMP-011", citizenId:"c2", title:"Manhole uncovered – Tirunelveli Market", category:"Road Damage", department:"Roads Department", status:"In Progress", location:"Main Road, Tirunelveli", lat:8.7139, lng:77.7567, description:"Open manhole posing danger especially at night near bus stand.", createdAt:"2026-02-10T08:00:00Z", updatedAt:"2026-02-11T10:00:00Z", remarks:"Safety cone placed.", resolutionTime:null, priority:"HIGH", escalationLevel:2, upvotes:28, slaDueAt:"2026-02-17T08:00:00Z" },
  { id:"CMP-012", citizenId:"c3", title:"Irregular water supply – Erode East", category:"Water Supply", department:"Water Board", status:"Submitted", location:"Erode East, Erode", lat:11.3410, lng:77.7172, description:"Water arrives only at midnight, inconvenient for residents.", createdAt:"2026-02-12T09:00:00Z", updatedAt:"2026-02-12T09:00:00Z", remarks:"", resolutionTime:null, priority:"LOW", escalationLevel:0, upvotes:6, slaDueAt:"2026-02-19T09:00:00Z" },
];

const SEED_HISTORY = {
  "CMP-001":[
    {status:"Submitted",timestamp:"2026-01-10T09:00:00Z",note:"Complaint received."},
    {status:"Assigned",timestamp:"2026-01-11T10:00:00Z",note:"Assigned to Roads Dept."},
    {status:"In Progress",timestamp:"2026-01-13T08:00:00Z",note:"Repair team dispatched."},
    {status:"Resolved",timestamp:"2026-01-15T14:00:00Z",note:"Pothole filled and resurfaced."},
  ],
  "CMP-007":[
    {status:"Submitted",timestamp:"2026-01-28T20:00:00Z",note:"Complaint received."},
    {status:"Assigned",timestamp:"2026-01-28T20:30:00Z",note:"Emergency team assigned."},
    {status:"In Progress",timestamp:"2026-01-28T22:00:00Z",note:"Crew working on lines."},
    {status:"Resolved",timestamp:"2026-01-29T08:00:00Z",note:"Power restored."},
  ],
};

const ESCALATION_LOGS = [
  { id:"ESC-001", complaintId:"CMP-005", previousLevel:2, newLevel:3, triggeredAt:"2026-01-20T05:00:00Z", reason:"SLA breached", actionTaken:"Escalated to ADMIN" },
  { id:"ESC-002", complaintId:"CMP-003", previousLevel:1, newLevel:2, triggeredAt:"2026-02-01T05:00:00Z", reason:"SLA breached", actionTaken:"Escalated to ADMIN" },
  { id:"ESC-003", complaintId:"CMP-006", previousLevel:0, newLevel:1, triggeredAt:"2026-02-05T05:00:00Z", reason:"SLA breached", actionTaken:"Escalated to supervisor" },
  { id:"ESC-004", complaintId:"CMP-011", previousLevel:1, newLevel:2, triggeredAt:"2026-02-14T05:00:00Z", reason:"SLA breached", actionTaken:"Escalated to ADMIN" },
];

const USERS = {
  "citizen@demo.in": { id:"c1", name:"Arjun Sharma", role:"citizen", password:"demo123" },
  "citizen2@demo.in": { id:"c2", name:"Priya Nair", role:"citizen", password:"demo123" },
  "roads@civic.in": { id:"a1", name:"Deepak Verma", role:"authority", department:"Roads Department", password:"admin123" },
  "electricity@civic.in": { id:"a2", name:"Sunita Rao", role:"authority", department:"Electricity Board", password:"admin123" },
  "water@civic.in": { id:"a3", name:"Ramesh Kumar", role:"authority", department:"Water Board", password:"admin123" },
  "traffic@civic.in": { id:"a4", name:"Kavitha Menon", role:"authority", department:"Traffic Police", password:"admin123" },
  "swachh@civic.in": { id:"a5", name:"Mahesh Patil", role:"authority", department:"Swachh Bharat", password:"admin123" },
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtDT = (iso) => iso ? new Date(iso).toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "—";
const daysAgo = (iso) => Math.floor((Date.now() - new Date(iso)) / 86400000);
const genId = () => "CMP-" + String(Math.floor(Math.random() * 900) + 100);

function calcWeight(c) {
  const p = { HIGH:3, MEDIUM:2, LOW:1 }[c.priority] || 1;
  return 1 + (c.upvotes || 0) + (c.escalationLevel || 0) + p;
}

// ─── Global Styles ─────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Outfit', sans-serif;
    background: ${T.cream};
    color: ${T.ink};
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${T.surfaceDark}; }
  ::-webkit-scrollbar-thumb { background: ${T.surfaceDeep}; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.2s ease both; }
  
  .slide-in { animation: slideIn 0.3s ease both; }

  .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

  .btn-press:active { transform: scale(0.97); }
  
  .row-hover { transition: background 0.15s ease; cursor: pointer; }
  .row-hover:hover { background: ${T.surfaceDark} !important; }

  .ink-text { font-family: 'DM Serif Display', serif; }
  .mono { font-family: 'DM Mono', monospace; }

  input, select, textarea {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
  }
  button { font-family: 'Outfit', sans-serif; }
`;

// ─── Primitive Components ──────────────────────────────────────────────────────
function Badge({ status, size = "sm" }) {
  const s = STATUS[status] || { color: T.slate, bg: T.surfaceDark, label: status };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding: size === "sm" ? "3px 9px" : "5px 13px",
      borderRadius: 4, fontSize: size === "sm" ? 11 : 13,
      fontWeight: 600, letterSpacing:"0.04em",
      textTransform:"uppercase",
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}22`,
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, flexShrink:0 }} />
      {s.label || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.LOW;
  return (
    <span style={{
      display:"inline-block", padding:"2px 7px", borderRadius:3,
      fontSize:10, fontWeight:700, letterSpacing:"0.08em",
      color: p.color, border:`1px solid ${p.color}`, background:`${p.color}15`,
    }} className="mono">
      {p.label}
    </span>
  );
}

function EscBadge({ level }) {
  const colors = ["#718096","#c97a1a","#c94a2a","#8b1a1a"];
  const labels = ["None","L1","L2","L3"];
  if (level === 0) return null;
  return (
    <span style={{
      display:"inline-block", padding:"2px 6px", borderRadius:3,
      fontSize:10, fontWeight:700, letterSpacing:"0.06em",
      color: colors[level], border:`1px solid ${colors[level]}`,
      background:`${colors[level]}18`,
    }} className="mono">
      ESC-{labels[level]}
    </span>
  );
}

function Card({ children, style, className }) {
  return (
    <div className={className} style={{
      background: T.white,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon, className }) {
  return (
    <Card className={`hover-lift ${className || ""}`} style={{ padding:"22px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:T.slateLight, marginBottom:10 }}>{label}</div>
          <div style={{ fontSize:32, fontWeight:700, color: accent || T.ink, lineHeight:1, fontFamily:"'DM Serif Display', serif" }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:T.slateLight, marginTop:6 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{ width:40, height:40, borderRadius:10, background:`${accent || T.gold}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style, className }) {
  const variants = {
    primary: { background:T.ink, color:T.white, border:`1px solid ${T.ink}` },
    gold: { background:T.gold, color:T.white, border:`1px solid ${T.gold}` },
    teal: { background:T.teal, color:T.white, border:`1px solid ${T.teal}` },
    outline: { background:"transparent", color:T.ink, border:`1px solid ${T.border}` },
    ghost: { background:"transparent", color:T.slate, border:"none" },
    danger: { background:T.coral, color:T.white, border:`1px solid ${T.coral}` },
    surface: { background:T.surface, color:T.ink, border:`1px solid ${T.border}` },
  };
  const sizes = {
    xs: { padding:"4px 10px", fontSize:12 },
    sm: { padding:"7px 14px", fontSize:13 },
    md: { padding:"10px 20px", fontSize:14 },
    lg: { padding:"13px 28px", fontSize:15 },
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`btn-press ${className || ""}`} style={{
      borderRadius:7, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition:"all 0.15s ease",
      ...variants[variant], ...sizes[size], ...style,
    }}>
      {children}
    </button>
  );
}

function Field({ label, type="text", value, onChange, placeholder, required, options }) {
  const base = {
    width:"100%", padding:"10px 13px", border:`1px solid ${T.border}`,
    borderRadius:8, fontSize:14, color:T.ink, background:T.white,
    outline:"none", transition:"border-color 0.15s ease",
  };
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:"block", fontSize:13, fontWeight:600, color:T.ink, marginBottom:7 }}>
        {label}{required && <span style={{ color:T.coral }}> *</span>}
      </label>}
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}
          onFocus={e => e.target.style.borderColor = T.teal}
          onBlur={e => e.target.style.borderColor = T.border}>
          <option value="">{placeholder || "Select..."}</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={3} style={{ ...base, resize:"vertical", fontFamily:"'Outfit', sans-serif" }}
          onFocus={e => e.target.style.borderColor = T.teal}
          onBlur={e => e.target.style.borderColor = T.border} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={base}
          onFocus={e => e.target.style.borderColor = T.teal}
          onBlur={e => e.target.style.borderColor = T.border} />
      )}
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const colors = { success:T.teal, error:T.coral, info:T.violet };
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background:T.ink, color:T.white, padding:"13px 20px",
      borderRadius:10, fontSize:14, fontWeight:500,
      boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
      display:"flex", alignItems:"center", gap:10,
      borderLeft:`4px solid ${colors[type] || T.gold}`,
      animation:"slideIn 0.3s ease",
    }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
    </div>
  );
}

// ─── Tamil Nadu + Pondicherry SVG Map Heatmap ──────────────────────────────────
// Bounding box used for projection:
//   lng: 76.25 → 80.35   lat: 8.05 → 13.55
// viewBox: 0 0 800 880  (portrait, ~4:5 aspect to match TN shape)
//
// District paths hand-derived from simplified GeoJSON polygons.
// Each path is in SVG coordinate space (lng→x, lat→y inverted).

const TN_VIEWBOX = { minLng:76.25, maxLng:80.35, minLat:8.05, maxLat:13.55 };
const VB_W = 800, VB_H = 880;

function lngLatToSVG(lng, lat) {
  const x = ((lng - TN_VIEWBOX.minLng) / (TN_VIEWBOX.maxLng - TN_VIEWBOX.minLng)) * VB_W;
  const y = (1 - (lat - TN_VIEWBOX.minLat) / (TN_VIEWBOX.maxLat - TN_VIEWBOX.minLat)) * VB_H;
  return { x, y };
}

// Simplified district boundary polygons [lng, lat][] derived from Natural Earth / GADM data
const TN_DISTRICTS = [
  { name:"Chennai",       coords:[[80.20,13.22],[80.32,13.18],[80.31,13.05],[80.19,13.00],[80.12,13.10],[80.15,13.22]] },
  { name:"Thiruvallur",   coords:[[79.70,13.55],[80.20,13.55],[80.20,13.22],[80.12,13.10],[79.85,13.00],[79.60,13.10],[79.65,13.40]] },
  { name:"Kancheepuram",  coords:[[79.60,13.10],[79.85,13.00],[80.12,13.10],[80.19,13.00],[80.15,12.72],[79.95,12.60],[79.70,12.70],[79.55,12.90]] },
  { name:"Vellore",       coords:[[78.80,13.20],[79.35,13.55],[79.70,13.55],[79.65,13.40],[79.60,13.10],[79.55,12.90],[79.20,12.92],[78.95,13.00],[78.80,13.18]] },
  { name:"Tirupattur",    coords:[[78.40,13.10],[78.80,13.20],[78.80,13.18],[78.95,13.00],[78.80,12.80],[78.50,12.75],[78.35,12.90]] },
  { name:"Ranipet",       coords:[[79.20,12.92],[79.55,12.90],[79.50,12.60],[79.35,12.40],[79.10,12.50],[79.05,12.70]] },
  { name:"Tiruvannamalai",coords:[[78.80,12.80],[79.10,12.70],[79.05,12.50],[79.10,12.20],[78.95,12.00],[78.65,11.90],[78.50,12.05],[78.45,12.30],[78.50,12.75]] },
  { name:"Villupuram",    coords:[[79.10,12.20],[79.35,12.40],[79.50,12.60],[79.55,12.90],[79.70,12.70],[79.95,12.60],[79.90,12.30],[79.70,12.00],[79.55,11.80],[79.35,11.70],[79.15,11.85],[79.05,12.00]] },
  { name:"Cuddalore",     coords:[[79.55,11.80],[79.70,12.00],[79.90,12.30],[80.00,12.00],[80.05,11.75],[79.95,11.55],[79.75,11.45],[79.60,11.55]] },
  { name:"Kallakurichi",  coords:[[78.95,12.00],[79.05,12.00],[79.15,11.85],[79.35,11.70],[79.25,11.55],[79.05,11.40],[78.85,11.50],[78.80,11.75]] },
  { name:"Salem",         coords:[[78.10,11.80],[78.35,11.90],[78.65,11.90],[78.80,11.75],[78.80,11.50],[78.70,11.20],[78.50,11.10],[78.20,11.15],[78.05,11.40]] },
  { name:"Namakkal",      coords:[[77.85,11.40],[78.05,11.40],[78.20,11.15],[78.50,11.10],[78.45,10.90],[78.20,10.75],[77.95,10.80],[77.80,11.05],[77.80,11.25]] },
  { name:"Dharmapuri",    coords:[[77.60,12.20],[78.10,12.25],[78.35,11.90],[78.10,11.80],[78.05,11.40],[77.80,11.25],[77.65,11.40],[77.50,11.70],[77.55,12.00]] },
  { name:"Krishnagiri",   coords:[[77.55,12.55],[78.10,12.55],[78.10,12.25],[77.60,12.20],[77.55,12.00],[77.35,12.05],[77.30,12.35],[77.45,12.55]] },
  { name:"Erode",         coords:[[77.20,11.65],[77.50,11.70],[77.65,11.40],[77.80,11.05],[77.60,10.90],[77.40,10.80],[77.15,10.95],[77.05,11.25],[77.10,11.55]] },
  { name:"Tiruppur",      coords:[[77.05,11.25],[77.15,10.95],[77.40,10.80],[77.35,10.55],[77.10,10.40],[76.90,10.60],[76.85,10.90],[76.95,11.15]] },
  { name:"Coimbatore",    coords:[[76.85,11.10],[76.95,11.15],[76.85,10.90],[76.90,10.60],[77.10,10.40],[76.95,10.20],[76.75,10.25],[76.60,10.50],[76.65,10.80],[76.75,11.00]] },
  { name:"The Nilgiris",  coords:[[76.60,11.35],[77.05,11.55],[77.10,11.25],[76.95,11.15],[76.85,11.10],[76.75,11.00],[76.60,11.10],[76.55,11.25]] },
  { name:"Karur",         coords:[[77.80,11.05],[77.95,10.80],[78.20,10.75],[78.20,10.50],[78.00,10.35],[77.75,10.40],[77.60,10.60],[77.60,10.90]] },
  { name:"Tiruchirappalli",coords:[[78.45,10.90],[78.70,11.20],[78.80,11.00],[78.85,10.75],[78.65,10.55],[78.40,10.50],[78.20,10.50],[78.20,10.75],[78.45,10.90]] },
  { name:"Perambalur",    coords:[[79.05,11.40],[79.25,11.55],[79.20,11.30],[79.05,11.10],[78.85,11.10],[78.80,11.25],[78.85,11.50]] },
  { name:"Ariyalur",      coords:[[79.05,11.10],[79.20,11.30],[79.30,11.00],[79.25,10.80],[79.05,10.70],[78.85,10.80],[78.85,11.10]] },
  { name:"Thanjavur",     coords:[[78.85,10.80],[79.05,10.70],[79.25,10.80],[79.35,10.55],[79.20,10.30],[79.00,10.25],[78.75,10.30],[78.65,10.55],[78.85,10.80]] },
  { name:"Tiruvarur",     coords:[[79.35,10.55],[79.55,10.65],[79.70,10.45],[79.65,10.20],[79.45,10.10],[79.20,10.15],[79.00,10.25],[79.20,10.30],[79.35,10.55]] },
  { name:"Nagapattinam",  coords:[[79.65,10.20],[79.70,10.45],[79.90,10.35],[80.00,10.15],[79.90,9.95],[79.70,9.90],[79.60,10.05],[79.65,10.20]] },
  { name:"Mayiladuthurai",coords:[[79.55,10.65],[79.70,10.80],[79.90,10.70],[79.90,10.35],[79.70,10.45],[79.55,10.65]] },
  { name:"Sivaganga",     coords:[[78.65,10.10],[78.90,10.20],[79.00,10.25],[78.75,10.30],[78.65,10.05],[78.45,9.95],[78.30,10.05],[78.40,10.30],[78.65,10.10]] },
  { name:"Pudukkottai",   coords:[[78.40,10.50],[78.65,10.55],[78.65,10.10],[78.40,10.30],[78.30,10.05],[78.10,10.15],[78.05,10.40],[78.20,10.50]] },
  { name:"Madurai",       coords:[[77.75,10.40],[78.00,10.35],[78.20,10.50],[78.05,10.40],[78.10,10.15],[77.95,9.95],[77.70,9.90],[77.55,10.05],[77.60,10.30]] },
  { name:"Theni",         coords:[[77.35,10.10],[77.55,10.05],[77.70,9.90],[77.60,9.65],[77.40,9.60],[77.20,9.75],[77.20,9.95],[77.35,10.10]] },
  { name:"Dindigul",      coords:[[77.60,10.60],[77.75,10.40],[77.60,10.30],[77.55,10.05],[77.35,10.10],[77.20,9.95],[77.15,10.20],[77.30,10.50],[77.45,10.65]] },
  { name:"Virudhunagar",  coords:[[77.70,9.90],[77.95,9.95],[78.10,9.75],[78.05,9.50],[77.85,9.35],[77.60,9.40],[77.45,9.60],[77.60,9.65]] },
  { name:"Ramanathapuram",coords:[[78.30,9.60],[78.55,9.70],[78.80,9.50],[78.90,9.30],[78.70,9.10],[78.40,9.05],[78.20,9.20],[78.10,9.50],[78.30,9.60]] },
  { name:"Thoothukudi",   coords:[[77.85,9.35],[78.05,9.50],[78.10,9.25],[78.15,9.00],[78.00,8.80],[77.80,8.85],[77.70,9.10],[77.80,9.25]] },
  { name:"Tirunelveli",   coords:[[77.30,9.00],[77.55,9.10],[77.70,9.10],[77.80,8.85],[77.65,8.65],[77.45,8.60],[77.25,8.70],[77.20,8.90]] },
  { name:"Kanyakumari",   coords:[[77.20,8.70],[77.45,8.60],[77.50,8.35],[77.30,8.15],[77.05,8.15],[76.95,8.35],[77.05,8.55],[77.20,8.70]] },
  { name:"Tenkasi",       coords:[[77.20,9.20],[77.45,9.60],[77.60,9.40],[77.45,9.15],[77.30,9.00],[77.20,8.90],[77.05,9.00],[77.05,9.15]] },
  { name:"Chengalpattu",  coords:[[79.95,12.60],[80.15,12.72],[80.19,13.00],[80.31,13.05],[80.32,12.85],[80.20,12.65],[80.05,12.45],[79.90,12.30],[79.90,12.50]] },
  // Puducherry (UT) — shown as a distinct district polygon
  { name:"Puducherry",    coords:[[79.75,11.90],[79.90,11.95],[80.02,11.80],[79.95,11.65],[79.80,11.65],[79.72,11.75]], isPuducherry:true },
  { name:"Karaikal",      coords:[[79.80,10.95],[79.95,11.00],[80.00,10.88],[79.88,10.82],[79.78,10.88]], isPuducherry:true },
];

// Key city label positions
const TN_CITIES = [
  { name:"Chennai",     lat:13.08, lng:80.27 },
  { name:"Coimbatore",  lat:11.01, lng:76.97 },
  { name:"Madurai",     lat:9.93,  lng:78.12 },
  { name:"Trichy",      lat:10.80, lng:78.69 },
  { name:"Salem",       lat:11.66, lng:78.15 },
  { name:"Tirunelveli", lat:8.71,  lng:77.76 },
  { name:"Vellore",     lat:12.92, lng:79.13 },
  { name:"Puducherry",  lat:11.94, lng:79.83 },
  { name:"Erode",       lat:11.34, lng:77.72 },
];

function HeatmapCanvas({ complaints }) {
  const [tooltip, setTooltip] = useState(null);
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);

  const points = complaints.filter(c => c.lat && c.lng).map(c => ({
    ...c,
    weight: calcWeight(c),
    ...lngLatToSVG(c.lng, c.lat),
  }));

  function districtPath(coords) {
    return coords.map((c, i) => {
      const { x, y } = lngLatToSVG(c[0], c[1]);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z";
  }

  function handleMouseMove(e) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const scaleY = VB_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const hit = points.find(p => Math.hypot(p.x - mx, p.y - my) < 28);
    if (hit) {
      setTooltip({ screenX: e.clientX - rect.left, screenY: e.clientY - rect.top, c: hit });
      setHovered(hit.id);
    } else {
      setTooltip(null);
      setHovered(null);
    }
  }

  return (
    <div style={{ position:"relative" }}>
      {/* Legend row */}
      <div style={{ display:"flex", gap:16, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        {["Submitted","Assigned","In Progress","Resolved","Closed","Delayed"].map(k => {
          const v = STATUS[k];
          return (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:T.slate }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:v.color }} />
              {v.label}
            </div>
          );
        })}
        <div style={{ marginLeft:"auto", fontSize:11, color:T.slateLight }}>
          Halo size = urgency weight · hover for details
        </div>
      </div>

      {/* SVG Map */}
      <div style={{
        position:"relative",
        borderRadius:14,
        overflow:"hidden",
        boxShadow:"0 4px 32px rgba(30,60,100,0.18), 0 1px 4px rgba(0,0,0,0.10)",
        border:"2px solid #b0c8e0",
      }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ width:"100%", display:"block", cursor:"crosshair" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setTooltip(null); setHovered(null); }}
        >
          <defs>
            {/* Ocean gradient — deep blue to pale near coast */}
            <linearGradient id="oceanGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a6fa8" />
              <stop offset="40%" stopColor="#2e86c1" />
              <stop offset="100%" stopColor="#5dade2" />
            </linearGradient>

            {/* Land base gradient — warm green-tan, lighter in plains, greener west */}
            <linearGradient id="landGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dba7a" />
              <stop offset="35%" stopColor="#a8c97a" />
              <stop offset="65%" stopColor="#c9d98a" />
              <stop offset="100%" stopColor="#d4c87a" />
            </linearGradient>

            {/* Western Ghats hills — darker green */}
            <linearGradient id="ghatsGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a8c4a" />
              <stop offset="100%" stopColor="#6aaa5a" />
            </linearGradient>

            {/* Puducherry fill */}
            <linearGradient id="pondyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b8d4f0" />
              <stop offset="100%" stopColor="#90bce0" />
            </linearGradient>

            {/* Coastal glow filter */}
            <filter id="coastGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Terrain shadow filter for depth */}
            <filter id="terrainShadow" x="-5%" y="-5%" width="115%" height="115%">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#00000030" />
            </filter>

            {/* Soft inner glow for districts on hover */}
            <filter id="districtGlow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feFlood floodColor="#ffffff" floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Heatmap blob gradients */}
            {points.map(p => {
              const s = STATUS[p.status] || { color:"#c9922a" };
              return (
                <radialGradient key={`rg-${p.id}`} id={`rg-${p.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={s.color} stopOpacity="0.72" />
                  <stop offset="40%"  stopColor={s.color} stopOpacity="0.38" />
                  <stop offset="75%"  stopColor={s.color} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </radialGradient>
              );
            })}

            {/* Water texture pattern */}
            <pattern id="waterPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="url(#oceanGrad)" />
              <path d="M0,10 Q10,8 20,10 Q30,12 40,10" stroke="#4a9fd4" strokeWidth="0.6" fill="none" opacity="0.35"/>
              <path d="M0,20 Q10,18 20,20 Q30,22 40,20" stroke="#4a9fd4" strokeWidth="0.6" fill="none" opacity="0.25"/>
              <path d="M0,30 Q10,28 20,30 Q30,32 40,30" stroke="#4a9fd4" strokeWidth="0.6" fill="none" opacity="0.35"/>
            </pattern>

            {/* Terrain texture for land — subtle crosshatch */}
            <pattern id="terrainTex" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="transparent"/>
              <path d="M0,6 L6,0" stroke="#00000008" strokeWidth="0.8"/>
            </pattern>

            {/* Clip path for entire TN shape (union of all districts) used for outer shadow */}
            <clipPath id="tnClip">
              {TN_DISTRICTS.filter(d=>!d.isPuducherry).map(d => (
                <path key={d.name} d={districtPath(d.coords)} />
              ))}
            </clipPath>
          </defs>

          {/* Latitude lines (subtle) */}
          {[9, 10, 11, 12, 13].map(lat => {
            const { y } = lngLatToSVG(78, lat);
            return <line key={lat} x1={0} y1={y} x2={VB_W} y2={y} stroke="#4a9fd4" strokeWidth={0.4} opacity={0.3} strokeDasharray="6 8" />;
          })}
          {/* Longitude lines (subtle) */}
          {[77, 78, 79, 80].map(lng => {
            const { x } = lngLatToSVG(lng, 11);
            return <line key={lng} x1={x} y1={0} x2={x} y2={VB_H} stroke="#4a9fd4" strokeWidth={0.4} opacity={0.3} strokeDasharray="6 8" />;
          })}

          {/* Lat/Lng tick labels */}
          {[9,10,11,12,13].map(lat => {
            const { y } = lngLatToSVG(76.4, lat);
            return <text key={`lat${lat}`} x={18} y={y+4} fontSize={8} fill="#2e86c1" opacity={0.7} fontFamily="'DM Mono',monospace">{lat}°N</text>;
          })}
          {[77,78,79,80].map(lng => {
            const { x } = lngLatToSVG(lng, 8.15);
            return <text key={`lng${lng}`} x={x-10} y={VB_H-10} fontSize={8} fill="#2e86c1" opacity={0.7} fontFamily="'DM Mono',monospace">{lng}°E</text>;
          })}

          {/* ── LAYER 2: Land — main TN districts ── */}
          {/* Outer territory glow/shadow beneath all districts */}
          {TN_DISTRICTS.filter(d=>!d.isPuducherry).map(d => (
            <path key={`sh-${d.name}`} d={districtPath(d.coords)}
              fill="#00000018" stroke="none"
              transform="translate(3,4)"
            />
          ))}

          {/* Western Ghats districts — greener, hillier look */}
          {["The Nilgiris","Coimbatore","Tiruppur","Erode","Dharmapuri","Krishnagiri","Salem","Theni","Dindigul"].map(n => {
            const d = TN_DISTRICTS.find(dd=>dd.name===n);
            if (!d) return null;
            return (
              <path key={`ghats-${n}`} d={districtPath(d.coords)}
                fill="url(#ghatsGrad)"
                stroke="#3a7a3a" strokeWidth={0.7}
              />
            );
          })}

          {/* All other TN districts */}
          {TN_DISTRICTS.filter(d => !d.isPuducherry &&
            !["The Nilgiris","Coimbatore","Tiruppur","Erode","Dharmapuri","Krishnagiri","Salem","Theni","Dindigul"].includes(d.name)
          ).map(d => (
            <path key={d.name} d={districtPath(d.coords)}
              fill="url(#landGrad)"
              stroke="#8aaa60" strokeWidth={0.7}
            />
          ))}

          {/* Terrain texture overlay on all land */}
          {TN_DISTRICTS.filter(d=>!d.isPuducherry).map(d => (
            <path key={`tex-${d.name}`} d={districtPath(d.coords)}
              fill="url(#terrainTex)" stroke="none" opacity={0.5}
            />
          ))}

          {/* ── LAYER 3: Puducherry UT ── */}
          {TN_DISTRICTS.filter(d=>d.isPuducherry).map(d => (
            <path key={d.name} d={districtPath(d.coords)}
              fill="url(#pondyGrad)"
              stroke="#1a5fa8" strokeWidth={1.8} strokeDasharray="4 2"
            />
          ))}

          {/* ── LAYER 4: District borders (crisp internal lines) ── */}
          {TN_DISTRICTS.filter(d=>!d.isPuducherry).map(d => (
            <path key={`brd-${d.name}`} d={districtPath(d.coords)}
              fill="none"
              stroke="#5a8a3a" strokeWidth={0.9} opacity={0.7}
            />
          ))}

          {/* ── LAYER 5: Coastline highlight ── */}
          {/* East coast glow (Bay of Bengal side) */}
          <path
            d={`M${lngLatToSVG(80.32,13.18).x},${lngLatToSVG(80.32,13.18).y}
                L${lngLatToSVG(80.31,13.05).x},${lngLatToSVG(80.31,13.05).y}
                L${lngLatToSVG(80.05,11.75).x},${lngLatToSVG(80.05,11.75).y}
                L${lngLatToSVG(80.00,10.15).x},${lngLatToSVG(80.00,10.15).y}
                L${lngLatToSVG(79.90,9.95).x},${lngLatToSVG(79.90,9.95).y}
                L${lngLatToSVG(78.15,9.00).x},${lngLatToSVG(78.15,9.00).y}
                L${lngLatToSVG(77.50,8.35).x},${lngLatToSVG(77.50,8.35).y}`}
            fill="none" stroke="#ffffff" strokeWidth={2.5} opacity={0.5} strokeLinejoin="round"
          />

          {/* ── LAYER 6: Rivers (simplified) ── */}
          {/* Cauvery river — approximate path across TN */}
          <path
            d={`M${lngLatToSVG(77.20,11.62).x},${lngLatToSVG(77.20,11.62).y}
                Q${lngLatToSVG(77.80,11.30).x},${lngLatToSVG(77.80,11.30).y}
                 ${lngLatToSVG(78.20,11.10).x},${lngLatToSVG(78.20,11.10).y}
                Q${lngLatToSVG(78.70,10.95).x},${lngLatToSVG(78.70,10.95).y}
                 ${lngLatToSVG(79.00,10.80).x},${lngLatToSVG(79.00,10.80).y}
                Q${lngLatToSVG(79.50,10.55).x},${lngLatToSVG(79.50,10.55).y}
                 ${lngLatToSVG(79.85,10.35).x},${lngLatToSVG(79.85,10.35).y}`}
            fill="none" stroke="#2980b9" strokeWidth={1.6} opacity={0.7} strokeLinecap="round"
          />
          <text fontSize={7.5} fill="#1a5fa8" fontFamily="'Outfit',sans-serif" fontStyle="italic" opacity={0.8}>
            <textPath href="#cauveryPath" startOffset="20%">Cauvery</textPath>
          </text>
          {/* Cauvery label */}
          <text x={lngLatToSVG(78.5,10.97).x} y={lngLatToSVG(78.5,10.97).y}
            fontSize={7} fill="#1a5fa8" fontFamily="'Outfit',sans-serif" fontStyle="italic" opacity={0.85}>
            Cauvery R.
          </text>

          {/* Palar river */}
          <path
            d={`M${lngLatToSVG(79.10,13.00).x},${lngLatToSVG(79.10,13.00).y}
                Q${lngLatToSVG(79.55,12.75).x},${lngLatToSVG(79.55,12.75).y}
                 ${lngLatToSVG(80.05,12.50).x},${lngLatToSVG(80.05,12.50).y}`}
            fill="none" stroke="#3498db" strokeWidth={1.2} opacity={0.55} strokeLinecap="round"
          />

          {/* Vaigai river */}
          <path
            d={`M${lngLatToSVG(77.60,10.10).x},${lngLatToSVG(77.60,10.10).y}
                Q${lngLatToSVG(78.10,9.95).x},${lngLatToSVG(78.10,9.95).y}
                 ${lngLatToSVG(78.55,9.75).x},${lngLatToSVG(78.55,9.75).y}`}
            fill="none" stroke="#3498db" strokeWidth={1.1} opacity={0.5} strokeLinecap="round"
          />

          {/* ── LAYER 7: Bay of Bengal & Arabian Sea text ── */}
          <text x={VB_W - 90} y={300} textAnchor="middle" fontSize={13} fill="#1a6fa8"
            fontFamily="'DM Serif Display',serif" fontStyle="italic" opacity={0.55}
            transform={`rotate(90, ${VB_W-90}, 300)`}>
            Bay of Bengal
          </text>
          <text x={38} y={480} textAnchor="middle" fontSize={11} fill="#1a6fa8"
            fontFamily="'DM Serif Display',serif" fontStyle="italic" opacity={0.5}
            transform={`rotate(-90, 38, 480)`}>
            Arabian Sea
          </text>

          {/* ── LAYER 8: Heatmap blobs ── */}
          {points.map(p => {
            const r = Math.min(110, 48 + p.weight * 6);
            return (
              <ellipse key={`blob-${p.id}`} cx={p.x} cy={p.y} rx={r} ry={r * 0.88}
                fill={`url(#rg-${p.id})`}
              />
            );
          })}

          {/* ── LAYER 9: District labels ── */}
          {TN_DISTRICTS.map(d => {
            const n = d.coords.length;
            const centroid = d.coords.reduce(
              (acc, c) => ({ lng: acc.lng + c[0]/n, lat: acc.lat + c[1]/n }),
              { lng:0, lat:0 }
            );
            const { x, y } = lngLatToSVG(centroid.lng, centroid.lat);
            const words = d.name.split(" ");
            return (
              <text key={`lbl-${d.name}`} textAnchor="middle" pointerEvents="none"
                style={{ userSelect:"none" }}>
                {words.map((w, i) => (
                  <tspan key={i} x={x} dy={i === 0 ? y - (words.length-1)*5 : 10}
                    fontSize={d.isPuducherry ? 7.5 : 8}
                    fontWeight={d.isPuducherry ? 700 : 600}
                    fill={d.isPuducherry ? "#0a3a6a" : "#2a3a1a"}
                    fontFamily="'Outfit',sans-serif"
                    style={{ textShadow:"0 0 3px rgba(255,255,255,0.9)" }}
                    paintOrder="stroke"
                    stroke="rgba(255,255,255,0.85)" strokeWidth={2.5}
                  >{w}</tspan>
                ))}
              </text>
            );
          })}

          {/* ── LAYER 10: City markers ── */}
          {TN_CITIES.map(city => {
            const { x, y } = lngLatToSVG(city.lng, city.lat);
            const isCapital = city.name === "Chennai";
            return (
              <g key={city.name} pointerEvents="none">
                {/* Shadow */}
                <circle cx={x+1} cy={y+1} r={isCapital ? 6 : 4} fill="#00000030" />
                {/* City dot */}
                <circle cx={x} cy={y} r={isCapital ? 6 : 4}
                  fill={isCapital ? "#c0392b" : "#34495e"}
                  stroke="#ffffff" strokeWidth={1.5}
                />
                {isCapital && <circle cx={x} cy={y} r={9} fill="none" stroke="#c0392b" strokeWidth={1} opacity={0.5} />}
                {/* Label with white halo */}
                <text x={x + (isCapital ? 8 : 6)} y={y + 4}
                  fontSize={isCapital ? 10 : 8.5}
                  fontWeight={isCapital ? 700 : 600}
                  fill={isCapital ? "#7b1a1a" : "#1a2a0a"}
                  fontFamily="'Outfit',sans-serif"
                  paintOrder="stroke"
                  stroke="rgba(255,255,255,0.95)" strokeWidth={3}
                  style={{ userSelect:"none" }}>
                  {city.name}
                </text>
              </g>
            );
          })}

          {/* ── LAYER 11: Complaint dots ── */}
          {points.map(p => {
            const s = STATUS[p.status] || { color:"#c9922a" };
            const isHov = hovered === p.id;
            return (
              <g key={`dot-${p.id}`}>
                {/* Drop shadow for dot */}
                <circle cx={p.x+2} cy={p.y+2} r={isHov ? 10 : 8} fill="#00000040" />
                {/* Hover ring */}
                {isHov && <circle cx={p.x} cy={p.y} r={22} fill={s.color} opacity={0.18} />}
                {/* Main dot */}
                <circle cx={p.x} cy={p.y} r={isHov ? 10 : 8}
                  fill={s.color} stroke="#fff" strokeWidth={2.5}
                  style={{ transition:"r 0.15s ease", filter: isHov ? "brightness(1.15)" : "none" }}
                />
                {/* Escalation dashed ring */}
                {p.escalationLevel > 0 && (
                  <circle cx={p.x} cy={p.y} r={isHov ? 17 : 14} fill="none"
                    stroke={["","#c97a1a","#c94a2a","#8b1a1a"][p.escalationLevel]}
                    strokeWidth={2} strokeDasharray="4 3" opacity={0.9}
                  />
                )}
                {/* ID label with halo */}
                <text x={p.x} y={p.y - (isHov ? 18 : 14)} textAnchor="middle"
                  fontSize={8.5} fontFamily="'DM Mono',monospace" fontWeight={700}
                  fill="#0a0a0f"
                  paintOrder="stroke" stroke="rgba(255,255,255,0.95)" strokeWidth={3}
                  style={{ userSelect:"none", pointerEvents:"none" }}>
                  {p.id}
                </text>
              </g>
            );
          })}

          {/* ── LAYER 12: Compass rose ── */}
          <g transform={`translate(${VB_W - 62}, 62)`}>
            <circle cx={0} cy={0} r={30} fill="rgba(255,255,255,0.82)" stroke="#7aaa60" strokeWidth={1.5} />
            <circle cx={0} cy={0} r={26} fill="none" stroke="#7aaa60" strokeWidth={0.5} opacity={0.5} />
            {/* N */}
            <polygon points="0,-24 4,-8 -4,-8" fill="#c0392b" />
            <polygon points="0,24 4,8 -4,8" fill="#7a8a7a" />
            <polygon points="-24,0 -8,4 -8,-4" fill="#7a8a7a" />
            <polygon points="24,0 8,4 8,-4" fill="#7a8a7a" />
            <circle cx={0} cy={0} r={5} fill="#fff" stroke="#5a6a5a" strokeWidth={1} />
            <text x={0} y={-13} textAnchor="middle" fontSize={9} fontWeight={800} fill="#c0392b" fontFamily="'Outfit',sans-serif">N</text>
            <text x={0} y={21} textAnchor="middle" fontSize={7} fill="#7a8a7a" fontFamily="'Outfit',sans-serif">S</text>
            <text x={-17} y={4} textAnchor="middle" fontSize={7} fill="#7a8a7a" fontFamily="'Outfit',sans-serif">W</text>
            <text x={17} y={4} textAnchor="middle" fontSize={7} fill="#7a8a7a" fontFamily="'Outfit',sans-serif">E</text>
          </g>

          {/* ── LAYER 13: Scale bar ── */}
          <g transform={`translate(30, ${VB_H - 50})`}>
            <rect x={0} y={0} width={100} height={8} rx={2} fill="#2c3e50" opacity={0.85} />
            <rect x={100} y={0} width={100} height={8} rx={0} fill="#ecf0f1" stroke="#2c3e50" strokeWidth={1} opacity={0.9} />
            <rect x={0} y={-4} width={200} height={16} rx={2} fill="rgba(255,255,255,0.4)" />
            <text x={0} y={20} fontSize={8.5} fill="#2c3e50" fontFamily="'Outfit',sans-serif" fontWeight={600}>0</text>
            <text x={90} y={20} fontSize={8.5} fill="#2c3e50" fontFamily="'Outfit',sans-serif" fontWeight={600}>100 km</text>
            <text x={185} y={20} fontSize={8.5} fill="#2c3e50" fontFamily="'Outfit',sans-serif" fontWeight={600}>200 km</text>
          </g>

          {/* ── LAYER 14: Puducherry legend box ── */}
          <rect x={VB_W-175} y={VB_H-72} width={165} height={52} rx={7}
            fill="rgba(255,255,255,0.88)" stroke="#1a5fa8" strokeWidth={1.5} />
          <text x={VB_W-168} y={VB_H-54} fontSize={9} fontWeight={700} fill="#0a3a6a"
            fontFamily="'Outfit',sans-serif">Puducherry (UT)</text>
          <rect x={VB_W-168} y={VB_H-44} width={14} height={8} rx={2}
            fill="url(#pondyGrad)" stroke="#1a5fa8" strokeWidth={1} strokeDasharray="3 1.5" />
          <text x={VB_W-150} y={VB_H-37} fontSize={8} fill="#2c3e50" fontFamily="'Outfit',sans-serif">
            Union Territory enclave
          </text>

          {/* ── State title ── */}
          <rect x={18} y={14} width={210} height={34} rx={6} fill="rgba(255,255,255,0.82)" stroke="#7aaa60" strokeWidth={1} />
          <text x={28} y={30} fontSize={13} fontWeight={700} fill="#1a3a0a"
            fontFamily="'DM Serif Display',serif">Tamil Nadu</text>
          <text x={28} y={43} fontSize={8} fill="#5a6a4a" fontFamily="'Outfit',sans-serif">
            incl. Puducherry (UT)
          </text>
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div style={{
            position:"absolute",
            left: Math.min(tooltip.screenX + 14, 999),
            top: tooltip.screenY - 10,
            background:T.ink, color:T.white, padding:"11px 15px",
            borderRadius:9, fontSize:12, pointerEvents:"none",
            boxShadow:"0 8px 28px rgba(0,0,0,0.35)",
            zIndex:20, minWidth:200, maxWidth:240,
          }}>
            <div style={{ fontWeight:700, fontFamily:"'DM Serif Display', serif", fontSize:14, marginBottom:4 }}>{tooltip.c.title}</div>
            <div style={{ color:"#bbb", marginBottom:8, fontSize:11 }}>{tooltip.c.location}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
              <Badge status={tooltip.c.status} />
              <PriorityBadge priority={tooltip.c.priority} />
              {tooltip.c.escalationLevel > 0 && <EscBadge level={tooltip.c.escalationLevel} />}
            </div>
            <div style={{ display:"flex", gap:16, fontSize:11, color:"#ccc", borderTop:"1px solid #333", paddingTop:8 }}>
              <span>▲ {tooltip.c.upvotes} upvotes</span>
              <span>⚡ Weight {tooltip.c.weight}</span>
            </div>
          </div>
        )}
      </div>

      {/* Point cards */}
      <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:8 }}>
        {points.map(p => (
          <div key={p.id}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding:"9px 13px", background: hovered === p.id ? T.surfaceDark : T.surface,
              borderRadius:8, fontSize:12, border:`1px solid ${hovered === p.id ? T.border : T.borderLight}`,
              cursor:"default", transition:"all 0.15s",
            }}>
            <div style={{ fontWeight:700, color:T.gold, marginBottom:2 }} className="mono">{p.id}</div>
            <div style={{ color:T.ink, fontWeight:500, marginBottom:3, lineHeight:1.3, fontSize:11 }}>{p.title.slice(0,40)}{p.title.length>40?"…":""}</div>
            <div style={{ color:T.slateLight, marginBottom:6, fontSize:10 }}>{p.location}</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              <Badge status={p.status} />
              {p.escalationLevel > 0 && <EscBadge level={p.escalationLevel} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Timeline ──────────────────────────────────────────────────────────────────
function Timeline({ complaintId }) {
  const steps = SEED_HISTORY[complaintId] || [
    { status:"Submitted", timestamp: new Date().toISOString(), note:"Complaint registered." }
  ];
  return (
    <div>
      {steps.map((s, i) => {
        const st = STATUS[s.status] || STATUS.Submitted;
        return (
          <div key={i} style={{ display:"flex", gap:14, marginBottom: i < steps.length - 1 ? 0 : 0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:st.bg, border:`2px solid ${st.color}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:st.color }} />
              </div>
              {i < steps.length - 1 && <div style={{ width:2, height:32, background:T.borderLight }} />}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <Badge status={s.status} />
                <span style={{ fontSize:11, color:T.slateLight }} className="mono">{fmtDT(s.timestamp)}</span>
              </div>
              <div style={{ fontSize:13, color:T.slate }}>{s.note}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Topbar / Shell ────────────────────────────────────────────────────────────
function Shell({ user, onLogout, nav, activeNav, setActiveNav, children }) {
  return (
    <div style={{ minHeight:"100vh", background:T.cream, fontFamily:"'Outfit', sans-serif" }}>
      <header style={{
        position:"sticky", top:0, zIndex:200,
        background:"rgba(250,249,245,0.92)", backdropFilter:"blur(12px)",
        borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", padding:"0 28px", height:58,
        gap:28,
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:T.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:T.gold, fontSize:16, fontWeight:900, fontFamily:"'DM Serif Display', serif" }}>C</span>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:T.ink, letterSpacing:"-0.02em", fontFamily:"'DM Serif Display', serif", lineHeight:1 }}>CivicPulse</div>
            <div style={{ fontSize:9, color:T.slateLight, letterSpacing:"0.1em", textTransform:"uppercase", lineHeight:1 }}>Lite</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display:"flex", gap:2, flex:1 }}>
          {nav.map(item => (
            <button key={item.key} onClick={() => setActiveNav(item.key)} style={{
              padding:"6px 14px", borderRadius:6,
              background: activeNav === item.key ? T.ink : "transparent",
              color: activeNav === item.key ? T.white : T.slate,
              border:"none", fontSize:13, fontWeight:600, cursor:"pointer",
              transition:"all 0.15s ease",
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {user.role !== "public" && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.ink }}>{user.name}</div>
              <div style={{ fontSize:11, color:T.slateLight }}>{user.department || user.role}</div>
            </div>
          )}
          <Btn variant="outline" size="sm" onClick={onLogout}>
            {user.role === "public" ? "Login" : "Sign Out"}
          </Btn>
        </div>
      </header>

      <main style={{ padding:"28px 32px", maxWidth:1400, margin:"0 auto" }}>
        {children}
      </main>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────────
function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }} className="fade-up">
      <div>
        <h1 style={{ fontSize:26, fontWeight:400, color:T.ink, fontFamily:"'DM Serif Display', serif", margin:0, lineHeight:1.2 }}>{title}</h1>
        {subtitle && <p style={{ color:T.slateLight, marginTop:6, fontSize:14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Login ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("");
  const [error, setError] = useState("");

  const demos = {
    citizen: [{ label:"Arjun Sharma", email:"citizen@demo.in", password:"demo123" }],
    authority: [
      { label:"Roads Dept", email:"roads@civic.in", password:"admin123", dept:"Roads Department" },
      { label:"Electricity Board", email:"electricity@civic.in", password:"admin123", dept:"Electricity Board" },
      { label:"Water Board", email:"water@civic.in", password:"admin123", dept:"Water Board" },
      { label:"Traffic Police", email:"traffic@civic.in", password:"admin123", dept:"Traffic Police" },
      { label:"Swachh Bharat", email:"swachh@civic.in", password:"admin123", dept:"Swachh Bharat" },
    ],
  };

  function handleLogin() {
    const u = USERS[email];
    if (!u || u.password !== password) { setError("Invalid credentials."); return; }
    if (u.role === "authority" && u.department !== dept) { setError("Department mismatch."); return; }
    if (u.role === "citizen" && tab !== "citizen") { setError("Use citizen login."); return; }
    if (u.role === "authority" && tab !== "authority") { setError("Use authority login."); return; }
    setError(""); onLogin(u);
  }

  return (
    <div style={{ minHeight:"100vh", background:T.cream, display:"flex", flexDirection:"column", fontFamily:"'Outfit', sans-serif" }}>
      {/* Header bar */}
      <div style={{ background:T.ink, padding:"0 32px", display:"flex", alignItems:"center", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:T.gold, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:T.ink, fontSize:15, fontWeight:900, fontFamily:"'DM Serif Display', serif" }}>C</span>
          </div>
          <span style={{ color:T.white, fontWeight:700, fontSize:16, fontFamily:"'DM Serif Display', serif" }}>CivicPulse Lite</span>
          <span style={{ color:"#666", fontSize:12, marginLeft:4 }}>Civic Complaint Management System</span>
        </div>
      </div>

      <div style={{ flex:1, display:"flex" }}>
        {/* Left panel */}
        <div style={{ width:480, background:T.inkMid, padding:"60px 52px", display:"flex", flexDirection:"column", justifyContent:"center", gap:32 }}>
          <div>
            <h1 style={{ fontFamily:"'DM Serif Display', serif", fontSize:42, color:T.white, lineHeight:1.15, margin:0, marginBottom:16 }}>
              Better cities<br />start with<br /><span style={{ color:T.goldBright }}>better data.</span>
            </h1>
            <p style={{ color:"#8899aa", fontSize:14, lineHeight:1.7 }}>
              CivicPulse Lite connects citizens, authorities, and data to drive faster complaint resolution and transparent governance.
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { icon:"📍", text:"Geo-heatmap of complaint hotspots" },
              { icon:"📊", text:"Public transparency analytics" },
              { icon:"⚡", text:"Auto SLA escalation with cron scheduler" },
              { icon:"🏛", text:"Authority dashboard with RBAC" },
            ].map((f, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:16 }}>{f.icon}</span>
                <span style={{ color:"#b0c0d0", fontSize:13 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ padding:"16px 20px", background:"rgba(201,146,42,0.15)", borderRadius:10, border:`1px solid ${T.gold}44` }}>
            <div style={{ fontSize:11, color:T.gold, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>System Status</div>
            <div style={{ display:"flex", gap:16, fontSize:12, color:"#aabbcc" }}>
              <span>🟢 Cron Active</span>
              <span>🟢 DB Online</span>
              <span>🟢 {SEED_COMPLAINTS.length} Complaints</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
          <div style={{ width:"100%", maxWidth:420 }}>
            <div className="fade-up">
              <h2 style={{ fontSize:24, fontWeight:700, color:T.ink, marginBottom:6, fontFamily:"'DM Serif Display', serif" }}>Sign in</h2>
              <p style={{ color:T.slateLight, marginBottom:28, fontSize:14 }}>Choose your role to continue</p>
            </div>

            <Card style={{ padding:28 }} className="fade-up-1">
              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, marginBottom:24 }}>
                {[["citizen","👤 Citizen"],["authority","🏛 Authority"]].map(([k,l]) => (
                  <button key={k} onClick={() => { setTab(k); setError(""); setDept(""); }} style={{
                    flex:1, padding:"10px 0", background:"none", border:"none",
                    borderBottom: tab===k ? `2px solid ${T.ink}` : "2px solid transparent",
                    color: tab===k ? T.ink : T.slateLight, fontWeight:600, fontSize:13,
                    cursor:"pointer", fontFamily:"'Outfit', sans-serif", transition:"all 0.15s",
                  }}>{l}</button>
                ))}
              </div>

              <Field label="Email Address" value={email} onChange={setEmail} placeholder="Enter your email" required />
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter password" required />
              {tab === "authority" && (
                <Field label="Department" type="select" value={dept} onChange={setDept} options={DEPARTMENTS} placeholder="Select department" required />
              )}
              {error && (
                <div style={{ color:T.coral, fontSize:13, marginBottom:14, padding:"9px 13px", background:T.coralLight, borderRadius:7, border:`1px solid ${T.coral}33` }}>
                  {error}
                </div>
              )}
              <Btn onClick={handleLogin} style={{ width:"100%", marginBottom:6 }}>Sign In</Btn>

              {/* Demo accounts */}
              <div style={{ marginTop:20, paddingTop:18, borderTop:`1px solid ${T.borderLight}` }}>
                <div style={{ fontSize:11, color:T.slateLight, marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Quick Demo</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {demos[tab].map(d => (
                    <button key={d.email} onClick={() => { setEmail(d.email); setPassword(d.password); if (d.dept) setDept(d.dept); }} style={{
                      padding:"5px 10px", background:T.surface, border:`1px solid ${T.border}`,
                      borderRadius:5, fontSize:11, color:T.ink, cursor:"pointer", fontFamily:"'Outfit', sans-serif",
                      fontWeight:600, transition:"all 0.15s",
                    }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div style={{ textAlign:"center", marginTop:18 }} className="fade-up-2">
              <button onClick={() => onLogin({ role:"public" })} style={{
                background:"none", border:`1px solid ${T.border}`, color:T.slate,
                fontSize:13, cursor:"pointer", fontFamily:"'Outfit', sans-serif",
                padding:"9px 20px", borderRadius:7, fontWeight:500,
                transition:"all 0.15s",
              }}>
                View Public Transparency Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Public Dashboard ──────────────────────────────────────────────────────────
function PublicDashboard({ complaints, onLoginRedirect }) {
  const [nav, setNav] = useState("overview");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navItems = [
    { key:"overview", label:"Overview", icon:"📊" },
    { key:"heatmap", label:"Heatmap", icon:"🗺" },
    { key:"departments", label:"Departments", icon:"🏛" },
    { key:"escalations", label:"Escalations", icon:"⚡" },
  ];

  const filtered = complaints.filter(c =>
    (!catFilter || c.category === catFilter) &&
    (!statusFilter || c.status === statusFilter)
  );

  const total = filtered.length;
  const resolved = filtered.filter(c => ["Resolved","Closed"].includes(c.status)).length;
  const pending = filtered.filter(c => !["Resolved","Closed"].includes(c.status)).length;
  const delayed = filtered.filter(c => c.status === "Delayed").length;
  const resolvedPct = total ? Math.round(resolved/total*100) : 0;
  const avgRes = (() => {
    const times = filtered.filter(c => c.resolutionTime).map(c => c.resolutionTime);
    return times.length ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : "—";
  })();

  const statusDist = Object.entries(
    filtered.reduce((acc,c) => { acc[c.status]=(acc[c.status]||0)+1; return acc; }, {})
  ).map(([name,value]) => ({ name, value }));

  const catDist = CATEGORIES.map(cat => ({
    name: cat.replace(" Failure","").replace(" Issue","").replace(" Supply",""),
    value: filtered.filter(c => c.category === cat).length,
  }));

  const deptStats = DEPARTMENTS.map(d => {
    const dc = filtered.filter(c => c.department === d);
    const dr = dc.filter(c => ["Resolved","Closed"].includes(c.status));
    return { dept: d.split(" ")[0], total:dc.length, resolved:dr.length, pct: dc.length ? Math.round(dr.length/dc.length*100) : 0 };
  });

  // Trend (mock daily)
  const trendData = Array.from({length:14}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13-i));
    return { date: d.toLocaleDateString("en-IN",{month:"short",day:"numeric"}), count: Math.floor(Math.random()*5)+1 };
  });

  const COLORS = [T.teal, T.gold, T.coral, T.violet, T.amber, T.slateLight];

  return (
    <Shell user={{ role:"public" }} onLogout={onLoginRedirect} nav={navItems} activeNav={nav} setActiveNav={setNav}>
      {/* Banner */}
      <div style={{
        background:`linear-gradient(135deg, ${T.inkMid} 0%, ${T.ink} 100%)`,
        borderRadius:14, padding:"24px 32px", marginBottom:28,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        color:T.white,
      }} className="fade-up">
        <div>
          <div style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:T.goldBright, marginBottom:6, fontWeight:600 }}>Public Transparency Portal</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'DM Serif Display', serif" }}>Civic Complaint Dashboard</h2>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"#8899aa" }}>Real-time complaint data · Last updated: {new Date().toLocaleDateString("en-IN")}</p>
        </div>
        {/* Filters */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{
            padding:"7px 12px", borderRadius:7, border:`1px solid #334`,
            background:"#1a1a2e", color:T.white, fontSize:12, cursor:"pointer",
          }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{
            padding:"7px 12px", borderRadius:7, border:`1px solid #334`,
            background:"#1a1a2e", color:T.white, fontSize:12, cursor:"pointer",
          }}>
            <option value="">All Statuses</option>
            {["Submitted","Assigned","In Progress","Resolved","Closed","Delayed"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(catFilter||statusFilter) && <Btn variant="ghost" size="sm" onClick={() => { setCatFilter(""); setStatusFilter(""); }} style={{ color:"#aaa" }}>Clear</Btn>}
        </div>
      </div>

      {nav === "overview" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            <StatCard label="Total Complaints" value={total} sub="All time" accent={T.ink} icon="📋" className="fade-up" />
            <StatCard label="Resolved" value={resolved} sub={`${resolvedPct}% resolution rate`} accent="#2d7a47" icon="✅" className="fade-up-1" />
            <StatCard label="Pending" value={pending} sub="Require attention" accent={T.amber} icon="⏳" className="fade-up-2" />
            <StatCard label="SLA Delayed" value={delayed} sub="Breach count" accent={T.coral} icon="🚨" className="fade-up-3" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <Card style={{ padding:24 }} className="fade-up">
              <div style={{ fontSize:14, fontWeight:700, marginBottom:20, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Status Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusDist.map((entry,i) => <Cell key={i} fill={(STATUS[entry.name]||{color:COLORS[i]}).color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:T.ink, border:"none", borderRadius:8, color:T.white, fontSize:12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding:24 }} className="fade-up-1">
              <div style={{ fontSize:14, fontWeight:700, marginBottom:20, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>By Category</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catDist} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:T.slateLight }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:11, fill:T.slateLight }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background:T.ink, border:"none", borderRadius:8, color:T.white, fontSize:12 }} />
                  <Bar dataKey="value" fill={T.teal} radius={[5,5,0,0]}>
                    {catDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card style={{ padding:24 }} className="fade-up-2">
            <div style={{ fontSize:14, fontWeight:700, marginBottom:20, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Daily Complaint Trend (Last 14 Days)</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.teal} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={T.teal} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:T.slateLight }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:T.slateLight }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:T.ink, border:"none", borderRadius:8, color:T.white, fontSize:12 }} />
                <Area type="monotone" dataKey="count" stroke={T.teal} strokeWidth={2} fill="url(#tg)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {nav === "heatmap" && (
        <div>
          <PageHeader title="Geo Complaint Heatmap" subtitle="Spatial distribution of complaints across India. Dot size reflects urgency weight." />
          <Card style={{ padding:28 }}>
            <HeatmapCanvas complaints={filtered} />
          </Card>
        </div>
      )}

      {nav === "departments" && (
        <div>
          <PageHeader title="Department Performance" subtitle="Resolution rates and complaint volumes across all departments" />
          <Card style={{ padding:0, overflow:"hidden", marginBottom:20 }} className="fade-up">
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:T.surface }}>
                  {["Department","Total","Resolved","Resolution Rate","Avg Days","Pending"].map(h => (
                    <th key={h} style={{ padding:"13px 18px", textAlign:"left", fontWeight:600, color:T.slateLight, borderBottom:`1px solid ${T.border}`, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map(d => {
                  const dc = filtered.filter(c => c.department === d);
                  const dr = dc.filter(c => ["Resolved","Closed"].includes(c.status));
                  const times = dc.filter(c => c.resolutionTime).map(c => c.resolutionTime);
                  const avgT = times.length ? (times.reduce((a,b)=>a+b,0)/times.length).toFixed(1) : "—";
                  const pct = dc.length ? Math.round(dr.length/dc.length*100) : 0;
                  const pending = dc.length - dr.length;
                  return (
                    <tr key={d} style={{ borderBottom:`1px solid ${T.borderLight}` }} className="row-hover">
                      <td style={{ padding:"14px 18px", fontWeight:600, color:T.ink }}>{d}</td>
                      <td style={{ padding:"14px 18px", color:T.slate }}>{dc.length}</td>
                      <td style={{ padding:"14px 18px", color:"#2d7a47", fontWeight:600 }}>{dr.length}</td>
                      <td style={{ padding:"14px 18px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ flex:1, height:6, background:T.borderLight, borderRadius:3, maxWidth:80 }}>
                            <div style={{ width:`${pct}%`, height:"100%", background: pct>70?"#2d7a47":pct>40?T.amber:T.coral, borderRadius:3, transition:"width 0.5s ease" }} />
                          </div>
                          <span style={{ fontWeight:700, fontSize:13, color:pct>70?"#2d7a47":pct>40?T.amber:T.coral }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 18px", color:T.slate }}>{avgT !== "—" ? `${avgT} days` : "—"}</td>
                      <td style={{ padding:"14px 18px" }}>
                        <span style={{ fontWeight:600, color: pending > 2 ? T.coral : T.slate }}>{pending}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:14 }} className="fade-up-1">
            {deptStats.map(d => (
              <Card key={d.dept} style={{ padding:18 }}>
                <div style={{ fontSize:11, fontWeight:700, color:T.slateLight, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>{d.dept}</div>
                <div style={{ fontSize:30, fontWeight:700, color:T.gold, fontFamily:"'DM Serif Display', serif" }}>{d.total}</div>
                <div style={{ fontSize:12, color:T.slateLight, marginTop:4 }}>complaints</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {nav === "escalations" && (
        <div>
          <PageHeader title="Escalation Logs" subtitle="SLA breaches auto-detected by cron scheduler every 5 minutes" />
          <div style={{ marginBottom:16, padding:"14px 20px", background:T.amberLight, borderRadius:10, border:`1px solid ${T.amber}44`, fontSize:13, color:T.amber, display:"flex", gap:10, alignItems:"center" }} className="fade-up">
            <span>⚡</span>
            <span>Cron runs every 5 min · Escalation levels: <strong>L1</strong> (supervisor) → <strong>L2</strong> (manager) → <strong>L3</strong> (ADMIN). Same complaint is not re-escalated within 24h.</span>
          </div>
          <Card style={{ padding:0, overflow:"hidden", marginBottom:20 }} className="fade-up-1">
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:T.surface }}>
                  {["Log ID","Complaint","Prev Level","New Level","Triggered At","Reason","Action"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:T.slateLight, borderBottom:`1px solid ${T.border}`, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ESCALATION_LOGS.map(e => (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${T.borderLight}` }} className="row-hover">
                    <td style={{ padding:"12px 16px", fontWeight:700, color:T.gold }} className="mono">{e.id}</td>
                    <td style={{ padding:"12px 16px", color:T.teal, fontWeight:600 }} className="mono">{e.complaintId}</td>
                    <td style={{ padding:"12px 16px" }}><EscBadge level={e.previousLevel} /></td>
                    <td style={{ padding:"12px 16px" }}><EscBadge level={e.newLevel} /></td>
                    <td style={{ padding:"12px 16px", color:T.slateLight, whiteSpace:"nowrap" }} className="mono">{fmtDT(e.triggeredAt)}</td>
                    <td style={{ padding:"12px 16px", color:T.coral }}>{e.reason}</td>
                    <td style={{ padding:"12px 16px", color:T.slate }}>{e.actionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* High escalation complaints */}
          <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:14, fontFamily:"'DM Serif Display', serif" }} className="fade-up-2">Highly Escalated Complaints</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:14 }} className="fade-up-2">
            {complaints.filter(c => c.escalationLevel > 0).sort((a,b) => b.escalationLevel - a.escalationLevel).map(c => (
              <Card key={c.id} style={{ padding:18, borderLeft:`3px solid ${["","#c97a1a","#c94a2a","#8b1a1a"][c.escalationLevel]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span className="mono" style={{ fontSize:11, color:T.slateLight }}>{c.id}</span>
                  <EscBadge level={c.escalationLevel} />
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:T.ink, marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:12, color:T.slateLight, marginBottom:10 }}>{c.department} · {c.location}</div>
                <div style={{ display:"flex", gap:6 }}>
                  <Badge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}

// ─── Citizen Submit ────────────────────────────────────────────────────────────
function SubmitComplaint({ user, onSubmit }) {
  const [form, setForm] = useState({ title:"", category:"", location:"", description:"" });
  const [done, setDone] = useState(null);
  const set = k => v => setForm(f => ({ ...f, [k]:v }));

  const deptMap = { "Road Damage":"Roads Department", "Streetlight Failure":"Electricity Board", "Garbage Issue":"Swachh Bharat", "Water Supply":"Water Board", "Other":"Traffic Police" };

  function handleSubmit() {
    if (!form.title || !form.category || !form.location || !form.description) return;
    const c = {
      id: genId(), citizenId: user.id, ...form,
      department: deptMap[form.category] || "Roads Department",
      status:"Submitted",
      lat: 12.97 + (Math.random() - 0.5) * 4,
      lng: 77.59 + (Math.random() - 0.5) * 8,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      remarks:"", resolutionTime:null, priority:"MEDIUM", escalationLevel:0, upvotes:0,
      slaDueAt: new Date(Date.now() + 7*24*3600*1000).toISOString(),
    };
    onSubmit(c); setDone(c);
  }

  if (done) return (
    <div style={{ maxWidth:520, margin:"60px auto", textAlign:"center" }} className="fade-up">
      <div style={{ width:64, height:64, borderRadius:"50%", background:T.tealLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>✓</div>
      <h2 style={{ fontSize:22, fontFamily:"'DM Serif Display', serif" }}>Complaint Submitted</h2>
      <p style={{ color:T.slateLight, marginTop:10, lineHeight:1.7 }}>
        Your complaint <strong className="mono">{done.id}</strong> has been registered and assigned to <strong>{done.department}</strong>.
      </p>
      <div style={{ margin:"24px 0", padding:"14px 20px", background:T.surface, borderRadius:10, fontSize:13, color:T.slate, textAlign:"left" }}>
        <div style={{ fontWeight:600, marginBottom:8 }}>SLA Timeline:</div>
        <div>Due by: <strong>{fmt(done.slaDueAt)}</strong></div>
        <div style={{ marginTop:4 }}>Escalation begins if unresolved by due date.</div>
      </div>
      <Btn onClick={() => setDone(null)}>Submit Another</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <PageHeader title="File a Complaint" subtitle="Report civic issues to the relevant municipal authority." />
      <Card style={{ padding:28 }} className="fade-up">
        <Field label="Complaint Title" value={form.title} onChange={set("title")} placeholder="Brief description of the issue" required />
        <Field label="Category" type="select" value={form.category} onChange={set("category")} options={CATEGORIES} placeholder="Select category" required />
        <Field label="Location" value={form.location} onChange={set("location")} placeholder="Street address, locality, landmark" required />
        <Field label="Detailed Description" type="textarea" value={form.description} onChange={set("description")} placeholder="Describe the issue in detail..." required />

        {form.category && (
          <div style={{ padding:"10px 16px", background:T.goldLight, borderRadius:8, marginBottom:20, fontSize:13, color:T.gold, border:`1px solid ${T.gold}44` }}>
            📋 Will be routed to: <strong>{deptMap[form.category]}</strong>
          </div>
        )}
        <Btn variant="teal" onClick={handleSubmit} disabled={!form.title || !form.category || !form.location || !form.description}>
          Submit Complaint
        </Btn>
      </Card>
    </div>
  );
}

// ─── Citizen Dashboard ─────────────────────────────────────────────────────────
function CitizenDashboard({ user, complaints, onSubmit, onLogout }) {
  const [nav, setNav] = useState("overview");
  const [selected, setSelected] = useState(null);
  const mine = complaints.filter(c => c.citizenId === user.id);
  const navItems = [
    { key:"overview", label:"Overview", icon:"📊" },
    { key:"submit", label:"File Complaint", icon:"📝" },
    { key:"complaints", label:"My Complaints", icon:"📋" },
  ];

  return (
    <Shell user={user} onLogout={onLogout} nav={navItems} activeNav={nav} setActiveNav={v => { setNav(v); setSelected(null); }}>
      {nav === "overview" && (
        <div>
          <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} subtitle="Track your submitted complaints and their resolution status." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            <StatCard label="Total Filed" value={mine.length} accent={T.ink} icon="📋" className="fade-up" />
            <StatCard label="Resolved" value={mine.filter(c=>["Resolved","Closed"].includes(c.status)).length} accent="#2d7a47" icon="✅" className="fade-up-1" />
            <StatCard label="Pending" value={mine.filter(c=>!["Resolved","Closed"].includes(c.status)).length} accent={T.amber} icon="⏳" className="fade-up-2" />
            <StatCard label="Delayed" value={mine.filter(c=>c.status==="Delayed").length} accent={T.coral} icon="🚨" className="fade-up-3" />
          </div>
          <Card style={{ padding:0, overflow:"hidden" }} className="fade-up-4">
            <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.borderLight}`, fontWeight:700, fontSize:14, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Recent Complaints</div>
            {mine.slice(0,5).map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setNav("complaints"); }}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${T.borderLight}`, cursor:"pointer", transition:"background 0.15s" }}
                className="row-hover">
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:T.ink }}>{c.title}</div>
                  <div style={{ fontSize:12, color:T.slateLight, marginTop:3 }} className="mono">{c.id} · {c.department} · {fmt(c.createdAt)}</div>
                </div>
                <Badge status={c.status} />
              </div>
            ))}
            {mine.length === 0 && (
              <div style={{ padding:"40px 20px", textAlign:"center", color:T.slateLight }}>No complaints yet. <button onClick={() => setNav("submit")} style={{ color:T.teal, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit', sans-serif" }}>File one →</button></div>
            )}
          </Card>
        </div>
      )}

      {nav === "submit" && <SubmitComplaint user={user} onSubmit={c => { onSubmit(c); setNav("complaints"); }} />}

      {nav === "complaints" && (
        <div>
          <PageHeader title="My Complaints" subtitle={`${mine.length} complaints filed`} />
          {selected ? (
            <div className="fade-up">
              <Btn variant="outline" size="sm" onClick={() => setSelected(null)} style={{ marginBottom:20 }}>← Back to list</Btn>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
                <Card style={{ padding:26 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:11, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em" }} className="mono">{selected.id}</div>
                      <h3 style={{ fontSize:20, fontFamily:"'DM Serif Display', serif", color:T.ink, margin:"6px 0" }}>{selected.title}</h3>
                    </div>
                    <Badge status={selected.status} size="md" />
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                    {[["Category",selected.category],["Department",selected.department],["Location",selected.location],["Filed on",fmt(selected.createdAt)]].map(([k,v]) => (
                      <div key={k} style={{ padding:"12px 14px", background:T.surface, borderRadius:8 }}>
                        <div style={{ fontSize:10, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>{k}</div>
                        <div style={{ fontSize:14, color:T.ink, marginTop:4 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:16, background:T.surface, borderRadius:8, marginBottom: selected.remarks ? 14 : 0 }}>
                    <div style={{ fontSize:10, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Description</div>
                    <p style={{ margin:0, fontSize:14, color:T.slate, lineHeight:1.7 }}>{selected.description}</p>
                  </div>
                  {selected.remarks && (
                    <div style={{ padding:16, background:T.tealLight, borderRadius:8, border:`1px solid ${T.teal}33` }}>
                      <div style={{ fontSize:10, color:T.teal, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Authority Remarks</div>
                      <p style={{ margin:0, fontSize:14, color:T.slate, lineHeight:1.7 }}>{selected.remarks}</p>
                    </div>
                  )}
                </Card>
                <Card style={{ padding:22 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:20, fontFamily:"'DM Serif Display', serif" }}>Status Timeline</div>
                  <Timeline complaintId={selected.id} />
                  <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${T.borderLight}` }}>
                    <div style={{ fontSize:12, color:T.slateLight, marginBottom:10 }}>SLA Due Date</div>
                    <div style={{ fontSize:14, fontWeight:600, color:T.ink }}>{fmt(selected.slaDueAt)}</div>
                    {selected.escalationLevel > 0 && (
                      <div style={{ marginTop:12 }}>
                        <div style={{ fontSize:12, color:T.slateLight, marginBottom:6 }}>Escalation</div>
                        <EscBadge level={selected.escalationLevel} />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card style={{ padding:0, overflow:"hidden" }} className="fade-up">
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:T.surface }}>
                    {["ID","Title","Category","Department","Filed","Status"].map(h => (
                      <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontWeight:600, color:T.slateLight, borderBottom:`1px solid ${T.border}`, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mine.map(c => (
                    <tr key={c.id} onClick={() => setSelected(c)} className="row-hover" style={{ borderBottom:`1px solid ${T.borderLight}` }}>
                      <td style={{ padding:"13px 16px", fontWeight:700, color:T.gold }} className="mono">{c.id}</td>
                      <td style={{ padding:"13px 16px", color:T.ink }}>{c.title}</td>
                      <td style={{ padding:"13px 16px", color:T.slate }}>{c.category}</td>
                      <td style={{ padding:"13px 16px", color:T.slate }}>{c.department}</td>
                      <td style={{ padding:"13px 16px", color:T.slateLight }} className="mono">{fmt(c.createdAt)}</td>
                      <td style={{ padding:"13px 16px" }}><Badge status={c.status} /></td>
                    </tr>
                  ))}
                  {mine.length === 0 && (
                    <tr><td colSpan={6} style={{ padding:"40px 20px", textAlign:"center", color:T.slateLight }}>No complaints yet.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </Shell>
  );
}

// ─── Authority Dashboard ───────────────────────────────────────────────────────
function AuthorityDashboard({ user, complaints, onUpdateStatus, onLogout }) {
  const [nav, setNav] = useState("queue");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRemark, setNewRemark] = useState("");
  const [toast, setToast] = useState(null);

  const navItems = [
    { key:"queue", label:"Queue", icon:"📋" },
    { key:"metrics", label:"Metrics", icon:"📊" },
    { key:"escalations", label:"Escalations", icon:"⚡" },
  ];

  const mine = complaints.filter(c => c.department === user.department);
  const filtered = filter === "all" ? mine : mine.filter(c => c.status === filter);

  function handleUpdate() {
    if (!newStatus) return;
    onUpdateStatus(selected.id, newStatus, newRemark);
    setSelected(prev => ({ ...prev, status:newStatus, remarks:newRemark || prev.remarks }));
    setToast({ msg:`Status updated to "${newStatus}"`, type:"success" });
    setNewStatus(""); setNewRemark("");
  }

  const myEscLogs = ESCALATION_LOGS.filter(e => complaints.find(c => c.id === e.complaintId && c.department === user.department));

  return (
    <Shell user={user} onLogout={onLogout} nav={navItems} activeNav={nav} setActiveNav={v => { setNav(v); setSelected(null); }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {nav === "queue" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }} className="fade-up">
            <div>
              <h1 style={{ fontSize:26, fontFamily:"'DM Serif Display', serif", color:T.ink, margin:0 }}>{user.department}</h1>
              <p style={{ color:T.slateLight, marginTop:4, fontSize:14 }}>{mine.length} complaints · {mine.filter(c=>c.escalationLevel>0).length} escalated</p>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["all","Submitted","Assigned","In Progress","Delayed"].map(s => (
                <Btn key={s} variant={filter===s?"primary":"surface"} size="sm" onClick={() => setFilter(s)}>
                  {s === "all" ? "All" : s}
                </Btn>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="fade-up">
              <Btn variant="outline" size="sm" onClick={() => setSelected(null)} style={{ marginBottom:20 }}>← Back to queue</Btn>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
                <Card style={{ padding:28 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                    <div>
                      <div style={{ fontSize:11, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em" }} className="mono">{selected.id}</div>
                      <h3 style={{ fontSize:20, fontFamily:"'DM Serif Display', serif", color:T.ink, margin:"6px 0" }}>{selected.title}</h3>
                      <div style={{ fontSize:13, color:T.slateLight }}>Filed {fmt(selected.createdAt)} · {daysAgo(selected.createdAt)} days ago</div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                      <Badge status={selected.status} size="md" />
                      <PriorityBadge priority={selected.priority} />
                      {selected.escalationLevel > 0 && <EscBadge level={selected.escalationLevel} />}
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                    {[
                      ["Category",selected.category],
                      ["Location",selected.location],
                      ["Upvotes",`▲ ${selected.upvotes}`],
                      ["SLA Due",fmt(selected.slaDueAt)],
                      ["Weight",calcWeight(selected)],
                      ["Last Updated",fmt(selected.updatedAt)],
                    ].map(([k,v]) => (
                      <div key={k} style={{ padding:"12px 14px", background:T.surface, borderRadius:8 }}>
                        <div style={{ fontSize:10, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>{k}</div>
                        <div style={{ fontSize:14, color:T.ink, marginTop:4, fontWeight:500 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:16, background:T.surface, borderRadius:8, marginBottom:20 }}>
                    <div style={{ fontSize:10, color:T.slateLight, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Description</div>
                    <p style={{ margin:0, fontSize:14, color:T.slate, lineHeight:1.7 }}>{selected.description}</p>
                  </div>

                  {/* Update section */}
                  <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:22 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:16, fontFamily:"'DM Serif Display', serif" }}>Update Status</div>
                    <Field label="New Status" type="select" value={newStatus} onChange={setNewStatus}
                      options={["Assigned","In Progress","Resolved","Closed","Reopened"]}
                      placeholder="Select new status" />
                    <Field label="Resolution Notes" type="textarea" value={newRemark} onChange={setNewRemark}
                      placeholder="Add notes, action taken, or remarks..." />
                    <div style={{ display:"flex", gap:10 }}>
                      <Btn variant="teal" onClick={handleUpdate} disabled={!newStatus}>Update Complaint</Btn>
                      <Btn variant="outline" onClick={() => { setNewStatus(""); setNewRemark(""); }}>Clear</Btn>
                    </div>
                  </div>
                </Card>

                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Card style={{ padding:22 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:18, fontFamily:"'DM Serif Display', serif" }}>Status History</div>
                    <Timeline complaintId={selected.id} />
                  </Card>

                  {myEscLogs.filter(e => e.complaintId === selected.id).length > 0 && (
                    <Card style={{ padding:22 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:14, fontFamily:"'DM Serif Display', serif" }}>Escalation History</div>
                      {myEscLogs.filter(e => e.complaintId === selected.id).map(e => (
                        <div key={e.id} style={{ padding:"10px 14px", background:T.coralLight, borderRadius:8, marginBottom:8, border:`1px solid ${T.coral}33` }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                            <span className="mono" style={{ fontSize:11, color:T.coral, fontWeight:700 }}>{e.id}</span>
                            <span style={{ fontSize:10, color:T.slateLight }} className="mono">{fmtDT(e.triggeredAt)}</span>
                          </div>
                          <div style={{ fontSize:12, color:T.slate }}>L{e.previousLevel} → L{e.newLevel}: {e.actionTaken}</div>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card style={{ padding:0, overflow:"hidden" }} className="fade-up-1">
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:T.surface }}>
                    {["ID","Title","Category","SLA Due","Days","Esc","Priority","Status","Action"].map(h => (
                      <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, color:T.slateLight, borderBottom:`1px solid ${T.border}`, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const days = daysAgo(c.createdAt);
                    const slaOverdue = new Date(c.slaDueAt) < new Date() && !["Resolved","Closed"].includes(c.status);
                    return (
                      <tr key={c.id} style={{ borderBottom:`1px solid ${T.borderLight}`, background: slaOverdue ? `${T.coral}08` : "transparent" }} className="row-hover">
                        <td style={{ padding:"12px 14px", fontWeight:700, color:T.gold }} className="mono">{c.id}</td>
                        <td style={{ padding:"12px 14px", color:T.ink, maxWidth:180 }}>
                          <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                        </td>
                        <td style={{ padding:"12px 14px", color:T.slate, whiteSpace:"nowrap" }}>{c.category}</td>
                        <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                          <span style={{ color: slaOverdue ? T.coral : T.slate, fontWeight: slaOverdue ? 700 : 400 }} className="mono">{fmt(c.slaDueAt)}</span>
                          {slaOverdue && <span style={{ marginLeft:4, fontSize:10, color:T.coral }}>OVERDUE</span>}
                        </td>
                        <td style={{ padding:"12px 14px" }}>
                          <span style={{ fontWeight:700, color: days > 7 ? T.coral : T.slate }} className="mono">{days}d</span>
                        </td>
                        <td style={{ padding:"12px 14px" }}>{c.escalationLevel > 0 ? <EscBadge level={c.escalationLevel} /> : <span style={{ color:T.slateLight, fontSize:12 }}>—</span>}</td>
                        <td style={{ padding:"12px 14px" }}><PriorityBadge priority={c.priority} /></td>
                        <td style={{ padding:"12px 14px" }}><Badge status={c.status} /></td>
                        <td style={{ padding:"12px 14px" }}>
                          <Btn size="xs" variant="outline" onClick={() => { setSelected(c); setNewStatus(""); setNewRemark(""); }}>Review</Btn>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} style={{ padding:"40px 20px", textAlign:"center", color:T.slateLight }}>No complaints in this category.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {nav === "metrics" && (
        <div>
          <PageHeader title="Department Metrics" subtitle={`${user.department} performance overview`} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            <StatCard label="Total Assigned" value={mine.length} accent={T.ink} icon="📋" className="fade-up" />
            <StatCard label="Resolved" value={mine.filter(c=>["Resolved","Closed"].includes(c.status)).length} accent="#2d7a47" icon="✅" className="fade-up-1" />
            <StatCard label="Pending" value={mine.filter(c=>["Submitted","Assigned","In Progress"].includes(c.status)).length} accent={T.amber} icon="⏳" className="fade-up-2" />
            <StatCard label="SLA Breached" value={mine.filter(c=>c.status==="Delayed"||c.escalationLevel>0).length} accent={T.coral} icon="🚨" className="fade-up-3" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <Card style={{ padding:24 }} className="fade-up">
              <div style={{ fontSize:14, fontWeight:700, marginBottom:20, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Status Distribution</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={Object.entries(mine.reduce((a,c)=>{a[c.status]=(a[c.status]||0)+1;return a;},{})).map(([name,value])=>({name,value}))} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:10, fill:T.slateLight }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:T.slateLight }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background:T.ink, border:"none", borderRadius:8, color:T.white, fontSize:12 }} />
                  <Bar dataKey="value" fill={T.gold} radius={[5,5,0,0]}>
                    {Object.entries(mine.reduce((a,c)=>{a[c.status]=(a[c.status]||0)+1;return a;},{})).map(([name],i)=>((
                      <Cell key={i} fill={(STATUS[name]||{color:T.gold}).color} />
                    )))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card style={{ padding:24 }} className="fade-up-1">
              <div style={{ fontSize:14, fontWeight:700, marginBottom:20, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Priority Breakdown</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={["HIGH","MEDIUM","LOW"].map(p=>({ name:p, value:mine.filter(c=>c.priority===p).length }))} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {["HIGH","MEDIUM","LOW"].map((p,i) => <Cell key={i} fill={PRIORITY[p].color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:T.ink, border:"none", borderRadius:8, color:T.white, fontSize:12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {nav === "escalations" && (
        <div>
          <PageHeader title="Escalation Center" subtitle="SLA breaches and escalation logs for your department" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
            {[1,2,3].map(lv => (
              <Card key={lv} style={{ padding:20, borderTop:`3px solid ${["","#c97a1a","#c94a2a","#8b1a1a"][lv]}` }} className="fade-up">
                <div style={{ fontSize:11, color:T.slateLight, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Level {lv} Escalations</div>
                <div style={{ fontSize:32, fontWeight:700, color:["","#c97a1a","#c94a2a","#8b1a1a"][lv], fontFamily:"'DM Serif Display', serif" }}>
                  {mine.filter(c=>c.escalationLevel===lv).length}
                </div>
                <div style={{ fontSize:12, color:T.slateLight, marginTop:4 }}>complaints at this level</div>
              </Card>
            ))}
          </div>

          <Card style={{ padding:0, overflow:"hidden", marginBottom:20 }} className="fade-up-1">
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.borderLight}`, fontWeight:700, fontSize:14, color:T.ink, fontFamily:"'DM Serif Display', serif" }}>Escalation Logs</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:T.surface }}>
                  {["Log ID","Complaint","Level Change","Triggered","Reason","Action"].map(h => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontWeight:600, color:T.slateLight, borderBottom:`1px solid ${T.border}`, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myEscLogs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:"30px 16px", textAlign:"center", color:T.slateLight }}>No escalations for your department.</td></tr>
                )}
                {myEscLogs.map(e => (
                  <tr key={e.id} style={{ borderBottom:`1px solid ${T.borderLight}` }} className="row-hover">
                    <td style={{ padding:"11px 16px", fontWeight:700, color:T.gold }} className="mono">{e.id}</td>
                    <td style={{ padding:"11px 16px", color:T.teal, fontWeight:600 }} className="mono">{e.complaintId}</td>
                    <td style={{ padding:"11px 16px" }}>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <EscBadge level={e.previousLevel} />
                        <span style={{ color:T.slateLight }}>→</span>
                        <EscBadge level={e.newLevel} />
                      </div>
                    </td>
                    <td style={{ padding:"11px 16px", color:T.slateLight, whiteSpace:"nowrap" }} className="mono">{fmtDT(e.triggeredAt)}</td>
                    <td style={{ padding:"11px 16px", color:T.coral }}>{e.reason}</td>
                    <td style={{ padding:"11px 16px", color:T.slate }}>{e.actionTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div style={{ fontSize:14, fontWeight:700, color:T.ink, marginBottom:14, fontFamily:"'DM Serif Display', serif" }} className="fade-up-2">Active Escalated Complaints</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:12 }} className="fade-up-2">
            {mine.filter(c=>c.escalationLevel>0).map(c => (
              <Card key={c.id} style={{ padding:16, borderLeft:`3px solid ${["","#c97a1a","#c94a2a","#8b1a1a"][c.escalationLevel]}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span className="mono" style={{ fontSize:11, color:T.slateLight }}>{c.id}</span>
                  <EscBadge level={c.escalationLevel} />
                </div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:6, color:T.ink }}>{c.title}</div>
                <div style={{ fontSize:11, color:T.slateLight, marginBottom:8 }}>SLA: {fmt(c.slaDueAt)}</div>
                <div style={{ display:"flex", gap:6 }}>
                  <Badge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Shell>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState(SEED_COMPLAINTS);

  function addComplaint(c) {
    setComplaints(prev => [c, ...prev]);
  }

  function updateStatus(id, status, remarks) {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status, remarks: remarks || c.remarks, updatedAt: new Date().toISOString() } : c
    ));
  }

  return (
    <>
      <style>{globalStyles}</style>
      {!user && <LoginPage onLogin={setUser} />}
      {user?.role === "public" && <PublicDashboard complaints={complaints} onLoginRedirect={() => setUser(null)} />}
      {user?.role === "citizen" && <CitizenDashboard user={user} complaints={complaints} onSubmit={addComplaint} onLogout={() => setUser(null)} />}
      {user?.role === "authority" && <AuthorityDashboard user={user} complaints={complaints} onUpdateStatus={updateStatus} onLogout={() => setUser(null)} />}
    </>
  );
}