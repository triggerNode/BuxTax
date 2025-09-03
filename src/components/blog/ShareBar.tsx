import { generateSocialShareUrl } from "@/utils/metaGenerator";

export function ShareBar({ title }: { title: string }) {
  const caption = title + " — Read on BuxTax";
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">Share:</span>
      <a
        className="hover:underline"
        href={generateSocialShareUrl("twitter", title, caption)}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className="hover:underline"
        href={generateSocialShareUrl("linkedin", title, caption)}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        className="hover:underline"
        href={generateSocialShareUrl("reddit", title, caption)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Reddit
      </a>
    </div>
  );
}
