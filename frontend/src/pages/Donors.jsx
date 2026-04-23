import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_DONOR_MUTATION,
  DELETE_DONOR_MUTATION,
  UPDATE_DONOR_MUTATION,
} from '../graphql/mutations';
import { DASHBOARD_SUMMARY_QUERY, DONORS_QUERY } from '../graphql/queries';
import { useIsMobile } from '../context/MobileContext';

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function toIsoDate(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function initialForm() {
  return {
    name: '',
    phone: '+880',
    address: '',
    monthly_amount: '100',
    registration_date: todayDateOnly(),
    due_from: '',
  };
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

function FormPanel({ editingDonor, form, updateField, onSubmit, onCancel, isSubmitting }) {
  const [focusedField, setFocusedField] = useState('');

  function inputStyle(name) {
    const focused = focusedField === name;
    return {
      width: '100%',
      height: 48,
      borderRadius: 12,
      border: focused ? '2px solid #16a34a' : '1.5px solid #d1d5db',
      background: '#f9fafb',
      padding: '0 14px',
      fontSize: 14,
      outline: 'none',
      boxShadow: focused ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none',
      transition: 'border-color 150ms, box-shadow 150ms',
    };
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 5,
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
      <div>
        <label htmlFor="name" style={labelStyle}>নাম</label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('name')}
        />
      </div>

      <div>
        <label htmlFor="phone" style={labelStyle}>ফোন</label>
        <input
          id="phone"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          onFocus={() => setFocusedField('phone')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('phone')}
        />
      </div>

      <div>
        <label htmlFor="address" style={labelStyle}>ঠিকানা</label>
        <input
          id="address"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          onFocus={() => setFocusedField('address')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('address')}
        />
      </div>

      <div>
        <label htmlFor="monthly_amount" style={labelStyle}>মাসিক চাঁদা</label>
        <input
          id="monthly_amount"
          type="number"
          min="1"
          step="1"
          value={form.monthly_amount}
          onChange={(e) => updateField('monthly_amount', e.target.value)}
          onFocus={() => setFocusedField('monthly_amount')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('monthly_amount')}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {QUICK_AMOUNTS.map((a) => {
            const isActive = Number(form.monthly_amount) === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => updateField('monthly_amount', String(a))}
                style={{
                  padding: '4px 14px',
                  borderRadius: 999,
                  border: isActive ? 'none' : '1.5px solid #d1d5db',
                  background: isActive ? '#16a34a' : 'transparent',
                  color: isActive ? '#ffffff' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                ৳{a}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="registration_date" style={labelStyle}>নিবন্ধনের তারিখ</label>
        <input
          id="registration_date"
          type="date"
          value={form.registration_date}
          onChange={(e) => updateField('registration_date', e.target.value)}
          onFocus={() => setFocusedField('registration_date')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('registration_date')}
        />
      </div>

      <div>
        <label htmlFor="due_from" style={labelStyle}>
          বকেয়া গণনার তারিখ{' '}
          <span style={{ fontWeight: 400, color: '#9ca3af' }}>(ঐচ্ছিক)</span>
        </label>
        <input
          id="due_from"
          type="date"
          value={form.due_from}
          onChange={(e) => updateField('due_from', e.target.value)}
          onFocus={() => setFocusedField('due_from')}
          onBlur={() => setFocusedField('')}
          style={inputStyle('due_from')}
        />
        {form.due_from && (
          <div
            style={{
              marginTop: 8,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: '10px 12px',
              color: '#92400e',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            এই তারিখ থেকে বকেয়া হিসাব শুরু হবে। রেজিস্ট্রেশন তারিখের আগে না দিলে রেজিস্ট্রেশন তারিখ ব্যবহার হবে।
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {editingDonor && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              height: 46,
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            বাতিল
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            flex: 2,
            height: 46,
            background: isSubmitting ? '#86efac' : '#16a34a',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
          }}
        >
          {isSubmitting
            ? 'সংরক্ষণ হচ্ছে...'
            : editingDonor
            ? 'আপডেট করুন'
            : 'যোগ করুন'}
        </button>
      </div>
    </form>
  );
}

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
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {number}
    </span>
  );
}

export default function Donors() {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [editingDonor, setEditingDonor] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showFormSheet, setShowFormSheet] = useState(false);

  const searchText = search.trim();
  const variables = useMemo(
    () => ({ search: searchText || undefined, address: undefined }),
    [searchText]
  );

  const { data, loading, error } = useQuery(DONORS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const donors = data?.donors || [];

  const [createDonor, createState] = useMutation(CREATE_DONOR_MUTATION);
  const [updateDonor, updateState] = useMutation(UPDATE_DONOR_MUTATION);
  const [deleteDonor, deleteState] = useMutation(DELETE_DONOR_MUTATION);

  const isSubmitting = createState.loading || updateState.loading || deleteState.loading;

  function beginCreate(clearMessage = true) {
    setEditingDonor(null);
    setForm(initialForm());
    if (clearMessage) setMessage({ type: '', text: '' });
  }

  function beginEdit(donor) {
    setEditingDonor(donor);
    setForm({
      name: donor.name || '',
      phone: donor.phone || '+880',
      address: donor.address || '',
      monthly_amount: String(donor.monthly_amount || 0),
      registration_date: toInputDate(donor.registration_date),
      due_from: toInputDate(donor.due_from),
    });
    setMessage({ type: '', text: '' });
    if (isMobile) setShowFormSheet(true);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    const monthly = Number(form.monthly_amount);
    if (!form.name.trim() || !form.address.trim() || !form.registration_date) {
      setMessage({ type: 'error', text: 'নাম, ঠিকানা এবং রেজিস্ট্রেশন তারিখ বাধ্যতামূলক।' });
      return;
    }

    if (!Number.isFinite(monthly) || monthly <= 0) {
      setMessage({ type: 'error', text: 'মাসিক টাকার পরিমাণ সঠিকভাবে দিন।' });
      return;
    }

    const input = {
      name: form.name.trim(),
      phone: form.phone.trim() || '+880',
      address: form.address.trim(),
      monthly_amount: monthly,
      registration_date: toIsoDate(form.registration_date),
      due_from: form.due_from ? toIsoDate(form.due_from) : null,
    };

    try {
      if (editingDonor) {
        await updateDonor({
          variables: { id: editingDonor.id, input },
          refetchQueries: [
            { query: DONORS_QUERY, variables },
            { query: DASHBOARD_SUMMARY_QUERY },
          ],
          awaitRefetchQueries: true,
        });
        setMessage({ type: 'success', text: 'ডোনারের তথ্য আপডেট হয়েছে।' });
      } else {
        await createDonor({
          variables: { input },
          refetchQueries: [
            { query: DONORS_QUERY, variables },
            { query: DASHBOARD_SUMMARY_QUERY },
          ],
          awaitRefetchQueries: true,
        });
        setMessage({ type: 'success', text: 'নতুন দাতা যোগ হয়েছে।' });
      }

      beginCreate(false);
      if (isMobile) setShowFormSheet(false);
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setMessage({ type: 'error', text: graphMessage || 'দাতা সংরক্ষণ করা যায়নি।' });
    }
  }

  async function removeDonor(donor) {
    setMessage({ type: '', text: '' });

    const approved = window.confirm(`${donor.name} এবং সংশ্লিষ্ট পেমেন্ট মুছে ফেলতে চান?`);
    if (!approved) return;

    try {
      const result = await deleteDonor({
        variables: { id: donor.id },
        refetchQueries: [
          { query: DONORS_QUERY, variables },
          { query: DASHBOARD_SUMMARY_QUERY },
        ],
        awaitRefetchQueries: true,
      });

      const success = result.data?.deleteDonor?.success;
      setMessage({
        type: success ? 'success' : 'error',
        text: result.data?.deleteDonor?.message || 'ডিলিট সম্পন্ন হয়েছে।',
      });

      if (editingDonor?.id === donor.id) beginCreate(false);
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setMessage({ type: 'error', text: graphMessage || 'দাতা ডিলিট করা যায়নি।' });
    }
  }

  /* ───────── Mobile layout ───────── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100svh', background: '#f9fafb' }}>
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#fff',
            borderBottom: '1px solid #f3f4f6',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
              দাতা ম্যানেজমেন্ট
              {donors.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {donors.length}
                </span>
              )}
            </h1>
            <button
              type="button"
              onClick={() => { beginCreate(); setShowFormSheet(true); }}
              style={{
                height: 36,
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '0 14px',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              নতুন দাতা
            </button>
          </div>

          <div style={{ position: 'relative' }}>
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
              id="donor-admin-search"
              className="ds-input"
              type="search"
              placeholder="নাম বা সিরিয়াল নম্বর"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', height: 44, borderRadius: 12, paddingLeft: 40, paddingRight: 14 }}
            />
          </div>
        </div>

        {/* Feedback */}
        {message.text && (
          <div
            style={{
              margin: '10px 16px 0',
              background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              color: message.type === 'error' ? '#991b1b' : '#166534',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
            }}
          >
            {message.text}
          </div>
        )}

        {error && (
          <p style={{ margin: '10px 16px', color: '#ef4444', fontSize: 14 }}>
            দাতা তালিকা আনা যায়নি।
          </p>
        )}

        {/* List */}
        <div style={{ padding: '8px 0' }}>
          {loading && donors.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 14 }}>
              লোড হচ্ছে...
            </p>
          )}

          {donors.map((donor, index) => {
            const isPaid = Number(donor.balance) <= 0;
            return (
              <div
                key={donor.id}
                style={{
                  background: index % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0 }}>
                    <SerialBadge number={donor.serial_number} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{donor.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{donor.address}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
                        মাসিক: {formatMoney(donor.monthly_amount)}
                        {' · '}
                        {isPaid ? (
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>পরিশোধিত</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            বকেয়া: {formatMoney(donor.balance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => beginEdit(donor)}
                      style={{
                        background: '#dbeafe',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: 8,
                        height: 30,
                        padding: '0 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      এডিট
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDonor(donor)}
                      style={{
                        background: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: 8,
                        height: 30,
                        padding: '0 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ডিলিট
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form bottom sheet */}
        {showFormSheet && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="দাতা ফর্ম"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.48)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowFormSheet(false); }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
                maxHeight: '92svh',
                overflowY: 'auto',
                animation: 'sheetUp 300ms ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db' }} />
              </div>
              <div style={{ padding: '4px 20px 40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                    {editingDonor ? 'দাতা আপডেট' : 'নতুন দাতা যোগ করুন'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowFormSheet(false)}
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
                <FormPanel
                  editingDonor={editingDonor}
                  form={form}
                  updateField={updateField}
                  onSubmit={submitForm}
                  onCancel={() => { beginCreate(); setShowFormSheet(false); }}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ───────── Desktop layout ───────── */
  return (
    <div style={{ background: '#f9fafb', minHeight: '100svh', padding: '24px 0' }}>
      <div
        className="container"
        style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}
      >
        {/* Left — donor table */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                দাতা ম্যানেজমেন্ট
                {donors.length > 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: 999,
                      padding: '2px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {donors.length}
                  </span>
                )}
              </h1>
              <button
                type="button"
                onClick={() => beginCreate()}
                style={{
                  height: 38,
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                নতুন দাতা যোগ
              </button>
            </div>

            <div style={{ position: 'relative' }}>
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
                id="donor-admin-search"
                className="ds-input"
                type="search"
                placeholder="নাম বা সিরিয়াল নম্বর"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', height: 44, borderRadius: 12, paddingLeft: 40, paddingRight: 14 }}
              />
            </div>
          </div>

          {/* Feedback */}
          {message.text && (
            <div
              style={{
                margin: '12px 20px 0',
                background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                color: message.type === 'error' ? '#991b1b' : '#166534',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
              }}
            >
              {message.text}
            </div>
          )}

          {error && (
            <p style={{ margin: '12px 20px', color: '#ef4444', fontSize: 14 }}>
              দাতা তালিকা আনা যায়নি।
            </p>
          )}

          {/* Column headers */}
          <div
            style={{
              background: '#f0fdf4',
              padding: '8px 20px',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 100px 90px 100px',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {['ক্র.', 'নাম', 'ঠিকানা', 'মাসিক', 'বকেয়া', 'অ্যাকশন'].map((col) => (
              <span key={col} style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {loading && donors.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: 14 }}>
              লোড হচ্ছে...
            </p>
          )}

          {donors.map((donor, index) => {
            const isPaid = Number(donor.balance) <= 0;
            return (
              <div
                key={donor.id}
                style={{
                  background: index % 2 === 0 ? '#fff' : '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  padding: '12px 20px',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 120px 100px 90px 100px',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <SerialBadge number={donor.serial_number} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{donor.name}</div>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {donor.address}
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>{formatMoney(donor.monthly_amount)}</div>
                <div>
                  {isPaid ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>পরিশোধিত</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                      {formatMoney(donor.balance)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => beginEdit(donor)}
                    style={{
                      background: '#dbeafe',
                      color: '#2563eb',
                      border: 'none',
                      borderRadius: 8,
                      height: 32,
                      padding: '0 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    এডিট
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDonor(donor)}
                    style={{
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: 8,
                      height: 32,
                      padding: '0 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ডিলিট
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — form panel */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: 88,
          }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {editingDonor ? 'দাতা আপডেট' : 'নতুন দাতা যোগ করুন'}
          </h2>
          <FormPanel
            editingDonor={editingDonor}
            form={form}
            updateField={updateField}
            onSubmit={submitForm}
            onCancel={() => beginCreate()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}