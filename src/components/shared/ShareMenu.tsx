import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Download, MessageCircle, Linkedin, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  generateSocialShareUrl,
  generateSocialCaption,
  canvasToDataURL,
} from "@/utils/metaGenerator";
import { exportCard, captureCardImageBlob } from "@/utils/exportUtils";

const XMark = () => (
  <span className="inline-block w-4 text-base font-extrabold leading-none">
    X
  </span>
);

interface ShareMenuProps {
  dataSourceId?: string;
  shareData?: {
    netEarnings?: number;
    effectiveTakeRate?: number;
    nextGoal?: number;
    goalDeadline?: string;
  };
  cardTitle: string;
  cardType: "profit" | "goal" | "fee";
  userType: "gameDev" | "ugcCreator";
}

export function ShareMenu({
  dataSourceId,
  shareData,
  cardTitle,
  cardType,
  userType,
}: ShareMenuProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCaption = () => {
    return generateSocialCaption(
      shareData || {},
      cardType,
      userType,
      cardTitle
    );
  };

  const handleExport = async (format: "png" | "pdf") => {
    setIsGenerating(true);

    try {
      // Try server-side export first (Playwright service)
      try {
        const elementId =
          dataSourceId ||
          `buxtax-card-${cardTitle.toLowerCase().replace(/\s+/g, "-")}`;
        const payload = {
          userType,
          usdPayout: shareData?.netEarnings,
          netRobux: (shareData as any)?.netRobux,
          effectiveTakeRate: shareData?.effectiveTakeRate,
        };
        const endpoint =
          format === "pdf" ? "/export/profit.pdf" : "/export/profit.png";
        const base = (import.meta as any).env?.VITE_EXPORT_BASE || ""; // prod: "" (same-origin), dev: "http://localhost:4001"
        const resp = await fetch(`${base}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `bux-tax-profit-calculator.${format}`;
          a.click();
          URL.revokeObjectURL(url);
          toast({
            title: `${format.toUpperCase()} downloaded!`,
            description: `Your ${cardTitle} card has been saved as ${format.toUpperCase()}.`,
            duration: 3000,
          });
          setIsGenerating(false);
          return;
        }
      } catch {}

      // Fallback to client-side export
      // Generate the same ID format that BuxCard uses
      const elementId =
        dataSourceId ||
        `buxtax-card-${cardTitle.toLowerCase().replace(/\s+/g, "-")}`;

      console.log("Attempting to export element with ID:", elementId);

      // First, try to find the element to verify it exists
      const element = document.getElementById(elementId);
      if (!element) {
        console.error("Element not found with ID:", elementId);
        console.log("Available elements with similar IDs:");
        document.querySelectorAll('[id*="buxtax"]').forEach((el) => {
          console.log("Found element:", (el as HTMLElement).id);
        });

        toast({
          title: "Export failed",
          description: `Card element not found for ID: ${elementId}. Please ensure the card is visible.`,
          variant: "destructive",
          duration: 5000,
        });
        setIsGenerating(false);
        return;
      }

      await exportCard(elementId, { format });

      toast({
        title: `${format.toUpperCase()} downloaded!`,
        description: `Your ${cardTitle} card has been saved as ${format.toUpperCase()}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Please try again or ensure the card is fully visible.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSocialShare = async (
    platform: "twitter" | "reddit" | "discord" | "linkedin"
  ) => {
    try {
      const elementId =
        dataSourceId ||
        `buxtax-card-${cardTitle.toLowerCase().replace(/\s+/g, "-")}`;

      // Capture image blob with the same exclusion logic
      const blob = await captureCardImageBlob(elementId);

      // Attempt to copy the image to clipboard (best-effort)
      if (
        navigator.clipboard &&
        "write" in navigator.clipboard &&
        typeof (window as any).ClipboardItem !== "undefined"
      ) {
        try {
          await (navigator.clipboard as any).write([
            new (window as any).ClipboardItem({ "image/png": blob }),
          ]);
        } catch {}
      }

      const caption = generateCaption();

      // Prefer server-hosted image URL for Reddit/LinkedIn previews when available
      let hostedImageUrl: string | undefined;
      try {
        const base = (import.meta as any).env?.VITE_EXPORT_BASE || ""; // e.g. http://localhost:4001
        if (base) {
          const params = new URLSearchParams();
          if (typeof (shareData as any)?.netEarnings === "number")
            params.set("usdPayout", String((shareData as any).netEarnings));
          if (typeof (shareData as any)?.netRobux === "number")
            params.set("netRobux", String((shareData as any).netRobux));
          if (typeof shareData?.effectiveTakeRate === "number")
            params.set(
              "effectiveTakeRate",
              String(shareData.effectiveTakeRate)
            );
          params.set("userType", userType);
          hostedImageUrl = `${base}/image/profit.png?${params.toString()}`;
        }
      } catch {}

      if (platform === "discord") {
        try {
          await navigator.clipboard.writeText(caption);
        } catch {}
        toast({
          title: "Ready for Discord!",
          description: "Image + caption copied — paste in Discord.",
          duration: 6000,
        });
        return;
      }

      // For other platforms, open share URL with caption and current page URL
      // If we have a hosted image for Reddit, supply it as the URL to improve preview reliability
      const shareUrl =
        platform === "reddit" && hostedImageUrl
          ? `https://reddit.com/submit?title=${encodeURIComponent(
              caption
            )}&url=${encodeURIComponent(hostedImageUrl)}`
          : generateSocialShareUrl(platform, cardTitle, caption);
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

      window.open(shareUrl, "_blank", "noopener,noreferrer");
      toast({
        title: `${platformName} share opened!`,
        description: "Your BuxTax card data is ready to share!",
        duration: 5000,
      });
    } catch (error) {
      console.error("Social share error:", error);
      toast({
        title: "Share failed",
        description:
          "Please try again or use the download option to share manually.",
        variant: "destructive",
      });
    }
  };

  // removed: handleCopyCaption, handlePreviewImage (no longer used)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          aria-label="Open share menu"
          data-share-exclude="true"
          className="rounded-full px-3 h-8 text-sm font-semibold border-2 border-brand-royal bg-brand-yellow text-brand-royal hover:bg-brand-royal hover:text-brand-yellow transition-colors"
        >
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 p-0 rounded-2xl bg-brand-yellow text-brand-royal border-2 border-brand-royal shadow-lg overflow-hidden"
      >
        {/* Decorative share badge (top-right) */}
        <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-brand-royal border-2 border-brand-royal text-brand-yellow grid place-items-center">
          <Share2 className="h-4 w-4" />
        </div>

        {/* 1) Download PNG */}
        <DropdownMenuItem
          onClick={() => handleExport("png")}
          disabled={isGenerating}
          className="flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-none border-b border-brand-royal/40 data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
        >
          <Download className="h-5 w-5" />
          Download PNG
          <Check className="ml-auto h-4 w-4 opacity-0 data-[highlighted]:opacity-100 text-brand-yellow" />
        </DropdownMenuItem>

        {/* 2) Share on X */}
        <DropdownMenuItem
          onClick={() => handleSocialShare("twitter")}
          className="flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-none border-b border-brand-royal/40 data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
        >
          <XMark />
          Share on X
          <Check className="ml-auto h-4 w-4 opacity-0 data-[highlighted]:opacity-100 text-brand-yellow" />
        </DropdownMenuItem>

        {/* 3) Share on Reddit */}
        <DropdownMenuItem
          onClick={() => handleSocialShare("reddit")}
          className="flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-none border-b border-brand-royal/40 data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
        >
          <div className="h-5 w-5 rounded-sm bg-[hsl(var(--action))]" />
          Share on Reddit
          <Check className="ml-auto h-4 w-4 opacity-0 data-[highlighted]:opacity-100 text-brand-yellow" />
        </DropdownMenuItem>

        {/* 4) Share on LinkedIn */}
        <DropdownMenuItem
          onClick={() => handleSocialShare("linkedin")}
          className="flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-none border-b border-brand-royal/40 data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
        >
          <Linkedin className="h-5 w-5" />
          Share on LinkedIn
          <Check className="ml-auto h-4 w-4 opacity-0 data-[highlighted]:opacity-100 text-brand-yellow" />
        </DropdownMenuItem>

        {/* 5) Copy for Discord */}
        <DropdownMenuItem
          onClick={() => handleSocialShare("discord")}
          className="flex items-center gap-3 px-4 py-3 text-base font-semibold rounded-none data-[highlighted]:bg-brand-royal data-[highlighted]:text-brand-yellow"
        >
          <MessageCircle className="h-5 w-5" />
          Copy for Discord
          <Check className="ml-auto h-4 w-4 opacity-0 data-[highlighted]:opacity-100 text-brand-yellow" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
