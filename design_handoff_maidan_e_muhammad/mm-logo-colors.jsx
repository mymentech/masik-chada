// mm-logo-colors.jsx — Logo variants, color tokens, component library

// ── Logo Variants ─────────────────────────────────────────────
function LogoFull() {
  const { LogoMark, MM } = window;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, padding: 40, background: 'white', width: 560, height: 320, alignItems: 'flex-start', justifyContent: 'center' }}>
      {/* Horizontal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <LogoMark size={52} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: MM.green800, lineHeight: 1.2, fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>ময়দানে মুহাম্মাদ</div>
          <div style={{ fontSize: 12, color: MM.green600, marginTop: 3, letterSpacing: '0.5px', fontFamily: 'system-ui' }}>Maidan-e-Muhammad</div>
        </div>
      </div>
      {/* Divider */}
      <div style={{ width: '100%', height: 1, background: MM.gray100 }} />
      {/* Stacked */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <LogoMark size={72} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: MM.green800, fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>ময়দানে মুহাম্মাদ</div>
            <div style={{ fontSize: 11, color: MM.green600, marginTop: 3, letterSpacing: '0.5px', fontFamily: 'system-ui' }}>Maidan-e-Muhammad</div>
          </div>
        </div>
        {/* Icon only — circle */}
        <div>
          <div style={{ width: 72, height: 72, borderRadius: 36, overflow: 'hidden' }}>
            <LogoMark size={72} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: MM.gray400, marginTop: 8 }}>আইকন</div>
        </div>
        {/* Small favicon */}
        <div>
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden' }}>
            <LogoMark size={44} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: MM.gray400, marginTop: 8 }}>ফেভিকন</div>
        </div>
        {/* Dark bg variant */}
        <div>
          <div style={{ background: MM.green800, padding: 16, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark size={40} bg="rgba(255,255,255,0.15)" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>ময়দানে মুহাম্মাদ</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', fontFamily: 'system-ui' }}>Maidan-e-Muhammad</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: MM.gray400, marginTop: 8 }}>ডার্ক</div>
        </div>
      </div>
    </div>
  );
}

