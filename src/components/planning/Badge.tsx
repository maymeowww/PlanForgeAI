export default function Badge({ text, color = "gray" }: { text: string; color?: "green" | "amber" | "rose" | "gray" }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose:  "bg-rose-100 text-rose-700",
    gray:  "bg-gray-100 text-gray-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{text}</span>;
}
