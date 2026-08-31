type Status = "PENDING" | "DISETUJUI" | "DITOLAK" | "SELESAI";

const config: Record<Status, { label: string; dot: string; className: string }> = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400",
    className: "bg-amber-50 text-amber-700 border border-amber-200/80 ring-1 ring-amber-300/30",
  },
  DISETUJUI: {
    label: "Disetujui",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-300/30",
  },
  DITOLAK: {
    label: "Ditolak",
    dot: "bg-red-500",
    className: "bg-red-50 text-red-700 border border-red-200/80 ring-1 ring-red-300/30",
  },
  SELESAI: {
    label: "Selesai",
    dot: "bg-blue-500",
    className: "bg-blue-50 text-blue-700 border border-blue-200/80 ring-1 ring-blue-300/30",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as Status] ?? {
    label: status,
    dot: "bg-gray-400",
    className: "bg-gray-50 text-gray-600 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
