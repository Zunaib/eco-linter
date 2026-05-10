import { readFile, writeFile } from 'node:fs/promises';

export interface BadgeSpec {
  label: string;
  message: string;
  color: string;
  style: 'flat' | 'flat-square' | 'for-the-badge';
  logoSvg?: string;
}

// Approximate character width for badge text sizing (Verdana 11px)
function textWidth(text: string): number {
  const CHAR_WIDTHS: Record<string, number> = {
    f: 5, i: 4, j: 4, l: 4, r: 5, t: 5,
    m: 12, w: 10, ' ': 4,
  };
  return text.split('').reduce((acc, ch) => acc + (CHAR_WIDTHS[ch.toLowerCase()] ?? 7), 0);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateFlatBadge(spec: BadgeSpec): string {
  const labelWidth = textWidth(spec.label) + 20;
  const messageWidth = textWidth(spec.message) + 20;
  const totalWidth = labelWidth + messageWidth;
  const height = 20;
  const labelX = labelWidth / 2;
  const messageX = labelWidth + messageWidth / 2;
  const label = escapeXml(spec.label);
  const message = escapeXml(spec.message);
  const color = escapeXml(spec.color);
  const gradientId = `s${Math.random().toString(36).slice(2, 8)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="${gradientId}" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#${gradientId})"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelX}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelX}" y="14">${label}</text>
    <text x="${messageX}" y="15" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${messageX}" y="14">${message}</text>
  </g>
</svg>`;
}

function generateFlatSquareBadge(spec: BadgeSpec): string {
  const labelWidth = textWidth(spec.label) + 20;
  const messageWidth = textWidth(spec.message) + 20;
  const totalWidth = labelWidth + messageWidth;
  const height = 20;
  const labelX = labelWidth / 2;
  const messageX = labelWidth + messageWidth / 2;
  const label = escapeXml(spec.label);
  const message = escapeXml(spec.message);
  const color = escapeXml(spec.color);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <g>
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelX}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelX}" y="14">${label}</text>
    <text x="${messageX}" y="15" fill="#010101" fill-opacity=".3">${message}</text>
    <text x="${messageX}" y="14">${message}</text>
  </g>
</svg>`;
}

function generateForTheBadge(spec: BadgeSpec): string {
  const labelWidth = textWidth(spec.label.toUpperCase()) + 30;
  const messageWidth = textWidth(spec.message.toUpperCase()) + 30;
  const totalWidth = labelWidth + messageWidth;
  const height = 28;
  const labelX = labelWidth / 2;
  const messageX = labelWidth + messageWidth / 2;
  const label = escapeXml(spec.label.toUpperCase());
  const message = escapeXml(spec.message.toUpperCase());
  const color = escapeXml(spec.color);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <g>
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11" letter-spacing="1">
    <text x="${labelX}" y="19">${label}</text>
    <text x="${messageX}" y="19">${message}</text>
  </g>
</svg>`;
}

export function generateBadge(spec: BadgeSpec): string {
  switch (spec.style) {
    case 'flat': return generateFlatBadge(spec);
    case 'flat-square': return generateFlatSquareBadge(spec);
    case 'for-the-badge': return generateForTheBadge(spec);
  }
}

export function generateShieldsJson(spec: BadgeSpec): string {
  return JSON.stringify({
    schemaVersion: 1,
    label: spec.label,
    message: spec.message,
    color: spec.color,
    style: spec.style,
  }, null, 2);
}

export async function updateReadmeBadge(
  readmePath: string,
  badgePath: string,
): Promise<void> {
  const content = await readFile(readmePath, 'utf-8');

  // Replace existing eco-score badge or insert after first heading
  const badgePattern = /!\[(?:eco-score|Carbon Score)\]\([^)]+\)/;
  const newBadge = `![eco-score](${badgePath})`;

  let updated: string;
  if (badgePattern.test(content)) {
    updated = content.replace(badgePattern, newBadge);
  } else {
    // Insert after the first line
    const lines = content.split('\n');
    lines.splice(1, 0, newBadge);
    updated = lines.join('\n');
  }

  await writeFile(readmePath, updated, 'utf-8');
}
