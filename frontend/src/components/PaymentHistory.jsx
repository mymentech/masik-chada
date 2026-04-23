import { useQuery } from '@apollo/client';
import { DONOR_PAYMENTS_QUERY } from '../graphql/queries';

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

export default function PaymentHistory({ donorId, title = 'পূর্বের পেমেন্ট রেকর্ড', maxHeight = 280 }) {
  const { data, loading, error } = useQuery(DONOR_PAYMENTS_QUERY, {
    variables: { donorId: String(donorId) },
    fetchPolicy: 'cache-and-network',
    skip: !donorId,
  });

  const payments = data?.donorPayments || [];
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</div>
        {payments.length > 0 && (
          <span
            style={{
              background: '#dcfce7',
              color: '#166534',
              borderRadius: 999,
              padding: '2px 10px',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            মোট {payments.length} · {formatMoney(total)}
          </span>
        )}
      </div>

      {loading && payments.length === 0 ? (
        <p style={{ margin: 0, color: '#9ca3af', fontSize: 17, textAlign: 'center', padding: '12px 0' }}>
          লোড হচ্ছে...
        </p>
      ) : null}

      {error ? (
        <p style={{ margin: 0, color: '#ef4444', fontSize: 17 }}>
          পেমেন্ট হিস্ট্রি আনা যায়নি।
        </p>
      ) : null}

      {!loading && !error && payments.length === 0 ? (
        <p style={{ margin: 0, color: '#9ca3af', fontSize: 17, textAlign: 'center', padding: '12px 0' }}>
          এখনো কোনো পেমেন্ট নেই।
        </p>
      ) : null}

      {payments.length > 0 ? (
        <div
          style={{
            maxHeight,
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #f3f4f6',
          }}
        >
          {payments.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: idx === payments.length - 1 ? 'none' : '1px solid #f3f4f6',
                fontSize: 17,
              }}
            >
              <span style={{ color: '#374151' }}>{formatDate(p.payment_date)}</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>{formatMoney(p.amount)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
