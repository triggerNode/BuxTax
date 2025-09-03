import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { posts } from "@/content/blog";
import { ShareBar } from "@/components/blog/ShareBar";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;

  const { title, date, Component, image, imageAlt, readingTimeMinutes, tags } =
    post;
  const canonical = (post as any).canonical as string | undefined;
  const absoluteOgImage = image
    ? new URL(image, window.location.origin).toString()
    : undefined;

  return (
    <article className="container mx-auto px-4 py-10 max-w-3xl">
      <Helmet>
        <title>{title}</title>
        {post.description && (
          <meta name="description" content={post.description} />
        )}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph / Twitter */}
        <meta property="og:title" content={title} />
        {post.description && (
          <meta property="og:description" content={post.description} />
        )}
        <meta property="og:type" content="article" />
        {canonical && <meta property="og:url" content={canonical} />}
        {absoluteOgImage && (
          <meta property="og:image" content={absoluteOgImage} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {post.description && (
          <meta name="twitter:description" content={post.description} />
        )}
        {absoluteOgImage && (
          <meta name="twitter:image" content={absoluteOgImage} />
        )}

        {/* Article metadata */}
        <meta
          property="article:published_time"
          content={new Date(date).toISOString()}
        />
        <meta
          property="article:modified_time"
          content={new Date(date).toISOString()}
        />
        {tags &&
          tags
            .slice(0, 6)
            .map((t) => <meta key={t} property="article:tag" content={t} />)}

        {/* Article JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: post.description || undefined,
            image: absoluteOgImage,
            datePublished: new Date(date).toISOString(),
            dateModified: new Date(date).toISOString(),
            author: { "@type": "Organization", name: "BuxTax" },
            publisher: { "@type": "Organization", name: "BuxTax" },
            mainEntityOfPage: canonical || window.location.href,
          })}
        </script>

        {/* BreadcrumbList JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: new URL("/", window.location.origin).toString(),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: new URL("/blog", window.location.origin).toString(),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: canonical || window.location.href,
              },
            ],
          })}
        </script>
      </Helmet>
      <button
        onClick={() =>
          window.history.length > 1 ? navigate(-1) : navigate("/blog")
        }
        className="mb-6 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-yellow text-black hover:opacity-90"
      >
        ← Back
      </button>
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{title}</h1>
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>{new Date(date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{readingTimeMinutes} min read</span>
          {tags && tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-2">
                {tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-muted text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>
      {image && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img src={image} alt={imageAlt || title} className="w-full h-auto" />
        </div>
      )}
      <div className="prose prose-brand max-w-none">
        <Component />
      </div>
      <div className="mt-8">
        <ShareBar title={title} />
      </div>
    </article>
  );
}
