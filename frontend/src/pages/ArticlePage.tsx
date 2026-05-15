import { useParams, Link } from 'react-router-dom';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { articles, relatedTitles } from '../data/articles';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;

  if (!article) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>📰</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#7c2d12' }}>Article not found</h2>
      <Link to="/" style={{ color: '#f97316', fontWeight: 600 }}>← Back to Home</Link>
    </div>
  );

  return (
    <div style={{ background: '#fff7ed', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#7c2d12,#92400e)', padding: '48px 32px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fed7aa', fontSize: 13, textDecoration: 'none', marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <span style={{ background: article.tagColor, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, display: 'inline-block', marginBottom: 16 }}>{article.tag}</span>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff7ed', lineHeight: 1.25, marginBottom: 16 }}>{article.title}</h1>
          <p style={{ fontSize: 15, color: '#fed7aa', lineHeight: 1.7, marginBottom: 24 }}>{article.summary}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{article.author[0]}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff7ed' }}>{article.author}</div>
                <div style={{ fontSize: 12, color: '#fed7aa' }}>{article.authorRole} · {article.city}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fed7aa', fontSize: 13 }}><Clock size={13} /> {article.readTime}</div>
            <div style={{ fontSize: 13, color: '#fed7aa' }}>{article.date}</div>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#fde68a', marginLeft: 'auto' }}>Source: {article.source} ↗</a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '40px', boxShadow: '0 2px 8px rgba(249,115,22,0.08)', marginBottom: 32, border: '1px solid #fed7aa' }}>
          {article.content.map((block, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              {block.heading && (
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#7c2d12', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #fff7ed' }}>
                  {block.heading}
                </h2>
              )}
              {block.text.split('\n\n').map((para, j) => (
                <p key={j} style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 12 }}>{para}</p>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff7ed', borderRadius: 8, fontSize: 12, color: '#92400e', borderLeft: '3px solid #f97316' }}>
            Content sourced and summarized from{' '}
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', fontWeight: 600 }}>{article.source}</a>.
            Content was rephrased for compliance with licensing restrictions.
          </div>
        </div>

        {/* Related Articles */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#7c2d12', marginBottom: 16 }}>Related Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {article.related.filter(r => relatedTitles[r]).map(rel => (
              <Link key={rel} to={`/articles/${rel}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: '16px 20px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(249,115,22,0.08)', border: '1px solid #fed7aa' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#f97316'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#fed7aa'}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12' }}>{relatedTitles[rel]}</span>
                <ArrowRight size={16} color="#f97316" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

