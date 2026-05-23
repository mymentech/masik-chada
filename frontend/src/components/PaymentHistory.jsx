import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { APP_SETTINGS_QUERY, DONOR_PAYMENTS_QUERY } from '../graphql/queries';
import { DELETE_PAYMENT_MUTATION } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';

  const { data, loading, error } = useQuery(DONOR_PAYMENTS_QUERY, {
    variables: { donorId: String(donorId) },
    fetchPolicy: 'cache-and-network',
    skip: !donorId,
  });

  const { data: settingsData } = useQuery(APP_SETTINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !isAdmin,
  });
  const allowPaymentDelete = Boolean(settingsData?.appSettings?.allow_payment_delete);
  const canDelete = isAdmin && allowPaymentDelete;

  const [deletePayment, deleteState] = useMutation(DELETE_PAYMENT_MUTATION);
  const [pendingId, setPendingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const payments = data?.donorPayments || [];
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  async function handleDelete(payment) {
    const confirmMsg = `${formatDate(payment.payment_date)} তারিখের ${formatMoney(payment.amount)} পেমেন্টটি মুছে ফেলা হবে। আপনি কি নিশ্চিত?`;
    if (!window.confirm(confirmMsg)) return;
    setDeleteError('');
    setPendingId(payment.id);
    try {
      await deletePayment({
        variables: { id: String(payment.id) },
        refetchQueries: ['DonorPayments', 'Dashboard', 'DonorsPage', 'Donor'],
        awaitRefetchQueries: true,
      });
    } catch (err) {
      setDeleteError(err?.graphQLErrors?.[0]?.message || 'পেমেন্ট ডিলিট করা যায়নি।');
    } finally {
      setPendingId(null);
    }
  }

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

      {deleteError ? (
        <p style={{ margin: '0 0 10px', color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 10px', fontSize: 16 }}>
          {deleteError}
        </p>
      ) : null}

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
          {payments.map((p, idx) => {
            const isPending = pendingId === p.id && deleteState.loading;
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderBottom: idx === payments.length - 1 ? 'none' : '1px solid #f3f4f6',
                  fontSize: 17,
                  opacity: isPending ? 0.55 : 1,
                }}
              >
                <span style={{ color: '#374151' }}>{formatDate(p.payment_date)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, color: '#166534' }}>{formatMoney(p.amount)}</span>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={isPending || deleteState.loading}
                      title="পেমেন্ট ডিলিট"
                      aria-label="পেমেন্ট ডিলিট"
                      data-testid={`payment-history-delete-${p.id}`}
                      style={{
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        borderRadius: 8,
                        padding: '4px 10px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: isPending || deleteState.loading ? 'not-allowed' : 'pointer',
                        lineHeight: 1.2,
                      }}
                    >
                      {isPending ? '...' : 'ডিলিট'}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
