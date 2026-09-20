import fs from 'fs';

const cleanRTF = (content) => {
  return content
    .replace(/\\\\\r?\n/g, '\n') // Replace backslash followed by newline
    .replace(/\\par\b/g, '\n')   // Replace RTF \par command with newline
    .replace(/\{\*?\\[^{}]+\}|[{}]/g, '')
    .replace(/\\[a-z0-9]+ ?/g, ' ')
    .replace(/\\'[a-f0-9]{2}/g, '')
    .trim();
};

const content = fs.readFileSync('./public/photos/Trip - Chamonix - July 2023/Chamonix - July 2023.rtf', 'utf8');
const cleaned = cleanRTF(content);
console.log('--- CLEANED ---');
console.log(JSON.stringify(cleaned));
console.log('--- SPLIT ---');
cleaned.split('\n').forEach(line => {
    console.log('LINE:', JSON.stringify(line));
    const parts = line.split('-');
    const key = parts[0]?.trim();
    const value = parts.slice(1).join('-')?.trim();
    console.log('  KEY:', key, 'VALUE:', value);
});
