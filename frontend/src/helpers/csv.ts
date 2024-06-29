export function truncate(value: string, length: number, endWith?: string) {
  return value.length > length
    ? value.substring(0, length) + (endWith || "")
    : value;
}
