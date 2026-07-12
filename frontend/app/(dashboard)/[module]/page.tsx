"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { GenericTable } from "@/shared/components/GenericTable";
import { ComingSoon } from "@/shared/components/ComingSoon";
import { getModule } from "@/lib/modules";
import { jsonrpcSearch, recordApi, type Domain } from "@/shared/services/jsonrpc";
import type { Record_ } from "@/lib/types";

const PAGE_SIZE = 12;

export default function ModuleListPage() {
  const params = useParams<{ module: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const slug = params.module;
  const module = getModule(slug);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ field: string; order: "asc" | "desc" } | undefined>(undefined);

  const query = useQuery({
    queryKey: ["module", slug, page, search, sort],
    enabled: Boolean(module?.enabled),
    queryFn: () => {
      const domain: Domain = [];
      if (search && module?.searchField) domain.push([module.searchField, "ilike", `%${search}%`]);
      return jsonrpcSearch<Record_>(module!.model, {
        domain,
        sort_by: sort?.field,
        sort_order: sort?.order,
        page,
        page_size: PAGE_SIZE,
      });
    },
  });

  if (!module) {
    return <ComingSoon title={slug} />;
  }
  if (!module.enabled) {
    return <ComingSoon title={module.label} />;
  }

  const toggleSort = (field: string) => {
    setSort((s) => (s?.field === field ? { field, order: s.order === "asc" ? "desc" : "asc" } : { field, order: "asc" }));
    setPage(1);
  };

  const onAction = async (action: string, row: Record_) => {
    const id = String(row.id);
    if (action === "delete") {
      if (!confirm(`Delete this ${module.label.slice(0, -1)}?`)) return;
      await recordApi.unlink(module.model, [id]);
      qc.invalidateQueries({ queryKey: ["module", slug] });
    } else {
      router.push(`/${slug}/${id}`);
    }
  };

  return (
    <GenericTable
      module={module}
      rows={query.data?.rows ?? []}
      total={query.data?.total ?? 0}
      loading={query.isLoading}
      page={page}
      pageSize={PAGE_SIZE}
      onPageChange={setPage}
      sort={sort}
      onSort={toggleSort}
      search={search}
      onSearch={(v) => {
        setSearch(v);
        setPage(1);
      }}
      onNew={() => router.push(`/${slug}/new`)}
      onRowClick={(row) => router.push(`/${slug}/${String(row.id)}`)}
      onAction={onAction}
    />
  );
}