// ── Color Tokens ──────────────────────────────────────────────
function ColorTokens() {
  const { MM } = window;
  const swatches = [
    { name: 'Green 50', hex: '#f0fdf4', token: 'green50', usage: 'পেজ ব্যাকগ্রাউন্ড' },
    { name: 'Green 100', hex: '#dcfce7', token: 'green100', usage: 'ব্যাজ ব্যাকগ্রাউন্ড' },
    { name: 'Green 500', hex: '#22c55e', token: 'green500', usage: 'সেকেন্ডারি অ্যাকসেন্ট' },
    { name: 'Green 600', hex: '#16a34a', token: 'green600', usage: 'PRIMARY — বাটন, নেভ' },
    { name: 'Green 700', hex: '#15803d', token: 'green700', usage: 'বাটন হোভার, হেডার' },
    { name: 'Green 800', hex: '#166534', token: 'green800', usage: 'হেডিং, গাঢ় টেক্সট' },
    { name: 'Danger', hex: '#ef4444', token: 'danger', usage: 'বকেয়া, ডিলিট, এরর' },
    { name: 'Warning', hex: '#f97316', token: 'warning', usage: 'উচ্চ বকেয়া সতর্কতা' },
    { name: 'Info', hex: '#3b82f6', token: 'info', usage: 'তথ্যমূলক' },
    { name: 'Gray 50', hex: '#f9fafb', token: 'gray50', usage: 'অ্যাপ শেল' },
    { name: 'Gray 100', hex: '#f3f4f6', token: 'gray100', usage: 'বর্ডার, ডিভাইডার' },
    { name: 'Gray 300', hex: '#d1d5db', token: 'gray300', usage: 'ইনপুট বর্ডার' },
    { name: 'Gray 500', hex: '#6b7280', token: 'gray500', usage: 'সেকেন্ডারি টেক্সট' },
    { name: 'Gray 700', hex: '#374151', token: 'gray700', usage: 'বডি টেক্সট' },
    { name: 'Gray 900', hex: '#111827', token: 'gray900', usage: 'হেডিং, প্রাইমারি টেক্সট' },
    { name: 'White', hex: '#ffffff', token: 'white', usage: 'কার্ড, মোডাল ব্যাকগ্রাউন্ড' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 24, background: MM.gray50, width: 740, height: 420 }}>
      {swatches.map(s => (
        <div key={s.token} style={{ background: 'white', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ height: 44, background: s.hex, border: s.hex === '#ffffff' ? '1px solid #e5e7eb' : 'none' }} />
          <div style={{ padding: '8px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 2, fontFamily: 'system-ui' }}>{s.name}</div>
            <div style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace', marginBottom: 3 }}>{s.hex}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>{s.usage}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Component Library ─────────────────────────────────────────
function ComponentLibrary() {
  const { MM, bnNum } = window;
  return (
    <div style={{ width: 820, padding: 32, background: MM.gray50, display: 'flex', flexDirection: 'column', gap: 28, fontFamily: "'Nikosh', 'NikoshBAN', sans-serif" }}>
      {/* Buttons */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>BUTTONS</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ height: 52, background: MM.green600, borderRadius: 12, padding: '0 28px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>প্রাইমারি বাটন</span>
          </div>
          <div style={{ height: 52, background: 'white', border: `1.5px solid ${MM.green600}`, borderRadius: 12, padding: '0 28px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ color: MM.green600, fontSize: 16, fontWeight: 600 }}>সেকেন্ডারি বাটন</span>
          </div>
          <div style={{ height: 52, background: MM.danger, borderRadius: 12, padding: '0 28px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>ডেঞ্জার বাটন</span>
          </div>
          <div style={{ height: 44, width: 44, borderRadius: 12, background: MM.green100, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MM.green600} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div style={{ height: 52, background: MM.green600, borderRadius: 12, padding: '0 28px', display: 'flex', alignItems: 'center', opacity: 0.5 }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>ডিসেবলড</span>
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>QUICK-SELECT CHIPS</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[50, 100, 200, 500].map((amt, i) => (
            <div key={amt} style={{ height: 36, padding: '0 18px', borderRadius: 999, background: i === 1 ? MM.green600 : 'white', border: `1.5px solid ${i === 1 ? MM.green600 : MM.gray300}`, color: i === 1 ? 'white' : MM.gray700, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>৳{bnNum(amt)}</div>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>INPUTS</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>ডিফল্ট</div>
            <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: 'white' }}>
              <span style={{ fontSize: 15, color: MM.gray400 }}>প্লেসহোল্ডার টেক্সট</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>ফোকাস</div>
            <div style={{ height: 52, border: `2px solid ${MM.green600}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: 'white', boxShadow: `0 0 0 3px rgba(22,163,74,0.12)` }}>
              <span style={{ fontSize: 15, color: MM.gray900 }}>ফোকাস স্টেট</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>সার্চ বার</div>
            <div style={{ height: 48, background: MM.gray100, borderRadius: 12, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: 15, color: MM.gray400 }}>সার্চ করুন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges + cards */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>BADGES</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: MM.green100, color: MM.green800, fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>০১</span>
            <span style={{ background: '#fee2e2', color: MM.danger, fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>বকেয়া ৳২০০</span>
            <span style={{ background: MM.green100, color: MM.green600, fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>✓ পরিশোধিত</span>
            <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '3px 8px' }}>বেশি বকেয়া</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>TOAST</div>
          <div style={{ background: MM.green700, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>মো. মোবারক হোসাইন — চাঁদা গ্রহণ সফল হয়েছে</span>
          </div>
        </div>
      </div>

      {/* Donor row */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>DONOR LIST ROW</div>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: `1px solid ${MM.gray100}` }}>
          {[
            { serial: 1, name: 'মো. মোবারক হোসাইন', addr: 'ঢাকিরকান্দা', monthly: 200, balance: 200, paid: false },
            { serial: 2, name: 'মতিউর রহমান', addr: 'ময়দানে মুহাম্মাদ', monthly: 200, balance: 0, paid: true },
          ].map((d, i) => (
            <div key={d.serial} style={{ padding: '12px 16px', borderBottom: i === 0 ? `1px solid ${MM.gray100}` : 'none', display: 'flex', alignItems: 'center', minHeight: 68, background: i % 2 === 0 ? 'white' : MM.gray50 }}>
              <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>{bnNum(d.serial)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: MM.gray400, marginTop: 2 }}>{d.addr}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 12, color: MM.gray500 }}>৳{bnNum(d.monthly)}</span>
                {d.paid ? <span style={{ fontSize: 13, fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span> : <span style={{ fontSize: 14, fontWeight: 700, color: MM.danger }}>৳{bnNum(d.balance)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MM.gray400, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 12 }}>TYPOGRAPHY — Hind Siliguri</div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: '4xl / 36px / 700', size: 36, weight: 700, text: 'ময়দানে' },
            { label: '2xl / 24px / 700', size: 24, weight: 700, text: 'ময়দানে মুহাম্মাদ' },
            { label: 'xl / 20px / 600', size: 20, weight: 600, text: 'পেজ শিরোনাম' },
            { label: 'lg / 18px / 600', size: 18, weight: 600, text: 'কার্ড শিরোনাম' },
            { label: 'base / 16px / 400', size: 16, weight: 400, text: 'বডি টেক্সট' },
            { label: 'sm / 14px / 400', size: 14, weight: 400, text: 'সেকেন্ডারি টেক্সট' },
            { label: 'xs / 12px / 500', size: 12, weight: 500, text: 'ব্যাজ, ফুটনোট' },
          ].map(t => (
            <div key={t.label}>
              <div style={{ fontSize: t.size, fontWeight: t.weight, color: MM.gray900, lineHeight: 1.3 }}>{t.text}</div>
              <div style={{ fontSize: 10, color: MM.gray400, marginTop: 4, fontFamily: 'system-ui' }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LogoFull, ColorTokens, ComponentLibrary });
