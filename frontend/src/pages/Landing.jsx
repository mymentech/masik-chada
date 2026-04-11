import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="hero-wrap container">
      <section className="hero">
        <p className="eyebrow">ময়দানে মুহাম্মাদ</p>
        <h1>মাসিক সাবস্ক্রিপশন ও কালেকশন ম্যানেজমেন্ট</h1>
        <p>
          মাঠ পর্যায়ের কালেকশন কাজকে দ্রুত, নির্ভুল এবং মোবাইল-ফার্স্ট রাখতে
          তৈরি করা হয়েছে এই সিস্টেম।
        </p>
        <Link to="/login" className="primary-btn">
          লগইন করুন
        </Link>
      </section>
    </main>
  );
}
