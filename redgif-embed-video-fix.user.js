// ==UserScript==
// @name         RedGif Embeded Video Fix
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  RedGif Embeded Video Fix!
// @author       bigbear2
// @description  Fixes embedded RedGif videos: disables loop, enables audio, blocks links and adds play/stop toggle.
// @homepage     https://github.com/bigbear2/
// @match        https://www.redgifs.com/ifr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=redgifs.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const APP_NAME = '🤖 RedGif Embeded Video Fix';
    const RETRY_DELAY = 500; // ms
    const MAX_RETRIES = 10;
    const DEBUG = true;

    let state = {
        videoFixed: false,
        audioFixed: false,
        retryCount: 0
    };

    // Utility per logging
    const log = {
        _shouldLog: () => DEBUG,

        info: (...args) => {
            if (log._shouldLog()) console.log(APP_NAME, ...args);
        },
        warn: (...args) => {
            if (log._shouldLog()) console.warn(APP_NAME, ...args);
        },
        error: (...args) => {
            if (log._shouldLog()) console.error(APP_NAME, ...args);
        }
    };

    window.toggleDebug = () => {
        DEBUG = !DEBUG;
        log.info(`Debug mode: ${DEBUG ? 'ON' : 'OFF'}`);
    };

    // Attesa con timeout
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));


    function videoTogglePlay() {
        log.info('Video toggle play function called');
        const video = document.querySelector('video');
        if (video) {
            log.info('Video element found:', video);
            if (video.paused) {
                log.info('Video is paused, attempting to play...');
                video.play();
            } else {
                log.info('Video is already playing.');
                video.pause();
            }
        } else {
            log.warn('No video element found.');
        }
    }


    // Trova elemento con selettore e timeout
    async function waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await wait(100);
        }
        return null;
    }

    async function fixAudio() {
        if (state.audioFixed) return;

        try {
            const soundButton = await waitForElement(".SoundButton", 3000);
            if (soundButton) {
                soundButton.click();
                state.audioFixed = true;
                log.info('Audio fixed successfully.');
            } else {
                log.warn('Sound button not found after timeout.');
            }
        } catch (error) {
            log.error('Error fixing audio:', error);
        }
    }

    function fixVideo() {
        if (state.videoFixed) return;

        const videos = document.querySelectorAll('video');
        if (videos.length === 0) {
            log.warn('No video elements found.');
            return;
        }

        videos.forEach((video, index) => {
            try {
                video.pause();
                video.loop = false;
                video.removeAttribute('loop');
                log.info(`Video ${index + 1}: loop disabled`);
            } catch (error) {
                log.error(`Error fixing video ${index + 1}:`, error);
            }
        });

        let elm = document.querySelector("#root > div > div > div > div > div.backdropWrap");
        elm.addEventListener('click', videoTogglePlay);
        let img = document.querySelector("#root > div > div > div > div > div.backdropWrap > img");
        img.setAttribute('style', 'opacity: 0;');

        state.videoFixed = true;
        log.info('Video fixed successfully.');
    }

    async function fixVideoAndAudio() {
        const video = await waitForElement('video', 5000);
        if (video) {
            fixVideo();
            await fixAudio();
            return true;
        }
        return false;
    }

    async function fixLinks() {
        const links = document.querySelectorAll('a[href^="/watch/"]');

        if (links.length === 0) {
            if (state.retryCount < MAX_RETRIES) {
                state.retryCount++;
                log.warn(`No links found, retry ${state.retryCount}/${MAX_RETRIES}...`);
                setTimeout(() => fixLinks(), RETRY_DELAY);
            } else {
                log.error('Max retries reached, could not find links.');
            }
            return;
        }

        // Fix links
        links.forEach(link => {
            link.setAttribute('href', '#');
            link.removeAttribute('target');
            // Aggiungi stile per indicare che è disabilitato (opzionale)
            link.style.cursor = 'default';
            link.style.opacity = '0.7';
        });

        log.info(`${links.length} links fixed.`);

        // Fix video e audio
        const fixed = await fixVideoAndAudio();
        if (fixed) {
            log.info('All fixes applied successfully.');
        } else {
            log.warn('Video/Audio elements not found.');
        }
    }

    // Osserva il DOM per cambiamenti (utile per link caricati dinamicamente)
    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            // Se abbiamo già fissato tutto, possiamo disconnetterci
            if (state.videoFixed && state.audioFixed) {
                observer.disconnect();
                return;
            }

            // Controlla se ci sono nuovi link da fissare
            const hasNewLinks = mutations.some(mutation =>
                mutation.addedNodes.length > 0 &&
                mutation.target.querySelectorAll &&
                mutation.target.querySelectorAll('a[href^="/watch/"]').length > 0
            );

            if (hasNewLinks) {
                fixLinks();
            }

            // Controlla se è apparso il video
            if (!state.videoFixed && document.querySelector('video')) {
                fixVideoAndAudio();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    // Inizializzazione
    async function init() {
        log.info('Initializing...', window.location.href);

        // Aspetta che il DOM sia pronto
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Avvia l'osservatore del DOM
        const observer = observeDOM();

        // Tentativo iniziale
        await fixLinks();

        // Pulisci l'osservatore dopo 30 secondi per evitare memory leak
        setTimeout(() => {
            observer.disconnect();
            log.info('DOM observer stopped after timeout.');
        }, 30000);
    }

    // Avvia lo script
    init().catch(error => {
        log.error('Initialization failed:', error);
    });
})();