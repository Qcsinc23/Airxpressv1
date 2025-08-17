# Hero Section Image Requirements

## Required Images for Professional Hero Section

### 1. **Background Image** (`/public/hero-bg.jpg`)
- **Purpose**: Background landscape image for the hero section
- **Specifications**:
  - Resolution: 1920x1080px minimum
  - Format: JPG (optimized for web)
  - Content: Professional shipping/cargo/aviation themed image
  - Colors: Blue/navy tones to match brand
  - File size: Under 500KB for optimal loading

### 2. **Hero Transparent Image** (`/public/hero-transparent.png`)
- **Purpose**: Main focal point with transparency effects
- **Specifications**:
  - Resolution: 800x800px minimum
  - Format: PNG with alpha transparency
  - Content: Airplane, cargo container, or shipping symbol
  - Background: Fully transparent (alpha channel)
  - Clean edges: No halos or artifacts
  - File size: Under 300KB

## Current Status
- ✅ Hero component implemented with professional transparency effects
- ✅ CSS animations and styling completed
- ✅ Integrated into main application page
- ⏳ **Images needed**: Add the two images above to `/public/` folder

## Fallback Behavior
The hero section will display gracefully even without images:
- Text content and CTAs will remain functional
- Background gradients provide visual appeal
- Component is fully responsive and accessible

## Testing
Once images are added, the hero section will display:
- Professional transparency effects on the hero image
- Clean alpha channel rendering without artifacts
- Optimized layering for seamless background integration
- Floating animation elements for visual enhancement