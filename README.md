# 🎬 RedGif Embedded Video Fix

A Tampermonkey/Greasemonkey userscript that fixes various issues with RedGif videos embedded in third-party pages.

## 🌟 Features

- ✅ **Disables automatic loop** - Videos no longer repeat endlessly
- 🔊 **Automatically enables audio** - Clicks the sound button on startup
- 🔗 **Blocks navigation links** - Prevents leaving the page when clicking on links
- 🎮 **Play/Stop Toggle** - Click on the video backdrop to pause/play
- 🔄 **Dynamic detection** - Handles dynamically loaded elements
- 🐛 **Debug mode** - Toggle logs from console with `toggleDebug()`

## 📦 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge) or [Greasemonkey](https://www.greasespot.net/) (Firefox)
2. Click [this link](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix.user.js) to install the script
3. Or create a new script and paste the code manually

## 🎯 How it works

The script automatically intervenes when you visit a page with URL `https://www.redgifs.com/ifr/*` (typically RedGif embeds) and:

1. Waits for the page to fully load
2. Finds and disables the `loop` attribute on all video tags
3. Locates and clicks the sound button (`.SoundButton`)
4. Blocks all links pointing to `/watch/` by replacing them with `#`
5. Adds a listener to the backdrop for click-to-play/pause control
6. Monitors for any dynamically loaded elements

## 🛠️ Usage

The script works completely automatically. No user interaction is required.

### Debug mode

To see debug logs in the browser console:

```javascript
// Enable/disable logs
toggleDebug()

// Current status will be shown:
// "Debug mode: ON" or "Debug mode: OFF"