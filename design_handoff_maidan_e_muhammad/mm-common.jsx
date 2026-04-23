// mm-common.jsx — Design tokens, logo, phone frame, bottom nav

const MM = {
  green50:'#f0fdf4', green100:'#dcfce7', green500:'#22c55e',
  green600:'#16a34a', green700:'#15803d', green800:'#166534', green900:'#14532d',
  danger:'#ef4444', warning:'#f97316', info:'#3b82f6',
  gray50:'#f9fafb', gray100:'#f3f4f6', gray300:'#d1d5db',
  gray400:'#9ca3af', gray500:'#6b7280', gray700:'#374151', gray900:'#111827',
  white:'#ffffff',
};

const BN_D = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function bnNum(n) { return String(n).replace(/[0-9]/g, d => BN_D[+d]); }
function taka(n) {
  const abs = Math.abs(Number(n));
  const s = abs.toLocaleString('en-IN');
  return '৳' + bnNum(s);
}

function LogoMark({ size = 64, bg = MM.green600 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect width="80" height="80" rx="18" fill={bg}/>
      {/* Base platform */}
      <rect x="12" y="55" width="56" height="6" rx="2" fill="white"/>
      {/* Left minaret */}
      <rect x="11" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M11 38 Q16 31 21 38Z" fill="white"/>
      {/* Right minaret */}
      <rect x="59" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M59 38 Q64 31 69 38Z" fill="white"/>
      {/* Main dome */}
      <path d="M21 55 Q21 29 40 29 Q59 29 59 55Z" fill="white"/>
      {/* Crescent on dome peak */}
      <circle cx="40" cy="23" r="10" fill="white"/>
      <circle cx="44.5" cy="19.5" r="9" fill={bg}/>
      {/* Star */}
      <circle cx="50" cy="17" r="2.2" fill="white"/>
    </svg>
  );
}

function MMStatusBar({ dark = false }) {
  const c = dark ? 'rgba(255,255,255,0.92)' : MM.gray900;
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
      <span style={{ fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15, color: c }}>৯:৪১</span>
      <div style={{ width: 122, height: 34, background: '#000', borderRadius: 20 }} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <rect x="0" y="7" width="3" height="5" rx="0.7" fill={c}/>
          <rect x="4.7" y="4.5" width="3" height="7.5" rx="0.7" fill={c}/>
          <rect x="9.4" y="2" width="3" height="10" rx="0.7" fill={c}/>
          <rect x="14.1" y="0" width="3" height="12" rx="0.7" fill={c}/>
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={c} strokeOpacity="0.4"/>
          <rect x="2" y="2" width="18" height="9" rx="2" fill={c}/>
          <path d="M24 5V8C24.9 7.6 25.5 6.9 25.5 6.5C25.5 6.1 24.9 5.4 24 5Z" fill={c} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function MMHomeBar({ dark = false }) {
  return (
    <div style={{ height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8, flexShrink: 0 }}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)' }} />
    </div>
  );
}

// fullBleed: status bar & home bar float on top of content (for splash/login)
function PhoneFrame({ children, dark = false, bg = MM.gray50, fullBleed = false }) {
  if (fullBleed) {
    return (
      <div style={{ width: 390, height: 844, background: bg, overflow: 'hidden', position: 'relative', fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}><MMStatusBar dark={dark} /></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }}><MMHomeBar dark={dark} /></div>
        {children}
      </div>
    );
  }
  return (
    <div style={{ width: 390, height: 844, background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>
      <MMStatusBar dark={dark} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
      <MMHomeBar dark={dark} />
    </div>
  );
}

function BottomNav({ active = 'donations' }) {
  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', I: MMDash },
    { id: 'donations', label: 'চাঁদা সংগ্রহ', I: MMCoins },
    { id: 'donors', label: 'দাতা', I: MMUsers },
    { id: 'reports', label: 'রিপোর্ট', I: MMChart },
  ];
  return (
    <div style={{ height: 64, background: '#fff', borderTop: `1px solid ${MM.gray100}`, display: 'flex', flexShrink: 0 }}>
      {tabs.map(({ id, label, I }) => {
        const on = id === active;
        const color = on ? MM.green600 : MM.gray400;
        return (
          <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer', paddingBottom: 2 }}>
            <I color={color} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 400, color, lineHeight: 1.2 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Icon components
function MMDash({ color }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function MMCoins({ color }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>; }
function MMUsers({ color }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function MMChart({ color }) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }

Object.assign(window, { MM, bnNum, taka, LogoMark, PhoneFrame, BottomNav, MMStatusBar, MMHomeBar, MMDash, MMCoins, MMUsers, MMChart });
