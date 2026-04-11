import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_DONOR_MUTATION,
  DELETE_DONOR_MUTATION,
  UPDATE_DONOR_MUTATION
} from '../graphql/mutations';
import { DASHBOARD_SUMMARY_QUERY, DONORS_QUERY } from '../graphql/queries';

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(value) {
  if (!value) {
    return '';
  }
  return new Date(value).toISOString().slice(0, 10);
}

function toIsoDate(value) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function formatMoney(value) {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function initialForm() {
  return {
    name: '',
    phone: '+880',
    address: '',
    monthly_amount: '100',
    registration_date: todayDateOnly(),
    due_from: ''
  };
}

export default function Donors() {
  const [search, setSearch] = useState('');
  const [editingDonor, setEditingDonor] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [message, setMessage] = useState({ type: '', text: '' });

  const searchText = search.trim();
  const variables = useMemo(
    () => ({
      search: searchText || undefined,
      address: undefined
    }),
    [searchText]
  );

  const { data, loading, error } = useQuery(DONORS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network'
  });

  const donors = data?.donors || [];

  const [createDonor, createState] = useMutation(CREATE_DONOR_MUTATION);
  const [updateDonor, updateState] = useMutation(UPDATE_DONOR_MUTATION);
  const [deleteDonor, deleteState] = useMutation(DELETE_DONOR_MUTATION);

  const isSubmitting = createState.loading || updateState.loading || deleteState.loading;

  function beginCreate(clearMessage = true) {
    setEditingDonor(null);
    setForm(initialForm());
    if (clearMessage) {
      setMessage({ type: '', text: '' });
    }
  }

  function beginEdit(donor) {
    setEditingDonor(donor);
    setForm({
      name: donor.name || '',
      phone: donor.phone || '+880',
      address: donor.address || '',
      monthly_amount: String(donor.monthly_amount || 0),
      registration_date: toInputDate(donor.registration_date),
      due_from: toInputDate(donor.due_from)
    });
    setMessage({ type: '', text: '' });
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
      due_from: form.due_from ? toIsoDate(form.due_from) : null
    };

    try {
      if (editingDonor) {
        await updateDonor({
          variables: { id: editingDonor.id, input },
          refetchQueries: [
            { query: DONORS_QUERY, variables },
            { query: DASHBOARD_SUMMARY_QUERY }
          ],
          awaitRefetchQueries: true
        });

        setMessage({ type: 'success', text: 'ডোনারের তথ্য আপডেট হয়েছে।' });
      } else {
        await createDonor({
          variables: { input },
          refetchQueries: [
            { query: DONORS_QUERY, variables },
            { query: DASHBOARD_SUMMARY_QUERY }
          ],
          awaitRefetchQueries: true
        });

        setMessage({ type: 'success', text: 'নতুন ডোনার যোগ হয়েছে।' });
      }

      beginCreate(false);
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setMessage({
        type: 'error',
        text: graphMessage || 'ডোনার সংরক্ষণ করা যায়নি।'
      });
    }
  }

  async function removeDonor(donor) {
    setMessage({ type: '', text: '' });

    const approved = window.confirm(`${donor.name} এবং সংশ্লিষ্ট পেমেন্ট মুছে ফেলতে চান?`);
    if (!approved) {
      return;
    }

    try {
      const result = await deleteDonor({
        variables: { id: donor.id },
        refetchQueries: [
          { query: DONORS_QUERY, variables },
          { query: DASHBOARD_SUMMARY_QUERY }
        ],
        awaitRefetchQueries: true
      });

      const success = result.data?.deleteDonor?.success;
      setMessage({
        type: success ? 'success' : 'error',
        text: result.data?.deleteDonor?.message || 'ডিলিট সম্পন্ন হয়েছে।'
      });

      if (editingDonor?.id === donor.id) {
        beginCreate(false);
      }
    } catch (mutationError) {
      const graphMessage = mutationError?.graphQLErrors?.[0]?.message;
      setMessage({ type: 'error', text: graphMessage || 'ডোনার ডিলিট করা যায়নি।' });
    }
  }

  return (
    <section className="container donors-page">
      <div className="page-shell">
        <h1>ডোনার ম্যানেজমেন্ট</h1>

        <label htmlFor="donor-admin-search" className="field-label">সার্চ</label>
        <input
          id="donor-admin-search"
          className="search-input"
          type="search"
          placeholder="নাম বা সিরিয়াল নম্বর"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {message.text ? (
          <p className={message.type === 'error' ? 'feedback-error' : 'feedback-success'}>{message.text}</p>
        ) : null}

        {error ? <p className="feedback-error">ডোনার তালিকা আনা যায়নি।</p> : null}

        <div className="donor-admin-list">
          {loading && donors.length === 0 ? <p>ডোনার লোড হচ্ছে...</p> : null}

          {donors.map((donor) => (
            <article key={donor.id} className="donor-admin-card">
              <div>
                <h2>#{donor.serial_number} - {donor.name}</h2>
                <p>{donor.address}</p>
                <p>মাসিক: {formatMoney(donor.monthly_amount)} | বকেয়া: {formatMoney(donor.balance)}</p>
              </div>
              <div className="card-actions">
                <button type="button" className="tap-btn ghost-btn" onClick={() => beginEdit(donor)}>
                  এডিট
                </button>
                <button type="button" className="tap-btn danger-btn" onClick={() => removeDonor(donor)}>
                  ডিলিট
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="page-shell donor-form-shell">
        <div className="form-header-row">
          <h2>{editingDonor ? 'ডোনার আপডেট' : 'নতুন ডোনার যোগ করুন'}</h2>
          {editingDonor ? (
            <button type="button" className="ghost-btn tap-btn" onClick={beginCreate}>
              নতুন ফর্ম
            </button>
          ) : null}
        </div>

        <form className="donor-form-grid" onSubmit={submitForm}>
          <label htmlFor="name" className="field-label">নাম</label>
          <input id="name" className="sheet-input" value={form.name} onChange={(event) => updateField('name', event.target.value)} />

          <label htmlFor="phone" className="field-label">ফোন</label>
          <input id="phone" className="sheet-input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />

          <label htmlFor="address" className="field-label">ঠিকানা</label>
          <input id="address" className="sheet-input" value={form.address} onChange={(event) => updateField('address', event.target.value)} />

          <label htmlFor="monthly_amount" className="field-label">মাসিক টাকা</label>
          <input
            id="monthly_amount"
            className="sheet-input"
            type="number"
            min="1"
            step="1"
            value={form.monthly_amount}
            onChange={(event) => updateField('monthly_amount', event.target.value)}
          />

          <label htmlFor="registration_date" className="field-label">রেজিস্ট্রেশন তারিখ</label>
          <input
            id="registration_date"
            className="sheet-input"
            type="date"
            value={form.registration_date}
            onChange={(event) => updateField('registration_date', event.target.value)}
          />

          <label htmlFor="due_from" className="field-label">অ্যামনেস্টি তারিখ (ঐচ্ছিক)</label>
          <input
            id="due_from"
            className="sheet-input"
            type="date"
            value={form.due_from}
            onChange={(event) => updateField('due_from', event.target.value)}
          />

          <button type="submit" className="primary-btn full-width tap-btn" disabled={isSubmitting}>
            {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingDonor ? 'আপডেট করুন' : 'যোগ করুন'}
          </button>
        </form>
      </div>
    </section>
  );
}
