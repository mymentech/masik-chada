import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { APP_SETTINGS_QUERY } from '../graphql/queries';
import { UPDATE_APP_SETTINGS_MUTATION } from '../graphql/mutations';
import { useIsMobile } from '../context/MobileContext';

export default function Settings() {
  const isMobile = useIsMobile();
  const { data, loading } = useQuery(APP_SETTINGS_QUERY, { fetchPolicy: 'cache-and-network' });
  const [updateSettings, state] = useMutation(UPDATE_APP_SETTINGS_MUTATION);
  const [allowDelete, setAllowDelete] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    if (data?.appSettings) setAllowDelete(Boolean(data.appSettings.allow_donor_delete));
  }, [data]);

  async function toggleDelete(next) {
    setAllowDelete(next);
    setNotice({ type: '', text: '' });
    try {
      await updateSettings({
        variables: { allowDonorDelete: next },
        refetchQueries: [{ query: APP_SETTINGS_QUERY }],
        awaitRefetchQueries: true,
      });
      setNotice({ type: 'success', text: next ? 'Delete বাটন চালু করা হয়েছে।' : 'Delete বাটন বন্ধ করা হয়েছে।' });
    } catch (err) {
      setAllowDelete(!next);
      setNotice({ type: 'error', text: err?.graphQLErrors?.[0]?.message || 'সেভ করা যায়নি।' });
    }
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100svh', padding: isMobile ? 16 : '24px 0' }}>
      <div className={isMobile ? '' : 'container'} style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>সেটিংস</h1>

        {notice.text && (
          <div
            style={{
              background: notice.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${notice.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              color: notice.type === 'error' ? '#991b1b' : '#166534',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 18,
            }}
          >
            {notice.text}
          </div>
        )}

        <section
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: isMobile ? 20 : 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>
                দাতা ডিলিট বাটন
              </h2>
              <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 17, lineHeight: 1.6 }}>
                বন্ধ থাকলে দাতা ম্যানেজমেন্ট পেজে Delete বাটন দেখানো হবে না এবং ডিলিট অপারেশন সার্ভার থেকেও
                ব্লক থাকবে। ভুলবশত দাতার তথ্য মুছে যাওয়া রোধ করতে এটি ডিফল্টভাবে বন্ধ।
              </p>
            </div>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                cursor: state.loading ? 'not-allowed' : 'pointer',
                opacity: state.loading ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 600, color: allowDelete ? '#15803d' : '#6b7280' }}>
                {allowDelete ? 'চালু' : 'বন্ধ'}
              </span>
              <span
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 46,
                  height: 26,
                  borderRadius: 999,
                  background: allowDelete ? '#16a34a' : '#d1d5db',
                  transition: 'background 150ms',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: allowDelete ? 22 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transition: 'left 150ms',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </span>
              <input
                type="checkbox"
                checked={allowDelete}
                disabled={state.loading || loading}
                onChange={(e) => toggleDelete(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
