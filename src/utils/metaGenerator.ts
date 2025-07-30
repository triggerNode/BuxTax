// src/utils/metaGenerator.ts

export interface ShareData {
  netEarnings?: number;
  effectiveTakeRate?: number;
  nextGoal?: number;
  goalDeadline?: string;
  // Additional fields for specific card types
  targetUSD?: number;
  requiredRobux?: number;
  feePercentage?: number;
}

export type CardType = 'profit' | 'goal' | 'fee';
export type UserType = 'gameDev' | 'ugcCreator';

/**
 * Generates a social media share URL for various platforms.
 * @param platform The social media platform ('twitter', 'reddit', 'linkedin', 'facebook').
 * @param cardTitle The title of the card.
 * @param caption The caption to share.
 * @returns The share URL for the specified platform.
 */
export function generateSocialShareUrl(
  platform: 'twitter' | 'reddit' | 'linkedin' | 'facebook',
  cardTitle: string,
  caption: string
): string {
  const pageUrl = window.location.href; // Current page URL

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(pageUrl)}&hashtags=BuxTax,RobloxDev`;
    case 'reddit':
      return `https://reddit.com/submit?title=${encodeURIComponent(caption)}&url=${encodeURIComponent(pageUrl)}`;
    case 'linkedin':
      return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(cardTitle)}&summary=${encodeURIComponent(caption)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(caption)}`;
    default:
      return '';
  }
}

/**
 * Converts ShareMenu's shareData to a formatted caption for social sharing.
 * @param shareMenuData The shareData from ShareMenu.
 * @param cardType The type of card.
 * @param userType The user type.
 * @param cardTitle The title of the card.
 * @returns A formatted caption for social media sharing.
 */
export function generateSocialCaption(
  shareMenuData: {
    netEarnings?: number;
    effectiveTakeRate?: number;
    nextGoal?: number;
    goalDeadline?: string;
  },
  cardType: CardType,
  userType: UserType,
  cardTitle: string
): string {
  const formatCurrency = (value?: number) => {
    if (!value) return '$0.00';
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return '0%';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatRobux = (value?: number) => {
    if (!value) return 'R$0';
    return `R$${Math.round(value).toLocaleString()}`;
  };

  let caption = `📊 BuxTax ${cardTitle}\n\n`;

  switch (cardType) {
    case 'profit':
      if (shareMenuData.netEarnings !== undefined) {
        caption += `💰 Net Earnings: ${formatCurrency(shareMenuData.netEarnings)}\n`;
      }
      if (shareMenuData.effectiveTakeRate !== undefined) {
        caption += `📈 Effective Take Rate: ${formatPercentage(shareMenuData.effectiveTakeRate)}\n`;
      }
      break;
    case 'goal':
      if (shareMenuData.nextGoal !== undefined) {
        caption += `🎯 Target: ${formatCurrency(shareMenuData.nextGoal)}\n`;
        // Calculate approximate Robux requirement
        const requiredRobux = shareMenuData.nextGoal * (userType === 'gameDev' ? 350 : 1000/3);
        caption += `🪙 Required Robux: ${formatRobux(requiredRobux)}\n`;
      }
      if (shareMenuData.goalDeadline) {
        caption += `⏰ Deadline: ${shareMenuData.goalDeadline}\n`;
      }
      break;
    case 'fee':
      if (shareMenuData.effectiveTakeRate !== undefined) {
        caption += `💸 Effective Take Rate: ${formatPercentage(shareMenuData.effectiveTakeRate)}\n`;
      }
      if (shareMenuData.netEarnings !== undefined) {
        caption += `💰 Net Earnings: ${formatCurrency(shareMenuData.netEarnings)}\n`;
      }
      break;
  }

  caption += `\n🔗 Check out BuxTax.com for more insights!`;
  return caption;
}

/**
 * Creates a data URL from a canvas element for sharing.
 * @param canvas The canvas element to convert.
 * @returns A data URL that can be shared.
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * Downloads a canvas as an image file.
 * @param canvas The canvas element to download.
 * @param filename The filename for the download.
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvasToDataURL(canvas);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
