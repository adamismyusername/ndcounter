# US National Debt Counter Widget

A simple, embeddable widget that displays the current U.S. National Debt with lightning-fast performance. This lightweight widget can be dropped into any website with a single code snippet and is designed to be responsive, easy to implement, and highly customizable.

# Table of Contents

Live Demo
Features
Quick Start
CSS Customization Guide
CSS Selector Reference
Quick Customization Examples
Pre-built Themes
Responsive Customization
Advanced Examples
Troubleshooting
How It Works
Support

[A link to that custom anchor](#-support)

## 🚀 Live Demo

You can see a live version of the widget here: **[https://adamismyusername.github.io/ndcounter/](https://adamismyusername.github.io/ndcounter/)**

## ✨ Features

- **⚡ Lightning Fast**: Data served from cached JSON files for instant loading
- **🔄 Always Fresh**: Automatically updated daily via GitHub Actions
- **📊 Official Data**: Source data from the official [U.S. Treasury API](https://fiscaldata.treasury.gov)
- **🎯 Easy Implementation**: Add to your site with a single HTML snippet
- **🎨 Smooth Animation**: Features a beautiful "count-up" animation when loading
- **📱 Responsive Design**: Automatically adjusts for mobile, tablet, and desktop
- **🛠️ Highly Customizable**: Easy CSS customization with comprehensive documentation
- **🔒 Bulletproof Reliable**: Multiple fallback layers ensure it always works
- **📈 Infinitely Scalable**: Handle unlimited traffic without API rate limits
- **🚫 No Dependencies**: Built with vanilla JavaScript - no external libraries required

## 📦 Quick Start

To add the U.S. National Debt Counter to your website, copy and paste the following code where you want the widget to appear:

```html
<!-- US National Debt Widget v1.0.2 -->
<link rel="stylesheet" href="https://adamismyusername.github.io/ndcounter/national-debt-counter.css">
<script src="https://adamismyusername.github.io/ndcounter/national-debt-counter.js"></script>

<!-- Begin Custom CSS -->
<style>
---CUSTOM CSS CODE GOES HERE---
</style>
<!-- End Custom CSS -->

<!-- Widget HTML -->
<div id="debt-widget-container">
    <div id="debt-amount">Loading...</div>
    <div class="widget-info">
        <span id="last-updated-date">Updated: Today's Date</span>
        <span id="data-source">Source: https://fiscaldata.treasury.gov</span>
    </div>
</div>
```

**That's it!** The CSS and JavaScript are hosted via GitHub Pages, so you don't need to host any files yourself.

## 🎨 CSS Customization Guide

The widget is designed for easy customization using standard CSS. 

Add your custom styles inbetween the <style> & </style> tags in the section labeled "Custom CSS".

Simply replace **---CUSTOM CSS CODE GOES HERE---** with your custom CSS as shown in the example below.

```html
<!-- Begin Custom CSS -->
<style>
---CUSTOM CSS CODE GOES HERE---
</style>
<!-- End Custom CSS -->
```
For example, if you were going to change the color of debt value number to black, your full code would look like this...

```html
<!-- US National Debt Widget v1.0.2 -->
<link rel="stylesheet" href="https://adamismyusername.github.io/ndcounter/national-debt-counter.css">
<script src="https://adamismyusername.github.io/ndcounter/national-debt-counter.js"></script>

<!-- Begin Custom CSS -->
<style>
  #debt-amount { color: #000000;}
</style>
<!-- End Custom CSS -->

<!-- Widget HTML -->
<div id="debt-widget-container">
    <div id="debt-amount">Loading...</div>
    <div class="widget-info">
        <span id="last-updated-date">Updated: Today's Date</span>
        <span id="data-source">Source: https://fiscaldata.treasury.gov</span>
    </div>
</div>
```

### 📋 CSS Selector Reference

| Selector | Target | Description |
|----------|--------|-------------|
| `#debt-widget-container` | Main container | Overall widget wrapper, background, padding, borders |
| `#debt-amount` | Debt number | The main debt amount display, color, size, font |
| `.widget-info` | Info line container | Container for date and source, layout, spacing |
| `#last-updated-date` | Date text | The "Updated: ..." text styling |
| `#data-source` | Source text | The "Source: ..." text styling |
| `.digit-container` | Individual digits | Each digit in the debt amount (for animations) |
| `.currency-symbol` | Dollar sign | The $ symbol styling |

### 🎯 Quick Customization Examples

#### Change Colors
```css
/* Blue theme */
#debt-amount {
    color: #2563eb;
}

.widget-info {
    color: #3b82f6;
}
```

#### Add Background and Border
```css
#debt-widget-container {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

#### Larger Text
```css
#debt-amount {
    font-size: 72px;
}

.widget-info {
    font-size: 18px;
}
```

### 🌈 Pre-built Themes

#### Dark Mode Theme
```css
#debt-widget-container {
    background: #1a202c;
    color: #e2e8f0;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #2d3748;
}

#debt-amount {
    color: #68d391;
    text-shadow: 0 0 10px rgba(104, 211, 145, 0.3);
}

