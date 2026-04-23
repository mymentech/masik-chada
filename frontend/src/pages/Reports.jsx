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

function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value).slice(0, 10);
  }
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

  const monthLabel = useMemo(() => {
    if (!queryMonth) return '';
    try {
      const [y, m] = queryMonth.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return new Intl.DateTimeFormat('bn-BD', { year: 'numeric', month: 'long' }).format(date);
    } catch {
      return queryMonth;
    }
  }, [queryMonth]);

  const generatedOn = useMemo(
    () =>
      new Intl.DateTimeFormat('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    [report],
  );

  return (
    <div style={{ minHeight: '100svh', background: '#f9fafb' }} className="print-area">
      {/* Print-only document header (A4, grayscale-friendly).
          The `.pMonth` / `.pDate` spans also feed CSS `string-set`, which the
          @page @bottom-left margin box renders on every subsequent page. */}
      {report && (
        <div className="print-only print-doc-header">
          <h1>মাসিক রিপোর্ট</h1>
          <p className="subtitle">ميدان محمد — মাসিক চাঁদা · {monthLabel}</p>
          <div className="meta">
            <span>মাস: <span className="pMonth">{monthLabel}</span></span>
            <span>প্রিন্ট: <span className="pDate">{generatedOn}</span></span>
          </div>
        </div>
      )}

      {/* Print-only summary */}
      {report && (
        <div className="print-only print-summary">
          <div className="cell">
            <p className="label">মোট সংগ্রহ</p>
            <p className="value">{formatMoney(report.collected)}</p>
          </div>
          <div className="cell">
            <p className="label">মোট বকেয়া</p>
            <p className="value">{formatMoney(report.totalBalance)}</p>
          </div>
          <div className="cell">
            <p className="label">সক্রিয় কালেক্টর</p>
            <p className="value">{report.byCollector?.length ?? 0} জন</p>
          </div>
        </div>
      )}

      {/* Print-only collector breakdown */}
      {report && report.byCollector?.length > 0 && (
        <table className="print-only print-table">
          <caption>কালেক্টরভিত্তিক সংগ্রহ</caption>
          <thead>
            <tr>
              <th style={{ width: '8%' }}>ক্রম</th>
              <th>কালেক্টর</th>
              <th className="num" style={{ width: '25%' }}>মোট সংগ্রহ</th>
            </tr>
          </thead>
          <tbody>
            {report.byCollector.map((row, i) => (
              <tr key={row.name}>
                <td className="serial">{i + 1}</td>
                <td>{row.name}</td>
                <td className="num">{formatMoney(row.total)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={2}>সর্বমোট</td>
              <td className="num">{formatMoney(totalByCollectors)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Print-only detailed payments — thead repeats on each page */}
      {report && report.payments?.length > 0 && (
        <table className="print-only print-table">
          <caption>পেমেন্ট বিবরণী ({report.payments.length} টি)</caption>
          <thead>
            <tr>
              <th className="serial">সিরিয়াল</th>
              <th>নাম</th>
              <th>ঠিকানা</th>
              <th>কালেক্টর</th>
              <th>তারিখ</th>
              <th className="num">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {report.payments.map((p) => (
              <tr key={p.id}>
                <td className="serial">{p.donor_serial}</td>
                <td>{p.donor_name}</td>
                <td>{p.donor_address}</td>
                <td>{p.collector_name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.payment_date)}</td>
                <td className="num">{formatMoney(p.amount)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={5}>সর্বমোট</td>
              <td className="num">{formatMoney(report.collected)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Screen-only UI below */}
      <div
        className="no-print"
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
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>
              মাসিক রিপোর্ট
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <label
                htmlFor="report-month"
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  padding: 0,
                  margin: -1,
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                মাস নির্বাচন করুন
              </label>
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
                  fontSize: 18,
                }}
              />
              <button
                type="button"
                onClick={exportPdf}
                disabled={!canExport}
                data-testid="reports-export-pdf"
                style={{
                  height: 40,
                  background: canExport ? '#16a34a' : '#d1d5db',
                  color: canExport ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontWeight: 600,
                  fontSize: 18,
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
        className={`no-print ${isMobile ? '' : 'container'}`}
        style={{ padding: contentPadding }}
      >
        {loading && !report && (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: 18 }}>
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
              fontSize: 18,
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
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 19 }}>
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
                <h2 style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                  মোট সংগ্রহ
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  এ মাসের সংগ্রহ
                </p>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {formatMoney(report.collected)}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
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
                <h2 style={{ margin: 0, fontSize: 18, color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>
                  মোট বকেয়া
                </h2>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 28,
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
                <h2 style={{ margin: 0, fontSize: 18, color: '#4b5563', fontWeight: 700 }}>
                  সক্রিয় কালেক্টর
                </h2>
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 28,
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
                <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                  কালেক্টরভিত্তিক সংগ্রহ
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                  মোট
                </span>
              </div>

              {/* Collector rows */}
              {report.byCollector?.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 18 }}>
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
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#374151' }}>
                      {row.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 19, fontWeight: 700, color: '#15803d' }}>
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
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>মোট সংগ্রহ</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>
                    {formatMoney(totalByCollectors)}
                  </span>
                </div>
              )}
            </div>

            {/* Detailed payments table */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  background: '#166534',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                  পেমেন্ট বিবরণী
                </span>
                <span style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {report.payments?.length ?? 0} টি পেমেন্ট
                </span>
              </div>

              {report.payments?.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 18 }}>
                  এই মাসে কোনো পেমেন্ট নেই।
                </p>
              ) : null}

              {report.payments?.length > 0 && !isMobile && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr 120px 140px 110px',
                    gap: 8,
                    padding: '10px 20px',
                    background: '#f0fdf4',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#166534',
                  }}
                >
                  <span>সিরিয়াল</span>
                  <span>নাম</span>
                  <span>ঠিকানা</span>
                  <span>কালেক্টর</span>
                  <span>তারিখ</span>
                  <span style={{ textAlign: 'right' }}>পরিমাণ</span>
                </div>
              )}

              {report.payments?.map((p, idx) =>
                isMobile ? (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 16px',
                      background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#166534',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 15,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {p.donor_serial}
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.donor_name}
                        </span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                        {formatMoney(p.amount)}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, color: '#6b7280' }}>{p.donor_address}</div>
                    <div style={{ fontSize: 15, color: '#9ca3af', marginTop: 2 }}>
                      {formatDate(p.payment_date)} · {p.collector_name}
                    </div>
                  </div>
                ) : (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 1fr 120px 140px 110px',
                      gap: 8,
                      padding: '12px 20px',
                      alignItems: 'center',
                      background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: 17,
                    }}
                  >
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: 6,
                        padding: '2px 0',
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        width: 48,
                      }}
                    >
                      {p.donor_serial}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.donor_name}
                    </span>
                    <span
                      style={{
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.donor_address}
                    </span>
                    <span
                      style={{
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.collector_name}
                    </span>
                    <span style={{ color: '#374151' }}>{formatDate(p.payment_date)}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                      {formatMoney(p.amount)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
