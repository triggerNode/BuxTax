export function Footer() {
  return (
    <footer className="border-t border-border/40 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition-colors">
            Terms
          </button>
          <button className="hover:text-foreground transition-colors">
            Privacy
          </button>
          <a 
            href="mailto:support@bux.tax" 
            className="hover:text-foreground transition-colors"
          >
            support@bux.tax
          </a>
        </div>
      </div>
    </footer>
  );
}