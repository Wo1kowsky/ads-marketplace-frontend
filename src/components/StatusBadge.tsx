const statusColors: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#e6f4ea", color: "#1e7e34" },
  draft:     { bg: "#f0f0f0", color: "#666" },
  paused:    { bg: "#fff3e0", color: "#e65100" },
  completed: { bg: "#e3f2fd", color: "#1565c0" },
  pending:   { bg: "#fff8e1", color: "#f9a825" },
  accepted:  { bg: "#e6f4ea", color: "#1e7e34" },
  rejected:  { bg: "#fce4ec", color: "#c62828" },
};

const defaultColor = { bg: "#f0f0f0", color: "#666" };

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = status.toLowerCase();
  const { bg, color } = statusColors[s] ?? defaultColor;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "18px",
        backgroundColor: bg,
        color,
        textTransform: "capitalize",
      }}
    >
      {s}
    </span>
  );
}
