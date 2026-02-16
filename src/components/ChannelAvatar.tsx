const colors = [
  "#e57373", "#64b5f6", "#81c784", "#ffb74d",
  "#ba68c8", "#4dd0e1", "#ff8a65", "#a1887f",
];

function pickColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

interface ChannelAvatarProps {
  title: string;
  size?: number;
}

export function ChannelAvatar({ title, size = 40 }: ChannelAvatarProps) {
  const letter = (title[0] ?? "?").toUpperCase();
  const bg = pickColor(title);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.45,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}
