import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { MONTHLY_REPORT_QUERY } from '../graphql/queries';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export default function Reports() {
  const [month, setMonth] = useState(currentMonth());
  const queryMonth = useMemo(() => month, [month]);

  const { data, loading, error } = useQuery(MONTHLY_REPORT_QUERY, {
    variables: { month: queryMonth },
    skip: !queryMonth,
    fetchPolicy: 'cache-and-network'
  });

  const report = data?.monthlyReport;
  const canExport = Boolean(report) && !loading;

  function exportPdf() {
    if (!canExport) {
      return;
    }

    window.print();
  }

  return (
    <section className="container page-shell">
      <div className="report-toolbar">
        <div>
          <h1>মাসিক রিপোর্ট</h1>

          <label htmlFor="report-month" className="field-label">মাস নির্বাচন করুন</label>
          <input
            id="report-month"
            className="sheet-input report-month-input"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="primary-btn tap-btn report-export-btn"
          onClick={exportPdf}
          disabled={!canExport}
          data-testid="reports-export-pdf"
        >
          PDF এক্সপোর্ট
        </button>
      </div>

      {loading && !report ? <p>রিপোর্ট লোড হচ্ছে...</p> : null}
      {error ? <p className="feedback-error">রিপোর্ট লোড করা যায়নি।</p> : null}
      {!loading && !error && !report ? <p>এই মাসের জন্য কোনো রিপোর্ট পাওয়া যায়নি।</p> : null}

      {report ? (
        <>
          <div className="stats-grid report-grid">
            <article className="card">
              <h2>মোট সংগ্রহ</h2>
              <p>{formatMoney(report.collected)}</p>
            </article>
            <article className="card">
              <h2>মোট বকেয়া</h2>
              <p>{formatMoney(report.totalBalance)}</p>
            </article>
          </div>

          <div className="collector-block">
            <h2>কালেক্টরভিত্তিক সংগ্রহ</h2>
            {report.byCollector.length === 0 ? <p>এই মাসে কোনো সংগ্রহ পাওয়া যায়নি।</p> : null}

            {report.byCollector.map((row) => (
              <div key={row.name} className="collector-row">
                <span>{row.name}</span>
                <strong>{formatMoney(row.total)}</strong>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
