import { useNavigate } from 'react-router-dom';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../context/MobileContext';
import LogoMark from '../components/LogoMark';

function formatBdt(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBdtCompact(value) {
  const n = Number(value || 0);
  if (n >= 100000) {
    return '৳' + new Intl.NumberFormat('bn-BD', { maximumFractionDigits: 1 }).format(n / 100000) + ' লক্ষ';
  }
  return formatBdt(n);
}

function todayBengali() {
  return new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function StatCard({ label, value, iconBg, iconColor, icon }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const userName = user?.name || 'অ্যাডমিন';

  const statCards = [
    {
      label: 'মোট দাতা',
      value: summary?.totalDonors ?? '--',
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      icon: (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </>
      ),
    },
    {
      label: 'এ মাসের সংগ্রহ',
      value: summary ? formatBdtCompact(summary.thisMonthCollected) : '--',
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
      icon: (
        <>
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </>
      ),
    },
    {
      label: 'মোট বকেয়া',
      value: summary ? formatBdtCompact(summary.totalBalance) : '--',
      iconBg: '#fee2e2',
      iconColor: '#ef4444',
      icon: (
        <>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </>
      ),
    },
    {
      label: 'মোট কালেক্টর',
      value: summary?.totalCollectors ?? '--',
      iconBg: '#ffedd5',
      iconColor: '#f97316',
      icon: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100svh', background: '#f9fafb' }}>
      {/* Header banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
          padding: isMobile ? '20px 16px 28px' : '20px 24px 28px',
        }}
      >
        <div
          className={isMobile ? '' : 'container'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && <LogoMark size={32} bg="rgba(255,255,255,0.2)" />}
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
                স্বাগতম
              </p>
              <h1
                style={{
                  margin: 0,
                  color: '#ffffff',
                  fontSize: isMobile ? 20 : 22,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {userName}
              </h1>
              <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {todayBengali()}
              </p>
            </div>
          </div>

          {/* Bell icon */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={isMobile ? '' : 'container'}
        style={{
          padding: isMobile ? '20px 16px' : '24px 0',
          display: 'grid',
          gap: 20,
        }}
      >
        {loading && !summary ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
            ডেটা লোড হচ্ছে...
          </p>
        ) : null}

        {error && !summary ? (
          <p style={{ color: '#ef4444', textAlign: 'center', padding: '40px 0' }}>
            ড্যাশবোর্ড ডেটা লোড করা যায়নি।
          </p>
        ) : null}

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Welcome + Quick actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}
        >
          {/* Welcome card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  স্বাগতম, {userName}!
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>অ্যাডমিন প্যানেল</p>
              </div>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              ময়দানে মুহাম্মাদ মাসিক চাঁদা ব্যবস্থাপনা সিস্টেমে আপনাকে স্বাগতম। চাঁদা সংগ্রহ শুরু করতে বা রিপোর্ট দেখতে নিচের বাটন ব্যবহার করুন।
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => navigate('/donations')}
                style={{
                  height: 40,
                  background: '#16a34a',
                  color: '#fff',
                  border: 0,
                  borderRadius: 10,
                  padding: '0 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                চাঁদা সংগ্রহ শুরু করুন
              </button>
              <button
                type="button"
                onClick={() => navigate('/reports')}
                style={{
                  height: 40,
                  background: 'transparent',
                  color: '#374151',
                  border: '1.5px solid #d1d5db',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                রিপোর্ট দেখুন
              </button>
            </div>
          </div>

          {/* Summary card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>
              সারসংক্ষেপ
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                {
                  label: 'এ মাসের সংগ্রহ',
                  value: summary ? formatBdt(summary.thisMonthCollected) : '--',
                  color: '#16a34a',
                  bg: '#f0fdf4',
                },
                {
                  label: 'মোট বকেয়া',
                  value: summary ? formatBdt(summary.totalBalance) : '--',
                  color: '#ef4444',
                  bg: '#fef2f2',
                },
                {
                  label: 'মোট নিবন্ধিত দাতা',
                  value: summary?.totalDonors ?? '--',
                  color: '#3b82f6',
                  bg: '#eff6ff',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: item.bg,
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}
                >
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}