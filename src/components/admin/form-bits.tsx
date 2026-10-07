"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-ink/70">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("input min-h-[6rem] font-mono text-[13px] leading-relaxed", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("input", props.className)} />;
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-navy/10 px-4 py-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-green" />
      <span>
        <span className="block text-sm font-medium text-navy">{label}</span>
        {hint ? <span className="block text-xs text-slate-ink/70">{hint}</span> : null}
      </span>
    </label>
  );
}

export function SubmitButton({
  children = "Save changes",
  variant = "primary",
  className,
  confirm,
}: {
  children?: ReactNode;
  variant?: "primary" | "navy" | "outline" | "danger";
  className?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "navy"
        ? "btn-navy"
        : variant === "danger"
          ? "btn border border-red-200 text-red-600 hover:bg-red-50"
          : "btn-outline";
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={cn(cls, "py-2.5 text-sm disabled:opacity-60", className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Notice({ saved, deleted, duplicated, error }: { saved?: string; deleted?: string; duplicated?: string; error?: string }) {
  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (saved) return <div role="status" className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green-700">Saved. The public website now reflects your changes.</div>;
  if (deleted) return <div role="status" className="rounded-xl border border-navy/10 bg-mist px-4 py-3 text-sm text-navy">Deleted.</div>;
  if (duplicated) return <div role="status" className="rounded-xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green-700">Duplicated as an unpublished draft.</div>;
  return null;
}
