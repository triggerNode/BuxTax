type MdxModule = {
  frontmatter?: Record<string, any>;
  default: React.ComponentType<any>;
};

export type BlogPostMeta = {
  title: string;
  description: string;
  date: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  canonical?: string;
  tags?: string[];
  featured?: boolean;
  featureRank?: number;
  excerpt?: string;
};

export type BlogPost = BlogPostMeta & {
  readingTimeMinutes: number;
  Component: React.ComponentType<any>;
};

const modules = import.meta.glob<MdxModule>("./*.mdx", {
  eager: true,
}) as Record<string, MdxModule>;
const rawModules = import.meta.glob<string>("./*.mdx", {
  eager: true,
  as: "raw",
}) as Record<string, string>;

function computeExcerptAndReadingTime(raw: string): {
  excerpt: string;
  minutes: number;
} {
  const withoutFm = raw.replace(/^---[\s\S]*?---\s*/m, "");
  const stripped = withoutFm
    .replace(/`{3}[\s\S]*?`{3}/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, (m) => m.replace(/[\[\]\(\)]/g, " "))
    .replace(/[#*>_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(/\s+/).filter(Boolean);
  const minutes = Math.max(1, Math.ceil(words.length / 200));
  const excerpt = stripped.slice(0, 180) + (stripped.length > 180 ? "…" : "");
  return { excerpt, minutes };
}

export const posts: BlogPost[] = Object.entries(modules)
  .map(([file, mod]) => {
    const fm = (mod.frontmatter || {}) as Partial<BlogPostMeta>;
    const raw = rawModules[file] || "";
    const { excerpt, minutes } = computeExcerptAndReadingTime(raw);
    return {
      title: fm.title || file,
      description: fm.description || "",
      date: fm.date || new Date().toISOString(),
      slug: fm.slug || file.replace(/^\.\//, "").replace(/\.mdx$/, ""),
      image: fm.image,
      imageAlt: (fm as any).imageAlt,
      canonical: (fm as any).canonical,
      tags: fm.tags || [],
      featured: Boolean(fm.featured),
      featureRank:
        typeof fm.featureRank === "number"
          ? fm.featureRank
          : fm.featured
          ? 99
          : undefined,
      excerpt: fm.excerpt || excerpt,
      readingTimeMinutes: minutes,
      Component: mod.default,
    } as BlogPost;
  })
  .filter((p) => Boolean(p.slug))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
