import { Construction } from "lucide-react";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <Construction size={36} className="text-outline-strong" />
      <h2 className="text-title-sm font-semibold text-on-surface">{title}</h2>
      <p className="max-w-md text-body-sm text-on-surface-variant">
        This module is part of the AssetFlow roadmap. The navigation and design are in place; the backend
        model and JSON-RPC methods are not registered yet.
      </p>
    </div>
  );
}
