// ==UserScript==
// @name         RedGif Embeded Video Fix
// @namespace    http://tampermonkey.net/
// @version      0.14
// @author       bigbear2
// @description  Fixes embedded RedGif videos: disables loop, enables audio, blocks links and adds play/stop toggle.
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

    const APP_NAME = '🤖 Embeded Video Fix';
    const DEBUG = false;

    const state = {
        videoFixed: false,
        audioFixed: false,
        userWantsPlay: false, // Flag: l'utente ha cliccato per far partire il video
        observer: null
    };

    // ---------- LOG ----------
    const log = {
        info: (...a) => DEBUG && console.log(APP_NAME, ...a),
        warn: (...a) => DEBUG && console.warn(APP_NAME, ...a),
        error: (...a) => DEBUG && console.error(APP_NAME, ...a)
    };

    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // ---------- BLOCCO AUTOPLAY NATIVO ----------
    // Va eseguito a document-start
    try {
        const origPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
            if (this.tagName === 'VIDEO') {
                // Se l'utente non ha cliccato, blocca il play automatico
                if (!state.userWantsPlay) {
                    return Promise.resolve();
                }
            }
            return origPlay.apply(this, arguments);
        };
    } catch (e) {
        log.error('Failed to override play:', e);
    }

    // ---------- FIX VIDEO ----------
    function fixVideo() {
        const videos = document.querySelectorAll('video');
        videos.forEach((v, i) => {
            try {
                // Se l'utente ha cliccato, non toccare nulla
                if (state.userWantsPlay) return;

                v.autoplay = false;
                v.removeAttribute('autoplay');
                v.loop = false;
                v.removeAttribute('loop');
                if (!v.paused) v.pause();
                log.info(`Video ${i + 1}: autoplay/loop off, paused.`);
            } catch (e) { }
        });
    }

    // ---------- FIX LINK ----------
    function fixLinks() {
        const links = document.querySelectorAll('a.videoLink, a[href^="/watch/"]');
        links.forEach(link => {
            try {
                link.removeAttribute('target');
                link.setAttribute('href', '#');
                link.style.cursor = 'default';
                link.style.opacity = '0.7';
                // Evita che il click faccia qualcosa
                if (!link.dataset.__fixed) {
                    link.dataset.__fixed = '1';
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }, true);
                }
            } catch (e) { }
        });
    }

    // ---------- TOGGLE PLAY ----------
    function videoTogglePlay() {
        const video = document.querySelector('video');
        if (!video) return;

        if (video.paused) {
            log.info('User play requested.');
            state.userWantsPlay = true;
            video.muted = false;
            video.play().catch(e => log.warn('play() rejected:', e));
        } else {
            log.info('User pause requested.');
            // Se l'utente mette in pausa, riabilitiamo il blocco autoplay
            state.userWantsPlay = false;
            video.pause();
        }
    }

    // ---------- BACKDROP ----------
    function fixBackdrop() {
        if (state.videoFixed) return;
        const backdrop = document.querySelector('#root > div > div > div > div > div.backdropWrap');
        if (backdrop) {
            backdrop.addEventListener('click', videoTogglePlay);
            const img = backdrop.querySelector('img');
            if (img) img.style.opacity = '0';
            state.videoFixed = true;
            log.info('Backdrop bound + toggle ready.');
        }
    }

    // ---------- AUDIO ----------
    async function fixAudio() {
        if (state.audioFixed) return;
        const btn = document.querySelector('.SoundButton');
        if (btn) {
            try {
                btn.click();
                state.audioFixed = true;
                log.info('Audio toggled.');
            } catch (e) { }
        }
    }

    // ---------- TICK (eseguito una sola volta e su nuovi nodi) ----------
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
            // Se l'utente ha cliccato, ignoriamo i nuovi video per non fermarlo
            if (state.userWantsPlay) return;

            // Applichiamo i fix solo se non sono già stati applicati
            applyFixes();
        });
        state.observer.observe(document.body, {
            childList: true, // Guarda solo l'aggiunta di nuovi nodi, NON gli attributi
            subtree: true
        });
        log.info('MutationObserver started.');
    }

    // ---------- INIT ----------
    async function init() {
        log.info('Init on', location.href);

        // Applica subito i fix
        applyFixes();

        // Osserva i cambiamenti (es. video iniettato dopo)
        startObserver();

        // Fallback: dopo 5 secondi se non c'è video, riprova un'ultima volta
        setTimeout(() => {
            applyFixes();
        }, 5000);

    }

    // Avvia
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();