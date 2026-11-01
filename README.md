# 🎬 RedGif Embedded Video Fix

A Tampermonkey/Greasemonkey userscript that fixes various issues with RedGif videos embedded in third-party pages.

## 🌟 Features

- ⏸️ **Stops autoplay and looping** - Videos stay paused until you choose to play them
- 🔊 **Enables audio** - Clicks the RedGif sound button when it is available
- 🔗 **Blocks navigation links** - Prevents video links from navigating away from the embed
- 🎮 **Click-to-play/pause** - Click the video backdrop to start or pause playback
- 🔄 **Dynamic detection** - Handles videos and controls added after the page loads
- 🐛 **Debug logging** - Enable diagnostic messages by changing the `DEBUG` constant

## 📦 Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge) or [Greasemonkey](https://www.greasespot.net/) (Firefox)
2. Click [this link](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix.user.js) to install the script. Your userscript manager will check this URL for updates.
3. Or create a new script and paste the code manually

## 🎯 How it works

The script runs on pages matching `https://www.redgifs.com/ifr/*` (typically RedGif embeds) and:

1. Disables autoplay and looping on videos, and pauses any video already playing
2. Blocks programmatic video playback until you click the backdrop to play
3. Clicks the sound button (`.SoundButton`) when it is available
4. Prevents `.videoLink` and `/watch/` links from navigating away
5. Adds click-to-play/pause control to the video backdrop
6. Watches for dynamically added page elements and applies the fixes to them

## 🛠️ Usage

The fixes are applied automatically. Click the video backdrop to start playback, and click it again to pause.

### Debug mode

To enable diagnostic messages in the browser console, change `const DEBUG = false` to `const DEBUG = true` in the userscript and save it. The script does not expose a `toggleDebug()` console function.
