import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Download,
  Twitter,
  MessageCircle,
  Linkedin,
  Facebook,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  generateSocialShareUrl,
  generateSocialCaption,
  canvasToDataURL,
  downloadCanvasAsImage,
} from "@/utils/metaGenerator";

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
      const { exportCard } = await import("@/utils/exportUtils");

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
          console.log("Found element:", el.id);
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
    platform: "twitter" | "reddit" | "discord" | "linkedin" | "facebook"
  ) => {
    try {
      const caption = generateCaption();

      if (platform === "discord") {
        // For Discord, we'll generate an image and provide both text and image
        const elementId =
          dataSourceId ||
          `buxtax-card-${cardTitle.toLowerCase().replace(/\s+/g, "-")}`;
        const element = document.getElementById(elementId);

        if (element) {
          // Import html2canvas for image generation
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(element, {
            backgroundColor: "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });

          // Convert canvas to data URL
          const imageDataUrl = canvasToDataURL(canvas);

          const enhancedCaption = `${caption}

🖼️ Image: ${imageDataUrl}

Share both the text and image for maximum impact!`;

          await navigator.clipboard.writeText(enhancedCaption);
          toast({
            title: "Ready for Discord!",
            description:
              "Caption and image data copied! Paste into Discord and the image will appear.",
            duration: 6000,
          });
        } else {
          // Fallback to just text
          await navigator.clipboard.writeText(caption);
          toast({
            title: "Ready for Discord!",
            description:
              "Caption copied. For images, please download the PNG and share manually.",
            duration: 6000,
          });
        }
        return;
      }

      // For other platforms, generate share URL
      const shareUrl = generateSocialShareUrl(platform, cardTitle, caption);
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

      // Open the social media share dialog
      window.open(shareUrl, "_blank", "noopener,noreferrer");

      // Show success message
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

  const handleCopyCaption = async () => {
    try {
      const caption = generateCaption();
      await navigator.clipboard.writeText(caption);
      toast({
        title: "Caption copied!",
        description: "Your card data has been copied to clipboard.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewImage = async () => {
    try {
      const elementId =
        dataSourceId ||
        `buxtax-card-${cardTitle.toLowerCase().replace(/\s+/g, "-")}`;
      const element = document.getElementById(elementId);

      if (element) {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
        });

        // Open the image in a new tab
        const imageDataUrl = canvasToDataURL(canvas);
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>BuxTax Card Preview</title></head>
              <body style="margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <h2 style="margin-top: 0; color: #333;">Social Media Card Preview</h2>
                  <p style="color: #666; margin-bottom: 20px;">This is how your card will look when shared:</p>
                  <img src="${imageDataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
                  <p style="margin-top: 20px; color: #666; font-size: 14px;">
                    Right-click the image to save it, or use the download options in the share menu.
                  </p>
                </div>
              </body>
            </html>
          `);
        }

        toast({
          title: "Preview opened!",
          description:
            "This is how your social media card will look when shared.",
          duration: 4000,
        });
      } else {
        toast({
          title: "Preview failed",
          description: "Could not find the card element to preview.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Preview failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isGenerating}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handlePreviewImage()}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm bg-blue-500" />
            Preview Social Card
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("png")}
          disabled={isGenerating}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isGenerating}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSocialShare("twitter")}>
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("reddit")}>
          <div className="mr-2 h-4 w-4 rounded-sm bg-orange-500" />
          Share on Reddit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("linkedin")}>
          <Linkedin className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("facebook")}>
          <Facebook className="mr-2 h-4 w-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSocialShare("discord")}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Copy for Discord
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyCaption}>
          <div className="mr-2 h-4 w-4 rounded-sm bg-gray-500" />
          Copy Caption
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
