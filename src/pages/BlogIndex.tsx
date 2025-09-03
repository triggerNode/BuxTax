import { posts } from "@/content/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogHero } from "@/components/blog/BlogHero";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

export default function BlogIndex() {
  const [query, setQuery] = useState("");
  const allTags = useMemo(() => {
    const t = new Set<string>();
    posts.forEach((p) => (p.tags || []).forEach((x) => t.add(x)));
    return Array.from(t).sort();
  }, []);
  const [activeTag, setActiveTag] = useState<string>("");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q);
      const matchesTag = !activeTag || (p.tags || []).includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  // Choose feature ordering: any with featureRank ascending (1=hero, 2/3=secondary), else first item
  const ranked = filtered
    .filter((p) => typeof (p as any).featureRank === "number")
    .sort(
      (a: any, b: any) => (a.featureRank as number) - (b.featureRank as number)
    );
  const featured = ranked[0] || filtered[0];
  const secondary = ranked.slice(1, 3);
  const remaining = filtered.filter(
    (p) => p !== featured && !secondary.includes(p)
  );
  const restOrdered = [...secondary, ...remaining];

  const variants: ("royal" | "cherry" | "yellow" | "burgundy" | "black")[] = [
    "royal",
    "cherry",
    "yellow",
    "burgundy",
    "black",
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>BuxTax Blog — Guides for Roblox Creator Earnings</title>
        <meta
          name="description"
          content="Guides and insights: payouts, taxes, strategy, performance, and tools for Roblox creators."
        />
        <link rel="canonical" href="https://bux.tax/blog" />
        <meta property="og:title" content="BuxTax Blog" />
        <meta
          property="og:description"
          content="Guides and insights: payouts, taxes, strategy, performance, and tools for Roblox creators."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bux.tax/blog" />
        <meta
          property="og:image"
          content={new URL(
            "/og/robux-to-usd-rates.png",
            window.location.origin
          ).toString()}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <BlogHero />

      <div className="mb-8 grid gap-4 md:grid-cols-[2fr,1fr] items-center">
        <Input
          placeholder="Search articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => setActiveTag("")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              !activeTag ? "bg-foreground text-background" : "bg-background"
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                activeTag === t
                  ? "bg-foreground text-background"
                  : "bg-background"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {featured && (
        <div className="mb-10">
          <div className="text-sm text-muted-foreground mb-2">Featured</div>
          <BlogCard post={featured} variant="yellow" eager />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {restOrdered.map((p, i) => (
          <BlogCard
            key={p.slug}
            post={p}
            variant={variants[i % variants.length]}
          />
        ))}
      </div>
    </div>
  );
}
