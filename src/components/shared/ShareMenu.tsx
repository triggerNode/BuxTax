import { useState } from "react";
import { Share2, Download, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatPercentage } from "@/lib/fees";

interface ShareData {
  netEarnings?: number;
  effectiveTakeRate?: number;
  nextGoal?: number;
  goalDeadline?: string;
}

interface ShareMenuProps {
  dataSourceId?: string;
  shareData?: ShareData;
  cardTitle: string;
}

export function ShareMenu({ dataSourceId, shareData, cardTitle }: ShareMenuProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCaption = () => {
    if (!shareData || !shareData.netEarnings) {
      return `Check out my Roblox earnings breakdown with @BuxTax! 🎮💰`;
    }

    const { netEarnings, effectiveTakeRate, nextGoal, goalDeadline } = shareData;
    
    let caption = `I just netted ${formatCurrency(netEarnings)} from my Roblox game`;
    
    if (effectiveTakeRate) {
      caption += ` (Roblox took ${formatPercentage(effectiveTakeRate)})`;
    }
    
    if (nextGoal) {
      caption += `. Next goal: ${formatCurrency(nextGoal)}`;
      if (goalDeadline) {
        caption += ` by ${goalDeadline}`;
      }
    }
    
    caption += `. Track yours with @BuxTax`;
    
    return caption;
  };

  const handleCopyCaption = async () => {
    const caption = generateCaption();
    try {
      await navigator.clipboard.writeText(caption);
      toast({
        title: "Caption copied!",
        description: "Share text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'link');
    url.searchParams.set('utm_campaign', 'user_share');
    
    try {
      await navigator.clipboard.writeText(url.toString());
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'reddit' | 'discord') => {
    const caption = generateCaption();
    const url = window.location.href;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?title=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`;
        break;
      case 'discord':
        // For Discord, we'll just copy the caption since there's no direct share URL
        handleCopyCaption();
        toast({
          title: "Ready for Discord!",
          description: "Caption copied - paste it in your Discord channel",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleExport = async (format: 'png' | 'pdf') => {
    setIsGenerating(true);
    
    try {
      const { exportCard } = await import('@/utils/exportUtils');
      const elementId = dataSourceId || 'main-content';
      
      await exportCard(elementId, {
        format,
        filename: `buxtax-${cardTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        addWatermark: true,
      });
      
      toast({
        title: `${format.toUpperCase()} exported!`,
        description: "File has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share {cardTitle}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport('png')} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('reddit')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Share on Reddit
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSocialShare('discord')}>
          <Copy className="mr-2 h-4 w-4" />
          Copy for Discord
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}