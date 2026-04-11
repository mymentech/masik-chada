import { useDashboardSummary } from '../hooks/useDashboardSummary';

function formatBdt(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(value);
}

export default function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();

  if (loading && !summary) {
    return (
      <section className="container page-shell">
        <h1>ড্যাশবোর্ড</h1>
        <p>ডেটা লোড হচ্ছে...</p>
      </section>
    );
  }

  if (error && !summary) {
    return (
      <section className="container page-shell">
        <h1>ড্যাশবোর্ড</h1>
        <p className="error-text">ড্যাশবোর্ড ডেটা লোড করা যায়নি।</p>
      </section>
    );
  }

  const cards = [
    {
      title: 'মোট ডোনার',
      value: summary?.totalDonors ?? '--'
    },
    {
      title: 'এই মাসের সংগ্রহ',
      value: summary ? formatBdt(summary.thisMonthCollected) : '--'
    },
    {
      title: 'মোট বকেয়া',
      value: summary ? formatBdt(summary.totalBalance) : '--'
    },
    {
      title: 'মোট কালেক্টর',
      value: summary?.totalCollectors ?? '--'
    }
  ];

  return (
    <section className="container page-shell">
      <h1>ড্যাশবোর্ড</h1>
      <div className="stats-grid">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <h2>{card.title}</h2>
            <p>{card.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
