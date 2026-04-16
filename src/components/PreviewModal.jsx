import { X, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { buildEmailHtml } from '../utils/htmlRenderer';

export default function PreviewModal({ elements, emailMeta, onClose }) {
  const [view, setView] = useState('desktop');
  const html = buildEmailHtml(elements, emailMeta);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-gray-900">Email Preview</h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor size={15} /> Desktop
            </button>
            <button
              onClick={() => setView('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone size={15} /> Mobile
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          <X size={15} /> Close Preview
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-gray-200 flex justify-center py-8">
        <div
          className={`bg-white shadow-2xl rounded transition-all ${
            view === 'mobile' ? 'w-[375px]' : 'w-[680px]'
          }`}
          style={{ minHeight: 400 }}
        >
          <iframe
            srcDoc={html}
            title="Email Preview"
            style={{ width: '100%', minHeight: 600, border: 'none', display: 'block' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
