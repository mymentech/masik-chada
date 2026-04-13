import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { RECORD_PAYMENT_MUTATION } from '../graphql/mutations';
import { ADDRESSES_QUERY, DASHBOARD_SUMMARY_QUERY, DONORS_QUERY } from '../graphql/queries';

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(value) {
  if (!value) {
    return '';
  }
  return new Date(value).toISOString().slice(0, 10);
}

function toGraphqlDate(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debounced;
}

export default function Donations() {
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayIsoDate());
  const [notice, setNotice] = useState({ type: '', text: '' });

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const variables = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      address: address || undefined
    }),
    [debouncedSearch, address]
  );

  const { data, loading, error } = useQuery(DONORS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network'
  });
  const { data: addressesData } = useQuery(ADDRESSES_QUERY, {
    fetchPolicy: 'cache-first'
  });

  const donors = data?.donors || [];
  const addresses = addressesData?.addresses || [];
  const selectedDonor = donors.find((donor) => donor.id === selectedDonorId) || null;

  const [recordPayment, paymentState] = useMutation(RECORD_PAYMENT_MUTATION);

  useEffect(() => {
    if (!selectedDonorId || selectedDonor) {
      return;
    }

    setSelectedDonorId(null);
  }, [selectedDonorId, selectedDonor]);

  useEffect(() => {
    if (!selectedDonor) {
      return;
    }

    setAmount(String(selectedDonor.monthly_amount));
    setPaymentDate(todayIsoDate());
  }, [selectedDonor]);

  async function submitPayment(event) {
    event.preventDefault();
    setNotice({ type: '', text: '' });

    if (!selectedDonor) {
      setNotice({ type: 'error', text: 'প্রথমে একজন ডোনার নির্বাচন করুন।' });
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
          paymentDate: toGraphqlDate(paymentDate)
        },
        refetchQueries: [
          { query: DONORS_QUERY, variables },
          { query: DASHBOARD_SUMMARY_QUERY }
        ],
        awaitRefetchQueries: true
      });

      setNotice({ type: 'success', text: `${selectedDonor.name} এর পেমেন্ট সফলভাবে যোগ হয়েছে।` });
      setSelectedDonorId(null);
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setNotice({
        type: 'error',
        text: graphMessage || 'পেমেন্ট যোগ করা যায়নি। আবার চেষ্টা করুন।'
      });
    }
  }

  return (
    <section className="container donations-page">
      <div className="page-shell">
        <h1>দান সংগ্রহ</h1>
        <p className="hint-text">
          মোবাইল কালেকশনের জন্য ডোনার সিলেক্ট করে দ্রুত পেমেন্ট যোগ করুন।
          সার্চ ফলাফল ৩০০ms ডিবাউন্সে আপডেট হয়।
        </p>

        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="donor-search" className="field-label">ডোনার সার্চ</label>
            <input
              id="donor-search"
              className="search-input"
              type="search"
              placeholder="নাম বা সিরিয়াল নম্বর লিখুন"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="donations-search-input"
            />
          </div>

          <div className="filter-field">
            <label htmlFor="donor-address" className="field-label">এলাকা ফিল্টার</label>
            <select
              id="donor-address"
              className="sheet-input"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              data-testid="donations-address-filter"
            >
              <option value="">সব এলাকা</option>
              {addresses.map((row) => (
                <option key={row} value={row}>
                  {row}
                </option>
              ))}
            </select>
          </div>
        </div>

        {notice.text ? (
          <p
            className={notice.type === 'error' ? 'feedback-error' : 'feedback-success'}
            role="status"
            aria-live="polite"
            data-testid={notice.type === 'error' ? 'donations-feedback-error' : 'donations-feedback-success'}
          >
            {notice.text}
          </p>
        ) : null}

        {error ? <p className="feedback-error">ডোনার তালিকা লোড করা যায়নি।</p> : null}

        <div className="donor-list" role="list" aria-label="ডোনার তালিকা" data-testid="donations-donor-list">
          {loading && donors.length === 0 ? <p>ডোনার তালিকা লোড হচ্ছে...</p> : null}

          {!loading && donors.length === 0 ? <p>কোনো ডোনার পাওয়া যায়নি।</p> : null}

          {donors.map((donor) => {
            const isSelected = donor.id === selectedDonorId;

            return (
              <button
                key={donor.id}
                type="button"
                className={isSelected ? 'donor-row donor-row-active' : 'donor-row'}
                onClick={() => setSelectedDonorId(donor.id)}
                data-testid={`donor-row-${donor.id}`}
                data-selected={isSelected ? 'true' : 'false'}
              >
                <div className="donor-row-top">
                  <strong>#{donor.serial_number} - {donor.name}</strong>
                  <span>{formatMoney(donor.balance)}</span>
                </div>
                <div className="donor-row-meta">
                  <span>{donor.address}</span>
                  <span>মাসিক: {formatMoney(donor.monthly_amount)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDonor ? (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="পেমেন্ট ফর্ম">
          <div className="bottom-sheet" data-testid="donations-payment-sheet">
            <div className="sheet-header">
              <div>
                <h2>{selectedDonor.name}</h2>
                <p>বকেয়া: {formatMoney(selectedDonor.balance)}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={() => setSelectedDonorId(null)}>
                বন্ধ
              </button>
            </div>

            <form className="sheet-form" onSubmit={submitPayment}>
              <label htmlFor="payment-amount" className="field-label">টাকার পরিমাণ</label>
              <input
                id="payment-amount"
                className="sheet-input"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                data-testid="donations-payment-amount-input"
              />

              <label htmlFor="payment-date" className="field-label">তারিখ</label>
              <input
                id="payment-date"
                className="sheet-input"
                type="date"
                value={paymentDate || toInputDate(selectedDonor.registration_date)}
                onChange={(event) => setPaymentDate(event.target.value)}
                data-testid="donations-payment-date-input"
              />

              <button
                type="submit"
                className="primary-btn full-width tap-btn"
                disabled={paymentState.loading}
                data-testid="donations-submit-payment"
              >
                {paymentState.loading ? 'সংরক্ষণ হচ্ছে...' : 'পেমেন্ট যোগ করুন'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <output data-testid="donations-selected-donor-id" hidden>
        {selectedDonorId || ''}
      </output>
    </section>
  );
}
