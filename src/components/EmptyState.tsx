import { Text } from "@telegram-tools/ui-kit";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 8 }}>
      <Text type="title3" align="center">{title}</Text>
      {description && (
        <Text type="body" color="secondary" align="center">{description}</Text>
      )}
    </div>
  );
}
