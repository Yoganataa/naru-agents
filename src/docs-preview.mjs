import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { marked } from 'marked';

const docsDir = join(process.cwd(), 'docs');

// Configure marked with GitHub Flavored Markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

async function renderPage(urlPath) {
  let relativePath = urlPath.replace(/^\/naru-agents\/?/, '/').replace(/^\//, '');
  if (!relativePath || relativePath === 'index.html' || relativePath === '') {
    relativePath = 'index.md';
  } else if (!extname(relativePath)) {
    relativePath += '.md';
  }

  let filePath = join(docsDir, relativePath);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) {
      filePath = join(filePath, 'index.md');
    }
  } catch {
    filePath = join(docsDir, 'index.md');
  }

  let rawMd = await readFile(filePath, 'utf8');
  // Strip frontmatter
  rawMd = rawMd.replace(/^---[\s\S]*?---\r?\n/, '');

  // Parse markdown via marked
  const bodyHtml = marked.parse(rawMd);

  const layout = await readFile(join(docsDir, '_layouts', 'default.html'), 'utf8');
  const header = await readFile(join(docsDir, '_includes', 'header.html'), 'utf8');
  const sidebar = await readFile(join(docsDir, '_includes', 'sidebar.html'), 'utf8');

  let fullHtml = layout
    .replace('{% include header.html %}', header)
    .replace('{% include sidebar.html %}', sidebar)
    .replace('{{ content }}', bodyHtml)
    .replace(/\{\{\s*site\.baseurl\s*\}\}/g, '/naru-agents')
    .replace(/\{\{\s*site\.title\s*\}\}/g, 'N.A.R.U. Documentation')
    .replace(/\{\{\s*site\.repository\s*\}\}/g, 'yoganataa/naru-agents')
    .replace(/\{\{\s*page\.title\s*\|\s*default:\s*site\.title\s*\}\}/g, 'N.A.R.U. Documentation');

  return fullHtml;
}

const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost:3000');
  let pathname = parsedUrl.pathname;

  if (pathname.includes('/assets/')) {
    const assetRelative = pathname.substring(pathname.indexOf('/assets/'));
    const assetPath = join(docsDir, assetRelative);
    try {
      const data = await readFile(assetPath);
      const ext = extname(assetPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      return res.end(data);
    } catch {
      res.writeHead(404);
      return res.end('Asset not found');
    }
  }

  if (pathname === '/') {
    res.writeHead(302, { Location: '/naru-agents/' });
    return res.end();
  }

  try {
    const html = await renderPage(pathname);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    res.writeHead(500);
    res.end('Error rendering page: ' + err.message);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('🚀 High-End N.A.R.U. Docs Server restarted on http://localhost:' + PORT + '/naru-agents/');
});
