# Assets Directory

This directory contains all static assets for the web application.

## Directory Structure

```
assets/
├── images/
│   ├── ui/               # UI-specific images, backgrounds, decorative elements
│   └── placeholders/     # Placeholder images for loading states
├── icons/
│   └── disc-types/       # Custom icons for putters, midranges, drivers, etc.
├── fonts/                # Custom web fonts
└── data/                 # Static JSON/CSV files
```

## Guidelines

### File Naming Conventions

Use kebab-case with descriptive names:

**Good:**

- `innova-logo-primary.svg`
- `disc-placeholder-putter.png`
- `course-lake-marshall-hole-1.jpg`
- `brand-discraft-logo.svg`

**Bad:**

- `image1.png`
- `IMG_2024.jpg`
- `final_FINAL_v2.png`

### File Size Guidelines

**Before committing images:**

- SVG: Any size (they're tiny)
- PNG/JPG icons/logos: < 100KB
- PNG/JPG photos: < 300KB (optimize first!)
- Videos: DO NOT COMMIT (use external hosting)

**Optimization:**
Images are automatically optimized during build via `vite-plugin-image-optimizer`, but you should still optimize large images before committing:

- Use [TinyPNG](https://tinypng.com/) for PNG/JPG
- Use [Squoosh](https://squoosh.app/) for all formats
- Prefer WebP format for photos (better compression)

### Image Formats

- **Logos/Icons**: SVG (preferred) or PNG with transparency
- **Photos**: WebP (best compression) or JPG
- **Screenshots**: PNG
- **Avoid**: GIF (use MP4/WebM for animations)

### What NOT to Store Here

- User-uploaded content (use S3/external storage)
- Large video files (use video hosting service)
- Frequently changing data (use API)
- Sensitive or confidential files
- Generated/build artifacts

## Usage in Code

### Import images directly:

```tsx
import discPlaceholder from '@/assets/images/placeholders/disc-placeholder.png';

<img src={discPlaceholder} alt="Disc placeholder" />;
```

### Import from centralized index:

```tsx
// In assets/index.ts
export { default as DiscPlaceholder } from './images/placeholders/disc-placeholder.png';

// In your component
import { DiscPlaceholder } from '@/assets';
<img src={DiscPlaceholder} alt="Disc" />;
```

### Public folder alternative:

For assets that need stable URLs (rare), use `/public` instead of `/src/assets`.

## Best Practices

1. **Optimize before committing** - Run images through TinyPNG/Squoosh
2. **Use descriptive names** - Make it obvious what the image is
3. **Keep file sizes small** - Check file size before committing
4. **Prefer SVG for logos** - Scalable and tiny file size
5. **Use WebP for photos** - Better compression than JPG/PNG
6. **Don't duplicate** - Reuse existing assets when possible
7. **Document sources** - Add comment if using third-party assets

## CI/CD Checks

Large files (>300KB) will trigger warnings in CI. If you need to commit a large file, consider:

1. Further optimization
2. Using external hosting (S3, Cloudinary)
3. Documenting why it's necessary

## Questions?

See the main project README or ask the team in #engineering.
