# RedGif Embedded Video Fix

A Tampermonkey/Greasemonkey userscript that makes RedGif videos embedded on third-party pages easier to control. It disables autoplay and looping, enables audio when possible, blocks navigation links, and adds click-to-play/pause behavior.

## Features

- Keeps embedded videos paused until you start them.
- Disables looping and attempts to enable audio.
- Prevents video links from navigating away from the embed.
- Click the video backdrop to play or pause.
- Optionally pauses when leaving the embed or using the mouse wheel, and resumes on re-entry.
- Optionally seek backward or forward with the left/right arrow keys.
- Detects videos and controls added dynamically.

## Choose a version

Install **only one** version for each browser:

### Original — settings in the script

[Install the original userscript](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix.user.js)

The playback and keyboard options are configured by editing the constants near the top of the script. By default, pause-on-exit, resume-on-enter, pause-on-wheel, and keyboard seeking are enabled; arrow keys skip 5 seconds.

### Settings — configure from the embed

[Install the settings userscript](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-settings.user.js)

Use the gear icon at the top-right of the embed to open **Userscript Settings**. Toggle the four playback/keyboard options and choose the number of seconds to skip. The defaults match the original version, and your userscript manager saves your choices.

> Do not install both versions at the same time: they run on the same RedGif embeds.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. Choose one version above and open its install link.
3. Confirm the installation in your userscript manager.

Both scripts run on pages matching `https://www.redgifs.com/ifr/*`.

## Usage

Click the video backdrop to play or pause. When keyboard seeking is enabled, use the left and right arrow keys to seek backward or forward. The settings version lets you change the skip duration and playback options without editing the script.

## Debug mode

To enable diagnostic messages, set `const DEBUG = false` to `true` in the userscript source and save it. The script does not expose a `toggleDebug()` console function.

## License

MIT
