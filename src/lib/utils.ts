export function cn(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ");
}
