# ROM Scraper

> Internal desktop scraping tool for Ryan's Outdoor Media — automates media collection and content migration across Facebook, Instagram, WordPress, Shopify, and more.

---

## Overview

ROM Scraper is a cross-platform desktop application built for the Ryan's Outdoor Media team. It streamlines website migrations and content gathering by automating the download of images, videos, and other media from client websites and social media platforms.

Built with Electron, it runs natively on both **Windows** and **macOS** and features a clean, modern interface with platform presets, session-based authentication for social media, and real-time download tracking.

---

## Features

- **Platform Presets** — One-click configuration for Facebook, Instagram, Twitter/X, Pinterest, Flickr, Tumblr, Reddit, Squarespace, WordPress, Wix, Shopify, and custom URLs
- **Session Cookie Authentication** — Scrape logged-in content from Facebook and Instagram by injecting your browser session cookies
- **Headless Browser Engine** — Powered by Puppeteer, handles JavaScript-rendered pages that standard scrapers miss
- **Smart Filtering** — Filter downloads by date range, content type (images, videos, documents, audio, fonts), and file size
- **Crawl Options** — Configurable depth, delay, thread count, and max file limits
- **Deduplication** — Automatically skips duplicate files based on content hash
- **Real-time Results** — Live results table and activity log with status indicators
- **Export** — Export results to CSV or JSON, save activity logs
- **Built-in Instructions** — Contextual help sidebar with Quick Start, Settings explanations, and per-platform notes for team members

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
git clone https://github.com/Alucrob/Rom-Scraper.git
cd Rom-Scraper

# 2. Install dependencies
npm install

# 3. Run the app
npm start
```

---

## Building a Distributable

```bash
# Windows installer (.exe)
npm run build

# Portable .exe (no install required)
npm run build:portable
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
4. Press **F12** → **Application** tab → **Cookies** → select the domain
5. Copy the required cookie values into the labeled fields:
   - **Facebook**: `c_user`, `xs`, `datr`, `fr`
   - **Instagram**: `sessionid`, `csrftoken`, `ds_user_id`
6. Click **Start Scrape**

> ⚠️ Keep cookie values private — they act as a temporary login to your account and expire after a few weeks.

### Crawl Settings Guide

| Setting | Recommended | Description |
|---|---|---|
| Crawl Depth | 0–1 | 0 = current page only, 1 = follow links one level deep |
| Delay | 0.5–2s | Wait between requests. Use 2s+ for social media |
| Max Files | Start at 50 | Hard stop to prevent runaway downloads |
| Timeout | 10–15s | How long to wait for slow servers |

---

## Project Structure

```
Rom-Scraper/
├── main.js              # Electron main process + scraping engine
├── package.json         # Dependencies and build config
├── version.json         # Current version (used by auto-updater)
├── src/
│   ├── index.html       # Main application UI
│   ├── loading.html     # Startup loading screen
│   └── preload.js       # Electron context bridge
└── assets/
    └── icon.ico         # App icon
```

---

## Updating the App

ROM Scraper includes an auto-updater. When a new version is released:

1. Push updated files to this repository
2. Bump the version number in `version.json`
3. Team members will be notified automatically on next launch and prompted to update

---

## For Team Members

If you're a team member setting up ROM Scraper for the first time:

1. Install [Node.js LTS](https://nodejs.org)
2. Clone or download this repository
3. Open a terminal in the project folder and run `npm install`
4. Run `npm start` to launch the app
5. Check the **Quick Start** tab in the app's right sidebar for usage instructions

For questions or issues, contact your team lead.

---

## Built With

- [Electron](https://electronjs.org) — Desktop app framework
- [Puppeteer](https://pptr.dev) — Headless Chrome browser automation
- [Node.js](https://nodejs.org) — Runtime
- IBM Plex Mono — UI typography

---

*Ryan's Outdoor Media — Internal Tool — Not for public distribution*
