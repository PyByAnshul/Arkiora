import {
  BarChart3,
  Boxes,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Share2,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "many2one"
  | "textarea";

export interface FieldMeta {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  options?: string[];
  /** Referenced model for `many2one` fields (used to load select options). */
  model?: string;
  /** Field on the referenced record to display as the option label. */
  labelField?: string;
}

export interface ColumnMeta {
  field: string;
  header: string;
  sortable?: boolean;
  type?: "text" | "currency" | "status" | "date";
}

export interface ModuleMeta {
  slug: string;
  label: string;
  model: string;
  icon: LucideIcon;
  enabled: boolean;
  /** Field used by the list search box (omit if the model has no searchable text field). */
  searchField?: string;
  columns: ColumnMeta[];
  formFields: FieldMeta[];
  rowActions: string[];
}

export const STATUS_OPTIONS = [
  "draft",
  "active",
  "under_maintenance",
  "disposed",
  "written_off",
] as const;

export const MODULES: Record<string, ModuleMeta> = {
  assets: {
    slug: "assets",
    label: "Assets",
    model: "asset",
    icon: Boxes,
    enabled: true,
    searchField: "name",
    columns: [
      { field: "code", header: "Code", sortable: true },
      { field: "name", header: "Name", sortable: true },
      { field: "status", header: "Status", type: "status" },
      { field: "location", header: "Location" },
      { field: "current_value", header: "Value", type: "currency", sortable: true },
    ],
    formFields: [
      { name: "name", label: "Asset Name", type: "text", required: true },
      { name: "code", label: "Asset Code", type: "text", readonly: true },
      { name: "category_id", label: "Category", type: "many2one", model: "asset.category", labelField: "name", required: true },
      { name: "purchase_price", label: "Purchase Price", type: "currency", required: true },
      { name: "current_value", label: "Current Value", type: "currency" },
      { name: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { name: "purchase_date", label: "Purchase Date", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
    rowActions: ["view", "edit", "delete"],
  },
  categories: {
    slug: "categories",
    label: "Categories",
    model: "asset.category",
    icon: Tag,
    enabled: true,
    searchField: "name",
    columns: [
      { field: "name", header: "Name", sortable: true },
      { field: "code", header: "Code", sortable: true },
      { field: "depreciation_method", header: "Depreciation" },
      { field: "useful_life_years", header: "Life (yrs)", type: "text" },
    ],
    formFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text" },
      {
        name: "depreciation_method",
        label: "Depreciation Method",
        type: "select",
        options: ["straight_line", "written_down_value", "units_of_production"],
      },
      { name: "useful_life_years", label: "Useful Life (years)", type: "number" },
      { name: "salvage_value", label: "Salvage Value", type: "currency" },
    ],
    rowActions: ["view", "edit", "delete"],
  },
  allocations: {
    slug: "allocations",
    label: "Allocations",
    model: "asset.allocation",
    icon: Share2,
    enabled: true,
    columns: [
      { field: "asset_id", header: "Asset", sortable: true },
      { field: "status", header: "Status", type: "status" },
      { field: "allocated_to", header: "Allocated To" },
      { field: "department_id", header: "Department" },
    ],
    formFields: [
      { name: "asset_id", label: "Asset", type: "many2one", model: "asset", labelField: "name", required: true },
      { name: "allocated_to", label: "Allocated To (User ID)", type: "text" },
      { name: "department_id", label: "Department ID", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["requested", "approved", "allocated", "returned"] },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    rowActions: ["view", "edit", "delete"],
  },
  // --- Backend modules not yet implemented; listed for navigation parity. ---
  "transfer-requests": {
    slug: "transfer-requests",
    label: "Transfer Requests",
    model: "asset.transfer",
    icon: Share2,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
  maintenance: {
    slug: "maintenance",
    label: "Maintenance",
    model: "asset.maintenance",
    icon: Wrench,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
  bookings: {
    slug: "bookings",
    label: "Bookings",
    model: "asset.booking",
    icon: CalendarRange,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
  "audit-cycles": {
    slug: "audit-cycles",
    label: "Audit Cycles",
    model: "asset.audit",
    icon: ClipboardList,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
  reports: {
    slug: "reports",
    label: "Reports",
    model: "",
    icon: BarChart3,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
  settings: {
    slug: "settings",
    label: "Settings",
    model: "",
    icon: Settings,
    enabled: false,
    columns: [],
    formFields: [],
    rowActions: [],
  },
};

export const SIDEBAR_NAV: { slug: string; label: string; icon: LucideIcon; home?: boolean }[] = [
  { slug: "", label: "Dashboard", icon: LayoutDashboard, home: true },
  ...Object.values(MODULES).map((m) => ({ slug: m.slug, label: m.label, icon: m.icon })),
];

export function getModule(slug: string): ModuleMeta | undefined {
  return MODULES[slug];
}
