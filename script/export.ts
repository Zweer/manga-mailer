import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import ignore from 'ignore';

const rootFolder = join(__dirname, '..');
const ignoreFilename = join(rootFolder, '.gitignore');
const ignoreFile = `${readFileSync(ignoreFilename).toString()}
.git
.husky
*.svg
*.ico
*.png
*.jpg
docs/EXPORT.md
drizzle
package-lock.json`;
// console.log('Ignore file:', ignoreFile);
const files = readdirSync(rootFolder, { recursive: true, encoding: 'utf-8' });

const files2export = ignore()
  .add(ignoreFile)
  .filter(files)
  .sort();
// console.log('Files to export:', files2export);

const docFolder = join(rootFolder, 'docs');
if (!existsSync(docFolder)) {
  mkdirSync(docFolder);
}

const exportFilename = join(docFolder, 'EXPORT.md');
const filesExport = files2export.map((file) => {
  const filePath = join(rootFolder, file);
  if (lstatSync(filePath).isDirectory()) {
    return null;
  }

  const fileContent = readFileSync(filePath, { encoding: 'utf-8' });

  const extension = file.split('.').pop();

  return `${file}:\n\n\`\`\`${extension}\n${fileContent}\n\`\`\``;
}).filter(fileString => fileString != null).join('\n\n---\n\n');
const exportString = `# File export\n\n${filesExport}`;

writeFileSync(exportFilename, exportString, { encoding: 'utf-8' });
