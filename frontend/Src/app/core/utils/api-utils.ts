export function rows(data: any): any[] {
  return Array.isArray(data?.resultado) ? data.resultado : Array.isArray(data) ? data : [];
}

export function formatHour(value?: string): string {
  return value ? value.slice(0, 5) : '';
}
