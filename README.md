# AFJORD

> Stealth acquisition engine — automated media collection and content migration across Facebook, Instagram, WordPress, Shopify, and more.

---

## Overview

AFJORD is a cross-platform desktop application for streamlining website migrations and content gathering. It automates the download of images, videos, and other media from websites and social media platforms.

Built with Electron, it runs natively on both **Windows** and **macOS** and features a black and yellow stealth-themed interface with platform presets, session-based authentication for social media, AFIND dynamic stealth orchestration, and real-time download tracking.

---

## Features

- **Platform Presets** — One-click configuration for Facebook, Instagram, Twitter/X, Pinterest, Flickr, Tumblr, Reddit, Squarespace, WordPress, Wix, Shopify, and custom URLs
- **Session Cookie Authentication** — Scrape logged-in content from Facebook and Instagram by injecting your browser session cookies
- **Headless Browser Engine** — Powered by Puppeteer, handles JavaScript-rendered pages that standard scrapers miss
- **AFIND Stealth Engine** — Dynamic orchestration of 15 anti-blocking methods with automatic escalation and domain-adaptive learning
- **Smart Filtering** — Filter downloads by date range, content type (images, videos, documents, audio, fonts), and file size
- **Crawl Options** — Configurable depth, delay, thread count, and max file limits
- **Deduplication** — Automatically skips duplicate files based on content hash
- **Real-time Results** — Live results table and activity log with status indicators
- **Export** — Export results to CSV or JSON, save activity logs
- **Built-in Instructions** — Contextual help with Quick Start, Settings explanations, and per-platform notes

---

## Supported Platforms

| Platform | Method | Notes |
|---|---|---|
| Facebook | Puppeteer + Cookies | Requires session cookies from Chrome |
| Instagram | Puppeteer + Cookies | Requires session cookies, set delay 2s+ |
| Twitter / X | Puppeteer + Cookies | Use /media tab URL |
| WordPress | Standard HTTP | Most reliable, works on all client sites |
| Squarespace | Standard HTTP | Gallery and portfolio pages |
| Shopify | Standard HTTP | Use /collections or /products URLs |
| Wix | Puppeteer recommended | JS-heavy, enable cookie mode |
| Pinterest | Standard HTTP | Public boards only |
| Flickr | Standard HTTP | Excellent structure |
| Custom URL | Standard HTTP | Any public website |

---

## Requirements

- [Node.js](https://nodejs.org) v18 or higher (LTS recommended)
- Windows 10/11 or macOS 11+
- ~500MB disk space (includes Puppeteer's bundled Chrome)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Alucrob/AFJORD.git
cd AFJORD

# 2. Install dependencies
npm install

# 3. Run the app
npm start
```

---

## Building a Distributable

```bash
# Windows installer (.exe)
npm run build:win

# macOS dmg
npm run build:mac
```

Built files will appear in the `dist/` folder.

---

## How to Use

### Basic Scraping
1. Select a platform preset from the left sidebar, or enter a URL manually
2. Optionally set a date range to filter files by upload date
3. Select content types to download (Images, Videos, Documents, etc.)
4. Set your output folder using the Browse button
5. Click **Start Scrape**

### Facebook & Instagram (Session Cookies)
Facebook and Instagram block anonymous scraping. To scrape these platforms:

1. Enable **Use session cookies** in the Session Cookies card
2. Select your platform (Facebook / Instagram)
3. Open Chrome and log into the platform
4. Press **F12** > **Application** tab > **Cookies** > select the domain
5. Copy the required cookie values into the labeled fields:
   - **Facebook**: `c_user`, `xs`, `datr`, `fr`
   - **Instagram**: `sessionid`, `csrftoken`, `ds_user_id`
6. Click **Start Scrape**

> Keep cookie values private -- they act as a temporary login to your account and expire after a few weeks.

### Crawl Settings Guide

| Setting | Recommended | Description |
|---|---|---|
| Crawl Depth | 0-1 | 0 = current page only, 1 = follow links one level deep |
| Delay | 0.5-2s | Wait between requests. Use 2s+ for social media |
| Max Files | Start at 50 | Hard stop to prevent runaway downloads |
| Timeout | 10-15s | How long to wait for slow servers |

---

## Project Structure

```
AFJORD/
├── main.js              # Electron main process + scraping engine
├── package.json         # Dependencies and build config
├── version.json         # Current version (used by auto-updater)
├── src/
│   ├── index.html       # Main application UI
│   ├── loading.html     # Startup loading screen
│   ├── updater.html     # Auto-update UI
│   ├── preload.js       # Electron context bridge
│   ├── styles/          # Modular CSS (theme, layout, components, log, animations)
│   ├── js/              # Modular JS (app, pages, components, stealth)
│   └── agent/           # AFIND stealth orchestration engine
├── config/              # Stealth configuration
└── assets/
    └── icon.ico         # App icon
```

---

## Updating the App

AFJORD includes an auto-updater. When a new version is released:

1. Push updated files to this repository
2. Bump the version number in `version.json`
3. Users will be notified automatically on next launch and prompted to update

---

## Built With

- [Electron](https://electronjs.org) — Desktop app framework
- [Puppeteer](https://pptr.dev) — Headless Chrome browser automation
- [Node.js](https://nodejs.org) — Runtime
- IBM Plex Mono — UI typography

---

*AFJORD — Stealth Acquisition Engine*
