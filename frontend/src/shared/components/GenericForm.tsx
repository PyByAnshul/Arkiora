"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";
import { jsonrpcSearch } from "@/shared/services/jsonrpc";
import type { FieldMeta, ModuleMeta } from "@/lib/modules";
import type { Record_ } from "@/lib/types";

interface Option {
  value: string;
  label: string;
}

interface Props {
  module: ModuleMeta;
  initial?: Record_;
  submitting?: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

function toInitial(fields: FieldMeta[], initial?: Record_): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = initial?.[f.name];
    out[f.name] = v === null || v === undefined ? "" : typeof v === "object" ? String(v) : v;
  }
  return out;
}

export function GenericForm({ module, initial, submitting, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: toInitial(module.formFields, initial) });

  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [loadError, setLoadError] = useState<Record<string, string>>({});

  // Load `many2one` option lists from their referenced models.
  useEffect(() => {
    let alive = true;
    for (const f of module.formFields) {
      if (f.type !== "many2one" || !f.model) continue;
      jsonrpcSearch<Record_>(f.model, { page_size: 200 })
        .then(({ rows }) => {
          if (!alive) return;
          setOptions((o) => ({
            ...o,
            [f.name]: rows.map((r) => ({
              value: String(r.id),
              label: String(r[f.labelField ?? "name"] ?? r.id),
            })),
          }));
        })
        .catch(() => {
          if (alive) setLoadError((e) => ({ ...e, [f.name]: "Could not load options" }));
        });
    }
    return () => {
      alive = false;
    };
  }, [module.formFields]);

  const required = useMemo(() => new Set(module.formFields.filter((f) => f.required).map((f) => f.name)), [module.formFields]);

  const submit = (data: Record<string, unknown>) => {
    const values: Record<string, unknown> = {};
    for (const f of module.formFields) {
      if (f.readonly) continue;
      let v = data[f.name];
      if (f.type === "number" || f.type === "currency") v = v === "" || v === undefined ? null : Number(v);
      if (v === "") v = null;
      values[f.name] = v;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit((data) => submit(data as Record<string, unknown>))} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {module.formFields.map((f) => {
          const fieldErrors = errors[f.name];
          const invalid = Boolean(fieldErrors);
          const base = "input-base" + (invalid ? " border-error focus:ring-error/30" : "");
          const rules = f.required ? { required: `${f.label} is required` } : {};
          return (
            <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="label-text mb-1 block">
                {f.label}
                {required.has(f.name) && <span className="text-error"> *</span>}
              </label>

              {f.type === "textarea" ? (
                <textarea className={base + " min-h-24"} rows={3} {...register(f.name, rules)} disabled={f.readonly} />
              ) : f.type === "select" ? (
                <select className={base} {...register(f.name, rules)} disabled={f.readonly}>
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : f.type === "many2one" ? (
                <select className={base} {...register(f.name, rules)} disabled={f.readonly}>
                  <option value="">—</option>
                  {(options[f.name] ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input type="date" className={base} {...register(f.name, rules)} disabled={f.readonly} />
              ) : f.type === "number" || f.type === "currency" ? (
                <input
                  type="number"
                  step={f.type === "currency" ? "0.01" : "1"}
                  className={base}
                  {...register(f.name, rules)}
                  disabled={f.readonly}
                />
              ) : (
                <input type="text" className={base} {...register(f.name, rules)} disabled={f.readonly} />
              )}

              {invalid && <p className="mt-1 text-body-sm text-error">{String(fieldErrors?.message ?? "Required")}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 border-t border-outline pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
