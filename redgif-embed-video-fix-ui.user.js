// ==UserScript==
// @name         RedGif Embeded Video Fix - UI
// @namespace    http://tampermonkey.net/
// @version      0.21
// @author       bigbear2
// @description  Fixes embedded RedGif videos with playback, looping, and keyboard settings.
// @homepage     https://github.com/bigbear2/
// @downloadURL  https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-ui.user.js
// @updateURL    https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-ui.user.js
// @match        https://www.redgifs.com/ifr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=redgifs.com
// @sandbox      raw
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ---------- SETTINGS ----------
    const SETTINGS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path d="M13.1875 3L13.03125 3.8125L12.4375 6.78125C11.484375 7.15625 10.625 7.683594 9.84375 8.3125L6.9375 7.3125L6.15625 7.0625L5.75 7.78125L3.75 11.21875L3.34375 11.9375L3.9375 12.46875L6.1875 14.4375C6.105469 14.949219 6 15.460938 6 16C6 16.539063 6.105469 17.050781 6.1875 17.5625L3.9375 19.53125L3.34375 20.0625L3.75 20.78125L5.75 24.21875L6.15625 24.9375L6.9375 24.6875L9.84375 23.6875C10.625 24.316406 11.484375 24.84375 12.4375 25.21875L13.03125 28.1875L13.1875 29L18.8125 29L18.96875 28.1875L19.5625 25.21875C20.515625 24.84375 21.375 24.316406 22.15625 23.6875L25.0625 24.6875L25.84375 24.9375L26.25 24.21875L28.25 20.78125L28.65625 20.0625L28.0625 19.53125L25.8125 17.5625C25.894531 17.050781 26 16.539063 26 16C26 15.460938 25.894531 14.949219 25.8125 14.4375L28.0625 12.46875L28.65625 11.9375L28.25 11.21875L26.25 7.78125L25.84375 7.0625L25.0625 7.3125L22.15625 8.3125C21.375 7.683594 20.515625 7.15625 19.5625 6.78125L18.96875 3.8125L18.8125 3 Z M 14.8125 5L17.1875 5L17.6875 7.59375L17.8125 8.1875L18.375 8.375C19.511719 8.730469 20.542969 9.332031 21.40625 10.125L21.84375 10.53125L22.40625 10.34375L24.9375 9.46875L26.125 11.5L24.125 13.28125L23.65625 13.65625L23.8125 14.25C23.941406 14.820313 24 15.402344 24 16C24 16.597656 23.941406 17.179688 23.8125 17.75L23.6875 18.34375L24.125 18.71875L26.125 20.5L24.9375 22.53125L22.40625 21.65625L21.84375 21.46875L21.40625 21.875C20.542969 22.667969 19.511719 23.269531 18.375 23.625L17.8125 23.8125L17.6875 24.40625L17.1875 27L14.8125 27L14.3125 24.40625L14.1875 23.8125L13.625 23.625C12.488281 23.269531 11.457031 22.667969 10.59375 21.875L10.15625 21.46875L9.59375 21.65625L7.0625 22.53125L5.875 20.5L7.875 18.71875L8.34375 18.34375L8.1875 17.75C8.058594 17.179688 8 16.597656 8 16C8 15.402344 8.058594 14.820313 8.1875 14.25L8.34375 13.65625L7.875 13.28125L5.875 11.5L7.0625 9.46875L9.59375 10.34375L10.15625 10.53125L10.59375 10.125C11.457031 9.332031 12.488281 8.730469 13.625 8.375L14.1875 8.1875L14.3125 7.59375 Z M 16 11C13.25 11 11 13.25 11 16C11 18.75 13.25 21 16 21C18.75 21 21 18.75 21 16C21 13.25 18.75 11 16 11 Z M 16 13C17.667969 13 19 14.332031 19 16C19 17.667969 17.667969 19 16 19C14.332031 19 13 17.667969 13 16C13 14.332031 14.332031 13 16 13Z" fill="#FFFFFF" />
                            </svg>`;

    const APP_NAME = '🤖 Embedded Video Fix';
    const DEBUG = false;
    const SETTINGS_STORAGE_KEY = 'redgifEmbedVideoFix.settings';
    const DEFAULT_SETTINGS = {
        ENABLE_VIDEO_LOOP: false,
        ENABLE_PAUSE_ON_EXIT: true,
        ENABLE_PLAY_ON_ENTER: true,
        ENABLE_PAUSE_ON_WHEEL: true,
        ENABLE_KEYBOARD_SKIP: true,
        SKIP_SECONDS: 5
    };

    function loadSettings() {
        try {
            const stored = GM_getValue(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
            if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };

            return {
                ENABLE_VIDEO_LOOP: typeof stored.ENABLE_VIDEO_LOOP === 'boolean' ? stored.ENABLE_VIDEO_LOOP : DEFAULT_SETTINGS.ENABLE_VIDEO_LOOP,
                ENABLE_PAUSE_ON_EXIT: typeof stored.ENABLE_PAUSE_ON_EXIT === 'boolean' ? stored.ENABLE_PAUSE_ON_EXIT : DEFAULT_SETTINGS.ENABLE_PAUSE_ON_EXIT,
                ENABLE_PLAY_ON_ENTER: typeof stored.ENABLE_PLAY_ON_ENTER === 'boolean' ? stored.ENABLE_PLAY_ON_ENTER : DEFAULT_SETTINGS.ENABLE_PLAY_ON_ENTER,
                ENABLE_PAUSE_ON_WHEEL: typeof stored.ENABLE_PAUSE_ON_WHEEL === 'boolean' ? stored.ENABLE_PAUSE_ON_WHEEL : DEFAULT_SETTINGS.ENABLE_PAUSE_ON_WHEEL,
                ENABLE_KEYBOARD_SKIP: typeof stored.ENABLE_KEYBOARD_SKIP === 'boolean' ? stored.ENABLE_KEYBOARD_SKIP : DEFAULT_SETTINGS.ENABLE_KEYBOARD_SKIP,
                SKIP_SECONDS: Number.isInteger(stored.SKIP_SECONDS) && stored.SKIP_SECONDS > 0 ? stored.SKIP_SECONDS : DEFAULT_SETTINGS.SKIP_SECONDS
            };
        } catch (error) {
            console.error(APP_NAME, 'Could not load saved settings:', error);
            return { ...DEFAULT_SETTINGS };
        }
    }

    const settings = loadSettings();
    let settingsModalOpen = false;

    const state = {
        videoFixed: false,
        audioFixed: false,
        userWantsPlay: false,     // Flag: the user clicked to start the video
        pausedByOverlay: false,   // Flag: the video was paused by the overlay (mouse leave or wheel)
        observer: null
    };

    // ---------- LOG ----------
    const log = {
        info: (...args) => DEBUG && console.log(APP_NAME, ...args),
        warn: (...args) => DEBUG && console.warn(APP_NAME, ...args),
        error: (...args) => DEBUG && console.error(APP_NAME, ...args)
    };

    // ---------- BLOCK NATIVE AUTOPLAY ----------
    // Must run at document-start
    try {
        const originalPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
            if (this.tagName === 'VIDEO' && !state.userWantsPlay) {
                // The user did not click: block automatic playback
                return Promise.resolve();
            }
            return originalPlay.apply(this, arguments);
        };
    } catch (e) {
        log.error('Failed to override play:', e);
    }

    // ---------- FIX VIDEO ----------
    function fixVideo() {
        const videos = document.querySelectorAll('video');
        videos.forEach((video, index) => {
            try {
                video.autoplay = false;
                video.removeAttribute('autoplay');
                video.loop = settings.ENABLE_VIDEO_LOOP;
                if (!state.userWantsPlay && !video.paused) video.pause();

                log.info(`Video ${index + 1}: autoplay off, loop ${settings.ENABLE_VIDEO_LOOP ? 'on' : 'off'}.`);
            } catch (e) { }
        });
    }

    // ---------- FIX LINKS ----------
    function fixLinks() {
        const links = document.querySelectorAll('a.videoLink, a[href^="/watch/"]');
        links.forEach(link => {
            try {
                link.removeAttribute('target');
                link.setAttribute('href', '#');
                link.style.cursor = 'default';
                link.style.opacity = '0.7';

                // Prevent clicks on links from doing anything
                if (!link.dataset.fixed) {
                    link.dataset.fixed = '1';
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }, true);
                }
            } catch (e) { }
        });
    }

    // ---------- TOGGLE PLAY ----------
    function toggleVideoPlay() {
        const video = document.querySelector('video');
        if (!video) return;

        if (video.paused) {
            log.info('User requested play.');
            state.userWantsPlay = true;
            state.pausedByOverlay = false;
            video.muted = false;
            video.play().catch(e => log.warn('play() rejected:', e));
        } else {
            log.info('User requested pause.');
            // Re-enable the autoplay block after a manual pause
            state.userWantsPlay = false;
            state.pausedByOverlay = false;
            video.pause();
        }
    }

    // ---------- PAUSE / RESUME HELPERS ----------
    function pauseVideoByOverlay(reason) {
        const video = document.querySelector('video');
        if (!video || video.paused) return;

        log.info(`Pausing video: ${reason}.`);
        state.pausedByOverlay = true;
        state.userWantsPlay = false;
        video.pause();
    }

    function resumeVideoByOverlay() {
        const video = document.querySelector('video');
        if (!video || !state.pausedByOverlay) return;

        log.info('Resuming video: mouse entered iframe.');
        state.pausedByOverlay = false;
        state.userWantsPlay = true;
        video.play().catch(e => log.warn('play() rejected:', e));
    }

    // ---------- USER SETTINGS ----------
    function closeSettingsModal() {
        const modal = document.getElementById('rg-settings-modal');
        if (!modal) return;

        modal.hidden = true;
        settingsModalOpen = false;
        document.getElementById('rg-settings-button')?.focus();
    }

    function openSettingsModal() {
        const modal = document.getElementById('rg-settings-modal');
        if (!modal) return;

        modal.querySelectorAll('[data-setting]').forEach(input => {
            const key = input.dataset.setting;
            if (input.type === 'checkbox') input.checked = settings[key];
        });
        modal.querySelector('#rg-skip-seconds').value = settings.SKIP_SECONDS;
        modal.querySelector('#rg-settings-error').hidden = true;
        modal.hidden = false;
        settingsModalOpen = true;
        modal.querySelector('[data-setting="ENABLE_PAUSE_ON_EXIT"]').focus();
    }

    function createSettingsControls(overlay) {
        const style = document.createElement('style');
        style.textContent = `
            #rg-settings-button {
                all: initial !important;
                position: fixed !important;
                top: 15px !important;
                right: 15px !important;
                z-index: 2 !important;
                display: grid !important;
                place-items: center !important;
                width: 32px !important;
                height: 32px !important;
                padding: 0 !important;
                border: 0 !important;
                border-radius: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                cursor: pointer !important;
                box-sizing: border-box !important;
                pointer-events: auto !important;
                transition: opacity .18s ease !important;
            }
            #rg-settings-button:hover { opacity: .78 !important; }
            #rg-settings-button:focus-visible { outline: 2px solid #d34b58 !important; outline-offset: 3px !important; }
            #rg-settings-button svg { display: block !important; width: 32px !important; height: 32px !important; }
            #rg-settings-modal[hidden] { display: none !important; }
            #rg-settings-modal {
                position: fixed !important;
                inset: 0 !important;
                z-index: 3 !important;
                display: grid !important;
                place-items: center !important;
                padding: 16px !important;
                background: rgba(0,0,0,.62) !important;
                box-sizing: border-box !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                color: #f5f5f6 !important;
                pointer-events: auto !important;
            }
            #rg-settings-dialog {
                display: flex !important;
                flex-direction: column !important;
                width: min(300px, calc(100vw - 32px)) !important;
                max-height: min(400px, calc(100vh - 32px)) !important;
                overflow: hidden !important;
                border: 1px solid rgba(255,255,255,.13) !important;
                border-radius: 16px !important;
                background: rgba(28,28,32,.94) !important;
                box-shadow: 0 24px 80px rgba(0,0,0,.55) !important;
                color: #f5f5f6 !important;
                box-sizing: border-box !important;
                backdrop-filter: blur(14px) !important;
            }
            #rg-settings-dialog, #rg-settings-dialog * { box-sizing: border-box !important; }
            #rg-settings-header { padding: 20px 20px 13px !important; border-bottom: 1px solid rgba(255,255,255,.09) !important; }
            #rg-settings-title { margin: 0 !important; color: #fff !important; font-size: 18px !important; font-weight: 650 !important; line-height: 1.3 !important; letter-spacing: -.02em !important; }
            #rg-settings-content { overflow-y: auto !important; padding: 10px 20px 16px !important; }
            .rg-setting-row { display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 14px !important; min-height: 42px !important; color: #ededf0 !important; font-size: 13px !important; line-height: 1.4 !important; cursor: pointer !important; }
            .rg-setting-row input[type="checkbox"] { flex: 0 0 auto !important; width: 17px !important; height: 17px !important; margin: 0 !important; accent-color: #c83f4d !important; cursor: pointer !important; }
            .rg-setting-row input[type="number"] { width: 68px !important; height: 34px !important; padding: 0 9px !important; border: 1px solid rgba(255,255,255,.16) !important; border-radius: 8px !important; background: rgba(0,0,0,.25) !important; color: #fff !important; font: inherit !important; text-align: center !important; }
            .rg-setting-row input:focus-visible { outline: 2px solid #d34b58 !important; outline-offset: 2px !important; }
            #rg-settings-error { margin: 4px 0 0 !important; color: #ff9aa3 !important; font-size: 12px !important; line-height: 1.4 !important; }
            #rg-settings-error[hidden] { display: none !important; }
            #rg-settings-actions { display: flex !important; justify-content: flex-end !important; gap: 9px !important; padding: 13px 20px 18px !important; border-top: 1px solid rgba(255,255,255,.09) !important; }
            #rg-settings-actions button { min-width: 76px !important; height: 36px !important; padding: 0 13px !important; border: 1px solid #bd3947 !important; border-radius: 9px !important; background: #bd3947 !important; color: #fff !important; font: 600 13px system-ui, sans-serif !important; cursor: pointer !important; transition: background .15s ease, border-color .15s ease !important; }
            #rg-settings-actions button:hover { border-color: #d34b58 !important; background: #d34b58 !important; }
            #rg-settings-actions button:focus-visible { outline: 2px solid #f3a1a8 !important; outline-offset: 2px !important; }
            #rg-settings-actions #rg-settings-cancel { border-color: #8f2d38 !important; background: #8f2d38 !important; }
            #rg-settings-actions #rg-settings-cancel:hover { border-color: #a93643 !important; background: #a93643 !important; }
            @media (max-width: 360px) {
                #rg-settings-header { padding: 16px 16px 12px !important; }
                #rg-settings-content { padding: 8px 16px 12px !important; }
                #rg-settings-actions { padding: 11px 16px 15px !important; }
            }
        `;
        overlay.appendChild(style);

        const button = document.createElement('button');
        button.id = 'rg-settings-button';
        button.type = 'button';
        button.setAttribute('aria-label', 'Open userscript settings');
        button.setAttribute('title', 'Settings');
        button.innerHTML = SETTINGS_ICON;
        button.addEventListener('click', event => {
            event.stopPropagation();
            openSettingsModal();
        });
        overlay.appendChild(button);

        const modal = document.createElement('div');
        modal.id = 'rg-settings-modal';
        modal.hidden = true;
        modal.innerHTML = `
            <section id="rg-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="rg-settings-title" tabindex="-1">
                <header id="rg-settings-header"><h2 id="rg-settings-title">Userscript Settings</h2></header>
                <div id="rg-settings-content">
                    <label class="rg-setting-row"><span>Enable video looping</span><input type="checkbox" data-setting="ENABLE_VIDEO_LOOP"></label>
                    <label class="rg-setting-row"><span>Pause when leaving the embed</span><input type="checkbox" data-setting="ENABLE_PAUSE_ON_EXIT"></label>
                    <label class="rg-setting-row"><span>Resume when entering the embed</span><input type="checkbox" data-setting="ENABLE_PLAY_ON_ENTER"></label>
                    <label class="rg-setting-row"><span>Pause when using the mouse wheel</span><input type="checkbox" data-setting="ENABLE_PAUSE_ON_WHEEL"></label>
                    <label class="rg-setting-row"><span>Enable keyboard seeking</span><input type="checkbox" data-setting="ENABLE_KEYBOARD_SKIP"></label>
                    <label class="rg-setting-row" for="rg-skip-seconds"><span>Seconds to skip</span><input id="rg-skip-seconds" type="number" min="1" step="1" inputmode="numeric"></label>
                    <p id="rg-settings-error" role="alert" hidden></p>
                </div>
                <footer id="rg-settings-actions">
                    <button id="rg-settings-cancel" type="button">Cancel</button>
                    <button id="rg-settings-save" type="button">Save</button>
                </footer>
            </section>
        `;
        modal.addEventListener('click', event => {
            event.stopPropagation();
            if (event.target === modal) closeSettingsModal();
        });
        modal.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
        modal.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                closeSettingsModal();
            }
        });
        modal.querySelector('#rg-settings-cancel').addEventListener('click', closeSettingsModal);
        modal.querySelector('#rg-settings-save').addEventListener('click', async () => {
            const secondsInput = modal.querySelector('#rg-skip-seconds');
            const seconds = secondsInput.valueAsNumber;
            const error = modal.querySelector('#rg-settings-error');
            if (!Number.isInteger(seconds) || seconds < 1) {
                error.textContent = 'Enter a whole number of seconds greater than zero.';
                error.hidden = false;
                secondsInput.focus();
                return;
            }

            const nextSettings = {
                ENABLE_VIDEO_LOOP: modal.querySelector('[data-setting="ENABLE_VIDEO_LOOP"]').checked,
                ENABLE_PAUSE_ON_EXIT: modal.querySelector('[data-setting="ENABLE_PAUSE_ON_EXIT"]').checked,
                ENABLE_PLAY_ON_ENTER: modal.querySelector('[data-setting="ENABLE_PLAY_ON_ENTER"]').checked,
                ENABLE_PAUSE_ON_WHEEL: modal.querySelector('[data-setting="ENABLE_PAUSE_ON_WHEEL"]').checked,
                ENABLE_KEYBOARD_SKIP: modal.querySelector('[data-setting="ENABLE_KEYBOARD_SKIP"]').checked,
                SKIP_SECONDS: seconds
            };

            const saveButton = modal.querySelector('#rg-settings-save');
            saveButton.disabled = true;
            try {
                await GM_setValue(SETTINGS_STORAGE_KEY, nextSettings);
                Object.assign(settings, nextSettings);
                fixVideo();
                closeSettingsModal();
            } catch (saveError) {
                console.error(APP_NAME, 'Could not save settings:', saveError);
                error.textContent = 'Settings could not be saved. Check the userscript manager and try again.';
                error.hidden = false;
            } finally {
                saveButton.disabled = false;
            }
        });
        overlay.appendChild(modal);
    }

    // ---------- OVERLAY href-rg-overlay ----------
    function createOverlay() {
        if (document.getElementById('href-rg-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'href-rg-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'width:100vw',
            'height:100vh',
            'background:transparent',
            'z-index:2147483647',
            'pointer-events:none'
        ].join(';');

        const page = document.documentElement;
        page.addEventListener('mouseenter', () => {
            if (!settings.ENABLE_PLAY_ON_ENTER) return;
            resumeVideoByOverlay();
        });

        page.addEventListener('mouseleave', () => {
            if (!settings.ENABLE_PAUSE_ON_EXIT) return;
            pauseVideoByOverlay('mouse left iframe');
        });

        document.addEventListener('wheel', () => {
            if (settings.ENABLE_PAUSE_ON_WHEEL) pauseVideoByOverlay('mouse wheel used');
        }, { passive: true });

        createSettingsControls(overlay);
        document.body.appendChild(overlay);
        log.info('Overlay href-rg-overlay created.');
    }

    // ---------- KEYBOARD SKIP ----------
    function handleKeyboardSkip(event) {
        if (settingsModalOpen || !settings.ENABLE_KEYBOARD_SKIP || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;

        const skip = event.key === 'ArrowLeft' ? -settings.SKIP_SECONDS : event.key === 'ArrowRight' ? settings.SKIP_SECONDS : 0;
        if (!skip) return;

        const video = document.querySelector('video');
        if (!video || !Number.isFinite(video.currentTime)) return;

        const nextTime = Math.max(0, video.currentTime + skip);
        video.currentTime = Number.isFinite(video.duration) ? Math.min(video.duration, nextTime) : nextTime;
        event.preventDefault();
        log.info(`Skipped video to ${video.currentTime} seconds.`);
    }

    // ---------- FIX BACKDROP ----------
    function fixBackdrop() {
        if (state.videoFixed) return;

        const backdrop = document.querySelector('#root > div > div > div > div > div.backdropWrap');
        if (backdrop) {
            backdrop.addEventListener('click', toggleVideoPlay);

            const image = backdrop.querySelector('img');
            if (image) image.style.opacity = '0';

            state.videoFixed = true;
            log.info('Backdrop bound and toggle ready.');
        }
    }

    // ---------- FIX AUDIO ----------
    function fixAudio() {
        if (state.audioFixed) return;

        const soundButton = document.querySelector('.SoundButton');
        if (soundButton) {
            try {
                soundButton.click();
                state.audioFixed = true;
                log.info('Audio enabled.');
            } catch (e) { }
        }
    }

    // ---------- APPLY FIXES ----------
    function applyFixes() {
        fixVideo();
        fixLinks();
        fixBackdrop();
        fixAudio();
    }

    // ---------- OBSERVER ----------
    function startObserver() {
        if (state.observer) return;

        state.observer = new MutationObserver(() => {
            // If the user started playback, ignore new nodes so the video is not stopped
            if (state.userWantsPlay) return;

            applyFixes();
        });

        state.observer.observe(document.body, {
            childList: true, // Watch only added nodes, NOT attributes
            subtree: true
        });

        log.info('MutationObserver started.');
    }

    // ---------- INIT ----------
    function init() {
        log.info('Init on', location.href);

        applyFixes();
        createOverlay();
        document.addEventListener('keydown', handleKeyboardSkip);
        startObserver();

        // Fallback: retry once more after 5 seconds
        setTimeout(applyFixes, 5000);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();