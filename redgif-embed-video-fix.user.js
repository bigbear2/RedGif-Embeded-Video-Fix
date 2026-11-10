// ==UserScript==
// @name         RedGif Embeded Video Fix
// @namespace    http://tampermonkey.net/
// @version      0.19
// @author       bigbear2
// @description  Fixes embedded RedGif videos with playback and keyboard settings configured in the script.
// @homepage     https://github.com/bigbear2/
// @downloadURL  https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix.user.js
// @updateURL    https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix.user.js
// @match        https://www.redgifs.com/ifr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=redgifs.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ---------- SETTINGS ----------
    const ENABLE_PAUSE_ON_EXIT = true;      // Pause the video when the mouse leaves the iframe
    const ENABLE_PLAY_ON_ENTER = true;      // Resume the video when the mouse re-enters the iframe
    const ENABLE_PAUSE_ON_WHEEL = true;     // Pause the video when the mouse wheel is used
    const ENABLE_KEYBOARD_SKIP = true;      // Skip +\- 5 seconds the video when the user presses the arrows keys (only if the overlay is present)
    const SETTINGS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <path d="M13.1875 3L13.03125 3.8125L12.4375 6.78125C11.484375 7.15625 10.625 7.683594 9.84375 8.3125L6.9375 7.3125L6.15625 7.0625L5.75 7.78125L3.75 11.21875L3.34375 11.9375L3.9375 12.46875L6.1875 14.4375C6.105469 14.949219 6 15.460938 6 16C6 16.539063 6.105469 17.050781 6.1875 17.5625L3.9375 19.53125L3.34375 20.0625L3.75 20.78125L5.75 24.21875L6.15625 24.9375L6.9375 24.6875L9.84375 23.6875C10.625 24.316406 11.484375 24.84375 12.4375 25.21875L13.03125 28.1875L13.1875 29L18.8125 29L18.96875 28.1875L19.5625 25.21875C20.515625 24.84375 21.375 24.316406 22.15625 23.6875L25.0625 24.6875L25.84375 24.9375L26.25 24.21875L28.25 20.78125L28.65625 20.0625L28.0625 19.53125L25.8125 17.5625C25.894531 17.050781 26 16.539063 26 16C26 15.460938 25.894531 14.949219 25.8125 14.4375L28.0625 12.46875L28.65625 11.9375L28.25 11.21875L26.25 7.78125L25.84375 7.0625L25.0625 7.3125L22.15625 8.3125C21.375 7.683594 20.515625 7.15625 19.5625 6.78125L18.96875 3.8125L18.8125 3 Z M 14.8125 5L17.1875 5L17.6875 7.59375L17.8125 8.1875L18.375 8.375C19.511719 8.730469 20.542969 9.332031 21.40625 10.125L21.84375 10.53125L22.40625 10.34375L24.9375 9.46875L26.125 11.5L24.125 13.28125L23.65625 13.65625L23.8125 14.25C23.941406 14.820313 24 15.402344 24 16C24 16.597656 23.941406 17.179688 23.8125 17.75L23.6875 18.34375L24.125 18.71875L26.125 20.5L24.9375 22.53125L22.40625 21.65625L21.84375 21.46875L21.40625 21.875C20.542969 22.667969 19.511719 23.269531 18.375 23.625L17.8125 23.8125L17.6875 24.40625L17.1875 27L14.8125 27L14.3125 24.40625L14.1875 23.8125L13.625 23.625C12.488281 23.269531 11.457031 22.667969 10.59375 21.875L10.15625 21.46875L9.59375 21.65625L7.0625 22.53125L5.875 20.5L7.875 18.71875L8.34375 18.34375L8.1875 17.75C8.058594 17.179688 8 16.597656 8 16C8 15.402344 8.058594 14.820313 8.1875 14.25L8.34375 13.65625L7.875 13.28125L5.875 11.5L7.0625 9.46875L9.59375 10.34375L10.15625 10.53125L10.59375 10.125C11.457031 9.332031 12.488281 8.730469 13.625 8.375L14.1875 8.1875L14.3125 7.59375 Z M 16 11C13.25 11 11 13.25 11 16C11 18.75 13.25 21 16 21C18.75 21 21 18.75 21 16C21 13.25 18.75 11 16 11 Z M 16 13C17.667969 13 19 14.332031 19 16C19 17.667969 17.667969 19 16 19C14.332031 19 13 17.667969 13 16C13 14.332031 14.332031 13 16 13Z" fill="#FFFFFF" />
                            </svg>`;

    const APP_NAME = '🤖 Embedded Video Fix';
    const DEBUG = false;

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

    // ---------- UTILS ----------
    function clickElement(element, options = {}) {
        const config = {
            scrollIntoView: true,
            simulateFullSequence: true,
            delay: 50,
            clientX: 0,
            clientY: 0,
            ...options
        };

        if (!element) return false;

        if (config.scrollIntoView) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
        try { element.focus(); } catch (e) { }

        setTimeout(() => {
            try {
                const eventOptions = {
                    bubbles: true, cancelable: true, view: window, detail: 1,
                    screenX: 0, screenY: 0,
                    clientX: config.clientX, clientY: config.clientY,
                    ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
                    button: 0, buttons: 1
                };

                if (config.simulateFullSequence) {
                    element.dispatchEvent(new MouseEvent('mousedown', eventOptions));
                    setTimeout(() => {
                        element.dispatchEvent(new MouseEvent('mouseup', eventOptions));
                        element.dispatchEvent(new MouseEvent('click', eventOptions));
                        log.info('Full-sequence click on:', element);
                    }, config.delay);
                } else {
                    element.click();
                    log.info('Simple click on:', element);
                }
            } catch (e) {
                log.error('Error during click:', e);
            }
        }, config.scrollIntoView ? 300 : 0);

        return true;
    }

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
                // If the user started playback, leave the video alone
                if (state.userWantsPlay) return;

                video.autoplay = false;
                video.removeAttribute('autoplay');
                video.loop = false;
                video.removeAttribute('loop');
                if (!video.paused) video.pause();

                log.info(`Video ${index + 1}: autoplay/loop off, paused.`);
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
            'z-index:2147483647'
        ].join(';');

        // Click: forward it to the element underneath (e.g. the backdrop wired to toggleVideoPlay)
        overlay.addEventListener('click', (event) => {
            overlay.style.pointerEvents = 'none';
            const elementBelow = document.elementFromPoint(event.clientX, event.clientY);
            overlay.style.pointerEvents = '';

            if (elementBelow && elementBelow !== overlay) {
                clickElement(elementBelow, {
                    scrollIntoView: false,
                    simulateFullSequence: true,
                    delay: 0,
                    clientX: event.clientX,
                    clientY: event.clientY
                });
            }
        });

        // Mouse enters the iframe: resume only if the overlay paused the video
        overlay.addEventListener('mouseenter', () => {
            if (!ENABLE_PLAY_ON_ENTER) return;
            resumeVideoByOverlay();
        });

        // Mouse leaves the iframe: pause the video
        overlay.addEventListener('mouseleave', () => {
            if (!ENABLE_PAUSE_ON_EXIT) return;
            pauseVideoByOverlay('mouse left iframe');
        });

        // Mouse wheel: pause the video and still forward the scroll to the page
        overlay.addEventListener('wheel', (event) => {
            if (ENABLE_PAUSE_ON_WHEEL) {
                pauseVideoByOverlay('mouse wheel used');
            }
            window.scrollBy(event.deltaX, event.deltaY);
        }, { passive: true });

        document.body.appendChild(overlay);
        log.info('Overlay href-rg-overlay created.');
    }

    // ---------- KEYBOARD SKIP ----------
    function handleKeyboardSkip(event) {
        if (!ENABLE_KEYBOARD_SKIP || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (!document.getElementById('href-rg-overlay')) return;
        if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;

        const skip = event.key === 'ArrowLeft' ? -5 : event.key === 'ArrowRight' ? 5 : 0;
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