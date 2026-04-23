// mm-screens-a.jsx — Screens 1–4: Splash, Login, Dashboard, Donations

// ── Screen 1: Splash ──────────────────────────────────────────
function SplashScreen() {
  const { PhoneFrame, LogoMark } = window;
  return (
    <PhoneFrame fullBleed dark bg="linear-gradient(155deg, #166534 0%, #15803d 55%, #166534 100%)">
      {/* Subtle geometric pattern */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 390 844" fill="none">
        {[...Array(6)].map((_,i) => (
          <g key={i}>
            <polygon points={`${65*i+40},0 ${65*i+120},80 ${65*i-40},80`} fill="none" stroke="white" strokeWidth="1"/>
            <polygon points={`${65*i+40},844 ${65*i+120},764 ${65*i-40},764`} fill="none" stroke="white" strokeWidth="1"/>
          </g>
        ))}
        <circle cx="195" cy="422" r="200" fill="none" stroke="white" strokeWidth="1"/>
        <circle cx="195" cy="422" r="140" fill="none" stroke="white" strokeWidth="0.6"/>
      </svg>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '44px 40px 34px' }}>
        <LogoMark size={100} bg="rgba(255,255,255,0.15)" />
        <div style={{ textAlign: 'center', color: 'white', marginTop: 8 }}>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.3px' }}>ময়দানে মুহাম্মাদ</div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6, letterSpacing: '0.5px', fontWeight: 400 }}>Maidan-e-Muhammad</div>
          <div style={{ fontSize: 13, opacity: 0.6, marginTop: 16, lineHeight: 1.6, fontWeight: 400 }}>মাসিক মাহফিল ও চাঁদা ব্যবস্থাপনা সিস্টেম</div>
        </div>
        {/* Loading dots */}
        <div style={{ position: 'absolute', bottom: 80, display: 'flex', gap: 10 }}>
          {[1, 0.45, 0.2].map((op, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: `rgba(255,255,255,${op})` }} />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 2: Login ───────────────────────────────────────────
function LoginScreen() {
  const { PhoneFrame, LogoMark, MM } = window;
  return (
    <PhoneFrame fullBleed dark bg="linear-gradient(160deg, #166534 0%, #15803d 100%)">
      {/* Header hero */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 36, gap: 12 }}>
        <LogoMark size={72} bg="rgba(255,255,255,0.18)" />
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>ময়দানে মুহাম্মাদ</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>Maidan-e-Muhammad</div>
        </div>
      </div>

      {/* White card */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'white', borderRadius: '24px 24px 0 0',
        padding: '28px 24px 34px', display: 'flex', flexDirection: 'column', gap: 0,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: MM.gray900, marginBottom: 24 }}>লগইন করুন</div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>ইমেইল</div>
          <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: MM.gray50 }}>
            <span style={{ fontSize: 15, color: MM.gray500 }}>admin@example.com</span>
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>পাসওয়ার্ড</div>
          <div style={{ height: 52, border: `1.5px solid ${MM.green600}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', boxShadow: `0 0 0 3px rgba(22,163,74,0.1)` }}>
            <span style={{ fontSize: 15, color: MM.gray900, letterSpacing: 4 }}>••••••••</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>

        {/* Button */}
        <div style={{ height: 52, background: MM.green600, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>লগইন করুন</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 14, color: MM.gray500 }}>← হোমে ফিরে যান</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 3: Dashboard ───────────────────────────────────────
function DashboardScreen() {
  const { PhoneFrame, LogoMark, BottomNav, MM, taka, bnNum } = window;
  const stats = [
    { label: 'মোট দাতা', value: bnNum(247), color: MM.green600, iconBg: MM.green100, Icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.green600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'এ মাসের সংগ্রহ', value: taka(18500), color: MM.info, iconBg: '#dbeafe', Icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.info} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { label: 'মোট বকেয়া', value: taka(1014587), color: MM.danger, iconBg: '#fee2e2', Icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.danger} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'কালেক্টর', value: bnNum(4), color: MM.warning, iconBg: '#ffedd5', Icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.warning} strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  ];
  return (
    <PhoneFrame dark={false} bg={MM.gray50}>
      {/* Green header */}
      <div style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', padding: '12px 20px 56px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <LogoMark size={34} bg="rgba(255,255,255,0.2)" />
          <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
        <div style={{ color: 'white' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>মো. মোজাম্মেল হক</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>আজ, ২৩ এপ্রিল ২০২৬</div>
        </div>
      </div>

      {/* Stat cards overlapping header */}
      <div style={{ padding: '0 16px', marginTop: -44, flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '14px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <s.Icon />
              </div>
              <div style={{ fontSize: 11, color: MM.gray500, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: MM.gray900, lineHeight: 1.2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Welcome card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '18px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: MM.green100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>🕌</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: MM.green800 }}>স্বাগতম</div>
          </div>
          <div style={{ fontSize: 14, color: MM.gray500, lineHeight: 1.7 }}>
            মাসিক চাঁদা সংগ্রহ ও দাতা ব্যবস্থাপনা সিস্টেমে আপনাকে স্বাগতম। নিচের নেভিগেশন থেকে কাজ শুরু করুন।
          </div>
        </div>
      </div>

      <BottomNav active="dashboard" />
    </PhoneFrame>
  );
}

// ── Screen 4: Donations ───────────────────────────────────────
const DONORS = [
  { serial: 1, name: 'মো. মোবারক হোসাইন', addr: 'ঢাকিরকান্দা', monthly: 200, balance: 200, paid: false },
  { serial: 2, name: 'মতিউর রহমান', addr: 'ময়দানে মুহাম্মাদ', monthly: 200, balance: 0, paid: true },
  { serial: 3, name: 'মোশারফ হোসাইন', addr: 'মুক্তাগাছা', monthly: 100, balance: 400, paid: false },
  { serial: 4, name: 'ক্বারী আ: সামাদ', addr: 'ঢাকিরকান্দা', monthly: 100, balance: 1600, paid: false },
  { serial: 5, name: 'আইয়ুব আলী', addr: 'জয়বাংলা', monthly: 100, balance: 1600, paid: false },
  { serial: 6, name: 'নূর হোসেন মাস্টার', addr: 'বিবিধ', monthly: 100, balance: 0, paid: true },
  { serial: 7, name: 'ডা. মসউদ', addr: 'মুক্তাগাছা', monthly: 100, balance: 400, paid: false },
];

function DonationsScreen() {
  const { PhoneFrame, BottomNav, MM, taka, bnNum } = window;
  return (
    <PhoneFrame bg={MM.white}>
      {/* Sticky header */}
      <div style={{ background: 'white', borderBottom: `1px solid ${MM.gray100}`, padding: '14px 16px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900, marginBottom: 10 }}>চাঁদা সংগ্রহ</div>
        {/* Search */}
        <div style={{ height: 48, background: MM.gray100, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, marginBottom: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span style={{ fontSize: 15, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর লিখুন</span>
        </div>
        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ height: 34, borderRadius: 999, border: `1px solid ${MM.gray300}`, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, background: 'white' }}>
            <span style={{ fontSize: 13, color: MM.gray700 }}>সব এলাকা</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MM.gray500} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MM.danger} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: MM.danger }}>৳১০,১৪,৫৮৭ বকেয়া</span>
          </div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ background: MM.green50, padding: '8px 16px', display: 'flex', flexShrink: 0, borderBottom: `1px solid ${MM.green100}` }}>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: MM.green800 }}>সিরিয়াল · নাম</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MM.green800, width: 52, textAlign: 'right' }}>মাসিক</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: MM.green800, width: 64, textAlign: 'right' }}>বকেয়া</span>
        </div>
      </div>

      {/* Donor list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {DONORS.map((d, i) => (
          <div key={d.serial} style={{
            padding: '12px 16px', borderBottom: `1px solid ${MM.gray100}`,
            background: i % 2 === 0 ? 'white' : MM.gray50,
            display: 'flex', alignItems: 'center', minHeight: 68,
          }}>
            {/* Serial badge + name */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>
                {bnNum(d.serial)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: MM.gray400, marginTop: 2 }}>{d.addr}</div>
              </div>
            </div>
            {/* Monthly + balance */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 110 }}>
              <span style={{ fontSize: 12, color: MM.gray500 }}>{taka(d.monthly)}</span>
              {d.paid ? (
                <span style={{ fontSize: 13, fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span>
              ) : (
                <span style={{ fontSize: 14, fontWeight: 700, color: MM.danger }}>{taka(d.balance)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="donations" />
    </PhoneFrame>
  );
}

Object.assign(window, { SplashScreen, LoginScreen, DashboardScreen, DonationsScreen, DONORS });
