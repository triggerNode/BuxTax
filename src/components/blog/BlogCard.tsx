import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { BlogPost } from "@/content/blog";

type Variant = "royal" | "cherry" | "yellow" | "burgundy" | "black";

function classesFor(variant: Variant) {
  switch (variant) {
    case "royal":
      return {
        card: "bg-royal text-cream border-transparent ring-2 ring-royal/60",
        meta: "text-cream/80",
        excerpt: "text-cream/90",
        tag: "bg-cream text-black",
      };
    case "cherry":
      return {
        card: "bg-cherry text-cream border-transparent ring-2 ring-cherry/60",
        meta: "text-cream/85",
        excerpt: "text-cream/95",
        tag: "bg-cream text-black",
      };
    case "burgundy":
      return {
        card: "bg-burgundy text-cream border-transparent ring-2 ring-burgundy/60",
        meta: "text-cream/80",
        excerpt: "text-cream/95",
        tag: "bg-cream text-black",
      };
    case "black":
      return {
        card: "bg-black text-cream border-transparent ring-2 ring-black/40",
        meta: "text-cream/80",
        excerpt: "text-cream/90",
        tag: "bg-cream text-black",
      };
    case "yellow":
    default:
      return {
        card: "bg-yellow text-black border-black/10 ring-2 ring-black/10",
        meta: "text-black/70",
        excerpt: "text-black/80",
        tag: "bg-black text-yellow",
      };
  }
}

export function BlogCard({
  post,
  variant = "royal",
  eager = false,
}: {
  post: BlogPost;
  variant?: Variant;
  eager?: boolean;
}) {
  const cls = classesFor(variant);
  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow ${cls.card}`}
      >
        {post.image && (
          <div className="aspect-[16/9] bg-cream/10 overflow-hidden">
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading={eager ? "eager" : "lazy"}
              {...(eager ? { fetchpriority: "high" } : {})}
            />
          </div>
        )}
        <CardHeader>
          <div className={`text-xs ${cls.meta}`}>
            {new Date(post.date).toLocaleDateString()} •{" "}
            {post.readingTimeMinutes} min read
          </div>
          <h3 className="text-xl font-semibold leading-snug group-hover:underline underline-offset-4">
            {post.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className={`${cls.excerpt} truncate`}>
            {post.excerpt || post.description}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className={`text-xs px-2 py-0.5 rounded-full ${cls.tag}`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
