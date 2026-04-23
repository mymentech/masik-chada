import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { RECORD_PAYMENT_MUTATION } from '../graphql/mutations';
import { ADDRESSES_QUERY, DASHBOARD_SUMMARY_QUERY, DONORS_QUERY, DONOR_PAYMENTS_QUERY } from '../graphql/queries';
import { useIsMobile } from '../context/MobileContext';
import PaymentHistory from '../components/PaymentHistory';

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function toGraphqlDate(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

function SerialBadge({ number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 28,
        height: 22,
        padding: '0 6px',
        background: '#dcfce7',
        color: '#166534',
        borderRadius: 6,
        fontSize: 15,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}

export default function Donations() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayIsoDate());
  const [notice, setNotice] = useState({ type: '', text: '' });
  const toastTimerRef = useRef(null);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const variables = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      address: address || undefined,
    }),
    [debouncedSearch, address]
  );

  const { data, loading, error } = useQuery(DONORS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const { data: addressesData } = useQuery(ADDRESSES_QUERY, { fetchPolicy: 'cache-first' });

  const donors = data?.donors || [];
  const addresses = addressesData?.addresses || [];
  const selectedDonor = donors.find((d) => d.id === selectedDonorId) || null;

  const totalDues = donors.reduce((sum, d) => sum + Number(d.balance || 0), 0);

  const [recordPayment, paymentState] = useMutation(RECORD_PAYMENT_MUTATION);

  useEffect(() => {
    if (!selectedDonorId || selectedDonor) return;
    setSelectedDonorId(null);
  }, [selectedDonorId, selectedDonor]);

  useEffect(() => {
    if (!selectedDonor) return;
    setAmount(String(selectedDonor.monthly_amount));
    setPaymentDate(todayIsoDate());
  }, [selectedDonor]);

  function dismissSheet() {
    setSelectedDonorId(null);
  }

  async function submitPayment(event) {
    event.preventDefault();
    setNotice({ type: '', text: '' });

    if (!selectedDonor) {
      setNotice({ type: 'error', text: 'প্রথমে একজন দাতা নির্বাচন করুন।' });
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setNotice({ type: 'error', text: 'সঠিক টাকার পরিমাণ লিখুন।' });
      return;
    }

    if (!paymentDate) {
      setNotice({ type: 'error', text: 'পেমেন্টের তারিখ দিন।' });
      return;
    }

    try {
      await recordPayment({
        variables: {
          donorId: selectedDonor.id,
          amount: parsedAmount,
          paymentDate: toGraphqlDate(paymentDate),
        },
        refetchQueries: [
          { query: DONORS_QUERY, variables },
          { query: DASHBOARD_SUMMARY_QUERY },
          { query: DONOR_PAYMENTS_QUERY, variables: { donorId: selectedDonor.id } },
        ],
        awaitRefetchQueries: true,
      });

      setNotice({
        type: 'success',
        text: `${selectedDonor.name} এর চাঁদা সফলভাবে গ্রহণ হয়েছে।`,
      });
      setSelectedDonorId(null);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setNotice({ type: '', text: '' }), 3000);
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setNotice({
        type: 'error',
        text: graphMessage || 'পেমেন্ট যোগ করা যায়নি। আবার চেষ্টা করুন।',
      });
    }
  }

  return (
    <div style={{ minHeight: '100svh', background: '#f9fafb', position: 'relative' }}>
      {/* Success toast */}
      {notice.type === 'success' && notice.text ? (
        <div
          role="status"
          aria-live="polite"
          data-testid="donations-feedback-success"
          style={{
            position: 'fixed',
            top: isMobile ? 16 : 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#15803d',
            color: '#ffffff',
            borderRadius: 14,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            animation: 'toastIn 250ms ease-out',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 600 }}>{notice.text}</span>
        </div>
      ) : null}

      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: isMobile ? 0 : 64,
          zIndex: 10,
          background: '#ffffff',
          borderBottom: '1px solid #f3f4f6',
          padding: isMobile ? '14px 16px 0' : '16px 0 0',
        }}
      >
        <div className={isMobile ? '' : 'container'}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>চাঁদা সংগ্রহ</h1>
            {totalDues > 0 && (
              <span
                style={{
                  background: '#fef2f2',
                  color: '#ef4444',
                  borderRadius: 999,
                  padding: '3px 10px',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                মোট বকেয়া: {formatMoney(totalDues)}
              </span>
            )}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="donor-search"
              className="ds-input"
              type="search"
              placeholder="নাম বা সিরিয়াল নম্বর লিখুন"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="donations-search-input"
              style={{
                width: '100%',
                height: 48,
                borderRadius: 12,
                paddingLeft: 40,
                paddingRight: 14,
              }}
            />
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 12, overflowX: 'auto' }}>
            <select
              id="donor-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              data-testid="donations-address-filter"
              style={{
                height: 34,
                borderRadius: 999,
                border: '1px solid #d1d5db',
                background: '#fff',
                padding: '0 12px',
                fontSize: 17,
                color: '#374151',
                cursor: 'pointer',
                outline: 'none',
                flexShrink: 0,
              }}
            >
              <option value="">সব এলাকা</option>
              {addresses.map((row) => (
                <option key={row} value={row}>{row}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table header */}
      <div style={{ background: '#f0fdf4' }}>
        <div
          className={isMobile ? '' : 'container'}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#166534' }}>
            সিরিয়াল · নাম
          </span>
          <span style={{ width: 52, textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#166534' }}>
            মাসিক
          </span>
          <span style={{ width: 72, textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#166534' }}>
            বকেয়া
          </span>
        </div>
      </div>

      {/* Error / empty states */}
      <div className={isMobile ? '' : 'container'}>
        {error ? (
          <p style={{ margin: '16px', color: '#ef4444', fontSize: 18 }}>
            ডোনার তালিকা লোড করা যায়নি।
          </p>
        ) : null}

        {notice.type === 'error' && notice.text ? (
          <p
            role="alert"
            aria-live="polite"
            data-testid="donations-feedback-error"
            style={{
              margin: '10px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 18,
            }}
          >
            {notice.text}
          </p>
        ) : null}
      </div>

      {/* Donor list */}
      <div
        role="list"
        aria-label="দাতা তালিকা"
        data-testid="donations-donor-list"
        className={isMobile ? '' : 'container'}
      >
        {loading && donors.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: 18 }}>
            তালিকা লোড হচ্ছে...
          </p>
        ) : null}

        {!loading && donors.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: 18 }}>
            কোনো দাতা পাওয়া যায়নি।
          </p>
        ) : null}

        {donors.map((donor, index) => {
          const isSelected = donor.id === selectedDonorId;
          const isPaid = Number(donor.balance) <= 0;

          return (
            <button
              key={donor.id}
              type="button"
              role="listitem"
              onClick={() => setSelectedDonorId(donor.id)}
              data-testid={`donor-row-${donor.id}`}
              data-selected={isSelected ? 'true' : 'false'}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                minHeight: 68,
                padding: '12px 16px',
                background: isSelected ? '#f0fdf4' : index % 2 === 0 ? '#ffffff' : '#f9fafb',
                border: 'none',
                borderLeft: isSelected ? '3px solid #16a34a' : '3px solid transparent',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 10,
              }}
            >
              {/* Left: serial + name + address */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <SerialBadge number={donor.serial_number} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 600,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {donor.name}
                  </div>
                  <div style={{ fontSize: 16, color: '#9ca3af', marginTop: 1 }}>{donor.address}</div>
                </div>
              </div>

              {/* Monthly */}
              <div
                style={{
                  width: 52,
                  textAlign: 'right',
                  fontSize: 16,
                  color: '#6b7280',
                  flexShrink: 0,
                }}
              >
                {formatMoney(donor.monthly_amount)}
              </div>

              {/* Balance */}
              <div style={{ width: 72, textAlign: 'right', flexShrink: 0 }}>
                {isPaid ? (
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#16a34a' }}>✓ পরিশোধিত</span>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                    {formatMoney(donor.balance)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment popup — slide-up sheet on mobile, centered modal on desktop */}
      {selectedDonor ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="চাঁদা পেমেন্ট ফর্ম"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.48)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'flex-end' : 'center',
            alignItems: isMobile ? 'stretch' : 'center',
            padding: isMobile ? 0 : 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) dismissSheet(); }}
        >
          <div
            data-testid="donations-payment-sheet"
            style={{
              background: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : 20,
              boxShadow: isMobile ? '0 -8px 40px rgba(0,0,0,0.18)' : '0 20px 50px rgba(0,0,0,0.2)',
              maxHeight: isMobile ? '88svh' : '90svh',
              width: isMobile ? 'auto' : '100%',
              maxWidth: isMobile ? undefined : 560,
              overflowY: 'auto',
              animation: isMobile ? 'sheetUp 300ms ease-out' : 'none',
            }}
          >
            {/* Drag handle — mobile only */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                <div
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    background: '#d1d5db',
                  }}
                />
              </div>
            )}

            <div style={{ padding: isMobile ? '0 20px 32px' : '24px 20px 32px' }}>
              {/* Donor info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
                    {selectedDonor.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 17, color: '#6b7280' }}>{selectedDonor.address}</span>
                    <SerialBadge number={selectedDonor.serial_number} />
                    {Number(selectedDonor.balance) > 0 && (
                      <span
                        style={{
                          background: '#fef2f2',
                          color: '#ef4444',
                          borderRadius: 999,
                          padding: '2px 8px',
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        বকেয়া {formatMoney(selectedDonor.balance)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={dismissSheet}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    color: '#6b7280',
                  }}
                  aria-label="বন্ধ করুন"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <form onSubmit={submitPayment} style={{ display: 'grid', gap: 16 }}>
                {/* Amount input */}
                <div>
                  <label
                    htmlFor="payment-amount"
                    style={{ display: 'block', fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}
                  >
                    টাকার পরিমাণ (৳)
                  </label>
                  <input
                    id="payment-amount"
                    className="ds-input"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="donations-payment-amount-input"
                    style={{
                      width: '100%',
                      height: 60,
                      borderRadius: 12,
                      padding: '0 16px',
                      fontSize: 32,
                      fontWeight: 700,
                    }}
                  />
                </div>

                {/* Quick amount chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {QUICK_AMOUNTS.map((a) => {
                    const isActive = Number(amount) === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(String(a))}
                        style={{
                          padding: '6px 18px',
                          borderRadius: 999,
                          border: isActive ? 'none' : '1.5px solid #d1d5db',
                          background: isActive ? '#16a34a' : 'transparent',
                          color: isActive ? '#ffffff' : '#374151',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 18,
                          transition: 'all 150ms',
                        }}
                      >
                        ৳{a}
                      </button>
                    );
                  })}
                </div>

                {/* Date input */}
                <div>
                  <label
                    htmlFor="payment-date"
                    style={{ display: 'block', fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: 8 }}
                  >
                    তারিখ
                  </label>
                  <input
                    id="payment-date"
                    className="ds-input"
                    type="date"
                    value={paymentDate || toInputDate(selectedDonor.registration_date)}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    data-testid="donations-payment-date-input"
                    style={{
                      width: '100%',
                      height: 52,
                      borderRadius: 12,
                      padding: '0 14px',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentState.loading}
                  data-testid="donations-submit-payment"
                  style={{
                    height: 52,
                    background: paymentState.loading ? '#86efac' : '#16a34a',
                    color: '#ffffff',
                    border: 0,
                    borderRadius: 12,
                    fontSize: 20,
                    fontWeight: 600,
                    cursor: paymentState.loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                    transition: 'background 150ms',
                  }}
                >
                  {paymentState.loading ? 'সংরক্ষণ হচ্ছে...' : 'চাঁদা গ্রহণ করুন'}
                </button>
              </form>

              <div style={{ marginTop: 20 }}>
                <PaymentHistory donorId={selectedDonor.id} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <output data-testid="donations-selected-donor-id" hidden>
        {selectedDonorId || ''}
      </output>
    </div>
  );
}