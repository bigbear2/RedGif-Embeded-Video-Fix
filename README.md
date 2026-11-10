# RedGif Embedded Video Fix

Tampermonkey/Greasemonkey userscripts for controlling RedGif videos embedded on third-party pages. Both versions always block autoplay, can optionally disable looping, pause/resume videos based on pointer and wheel activity, and support arrow-key seeking.

## Choose a version

Install **only one** version for each browser:

### Lite — options in the script

[Install RedGif Embed Video Fix Lite](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-lite.user.js)

Edit the constants near the top of the script to configure behavior:

- Autoplay is always blocked.
- `ENABLE_VIDEO_LOOP` defaults to `false`.
- Pause-on-exit, resume-on-enter, pause-on-wheel, and keyboard seeking default to `true`.
- `SKIP_SECONDS` defaults to `5`.

### UI — options in the embed

[Install RedGif Embed Video Fix UI](https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-ui.user.js)

Open the gear icon in the top-right of the embed to change looping, pause/resume behavior, keyboard seeking, and the seek duration. Autoplay is always blocked. Settings are saved by your userscript manager. Looping defaults to off; the remaining options default to on, with a 5-second seek.

> Do not install both versions at the same time: they run on the same RedGif embed pages.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. Choose one version above and open its install link.
3. Confirm the installation in your userscript manager.

Both scripts run on pages matching `https://www.redgifs.com/ifr/*`.

## Features

- Always prevents automatic playback until you click the video to play.
- Disables looping unless enabled in the selected version.
- Attempts to enable audio when the RedGif sound control is available.
- Prevents video links from navigating away from the embed.
- Click the video backdrop to play or pause.
- Optionally pauses when leaving the embed or using the mouse wheel, and resumes on re-entry.
- Optionally seek backward or forward with the left/right arrow keys.
- Detects videos and controls added dynamically.

## Usage

Click the video backdrop to play or pause. When keyboard seeking is enabled, use the left and right arrow keys to seek by the configured number of seconds.

## Debug mode

To enable diagnostic messages, set `const DEBUG = false` to `true` in the userscript source and save it. The script does not expose a `toggleDebug()` console function.

## License

MIT
