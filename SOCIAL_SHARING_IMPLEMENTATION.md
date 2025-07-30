# Social Media Sharing Implementation

## Overview

This document outlines the implementation of social media sharing functionality for BuxTax, focusing on generating shareable images and captions for various social platforms.

## Architecture

### Client-Side Image Generation

- Uses `html2canvas` to capture card elements as images
- Generates data URLs for immediate sharing
- Works with Vite/React setup (no server-side dependencies)

### Key Components

1. **ShareMenu Component** (`src/components/shared/ShareMenu.tsx`)

   - Handles all sharing functionality
   - Generates captions and images
   - Supports multiple social platforms

2. **MetaGenerator Utilities** (`src/utils/metaGenerator.ts`)

   - Generates formatted social media captions
   - Creates share URLs for different platforms
   - Handles canvas-to-image conversion

3. **Export Utilities** (`src/utils/exportUtils.ts`)
   - Handles PNG/PDF export functionality
   - Manages html2canvas configuration
   - Adds watermarks and styling

## Features

### Social Media Platforms Supported

- **Twitter**: Opens share dialog with formatted caption
- **Reddit**: Submits to Reddit with title and URL
- **LinkedIn**: Professional sharing with title and summary
- **Facebook**: Opens Facebook share dialog
- **Discord**: Copies caption with embedded image data

### Image Generation

- **Preview**: Opens card image in new tab for review
- **Download PNG**: Saves high-quality PNG file
- **Download PDF**: Creates PDF version of card
- **Discord Integration**: Embeds image data directly in text

### Caption Generation

- Automatically formats card data into engaging captions
- Includes emojis and relevant hashtags
- Adapts content based on card type (profit, goal, fee)
- User-type specific calculations (Game Dev vs UGC Creator)

## Implementation Details

### Card Types

1. **Profit Calculator**: Shows net earnings and effective take rate
2. **Goal Seeker**: Displays target USD and required Robux
3. **Fee Breakdown**: Shows effective take rate and net earnings

### User Types

- **Game Developer**: Uses 350 Robux = $1 USD conversion
- **UGC Creator**: Uses 1000/3 Robux = $1 USD conversion

### Image Quality

- High-resolution exports (2x scale)
- White background for consistency
- CORS-enabled for external resources
- Proper error handling and fallbacks

## Usage

### For Users

1. Click the share button on any calculator card
2. Choose from available sharing options:
   - Preview the card image
   - Download as PNG or PDF
   - Share to social media platforms
   - Copy caption for manual sharing

### For Developers

1. Ensure cards have proper `dataSourceId` attributes
2. Pass `cardType` and `userType` props to ShareMenu
3. Include relevant `shareData` for caption generation

## Technical Notes

### Dependencies

- `html2canvas`: Client-side image generation
- `jspdf`: PDF export functionality
- `lucide-react`: Icons for UI elements

### Browser Compatibility

- Modern browsers with Canvas API support
- CORS-enabled for external images
- Clipboard API for copy functionality

### Performance Considerations

- Images generated on-demand
- No server-side processing required
- Efficient canvas-to-dataURL conversion

## Future Enhancements

1. **Server-Side OG Images**: Implement Next.js API routes for better social media previews
2. **Custom Templates**: Allow users to customize card designs
3. **Analytics**: Track sharing metrics and engagement
4. **Batch Export**: Export multiple cards at once
5. **Advanced Formatting**: More sophisticated caption generation

## Troubleshooting

### Common Issues

1. **Element not found**: Ensure card has proper ID and is visible
2. **Image quality**: Check html2canvas scale settings
3. **CORS errors**: Verify external image sources
4. **Clipboard issues**: Check browser permissions

### Debug Steps

1. Check browser console for errors
2. Verify element IDs match between components
3. Test with different card types and user types
4. Ensure all required props are passed correctly
