// ==UserScript==
// @name         RedGif Embeded Video Fix - Lite
// @namespace    http://tampermonkey.net/
// @version      0.21
// @author       bigbear2
// @description  Fixes embedded RedGif videos with settings configured in the script.
// @homepage     https://github.com/bigbear2/
// @downloadURL  https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-lite.user.js
// @updateURL    https://github.com/bigbear2/RedGif-Embeded-Video-Fix/raw/refs/heads/main/redgif-embed-video-fix-lite.user.js
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
    const ENABLE_KEYBOARD_SKIP = true;      // Allow arrow-key seeking
    const ENABLE_VIDEO_LOOP = false;        // Allow videos to loop
    const SKIP_SECONDS = 5;                 // Seconds to skip with the arrow keys

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
                video.loop = ENABLE_VIDEO_LOOP;
                if (!state.userWantsPlay && !video.paused) video.pause();

                log.info(`Video ${index + 1}: autoplay off, loop ${ENABLE_VIDEO_LOOP ? 'on' : 'off'}.`);
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
            'z-index:2147483647',
            'pointer-events:none'
        ].join(';');

        const page = document.documentElement;
        page.addEventListener('mouseenter', () => {
            if (!ENABLE_PLAY_ON_ENTER) return;
            resumeVideoByOverlay();
        });

        page.addEventListener('mouseleave', () => {
            if (!ENABLE_PAUSE_ON_EXIT) return;
            pauseVideoByOverlay('mouse left iframe');
        });

        document.addEventListener('wheel', () => {
            if (ENABLE_PAUSE_ON_WHEEL) pauseVideoByOverlay('mouse wheel used');
        }, { passive: true });

        document.body.appendChild(overlay);
        log.info('Overlay href-rg-overlay created.');
    }

    // ---------- KEYBOARD SKIP ----------
    function handleKeyboardSkip(event) {
        if (!ENABLE_KEYBOARD_SKIP || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;

        const skip = event.key === 'ArrowLeft' ? -SKIP_SECONDS : event.key === 'ArrowRight' ? SKIP_SECONDS : 0;
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