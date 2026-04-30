import { Loader2 } from 'lucide-react';

export default function LoadingOverlay({ message = 'Loading…' }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'rgba(15, 17, 30, 0.65)', backdropFilter: 'blur(2px)' }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="flex flex-col items-center gap-3 px-6 py-5 rounded-xl border shadow-2xl"
        style={{ background: '#1e2030', borderColor: '#3d4060', minWidth: 220 }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: '#818cf8' }} />
        <p className="text-sm font-medium" style={{ color: '#e5e7eb' }}>{message}</p>
      </div>
    </div>
  );
}
