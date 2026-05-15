import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Rahul Sharma', city: 'Mumbai', text: 'INFRAALL helped me find my dream apartment in just 3 days. The verified sellers gave me confidence and the chat feature made communication super easy.', rating: 5, color: '#f97316' },
  { name: 'Priya Patel', city: 'Bangalore', text: 'Got amazing furniture deals and the home service providers were professional. Best marketplace for everything home-related in India!', rating: 5, color: '#8b5cf6' },
  { name: 'Amit Singh', city: 'Delhi', text: 'Sold my property within 2 weeks of posting. The platform is clean, fast and the support team is very helpful throughout the process.', rating: 5, color: '#06b6d4' },
  { name: 'Sneha Reddy', city: 'Hyderabad', text: 'Found quality building materials at great prices for my new home construction. INFRAALL is truly a one-stop solution!', rating: 5, color: '#10b981' },
];

export default function TestimonialsSection() {
  return (
    <section style={{ background: '#fef9f0', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>What Our Customers Say</h2>
          <p style={{ fontSize: 15, color: '#64748b' }}>Trusted by thousands of happy customers across India</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.08 }}>
                <Quote size={48} color={t.color} />
              </div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />)}
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${t.color},${t.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

