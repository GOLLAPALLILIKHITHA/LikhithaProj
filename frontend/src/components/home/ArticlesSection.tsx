import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { articles, articleList } from '../../data/articles';

export default function ArticlesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section style={{ background: '#fff7ed', padding: '48px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>Knowledge Centre</h2>
            <p style={{ fontSize: 14, color: '#92400e' }}>Real insights from trusted sources — rent rules, RERA rights, market trends & more</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => scroll('left')} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #fed7aa', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={18} color="#92400e" />
            </button>
            <button onClick={() => scroll('right')} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #fed7aa', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={18} color="#92400e" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }} className="no-scrollbar">
          {articleList.map((a) => {
            const art = articles[a.slug];
            if (!art) return null;
            return (
              <div key={a.slug} onClick={() => navigate(`/articles/${a.slug}`)}
                style={{ minWidth: 300, maxWidth: 300, flexShrink: 0, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(249,115,22,0.08)', border: '1px solid #fed7aa', cursor: 'pointer', transition: 'all 0.2s', scrollSnapAlign: 'start' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(249,115,22,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(249,115,22,0.08)'; }}>
                <div style={{ height: 120, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                  {a.emoji}
                  <span style={{ position: 'absolute', top: 10, left: 10, background: a.tagColor, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{a.tag}</span>
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#92400e' }}>{art.author.split(' ')[0]}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#fed7aa' }} />
                    <span style={{ fontSize: 11, background: '#fff7ed', color: '#92400e', padding: '2px 8px', borderRadius: 10 }}>{art.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#92400e', marginLeft: 'auto' }}>
                      <Clock size={11} /> {art.readTime}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7c2d12', marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{art.title}</h3>
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{art.summary}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#92400e' }}>{art.date} · {art.source}</span>
                    <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Read <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: '#92400e', marginTop: 12, textAlign: 'center' }}>
          Swipe or use arrows · {articleList.length} articles from trusted sources
        </p>
      </div>
    </section>
  );
}