.widget-info {
    color: #a0aec0;
}
```

#### Minimal Theme
```css
#debt-widget-container {
    background: transparent;
    border: none;
    padding: 0;
}

#debt-amount {
    color: #374151;
    font-weight: 400;
    font-size: 48px;
    letter-spacing: 0;
}

.widget-info {
    color: #9ca3af;
    font-size: 12px;
}
```

#### Colorful Theme
```css
#debt-widget-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

#debt-amount {
    color: #fbbf24;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    font-size: 56px;
}

.widget-info {
    color: #f3f4f6;
    font-weight: 500;
}
```

### 📱 Responsive Customization

```css
/* Mobile-first approach */
#debt-amount {
    font-size: 24px;
}

/* Tablet styles */
@media (min-width: 768px) {
    #debt-amount {
        font-size: 42px;
    }
}

/* Desktop styles */
@media (min-width: 1024px) {
    #debt-amount {
        font-size: 60px;
    }
}
```

### 🚀 Advanced Examples

#### Animated Background
```css
#debt-widget-container {
    background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    padding: 30px;
    border-radius: 15px;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

#### Glassmorphism Effect
```css
#debt-widget-container {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

## 🔧 Troubleshooting

### My styles aren't being applied

**Common Issue:** CSS specificity conflicts

**Solutions:**
- Make sure your CSS is loaded AFTER the widget's CSS
- Use more specific selectors: `#debt-widget-container #debt-amount`
- Add `!important` as a last resort: `color: blue !important;`

### Responsive styles not working

Make sure to include viewport meta tag in your HTML:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Widget looks broken on mobile

Check these common issues:
- Font sizes too large for small screens
- Fixed widths preventing responsive behavior
- Missing mobile-specific CSS rules

## ⚙️ How It Works

### 🔄 Data Flow
1. **GitHub Action** runs daily at 9:00 AM EST
2. **Fetches latest data** from the U.S. Treasury API
3. **Saves to JSON file** in this repository
4. **Your widget** loads data from the fast JSON file
5. **Displays with animation** and formatting

### 🏗️ Technical Architecture
- **Data Source**: Official U.S. Treasury Fiscal Data API
- **Caching Layer**: GitHub Pages hosted JSON files
- **Update Frequency**: Daily automated updates
- **Fallback System**: Multiple layers ensure reliability
- **Performance**: Near-instant loading from CDN

## 🚀 Performance Benefits
- **⚡ 10x Faster Loading**: JSON files load in milliseconds vs. API calls
- **📈 Infinite Scalability**: No API rate limits to worry about
- **🔒 99.9% Uptime**: Multiple fallback layers ensure reliability
- **🌍 Global CDN**: Fast loading worldwide via GitHub Pages
- **📱 Mobile Optimized**: Responsive design for all devices

## 🛠️ Advanced Usage

### Testing Your Customizations

> **💡 Best Practice:** Always test your customizations in multiple browsers and screen sizes. Use browser developer tools to preview different devices.

### CSS Specificity Guide

If you're having specificity issues, use these selector patterns:

```css
/* Low specificity (may not override) */
#debt-amount { color: blue; }

/* Medium specificity (usually works) */
#debt-widget-container #debt-amount { color: blue; }

/* High specificity (almost always works) */
div#debt-widget-container #debt-amount { color: blue; }

/* Nuclear option (always works, use sparingly) */
#debt-amount { color: blue !important; }
```


## 📞 Support

### Common Issues
- **Widget not loading**: Check that all HTML IDs are present and correct
- **Styling not applying**: Verify CSS specificity and load order
- **Console errors**: Check browser developer tools for specific error messages

### Need Help?
- Check the browser's developer tools to inspect the widget structure
- Test your CSS in a simple HTML file first
- Make sure there are no syntax errors in your CSS
- Verify the widget HTML structure matches the required IDs

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ for transparency in government finance**
