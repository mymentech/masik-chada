// mm-screens-b.jsx — Screens 5–9: Payment, Donor Mgmt, Add Donor, Reports, Toast

// ── Screen 5: Payment Bottom Sheet ───────────────────────────
function PaymentScreen() {
  const { PhoneFrame, BottomNav, MM, taka, bnNum, DONORS } = window;
  const donor = DONORS[0]; // মো. মোবারক হোসাইন
  const chips = [50, 100, 200, 500];
  return (
    <PhoneFrame bg={MM.white}>
      {/* Frozen donations list behind */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* Backdrop */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)', zIndex: 10 }} />

        {/* Underlying list (dimmed) */}
        <div style={{ padding: '0 0 0 0' }}>
          <div style={{ background: 'white', padding: '14px 16px 12px', borderBottom: `1px solid ${MM.gray100}` }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900, marginBottom: 10 }}>চাঁদা সংগ্রহ</div>
            <div style={{ height: 48, background: MM.gray100, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, marginBottom: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ fontSize: 15, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর লিখুন</span>
            </div>
          </div>
          {DONORS.slice(0, 4).map((d, i) => (
            <div key={d.serial} style={{ padding: '12px 16px', borderBottom: `1px solid ${MM.gray100}`, background: i % 2 === 0 ? 'white' : MM.gray50, display: 'flex', alignItems: 'center', minHeight: 68 }}>
              <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px', flexShrink: 0, marginTop: 2 }}>{bnNum(d.serial)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: MM.gray400, marginTop: 2 }}>{d.addr}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 12, color: MM.gray500 }}>{taka(d.monthly)}</span>
                {d.paid ? <span style={{ fontSize: 13, fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span> : <span style={{ fontSize: 14, fontWeight: 700, color: MM.danger }}>{taka(d.balance)}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom sheet */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
          background: 'white', borderRadius: '20px 20px 0 0',
          padding: '0 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          maxHeight: '88%', overflow: 'auto',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px', position: 'sticky', top: 0, background: 'white', zIndex: 5 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: MM.gray300 }} />
          </div>
          <div style={{ padding: '0 20px 24px' }}>

          {/* Donor info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: MM.gray900 }}>{donor.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: MM.gray500 }}>{donor.addr} · সিরিয়াল: {bnNum(donor.serial)}</span>
              <span style={{ background: '#fee2e2', color: MM.danger, fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>বকেয়া {taka(donor.balance)}</span>
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>চাঁদার পরিমাণ</div>
            <div style={{ height: 60, border: `2px solid ${MM.green600}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 0 0 3px rgba(22,163,74,0.1)` }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: MM.gray900 }}>২০০</span>
              <span style={{ fontSize: 14, color: MM.gray500 }}>৳</span>
            </div>
            {/* Quick chips */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {chips.map(amt => (
                <div key={amt} style={{
                  height: 36, padding: '0 14px', borderRadius: 999,
                  background: amt === 200 ? MM.green600 : 'white',
                  border: `1.5px solid ${amt === 200 ? MM.green600 : MM.gray300}`,
                  color: amt === 200 ? 'white' : MM.gray700,
                  fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', cursor: 'pointer',
                }}>৳{bnNum(amt)}</div>
              ))}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>তারিখ</div>
            <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MM.gray50 }}>
              <span style={{ fontSize: 15, color: MM.gray700 }}>২৩/০৪/২০২৬</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>

          {/* Submit */}
          <div style={{ height: 52, background: MM.green600, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
            <span style={{ color: 'white', fontSize: 17, fontWeight: 600 }}>চাঁদা গ্রহণ করুন</span>
          </div>

          {/* Payment history */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${MM.gray100}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: MM.gray700 }}>পূর্বের পেমেন্ট হিস্ট্রি</div>
              <span style={{ fontSize: 12, color: MM.gray400 }}>সর্বশেষ ১২টি</span>
            </div>
            {[
              { date: '২৩ মার্চ ২০২৬', amount: 200, by: 'মোজাম্মেল হক' },
              { date: '২০ ফেব্রুয়ারি ২০২৬', amount: 200, by: 'আব্দুর রহমান' },
              { date: '১৫ জানুয়ারি ২০২৬', amount: 200, by: 'মোজাম্মেল হক' },
              { date: '১৮ ডিসেম্বর ২০২৫', amount: 200, by: 'মোজাম্মেল হক' },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < 3 ? `1px solid ${MM.gray100}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: MM.green100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MM.green700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray900 }}>{p.date}</div>
                    <div style={{ fontSize: 11, color: MM.gray400, marginTop: 1 }}>সংগ্রাহক: {p.by}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: MM.green700 }}>+{taka(p.amount)}</div>
              </div>
            ))}
          </div>
          </div>{/* end padding div */}
      </div>
      </div>
      <BottomNav active="donations" />
    </PhoneFrame>
  );
}

// ── Screen 6: Donor Management ────────────────────────────────
function DonorMgmtScreen() {
  const { PhoneFrame, BottomNav, MM, taka, bnNum, DONORS } = window;
  return (
    <PhoneFrame bg={MM.white}>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${MM.gray100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900 }}>দাতা ম্যানেজমেন্ট</div>
            <div style={{ height: 38, background: MM.green600, borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>+ নতুন দাতা</span>
            </div>
          </div>
          <div style={{ height: 48, background: MM.gray100, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 15, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর</span>
          </div>
        </div>

        {/* Donor cards */}
        {DONORS.map((d, i) => (
          <div key={d.serial} style={{
            padding: '14px 16px', borderBottom: `1px solid ${MM.gray100}`,
            background: i % 2 === 0 ? 'white' : MM.gray50,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px' }}>{bnNum(d.serial)}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{d.name}</span>
                </div>
                <div style={{ fontSize: 12, color: MM.gray500, marginBottom: 4 }}>{d.addr}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ color: MM.gray500 }}>মাসিক: <span style={{ fontWeight: 600, color: MM.gray700 }}>{taka(d.monthly)}</span></span>
                  {d.paid
                    ? <span style={{ fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span>
                    : <span>বকেয়া: <span style={{ fontWeight: 700, color: MM.danger }}>{taka(d.balance)}</span></span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <div style={{ height: 34, padding: '0 12px', borderRadius: 8, background: '#dbeafe', color: MM.info, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>এডিট</div>
                <div style={{ height: 34, padding: '0 12px', borderRadius: 8, background: '#fee2e2', color: MM.danger, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>ডিলিট</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="donors" />
    </PhoneFrame>
  );
}

// ── Screen 7: Add Donor Bottom Sheet ─────────────────────────
function AddDonorScreen() {
  const { PhoneFrame, BottomNav, MM, bnNum } = window;
  const chips = [50, 100, 200, 500];
  return (
    <PhoneFrame bg={MM.white}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* Dimmed donors behind */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10 }} />
        <div style={{ padding: '16px 16px 12px', background: 'white' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900 }}>দাতা ম্যানেজমেন্ট</div>
        </div>

        {/* Bottom sheet */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', maxHeight: '88%', overflow: 'auto' }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: MM.gray300 }} />
          </div>

          <div style={{ padding: '4px 20px 20px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900, marginBottom: 20 }}>নতুন দাতা যোগ করুন</div>

            {/* Fields */}
            {[
              { label: 'নাম *', placeholder: 'পূর্ণ নাম লিখুন', type: 'text' },
              { label: 'ফোন', placeholder: '+880', type: 'tel' },
              { label: 'ঠিকানা *', placeholder: 'এলাকার নাম', type: 'text' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>{f.label}</div>
                <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: MM.gray50 }}>
                  <span style={{ fontSize: 15, color: MM.gray400 }}>{f.placeholder}</span>
                </div>
              </div>
            ))}

            {/* Monthly + chips */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>মাসিক চাঁদা *</div>
              <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: MM.gray50, marginBottom: 8 }}>
                <span style={{ fontSize: 15, color: MM.gray700 }}>১০০</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {chips.map(amt => (
                  <div key={amt} style={{ height: 34, padding: '0 12px', borderRadius: 999, background: amt === 100 ? MM.green600 : 'white', border: `1.5px solid ${amt === 100 ? MM.green600 : MM.gray300}`, color: amt === 100 ? 'white' : MM.gray700, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}>৳{bnNum(amt)}</div>
                ))}
              </div>
            </div>

            {/* Registration date */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>নিবন্ধনের তারিখ *</div>
              <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MM.gray50 }}>
                <span style={{ fontSize: 15, color: MM.gray700 }}>২৩/০৪/২০২৬</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>

            {/* Info box */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.65 }}>
                <strong>বকেয়া গণনার তারিখ (ঐচ্ছিক):</strong> এই তারিখ সেট করলে এর আগের বকেয়া মাফ হয়ে যাবে। খালি রাখলে নিবন্ধনের তারিখ থেকে গণনা হবে।
              </div>
            </div>

            {/* Due from date */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: MM.gray700, marginBottom: 6 }}>বকেয়া গণনার তারিখ</div>
              <div style={{ height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', background: MM.gray50 }}>
                <span style={{ fontSize: 15, color: MM.gray400 }}>ঐচ্ছিক</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, height: 52, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: MM.gray700 }}>বাতিল</span>
              </div>
              <div style={{ flex: 1, height: 52, background: MM.green600, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>যোগ করুন</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="donors" />
    </PhoneFrame>
  );
}

// ── Screen 8: Reports ─────────────────────────────────────────
function ReportsScreen() {
  const { PhoneFrame, BottomNav, MM, taka, bnNum } = window;
  return (
    <PhoneFrame bg={MM.white}>
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${MM.gray100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900 }}>মাসিক রিপোর্ট</div>
            <div style={{ height: 38, background: MM.green600, borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>PDF</span>
            </div>
          </div>
          {/* Month picker */}
          <div style={{ marginTop: 12, height: 48, border: `1.5px solid ${MM.gray300}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MM.gray50, maxWidth: 220 }}>
            <span style={{ fontSize: 15, color: MM.gray700 }}>এপ্রিল ২০২৬</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: MM.green600, borderRadius: 16, padding: '16px 14px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>এ মাসের মোট সংগ্রহ</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>৳ ০.০০</div>
            </div>
            <div style={{ background: MM.danger, borderRadius: 16, padding: '16px 14px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>মাস শেষে মোট বকেয়া</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>৳ ৮১,৭০০</div>
            </div>
          </div>

          {/* Collector section */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: MM.gray900, marginBottom: 12 }}>কালেক্টর অনুযায়ী সংগ্রহ</div>
            {/* Table header */}
            <div style={{ background: MM.green600, borderRadius: '10px 10px 0 0', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>কালেক্টর</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>সংগৃহীত পরিমাণ</span>
            </div>

            {/* Empty state */}
            <div style={{ border: `1px solid ${MM.gray100}`, borderTop: 0, borderRadius: '0 0 10px 10px', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ marginBottom: 12 }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={MM.gray300} strokeWidth="1.5" strokeLinecap="round" style={{ display: 'block', margin: '0 auto' }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div style={{ fontSize: 14, color: MM.gray400 }}>এ মাসে কোনো সংগ্রহ হয়নি</div>
            </div>
          </div>

          {/* Info note */}
          <div style={{ background: MM.gray50, borderRadius: 12, padding: '14px', border: `1px solid ${MM.gray100}` }}>
            <div style={{ fontSize: 12, color: MM.gray500, lineHeight: 1.65 }}>
              সংগ্রহ শুরু হলে এখানে কালেক্টর অনুযায়ী সংগ্রহের তথ্য দেখাবে।
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="reports" />
    </PhoneFrame>
  );
}

// ── Screen 9: Success Toast ───────────────────────────────────
function ToastScreen() {
  const { PhoneFrame, BottomNav, MM, taka, bnNum, DONORS } = window;
  const donors = DONORS.map((d, i) => i === 0 ? { ...d, paid: true, balance: 0 } : d);
  return (
    <PhoneFrame bg={MM.white}>
      {/* Toast notification */}
      <div style={{ position: 'relative' }}>
        <div style={{
          margin: '10px 16px 0',
          background: MM.green700,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
          zIndex: 50,
          position: 'relative',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span style={{ fontSize: 14, color: 'white', fontWeight: 500, lineHeight: 1.4 }}>
            মো. মোবারক হোসাইন — চাঁদা গ্রহণ সফল হয়েছে
          </span>
        </div>
      </div>

      {/* Updated donations list */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ background: 'white', padding: '14px 16px 12px', borderBottom: `1px solid ${MM.gray100}` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: MM.gray900, marginBottom: 10 }}>চাঁদা সংগ্রহ</div>
          <div style={{ height: 48, background: MM.gray100, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, marginBottom: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MM.gray400} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 15, color: MM.gray400 }}>নাম বা সিরিয়াল নম্বর লিখুন</span>
          </div>
        </div>
        {/* Table header */}
        <div style={{ background: MM.green50, padding: '8px 16px', display: 'flex', borderBottom: `1px solid ${MM.green100}` }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: MM.green800 }}>সিরিয়াল · নাম</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: MM.green800, width: 52, textAlign: 'right' }}>মাসিক</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: MM.green800, width: 64, textAlign: 'right' }}>বকেয়া</span>
          </div>
        </div>
        {donors.map((d, i) => (
          <div key={d.serial} style={{
            padding: '12px 16px', borderBottom: `1px solid ${MM.gray100}`,
            background: i === 0 ? '#f0fdf4' : (i % 2 === 0 ? 'white' : MM.gray50),
            display: 'flex', alignItems: 'center', minHeight: 68,
            transition: 'background 0.3s',
          }}>
            <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ background: MM.green100, color: MM.green800, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 7px', flexShrink: 0, marginTop: 2 }}>{bnNum(d.serial)}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: MM.gray900 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: MM.gray400, marginTop: 2 }}>{d.addr}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 110 }}>
              <span style={{ fontSize: 12, color: MM.gray500 }}>{taka(d.monthly)}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: MM.green600 }}>✓ পরিশোধিত</span>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="donations" />
    </PhoneFrame>
  );
}

Object.assign(window, { PaymentScreen, DonorMgmtScreen, AddDonorScreen, ReportsScreen, ToastScreen });
