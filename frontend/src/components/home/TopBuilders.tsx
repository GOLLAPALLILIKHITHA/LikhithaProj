import { Star } from 'lucide-react';

const builders = [
  { name: 'Lodha Group', exp: '45 yrs', projects: 120, desc: 'One of India\'s largest real estate developers known for luxury and affordable housing across major cities.', emoji: '🏗️' },
  { name: 'Godrej Properties', exp: '32 yrs', projects: 85, desc: 'Bringing the Godrej legacy of trust and excellence to real estate across India with premium projects.', emoji: '🏢' },
  { name: 'Prestige Group', exp: '38 yrs', projects: 95, desc: 'Leading real estate developer in South India with landmark projects in Bangalore, Chennai and Hyderabad.', emoji: '🏛️' },
  { name: 'DLF Limited', exp: '75 yrs', projects: 200, desc: 'India\'s largest real estate company with strong presence in residential, commercial and retail segments.', emoji: '🌆' },
];

export default function TopBuilders() {
  return (
    <section style={{ background: '#fff7ed', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>Top Builders</h2>
          <p style={{ fontSize: 14, color: '#92400e' }}>Most credible developers in India</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {builders.map((b, i) => (
            <div key={i}
              style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #fed7aa', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249,115,22,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#fed7aa'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid #4338ca' }}>
                  {b.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#7c2d12' }}>{b.name}</div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                    {[...Array(5)].map((_, j) => <Star key={j} size={11} fill="#fbbf24" color="#fbbf24" />)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f97316' }}>{b.exp}</div>
                  <div style={{ fontSize: 11, color: '#92400e' }}>Experience</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#f97316' }}>{b.projects}+</div>
                  <div style={{ fontSize: 11, color: '#92400e' }}>Projects</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, marginBottom: 12 }}>{b.desc}</p>
              <button style={{ width: '100%', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#ea580c', padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                View Projects
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

