'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink/85">
        {label}
        {required ? <span className="ml-0.5 text-wine-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'w-full rounded-2xl border border-wine-900/10 bg-white px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink/35 focus:border-wine-400 focus:ring-4 focus:ring-wine-100 disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref,
) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', rows = 4, ...props },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={`${inputBase} resize-y leading-relaxed ${className}`} {...props} />;
});

export function Spinner({ size = 18, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function Switch({
  checked,
  onChange,
  label,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  text?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-wine-900/10 bg-white px-4 py-3.5 text-left transition hover:border-wine-300"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {text ? <span className="mt-0.5 block text-xs text-ink/50">{text}</span> : null}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-wine-600' : 'bg-ink/15'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-wine-900/15 bg-white/60 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-wine-50 text-wine-600">{icon}</span>
      <h3 className="mt-5 font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">{text}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
