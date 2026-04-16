import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CATEGORIES, ELEMENT_TEMPLATES } from '../data/elements';
import ThumbnailPreview from './ElementThumbnail';

export default function ElementsSidebar({ onAdd }) {
  const [activeCategory, setActiveCategory] = useState('header');

  const templates = ELEMENT_TEMPLATES[activeCategory] || [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Dark category list */}
      <div
        className="overflow-y-auto shrink-0"
        style={{ width: 168, background: '#1e2030' }}
      >
        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6b7280' }}>
            Components
          </p>
        </div>
        <div className="flex flex-col gap-0.5 px-2 pb-4">
          {CATEGORIES.map(cat => {
            const count = (ELEMENT_TEMPLATES[cat.id] || []).length;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  background: active ? '#2d3250' : 'transparent',
                  color: active ? '#ffffff' : '#9ca3af',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#252840'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="text-sm font-medium">{cat.label}</span>
                <span
                  className="text-xs font-semibold tabular-nums ml-2 rounded px-1.5 py-0.5"
                  style={{
                    background: active ? '#4f5db3' : '#2a2d40',
                    color: active ? '#c7d2fe' : '#6b7280',
                    minWidth: 22,
                    textAlign: 'center',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: 2-column thumbnail grid */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#181a27' }}>
        {/* Section header */}
        <div
          className="sticky top-0 z-10 px-4 pt-4 pb-3"
          style={{ background: '#181a27', borderBottom: '1px solid #2a2d3e' }}
        >
          <p className="text-sm font-semibold text-white">
            {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid */}
        <div className="p-3 grid grid-cols-2 gap-3">
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="group cursor-pointer rounded-xl overflow-hidden transition-all"
              style={{ border: '1px solid #2a2d3e' }}
              onClick={() => onAdd({ type: tmpl.id, props: { ...tmpl.defaults } })}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid #6366f1';
                e.currentTarget.style.boxShadow = '0 0 0 1px #6366f1';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid #2a2d3e';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Thumbnail area */}
              <div
                className="w-full overflow-hidden"
                style={{ background: '#252840', padding: 8 }}
              >
                <div className="rounded-lg overflow-hidden" style={{ background: '#fff' }}>
                  <ThumbnailPreview thumbnail={tmpl.thumbnail} label={tmpl.label} />
                </div>
              </div>
              {/* Label */}
              <div
                className="px-2.5 py-2 transition-colors"
                style={{ background: '#1e2030' }}
              >
                <p className="text-xs font-medium leading-tight" style={{ color: '#d1d5db' }}>
                  {tmpl.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
