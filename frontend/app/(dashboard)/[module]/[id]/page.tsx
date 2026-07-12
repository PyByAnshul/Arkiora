"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { GenericForm } from "@/shared/components/GenericForm";
import { ComingSoon } from "@/shared/components/ComingSoon";
import { getModule } from "@/lib/modules";
import { recordApi } from "@/shared/services/jsonrpc";
import type { Record_ } from "@/lib/types";

export default function ModuleDetailPage() {
  const params = useParams<{ module: string; id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { module: slug, id } = params;
  const module = getModule(slug);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["record", slug, id],
    enabled: Boolean(module?.enabled),
    queryFn: () => recordApi.read(module!.model, [id]).then((rows) => rows[0] as Record_ | undefined),
  });

  if (!module) return <ComingSoon title={slug} />;
  if (!module.enabled) return <ComingSoon title={module.label} />;

  const onSubmit = async (values: Record<string, unknown>) => {
    setError(null);
    setSubmitting(true);
    try {
      await recordApi.write(module.model, [id], values);
      qc.invalidateQueries({ queryKey: ["record", slug, id] });
      qc.invalidateQueries({ queryKey: ["module", slug] });
      router.push(`/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => router.push(`/${slug}`)} className="text-body-sm text-primary hover:underline">
        ← Back to {module.label}
      </button>
      <div className="card p-6">
        <h2 className="mb-4 text-title-sm font-semibold">Edit {module.label.slice(0, -1)}</h2>
        {query.isLoading ? (
          <p className="text-on-surface-variant">Loading…</p>
        ) : query.data ? (
          <>
            {error && (
              <div className="mb-4 rounded border border-error/30 bg-error-container px-3 py-2 text-body-sm text-error">
                {error}
              </div>
            )}
            <GenericForm
              module={module}
              initial={query.data}
              submitting={submitting}
              onSubmit={onSubmit}
              onCancel={() => router.push(`/${slug}`)}
            />
          </>
        ) : (
          <p className="text-on-surface-variant">Record not found.</p>
        )}
      </div>
    </div>
  );
}
