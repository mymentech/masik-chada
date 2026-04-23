import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { MONTHLY_REPORT_QUERY } from '../graphql/queries';
import { useIsMobile } from '../context/MobileContext';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function UserAvatar() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#dcfce7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width="18"
        height="18"
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
  );
}

export default function Reports() {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(currentMonth());
  const queryMonth = useMemo(() => month, [month]);

  const { data, loading, error } = useQuery(MONTHLY_REPORT_QUERY, {
    variables: { month: queryMonth },
    skip: !queryMonth,
    fetchPolicy: 'cache-and-network',
  });

  const report = data?.monthlyReport;
  const canExport = Boolean(report) && !loading;
  const totalByCollectors = report?.byCollector?.reduce((s, r) => s + Number(r.total || 0), 0) ?? 0;

  function exportPdf() {
    if (!canExport) return;
    window.print();
  }

  const contentPadding = isMobile ? '16px' : '24px 0';

  return (
    <div style={{ minHeight: '100svh', background: '#f9fafb' }}>
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: isMobile ? 0 : 64,
          zIndex: 10,
          background: '#fff',
          borderBottom: '1px solid #f3f4f6',
          padding: isMobile ? '14px 16px' : '16px 0',
        }}
      >
        <div className={isMobile ? '' : 'container'}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              মাসিক রিপোর্ট
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <input
                id="report-month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="ds-input"
                style={{
                  height: 40,
                  borderRadius: 10,
                  padding: '0 12px',
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={exportPdf}
                disabled={!canExport}
                data-testid="reports-export-pdf"
                data-print-show="true"
                style={{
                  height: 40,
                  background: canExport ? '#16a34a' : '#d1d5db',
                  color: canExport ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: canExport ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 150ms',
                }}
              >
                <DownloadIcon />
                PDF এক্সপোর্ট
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={isMobile ? '' : 'container'}
        style={{ padding: contentPadding }}
      >
        {loading && !report && (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
            রিপোর্ট লোড হচ্ছে...
          </p>
        )}

        {error && (
          <div
            style={{
              margin: isMobile ? '16px 0' : '16px 0',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 14,
            }}
          >
            রিপোর্ট লোড করা যায়নি।
          </div>
        )}

        {!loading && !error && !report && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              gap: 12,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 15 }}>
              এ মাসে কোনো সংগ্রহ হয়নি
            </p>
          </div>
        )}

        {report && (
          <div style={{ display: 'grid', gap: 16, marginTop: isMobile ? 0 : 0 }}>
            {/* Summary cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              {/* Total collected — dark green gradient */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #166534, #15803d)',
                  borderRadius: 16,
                  padding: 20,
                  gridColumn: isMobile ? '1 / -1' : 'auto',
                  boxShadow: '0 4px 14px rgba(22,101,52,0.2)',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
                  এ মাসের মোট সংগ্রহ
                </p>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {formatMoney(report.collected)}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                  {report.byCollector?.length ?? 0} জন কালেক্টর
                </p>
              </div>

              {/* Total balance — red */}
              <div
                style={{
                  background: '#ef4444',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 4px 14px rgba(239,68,68,0.15)',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  মোট বকেয়া
                </p>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {formatMoney(report.totalBalance)}
                </p>
              </div>

              {/* Collectors count — white */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                  সক্রিয় কালেক্টর
                </p>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#111827',
                    lineHeight: 1.2,
                  }}
                >
                  {report.byCollector?.length ?? 0} জন
                </p>
              </div>
            </div>

            {/* Collector table */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {/* Table title */}
              <div
                style={{
                  background: '#16a34a',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                  কালেক্টরভিত্তিক সংগ্রহ
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                  মোট
                </span>
              </div>

              {/* Collector rows */}
              {report.byCollector?.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 14 }}>
                  এই মাসে কোনো সংগ্রহ পাওয়া যায়নি।
                </p>
              ) : null}

              {report.byCollector?.map((row, index) => (
                <div
                  key={row.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <UserAvatar />
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                      {row.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#15803d' }}>
                    {formatMoney(row.total)}
                  </span>
                </div>
              ))}

              {/* Footer total row */}
              {report.byCollector?.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: '#f0fdf4',
                    borderTop: '2px solid #dcfce7',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>মোট সংগ্রহ</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>
                    {formatMoney(totalByCollectors)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}