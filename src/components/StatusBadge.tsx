type Status = "PENDING" | "DISETUJUI" | "DITOLAK" | "SELESAI";

const config: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  DISETUJUI: {
    label: "Disetujui",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
  DITOLAK: {
    label: "Ditolak",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  SELESAI: {
    label: "Selesai",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as Status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
