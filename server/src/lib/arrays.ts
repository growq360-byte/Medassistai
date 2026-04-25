export function toJson(arr: string[]): string {
  return JSON.stringify(arr);
}

export function fromJson(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
