export function extractToken(link: string): string {
  const value = link.trim();
  const withoutExtras = value.split("?")[0].split("#")[0];
  const parts = withoutExtras.split("/").filter(Boolean);
  const token = parts[parts.length - 1];
  return token ? token : "";
}
