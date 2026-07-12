"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { GenericForm } from "@/shared/components/GenericForm";
import { ComingSoon } from "@/shared/components/ComingSoon";
import { getModule } from "@/lib/modules";
import { recordApi } from "@/shared/services/jsonrpc";

export default function ModuleNewPage() {
  const params = useParams<{ module: string }>();
  const router = useRouter();
  const slug = params.module;
  const module = getModule(slug);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!module) return <ComingSoon title={slug} />;
  if (!module.enabled) return <ComingSoon title={module.label} />;

  const onSubmit = async (values: Record<string, unknown>) => {
    setError(null);
    setSubmitting(true);
    try {
      await recordApi.create(module.model, values);
      router.push(`/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => router.push(`/${slug}`)} className="text-body-sm text-primary hover:underline">
        ← Back to {module.label}
      </button>
      <div className="card p-6">
        <h2 className="mb-4 text-title-sm font-semibold">New {module.label.slice(0, -1)}</h2>
        {error && (
          <div className="mb-4 rounded border border-error/30 bg-error-container px-3 py-2 text-body-sm text-error">
            {error}
          </div>
        )}
        <GenericForm
          module={module}
          submitting={submitting}
          onSubmit={onSubmit}
          onCancel={() => router.push(`/${slug}`)}
        />
      </div>
    </div>
  );
}
