import fs from 'fs';
import path from 'path';

// Safely escape a string for use inside a RegExp
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getEmailTemplate(templateName: string, data: Record<string, string>, baseUrl: string): string {
  const templatePath = path.join(process.cwd(), `src/emails/templates/${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Replace [BASE_URL] placeholder (literal square brackets)
  html = html.replace(new RegExp(escapeRegExp('[BASE_URL]'), 'g'), baseUrl);

  // Replace other placeholders like [Invitation Link], [Guest Name], etc.
  for (const key in data) {
    const token = `[${key}]`;
    html = html.replace(new RegExp(escapeRegExp(token), 'g'), data[key] ?? '');
  }

  return html;
}
