import { Link } from 'react-router-dom';
import LogoMark from '../components/LogoMark';

const features = [
  {
    title: 'মাসিক চাঁদা ট্র্যাকিং',
    text: 'প্রত্যেক দাতার মাসিক চাঁদা, পরিশোধিত ও বকেয়া স্বয়ংক্রিয়ভাবে হিসাব করা হয়।',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: 'কালেকশন রিপোর্ট',
    text: 'মাস অনুযায়ী কালেক্টরভিত্তিক বিস্তারিত রিপোর্ট ও PDF এক্সপোর্ট সুবিধা।',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'মোবাইল-ফার্স্ট',
    text: 'মাঠে বসে দ্রুত চাঁদা গ্রহণ — মোবাইলে অপ্টিমাইজড চমৎকার ইন্টারফেস।',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    title: 'নিরাপদ ও ভূমিকা-ভিত্তিক',
    text: 'অ্যাডমিন ও কালেক্টর আলাদা সুবিধা — পাসওয়ার্ড সুরক্ষিত, টোকেন-ভিত্তিক লগইন।',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100svh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(255,255,255,0.96)',
          borderBottom: '1px solid #f3f4f6',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div
          className="container"
          style={{
            minHeight: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={36} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#166534', lineHeight: 1.1 }}>
                ময়দানে মুহাম্মাদ
              </div>
              <div style={{ fontSize: 14, color: '#16a34a', letterSpacing: '0.3px' }}>
                Maidan-e-Muhammad
              </div>
            </div>
          </div>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              padding: '0 18px',
              background: '#16a34a',
              color: '#ffffff',
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 10px rgba(22,163,74,0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            লগইন
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(160deg, #166534 0%, #15803d 100%)',
          color: '#ffffff',
          padding: '72px 0 88px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LogoMark size={80} bg="rgba(255,255,255,0.18)" />
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: 17, letterSpacing: 2, textTransform: 'uppercase' }}>
            Maidan-e-Muhammad
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(32px, 4.2vw, 48px)', fontWeight: 700, lineHeight: 1.2 }}>
            মাসিক সাবস্ক্রিপশন ও কালেকশন ম্যানেজমেন্ট
          </h1>
          <p
            style={{
              margin: '0 auto',
              maxWidth: 640,
              fontSize: 20,
              color: 'rgba(255,255,255,0.88)',
              lineHeight: 1.7,
            }}
          >
            মাঠ পর্যায়ের চাঁদা সংগ্রহ এবং দাতা ব্যবস্থাপনাকে সহজ, নির্ভুল ও মোবাইল-বান্ধব করে তোলার জন্য
            তৈরি করা একটি সম্পূর্ণ সিস্টেম। বকেয়া, আদায়, কালেক্টর রিপোর্ট — সবকিছু এক জায়গায়।
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 50,
                padding: '0 28px',
                background: '#ffffff',
                color: '#166534',
                borderRadius: 12,
                fontSize: 19,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              প্রবেশ করুন
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '56px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ color: '#16a34a', fontSize: 16, fontWeight: 700, letterSpacing: 2, margin: 0, textTransform: 'uppercase' }}>
              যে সুবিধাগুলো পাবেন
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(26px, 3vw, 34px)', color: '#111827', fontWeight: 700 }}>
              একটি প্ল্যাটফর্মে পুরো কালেকশন ম্যানেজমেন্ট
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '22px 20px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  {feature.icon}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.6 }}>{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ padding: '24px 0 56px' }}>
        <div className="container">
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 'clamp(24px, 4vw, 40px)',
              border: '1px solid #f3f4f6',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 'clamp(24px, 2.4vw, 30px)', color: '#111827', fontWeight: 700 }}>
              এখনই শুরু করুন
            </h3>
            <p style={{ margin: 0, color: '#6b7280', maxWidth: 520 }}>
              অ্যাকাউন্ট প্রস্তুত থাকলে প্রবেশ করুন। অ্যাকাউন্ট না থাকলে অ্যাডমিনের সাথে যোগাযোগ করুন।
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 48,
                padding: '0 24px',
                background: '#16a34a',
                color: '#ffffff',
                borderRadius: 12,
                fontSize: 19,
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: 6,
              }}
            >
              লগইন করুন
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ padding: '20px 0 32px', borderTop: '1px solid #f3f4f6', background: '#ffffff' }}>
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={28} />
            <span style={{ fontSize: 17, color: '#6b7280' }}>
              © {new Date().getFullYear()} ময়দানে মুহাম্মাদ
            </span>
          </div>
          <Link to="/login" style={{ fontSize: 17, color: '#16a34a', fontWeight: 600 }}>
            প্রবেশ করুন →
          </Link>
        </div>
      </footer>
    </div>
  );
}
