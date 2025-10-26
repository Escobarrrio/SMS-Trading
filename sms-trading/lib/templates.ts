export function extractVariables(text: string): string[] {
  const vars = new Set<string>();
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) vars.add(m[1]);
  return Array.from(vars);
}

export function compileTemplate(text: string, values: Record<string, string>) {
  const missing: string[] = [];
  const compiled = text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, v) => {
    if (values[v] == null) { if (!missing.includes(v)) missing.push(v); return `{${v}}`; }
    return values[v];
  });
  return { text: compiled, missing };
}
