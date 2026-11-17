import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function activeVerbSlugs(): string[] {
  const path = resolve(process.cwd(), '../content/verbs.json');
  const catalog = JSON.parse(readFileSync(path, 'utf8')) as Array<{ slug: string }>;
  return catalog.map(({ slug }) => slug);
}
