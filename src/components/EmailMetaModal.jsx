import { X, Mail } from 'lucide-react';

export default function EmailMetaModal({ meta, onChange, onClose, onExport }) {
  const field = (label, key, placeholder = '') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={meta[key] || ''}
        onChange={e => onChange({ ...meta, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Export EML</h2>
              <p className="text-xs text-gray-400">Configure email headers</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          {field('Subject *', 'subject', 'Your email subject line')}
          {field('From', 'from', 'sender@example.com')}
          {field('To', 'to', 'recipient@example.com')}
          {field('CC', 'cc', 'cc@example.com')}
          {field('BCC', 'bcc', 'bcc@example.com')}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Open the exported .eml file directly in Outlook to compose and send it. The To/From/CC fields can be changed in Outlook before sending.
            </p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onExport}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Download .eml
          </button>
        </div>
      </div>
    </div>
  );
}
