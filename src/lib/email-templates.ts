import fs from 'fs';
import path from 'path';

export function getEmailTemplate(templateName: string, data: Record<string, string>, baseUrl: string): string {
  const templatePath = path.join(process.cwd(), `src/emails/templates/${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Replace [BASE_URL] placeholder
  html = html.replace(/[\[]BASE_URL[\\]/g, baseUrl);

  // Replace other placeholders
  for (const key in data) {
    html = html.replace(new RegExp(`\[${key}\]`, 'g'), data[key]);
  }

  return html;
}
