# Assets Folder Structure

This folder contains all static image assets for the MapPro application.

## Folder Organization

- **logos/** - Company logos, brand marks, and logo variations
- **icons/** - UI icons, favicons, and small graphical elements
- **images/** - General images, photos, and illustrations
- **backgrounds/** - Background images and patterns

## Usage

Assets will be copied to the `build/assets/` folder during build. Reference them in your code like this:

```javascript
// In components - assets will be served from /assets/ path
<img src="/assets/logos/main-logo.png" alt="MapPro Logo" />

// Or import them (webpack will handle the path resolution)
import logo from '../assets/logos/main-logo.png';
<img src={logo} alt="MapPro Logo" />
```

## File Naming Convention

- Use kebab-case for file names: `main-logo.png`, `menu-icon.svg`
- Include size/density in filename when applicable: `logo-small.png`, `logo-large.png`
- Use descriptive names that indicate usage: `hero-background.jpg`, `favicon.ico`

## Supported Formats

- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Icons**: SVG, PNG, ICO
- **Vectors**: SVG preferred for scalability