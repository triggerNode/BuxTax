/*
  Build-time generator for sitemap.xml and feed.xml
  - Discovers MDX blog posts in src/content/blog
  - Emits public/sitemap.xml and public/feed.xml
  Configure site URL via env SITE_URL or defaults to https://bux.tax
*/
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || "https://bux.tax";

type PostMeta = {
  slug: string;
  title?: string;
  description?: string;
  date?: string;
  lastmod?: string;
};

function safeRead(file: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function parseFrontmatter(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const m = raw.match(/^---\s*([\s\S]*?)\s*---/);
  if (!m) return out;
  const body = m[1];
  for (const line of body.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1].trim();
    const val = kv[2].trim().replace(/^['"]|['"]$/g, "");
    out[key] = val;
  }
  return out;
}

function getBlogPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((file) => {
    const abs = path.join(BLOG_DIR, file);
    const raw = safeRead(abs);
    const fm = parseFrontmatter(raw);
    const slug = (fm.slug || file.replace(/\.mdx$/, "")).trim();
    const stat = fs.statSync(abs);
    const lastmod = stat.mtime.toISOString();
    return {
      slug,
      title: fm.title,
      description: fm.description,
      date: fm.date,
      lastmod,
    } as PostMeta;
  });
}

function xmlEscape(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function writeSitemap(posts: PostMeta[]) {
  const staticRoutes = ["/", "/blog", "/calculator", "/terms", "/privacy"];
  const urls: string[] = [];
  for (const r of staticRoutes) urls.push(`<url><loc>${SITE_URL}${r}</loc></url>`);
  for (const p of posts) urls.push(`<url><loc>${SITE_URL}/blog/${p.slug}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    "\n"
  )}\n</urlset>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), xml, "utf8");
}

function writeFeed(posts: PostMeta[]) {
  // Order newest first by lastmod or date
  posts.sort((a, b) => new Date(b.lastmod || b.date || 0).getTime() - new Date(a.lastmod || a.date || 0).getTime());
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}`;
      const title = xmlEscape(p.title || p.slug);
      const desc = xmlEscape(p.description || "");
      const pub = xmlEscape(p.date || p.lastmod || new Date().toISOString());
      return `<item><title>${title}</title><link>${link}</link><guid>${link}</guid><pubDate>${pub}</pubDate><description>${desc}</description></item>`;
    })
    .join("\n");
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>BuxTax Blog</title>\n  <link>${SITE_URL}/blog</link>\n  <description>Latest articles from BuxTax</description>\n  ${items}\n</channel>\n</rss>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, "feed.xml"), rss, "utf8");
}

function main() {
  const posts = getBlogPosts();
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  writeSitemap(posts);
  writeFeed(posts);
  // eslint-disable-next-line no-console
  console.log(`Generated sitemap.xml and feed.xml for ${posts.length} posts at ${SITE_URL}`);
}

main();


