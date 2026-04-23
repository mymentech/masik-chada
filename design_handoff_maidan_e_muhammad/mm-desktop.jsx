// mm-desktop.jsx — Desktop screens for ময়দানে মুহাম্মাদ

// ── Shared Desktop Top Nav ────────────────────────────────────
function DesktopTopNav({ active = 'dashboard' }) {
  const { LogoMark, MM } = window;
  const links = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড' },
    { id: 'donations', label: 'চাঁদা সংগ্রহ' },
    { id: 'donors',   label: 'দাতা ম্যানেজমেন্ট' },
    { id: 'reports',  label: 'রিপোর্ট' },
  ];
  return (
    <div style={{
      height: 64, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(6px)',
      borderBottom: `1px solid ${MM.gray100}`, display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 24, flexShrink: 0, position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LogoMark size={36} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: MM.green800, lineHeight: 1.1, fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>ময়দানে মুহাম্মাদ</div>
          <div style={{ fontSize: 10, color: MM.green600, letterSpacing: '0.3px', fontFamily: 'system-ui' }}>Maidan-e-Muhammad</div>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 4, marginLeft: 24 }}>
        {links.map(({ id, label }) => {
          const isActive = id === active;
          return (
            <div key={id} style={{
              height: 36, padding: '0 16px', borderRadius: 999, display: 'flex', alignItems: 'center',
              background: isActive ? MM.green50 : 'transparent',
              color: isActive ? MM.green800 : MM.gray500,
              fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
              transition: 'background 0.15s',
            }}>{label}</div>
          );
        })}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: MM.green100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.green700} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray900 }}>মো. মোজাম্মেল হক</div>
            <div style={{ fontSize: 11, color: MM.gray400 }}>অ্যাডমিন</div>
          </div>
        </div>
        <div style={{ height: 36, padding: '0 14px', background: '#eef2ff', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>লগআউট</span>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Shell ─────────────────────────────────────────────
function DesktopShell({ active, children }) {
  const { MM } = window;
  return (
    <div style={{ width: 1440, height: 900, background: MM.gray50, overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>
      <DesktopTopNav active={active} />
      <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Desktop Screen 1: Dashboard ───────────────────────────────
function DesktopDashboard() {
  const { MM, taka, bnNum } = window;
  const stats = [
    { label: 'মোট দাতা', value: bnNum(247), iconBg: MM.green100, color: MM.green600, Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MM.green600} strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'এ মাসের সংগ্রহ', value: taka(18500), iconBg: '#dbeafe', color: '#3b82f6', Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: 'মোট বকেয়া', value: taka(1014587), iconBg: '#fee2e2', color: MM.danger, Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MM.danger} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'মোট কালেক্টর', value: bnNum(4), iconBg: '#ffedd5', color: MM.warning, Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MM.warning} strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  ];
  return (
    <DesktopShell active="dashboard">
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: MM.gray900, marginBottom: 4 }}>ড্যাশবোর্ড</h1>
        <p style={{ fontSize: 14, color: MM.gray400 }}>আজ, ২৩ এপ্রিল ২০২৬ · মাসিক মাহফিল ও চাঁদা ব্যবস্থাপনা</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '20px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon />
              </div>
            </div>
            <div style={{ fontSize: 12, color: MM.gray400, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: MM.gray900 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Two-column: welcome + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Welcome */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${MM.gray100}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg, #166534, #15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900 }}>স্বাগতম, মোজাম্মেল হক</div>
              <div style={{ fontSize: 13, color: MM.gray400, marginTop: 2 }}>অ্যাডমিন · ময়দানে মুহাম্মাদ</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: MM.gray500, lineHeight: 1.8 }}>
            মাসিক চাঁদা সংগ্রহ ও দাতা ব্যবস্থাপনা সিস্টেমে আপনাকে স্বাগতম। বাম নেভিগেশন থেকে যেকোনো বিভাগে যান।
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 44, background: MM.green600, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>চাঁদা সংগ্রহ শুরু করুন</span>
            </div>
            <div style={{ height: 44, padding: '0 18px', background: MM.gray50, border: `1px solid ${MM.gray200}`, borderRadius: 10, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: MM.gray600 }}>রিপোর্ট দেখুন</span>
            </div>
          </div>
        </div>

        {/* Quick stats breakdown */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: MM.gray900, marginBottom: 16 }}>এলাকা অনুযায়ী সারসংক্ষেপ</div>
          {[
            { area: 'ঢাকিরকান্দা', donors: 82, collected: 8200, pct: 65 },
            { area: 'মুক্তাগাছা', donors: 54, collected: 5400, pct: 48 },
            { area: 'জয়বাংলা', donors: 41, collected: 4100, pct: 72 },
            { area: 'বিবিধ', donors: 70, collected: 800, pct: 30 },
          ].map(row => (
            <div key={row.area} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: MM.gray700 }}>{row.area} <span style={{ color: MM.gray400, fontWeight: 400 }}>({bnNum(row.donors)} দাতা)</span></span>
                <span style={{ fontSize: 13, fontWeight: 600, color: MM.green700 }}>{taka(row.collected)}</span>
              </div>
              <div style={{ height: 6, background: MM.gray100, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${row.pct}%`, height: '100%', background: `linear-gradient(90deg, ${MM.green500}, ${MM.green600})`, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Desktop Screen 2: Donations ───────────────────────────────
function DesktopDonations() {
  const { MM, taka, bnNum, DONORS } = window;
  const chips = [50, 100, 200, 500];
  const selectedDonor = DONORS[0];
  return (
    <DesktopShell active="donations">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: MM.gray900, marginBottom: 4 }}>চাঁদা সংগ্রহ</h1>
          <p style={{ fontSize: 14, color: MM.gray400 }}>ডোনার সিলেক্ট করে দ্রুত পেমেন্ট যোগ করুন</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', borderRadius: 10, padding: '10px 16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.danger} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: MM.danger }}>মোট বকেয়া: ৳১০,১৪,৫৮৭</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20, alignItems: 'start' }}>
        {/* Left: donor list */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Search + filter */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${MM.gray100}`, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, height: 44, background: MM.gray50, border: `1px solid ${MM.gray200}`, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: 14, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর লিখুন</span>
            </div>
            <div style={{ height: 44, padding: '0 16px', border: `1px solid ${MM.gray200}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'white', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, color: MM.gray600 }}>সব এলাকা</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          {/* Table header */}
          <div style={{ background: MM.green50, padding: '10px 20px', display: 'flex', borderBottom: `1px solid ${MM.green100}` }}>
            <span style={{ flex: '0 0 50px', fontSize: 12, fontWeight: 700, color: MM.green800 }}>ক্র.</span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: MM.green800 }}>নাম ও ঠিকানা</span>
            <span style={{ width: 90, fontSize: 12, fontWeight: 700, color: MM.green800, textAlign: 'right' }}>মাসিক</span>
            <span style={{ width: 100, fontSize: 12, fontWeight: 700, color: MM.green800, textAlign: 'right' }}>বকেয়া</span>
          </div>
          {/* Rows */}
          {DONORS.map((d, i) => (
            <div key={d.serial} style={{
              padding: '12px 20px', borderBottom: `1px solid ${MM.gray100}`,
              background: i === 0 ? MM.green50 : (i % 2 === 0 ? 'white' : MM.gray50),
              display: 'flex', alignItems: 'center', cursor: 'pointer',
              borderLeft: i === 0 ? `3px solid ${MM.green600}` : '3px solid transparent',
            }}>
              <span style={{ flex: '0 0 50px' }}>
                <span style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace' }}>{bnNum(d.serial)}</span>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: MM.gray900 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: MM.gray400, marginTop: 1 }}>{d.addr}</div>
              </div>
              <span style={{ width: 90, fontSize: 13, color: MM.gray500, textAlign: 'right' }}>{taka(d.monthly)}</span>
              <span style={{ width: 100, textAlign: 'right' }}>
                {d.paid
                  ? <span style={{ fontSize: 13, fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span>
                  : <span style={{ fontSize: 14, fontWeight: 700, color: MM.danger }}>{taka(d.balance)}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Right: payment panel */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #166534, #15803d)', padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>নির্বাচিত দাতা</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{selectedDonor.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{selectedDonor.addr} · সিরিয়াল: {bnNum(selectedDonor.serial)}</span>
              <span style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>বকেয়া {taka(selectedDonor.balance)}</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Amount */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 8 }}>চাঁদার পরিমাণ</div>
              <div style={{ height: 56, border: `2px solid ${MM.green600}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 0 0 3px rgba(22,163,74,0.1)` }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: MM.gray900 }}>২০০</span>
                <span style={{ fontSize: 16, color: MM.gray400 }}>৳</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {chips.map(amt => (
                  <div key={amt} style={{ flex: 1, height: 36, borderRadius: 999, background: amt === 200 ? MM.green600 : 'white', border: `1.5px solid ${amt === 200 ? MM.green600 : MM.gray300}`, color: amt === 200 ? 'white' : MM.gray700, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>৳{bnNum(amt)}</div>
                ))}
              </div>
            </div>
            {/* Date */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 8 }}>তারিখ</div>
              <div style={{ height: 48, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MM.gray50 }}>
                <span style={{ fontSize: 14, color: MM.gray700 }}>২৩/০৪/২০২৬</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            {/* Submit */}
            <div style={{ height: 52, background: MM.green600, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.25)', marginTop: 4 }}>
              <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>চাঁদা গ্রহণ করুন</span>
            </div>
            <div style={{ height: 48, border: `1.5px solid ${MM.gray200}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: MM.gray500 }}>বাতিল করুন</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Desktop Screen 3: Donor Management ───────────────────────
function DesktopDonors() {
  const { MM, taka, bnNum, DONORS } = window;
  return (
    <DesktopShell active="donors">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Left: donor table */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${MM.gray100}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: MM.gray900 }}>দাতা ম্যানেজমেন্ট</h2>
                <p style={{ fontSize: 13, color: MM.gray400, marginTop: 2 }}>{bnNum(247)} জন নিবন্ধিত দাতা</p>
              </div>
              <div style={{ height: 42, background: MM.green600, borderRadius: 10, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>নতুন দাতা যোগ</span>
              </div>
            </div>
            <div style={{ height: 44, background: MM.gray50, border: `1px solid ${MM.gray200}`, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: 14, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর</span>
            </div>
          </div>
          {/* Table header */}
          <div style={{ background: MM.green50, padding: '10px 20px', display: 'flex', borderBottom: `1px solid ${MM.green100}` }}>
            {['ক্র.', 'নাম', 'ঠিকানা', 'মাসিক চাঁদা', 'বকেয়া', 'অ্যাকশন'].map((h, i) => (
              <span key={h} style={{ fontSize: 12, fontWeight: 700, color: MM.green800, flex: [0.4,2,1.2,0.8,0.8,1][i], textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {DONORS.map((d, i) => (
            <div key={d.serial} style={{ padding: '12px 20px', borderBottom: `1px solid ${MM.gray100}`, display: 'flex', alignItems: 'center', background: i % 2 === 0 ? 'white' : MM.gray50 }}>
              <span style={{ flex: 0.4 }}>
                <span style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace' }}>{bnNum(d.serial)}</span>
              </span>
              <span style={{ flex: 2, fontSize: 14, fontWeight: 600, color: MM.gray900 }}>{d.name}</span>
              <span style={{ flex: 1.2, fontSize: 13, color: MM.gray500 }}>{d.addr}</span>
              <span style={{ flex: 0.8, fontSize: 13, color: MM.gray700, textAlign: 'right' }}>{taka(d.monthly)}</span>
              <span style={{ flex: 0.8, textAlign: 'right' }}>
                {d.paid ? <span style={{ fontSize: 13, color: MM.green600, fontWeight: 600 }}>✓ পরিশোধিত</span> : <span style={{ fontSize: 13, color: MM.danger, fontWeight: 700 }}>{taka(d.balance)}</span>}
              </span>
              <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <div style={{ height: 32, padding: '0 12px', borderRadius: 8, background: '#dbeafe', color: '#2563eb', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>এডিট</div>
                <div style={{ height: 32, padding: '0 12px', borderRadius: 8, background: '#fee2e2', color: MM.danger, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>ডিলিট</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: add/edit form */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: MM.gray900, marginBottom: 20 }}>নতুন দাতা যোগ করুন</div>
          {[
            { label: 'নাম *', placeholder: 'পূর্ণ নাম' },
            { label: 'ফোন', placeholder: '+880' },
            { label: 'ঠিকানা *', placeholder: 'এলাকার নাম' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>{f.label}</div>
              <div style={{ height: 44, border: `1.5px solid ${MM.gray300}`, borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', background: MM.gray50 }}>
                <span style={{ fontSize: 14, color: MM.gray400 }}>{f.placeholder}</span>
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>মাসিক চাঁদা *</div>
            <div style={{ height: 44, border: `1.5px solid ${MM.gray300}`, borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', background: MM.gray50, marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: MM.gray700 }}>১০০</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[50,100,200,500].map(a => <div key={a} style={{ flex: 1, height: 32, borderRadius: 999, background: a===100 ? MM.green600 : 'white', border: `1.5px solid ${a===100 ? MM.green600 : MM.gray300}`, color: a===100 ? 'white' : MM.gray700, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>৳{bnNum(a)}</div>)}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>নিবন্ধনের তারিখ *</div>
            <div style={{ height: 44, border: `1.5px solid ${MM.gray300}`, borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MM.gray50 }}>
              <span style={{ fontSize: 14, color: MM.gray700 }}>২৩/০৪/২০২৬</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>বকেয়া গণনার তারিখ সেট করলে আগের বকেয়া মাফ হয়ে যাবে।</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <div style={{ flex: 1, height: 44, border: `1.5px solid ${MM.gray200}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: MM.gray600 }}>বাতিল</span>
            </div>
            <div style={{ flex: 1, height: 44, background: MM.green600, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>যোগ করুন</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ── Desktop Screen 4: Reports ─────────────────────────────────
function DesktopReports() {
  const { MM, taka, bnNum } = window;
  const collectors = [
    { name: 'মো. মোজাম্মেল হক', total: 9200 },
    { name: 'আব্দুর রহমান', total: 6400 },
    { name: 'করিম উদ্দিন', total: 2900 },
  ];
  return (
    <DesktopShell active="reports">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: MM.gray900, marginBottom: 4 }}>মাসিক রিপোর্ট</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ height: 44, border: `1.5px solid ${MM.gray300}`, borderRadius: 10, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'white', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MM.gray500} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span style={{ fontSize: 14, color: MM.gray700 }}>এপ্রিল ২০২৬</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MM.gray500} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
        <div style={{ height: 44, padding: '0 20px', background: MM.green600, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>PDF এক্সপোর্ট</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #166534, #15803d)', borderRadius: 16, padding: '22px 20px' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>এ মাসের মোট সংগ্রহ</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{taka(18500)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>↑ গত মাসের তুলনায় +১২%</div>
        </div>
        <div style={{ background: MM.danger, borderRadius: 16, padding: '22px 20px' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>মাস শেষে মোট বকেয়া</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{taka(81700)}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>↓ গত মাসের তুলনায় -৩%</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '22px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, color: MM.gray400, marginBottom: 8 }}>পরিশোধিত দাতা</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: MM.gray900 }}>{bnNum(43)} / {bnNum(247)}</div>
          <div style={{ height: 8, background: MM.gray100, borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
            <div style={{ width: '17%', height: '100%', background: MM.green600, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Collector table */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${MM.gray100}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: MM.gray900 }}>কালেক্টর অনুযায়ী সংগ্রহ</div>
        </div>
        <div style={{ background: MM.green600, padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>কালেক্টরের নাম</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>সংগৃহীত পরিমাণ</span>
        </div>
        {collectors.map((c, i) => (
          <div key={c.name} style={{ padding: '16px 24px', borderBottom: `1px solid ${MM.gray100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? 'white' : MM.gray50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: MM.green100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.green700} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{c.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: MM.green700 }}>{taka(c.total)}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '14px 24px', background: MM.green50, display: 'flex', justifyContent: 'space-between', borderTop: `2px solid ${MM.green100}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: MM.green800 }}>মোট সংগ্রহ</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: MM.green800 }}>{taka(collectors.reduce((s, c) => s + c.total, 0))}</span>
        </div>
      </div>
    </DesktopShell>
  );
}

Object.assign(window, { DesktopTopNav, DesktopShell, DesktopDashboard, DesktopDonations, DesktopDonors, DesktopReports });
