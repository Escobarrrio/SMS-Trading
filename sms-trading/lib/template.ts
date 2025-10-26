export function renderTemplate(template: string, vars: Record<string, string | number | null | undefined>) {
  return template.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_, key) => {
    const v = vars[key];
    return v === null || v === undefined ? '' : String(v);
  });
}
