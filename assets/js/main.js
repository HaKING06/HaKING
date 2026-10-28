import { LANG_DATA, LANG_OPTIONS } from './translations.js';

let activeLang = 'tr';
let steamStats = null;
const htmlLangTags = { jp: 'ja', cn: 'zh-CN', kr: 'ko' };

// Keep the site usable when optional animation or audio CDNs are unavailable.
const fallbackGsap = {
    apply(target, values = {}) {
        const elements = typeof target === 'string'
            ? document.querySelectorAll(target)
            : target instanceof Element ? [target] : [];

        elements.forEach(element => {
            if (values.opacity !== undefined) element.style.opacity = values.opacity;
            if (values.width !== undefined) element.style.width = values.width;
            if (values.y !== undefined) element.style.transform = `translateY(${values.y}px)`;
            if (values.scale !== undefined) element.style.transform = `scale(${values.scale})`;
        });
    },
    set(target, values) { this.apply(target, values); },
    to(target, values = {}) {
        this.apply(target, values);
        if (typeof values.onComplete === 'function') values.onComplete();
    }
};
const gsap = window.gsap || fallbackGsap;
const HowlClass = window.Howl || class { play() {} pause() {} };

function setLang(c) {
            activeLang = c; // Seçili dili hafızaya al
            document.documentElement.lang = htmlLangTags[c] || c;
            let t = LANG_DATA[c] || LANG_DATA['en'];
            let fallback = LANG_DATA['en'];
            document.querySelectorAll('[data-k]').forEach(e => {
                const key = e.getAttribute('data-k');
                e.innerText = t[key] || fallback[key] || e.innerText;
            });
            document.querySelectorAll('[data-p]').forEach(e => {
                const key = e.getAttribute('data-p');
                e.placeholder = t[key] || fallback[key] || e.placeholder;
            });
            document.querySelectorAll('[data-aria-p]').forEach(e => {
                const key = e.getAttribute('data-aria-p');
                e.setAttribute('aria-label', t[key] || fallback[key] || key);
            });
            document.querySelectorAll('[data-aria-k]').forEach(e => {
                const key = e.getAttribute('data-aria-k');
                e.setAttribute('aria-label', t[key] || fallback[key] || key);
            });
            document.querySelectorAll('.lang-opt').forEach(option => {
                option.setAttribute('aria-pressed', String(option.dataset.language === c));
            });
            document.getElementById('curr-lang').innerText = c.toUpperCase();
            document.getElementById('lang-menu').classList.remove('show');
            if (steamStats) {
                renderTopGames(steamStats.top_games);
                updateFeaturedGame(steamStats.top_games?.[0]);
                updateSteamSync(steamStats.updated_at);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            const webFonts = document.getElementById('web-fonts');
            if (webFonts) webFonts.media = 'all';
            window.lucide?.createIcons();
            document.querySelector('[data-icon-library]')?.addEventListener('load', () => {
                window.lucide?.createIcons();
            }, { once: true });
            document.querySelectorAll('a[target="_blank"]').forEach(link => {
                link.rel = 'noopener noreferrer';
            });
            const m = document.getElementById('lang-menu');
            const langToggle = document.getElementById('lang-togg');

            // Populate Lang Menu
            LANG_OPTIONS.forEach(l => {
                const d = document.createElement('button');
                d.type = 'button';
                d.className = 'lang-opt';
                d.dataset.language = l.c;
                d.innerText = l.n;
                d.addEventListener('click', () => setLang(l.c));
                m.appendChild(d);
            });

            setLang('tr'); // Default to TR
            document.querySelectorAll('.section').forEach(section => {
                const isActive = section.classList.contains('active');
                section.inert = !isActive;
                section.setAttribute('aria-hidden', String(!isActive));
            });
            runBootLoader(); // Start boot sequence

            document.querySelectorAll('.nav-btn').forEach(button => {
                button.addEventListener('click', () => nav(button.dataset.t));
            });
            document.querySelectorAll('[data-nav-target]').forEach(button => {
                button.addEventListener('click', () => nav(button.dataset.navTarget));
            });
            document.querySelectorAll('[data-modal-tab]').forEach(button => {
                button.addEventListener('click', event => switchModalTab(event, button.dataset.modalTab));
            });
            document.getElementById('contact-form').addEventListener('submit', handleContactSubmit);
            document.getElementById('contact-reset').addEventListener('click', resetContactForm);

            const gameSearch = document.getElementById('game-search');
            const gameSort = document.getElementById('game-sort');
            gameSearch.addEventListener('input', refreshGameCollection);
            gameSort.addEventListener('change', refreshGameCollection);
            document.addEventListener('keydown', event => {
                const target = event.target;
                const isEditing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
                if (event.key === '/' && !isEditing && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    if (document.querySelector('.section.active')?.id === 'armory') {
                        gameSearch.focus();
                    } else {
                        nav('armory');
                        window.setTimeout(() => gameSearch.focus(), 420);
                    }
                }
                if (event.key === 'Escape' && document.activeElement === gameSearch) {
                    gameSearch.value = '';
                    refreshGameCollection();
                    gameSearch.blur();
                }
            });
            refreshGameCollection();

            langToggle.addEventListener('click', event => {
                event.stopPropagation();
                const isOpen = m.classList.toggle('show');
                langToggle.setAttribute('aria-expanded', String(isOpen));
            });
            document.addEventListener('click', event => {
                if (!m.contains(event.target) && !langToggle.contains(event.target)) {
                    m.classList.remove('show');
                    langToggle.setAttribute('aria-expanded', 'false');
                }
            });

            const modal = document.getElementById('first-time-modal');
            document.getElementById('modal-close').addEventListener('click', closeIntroModal);
            modal.addEventListener('click', event => {
                if (event.target === modal) closeIntroModal();
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && window.getComputedStyle(modal).display !== 'none') closeIntroModal();
            });
        });

        function nav(id) {
            let c = document.querySelector('.section.active'), n = document.getElementById(id);
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
                b.removeAttribute('aria-current');
            });
            const activeNavBtn = document.querySelector(`[data-t="${id}"]`);
            if (activeNavBtn) {
                activeNavBtn.classList.add('active');
                activeNavBtn.setAttribute('aria-current', 'page');
            }
            if (c !== n) {
                sfxClick();
                // Start every destination at the top, regardless of where it was
                // last left when the user switched to another section.
                n.scrollTop = 0;
                // Snappy, modern page fade & slide transition (duration: 0.2s - 0.25s)
                gsap.to(c, {
                    opacity: 0, y: -15, duration: 0.2, onComplete: () => {
                        c.classList.remove('active');
                        c.inert = true;
                        c.setAttribute('aria-hidden', 'true');
                        gsap.set(n, { opacity: 0, y: 15 });
                        n.inert = false;
                        n.setAttribute('aria-hidden', 'false');
                        n.classList.add('active');
                        gsap.to(n, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
                    }
                });
            }
        }

        function formatSteamHours(minutes) {
            const hours = Math.max(0, Number(minutes) || 0) / 60;
            const locale = activeLang === 'tr' ? 'tr-TR' : 'en-US';
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(hours);
            return `${formatted} ${labels.hours_short || 'h'}`;
        }

        function setSteamCover(element, appid) {
            const safeAppId = Number(appid);
            if (!element || !Number.isSafeInteger(safeAppId) || safeAppId <= 0) return;
            const imageUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${safeAppId}/header.jpg`;
            element.style.backgroundImage = `linear-gradient(0deg, rgba(5, 6, 9, 0.94), rgba(5, 6, 9, 0.08) 76%), url("${imageUrl}")`;
        }

        function updateFeaturedGame(game) {
            if (!game) return;
            const title = document.getElementById('featured-game-title');
            const hours = document.getElementById('featured-game-hours');
            const cover = document.getElementById('featured-game-cover');
            if (title) title.textContent = game.name || 'Steam';
            if (hours) hours.textContent = formatSteamHours(game.playtime_minutes);
            setSteamCover(cover, game.appid);
        }

        function updateSteamSync(updatedAt) {
            const syncLabel = document.getElementById('steam-sync');
            if (!syncLabel) return;
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            if (!updatedAt) {
                syncLabel.textContent = labels.steam_sync_wait || LANG_DATA.en.steam_sync_wait;
                return;
            }

            const date = new Date(updatedAt);
            if (Number.isNaN(date.getTime())) {
                syncLabel.textContent = labels.steam_sync_wait || LANG_DATA.en.steam_sync_wait;
                return;
            }
            const locale = activeLang === 'tr' ? 'tr-TR' : 'en-US';
            const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
            syncLabel.textContent = `${labels.steam_sync_last || LANG_DATA.en.steam_sync_last} · ${formattedDate}`;
        }

        function renderTopGames(games) {
            const grid = document.querySelector('#armory .grid');
            if (!grid || !Array.isArray(games) || games.length === 0) return;

            const validGames = games
                .filter(game => Number.isSafeInteger(Number(game.appid)) && Number(game.appid) > 0 && typeof game.name === 'string')
                .sort((a, b) => Number(b.playtime_minutes) - Number(a.playtime_minutes))
                .slice(0, 6);
            if (!validGames.length) return;

            const viewAll = grid.querySelector('.btn-view');
            const fragment = document.createDocumentFragment();
            validGames.forEach(game => {
                const appid = Number(game.appid);
                const minutes = Math.max(0, Number(game.playtime_minutes) || 0);
                const playtime = formatSteamHours(minutes);
                const card = document.createElement('a');
                card.className = 'game';
                card.dataset.appid = String(appid);
                card.dataset.playtimeMinutes = String(minutes);
                card.href = `https://store.steampowered.com/app/${appid}/`;
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.setAttribute('aria-label', `${game.name} — ${playtime}`);

                const cover = document.createElement('div');
                cover.className = 'game-bg';
                cover.setAttribute('aria-hidden', 'true');
                setSteamCover(cover, appid);

                const overlay = document.createElement('div');
                overlay.className = 'game-ov';
                const title = document.createElement('div');
                title.className = 'g-tit';
                title.textContent = game.name;
                const time = document.createElement('span');
                time.className = 'g-time';
                time.textContent = playtime;
                overlay.append(title, time);
                card.append(cover, overlay);
                fragment.append(card);
            });

            if (viewAll) grid.replaceChildren(fragment, viewAll);
            else grid.replaceChildren(fragment);
            refreshGameCollection();
        }

        function applySteamStats(data) {
            steamStats = data;
            const totalHours = document.getElementById('total-hours');
            const totalGames = document.getElementById('total-games');
            if (totalHours && data.total_hours) totalHours.textContent = data.total_hours;
            if (totalGames && Number.isFinite(Number(data.total_games))) totalGames.textContent = String(data.total_games);

            const sysEl = document.getElementById('sys-status');
            const statusKey = { ONLINE: 'sys', OFFLINE: 'sys_off', UNKNOWN: 'sys_unknown' }[data.system_status] || 'sys_unknown';
            if (sysEl) {
                const isOnline = data.system_status === 'ONLINE';
                sysEl.setAttribute('data-k', statusKey);
                sysEl.style.color = isOnline ? '' : 'var(--muted)';
                sysEl.style.textShadow = isOnline ? '' : 'none';
                sysEl.style.animation = isOnline ? '' : 'none';
            }
            setLang(activeLang);
        }

        function refreshGameCollection() {
            const grid = document.querySelector('#armory .grid');
            const search = document.getElementById('game-search');
            const sort = document.getElementById('game-sort');
            if (!grid || !search || !sort) return;

            const games = [...grid.querySelectorAll('.game')];
            // Game titles are mostly English; locale-insensitive matching avoids Turkish I/ı surprises.
            const query = search.value.trim().toLocaleLowerCase('en');
            const sortMode = sort.value;
            const viewAll = grid.querySelector('.btn-view');

            games.sort((a, b) => {
                if (sortMode === 'name') {
                    return a.querySelector('.g-tit').textContent.localeCompare(b.querySelector('.g-tit').textContent, document.documentElement.lang);
                }
                const playtime = card => Number(card.dataset.playtimeMinutes) || 0;
                return playtime(b) - playtime(a);
            });

            let visibleCount = 0;
            games.forEach(game => {
                const matches = game.querySelector('.g-tit').textContent.toLocaleLowerCase('en').includes(query);
                game.hidden = !matches;
                if (matches) visibleCount += 1;
                grid.insertBefore(game, viewAll);
            });

            const resultCount = document.getElementById('game-results');
            const emptyState = document.getElementById('game-empty');
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            resultCount.textContent = `${visibleCount} / ${games.length} ${visibleCount === 1 ? labels.library_result_one : labels.library_result_many}`;
            emptyState.hidden = visibleCount > 0;
            if (viewAll) viewAll.hidden = visibleCount === 0;
        }

        function initCur() {
            let c = document.getElementById('cursor');
            document.addEventListener('mousemove', event => {
                c.style.left = `${event.clientX}px`;
                c.style.top = `${event.clientY}px`;
            });
            document.addEventListener('mousedown', () => document.body.classList.add('hover'));
            document.addEventListener('mouseup', () => document.body.classList.remove('hover'));
            document.querySelectorAll('a,button,input,textarea,.card,.nav-btn,.lang-opt').forEach(element => {
                element.addEventListener('mouseenter', () => document.body.classList.add('hover'));
                element.addEventListener('mouseleave', () => document.body.classList.remove('hover'));
            });
        }

        const sfx = { click: new HowlClass({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.m4a'], volume: 0.2 }) };
        function sfxClick() { sfx.click.play(); }

        function initThree() {
            const THREE = window.THREE;
            if (!THREE) return;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const c = document.getElementById('canvas');
            const s = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const r = new THREE.WebGLRenderer({ alpha: true });
            r.setSize(window.innerWidth, window.innerHeight);
            c.appendChild(r.domElement);
            const g = new THREE.BufferGeometry();
            const pos = new Float32Array(2000 * 3);
            for (let i = 0; i < 4500; i++)pos[i] = (Math.random() - 0.5) * 200;
            g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const m = new THREE.PointsMaterial({ size: 0.15, color: 0xff0000, transparent: true, opacity: 0.5 });
            const mesh = new THREE.Points(g, m); s.add(mesh); cam.position.z = 50;
            if (prefersReducedMotion) {
                r.render(s, cam);
            } else {
                function a() { requestAnimationFrame(a); mesh.rotation.y += 0.001; r.render(s, cam); }
                a();
            }
            window.addEventListener('resize', () => {
                cam.aspect = window.innerWidth / window.innerHeight;
                cam.updateProjectionMatrix();
                r.setSize(window.innerWidth, window.innerHeight);
            });
        }

        /* ======================================= */
        /* POPUP (REKLAM-Script) */
        /* ======================================= */
        const POPUP_LAST_CLOSED_TIME_KEY = 'popup_last_closed_time';
        const SHOW_DELAY_MINUTES = 10;
        const DELAY_MILLIS = SHOW_DELAY_MINUTES * 60 * 1000;

        function checkAndShowModalWithTimer() {
            const modal = document.getElementById('first-time-modal');
            const lastClosedTime = localStorage.getItem(POPUP_LAST_CLOSED_TIME_KEY);
            const currentTime = new Date().getTime();

            if (sessionStorage.getItem('intro-promo-shown') === 'true') return;
            if (!lastClosedTime || (currentTime - parseInt(lastClosedTime) > DELAY_MILLIS)) {
                sessionStorage.setItem('intro-promo-shown', 'true');
                modal.style.display = 'block';
            }

        }

        function closeIntroModal() {
            const modal = document.getElementById('first-time-modal');
            const videoElement = document.getElementById('modal-video');
            modal.style.display = 'none';
            if (videoElement) {
                videoElement.pause();
                videoElement.currentTime = 0;
            }
            localStorage.setItem(POPUP_LAST_CLOSED_TIME_KEY, new Date().getTime().toString());
        }

        function switchModalTab(event, tabName) {
            event.stopPropagation();
            sfxClick();

            document.querySelectorAll('.modal-tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.modal-tab-content').forEach(content => content.style.display = 'none');

            event.currentTarget.classList.add('active');
            const targetContent = document.getElementById('modal-tab-' + tabName);
            if (targetContent) targetContent.style.display = 'block';

            const video = document.getElementById('modal-video');
            if (video) {
                if (tabName === 'trailer') {
                    video.play().catch(err => console.log("Video auto play blocked", err));
                } else {
                    video.pause();
                }
            }
        }

        /* ======================================= */
        /* CONTACT FORM */
        /* ======================================= */
        function handleContactSubmit(e) {
            e.preventDefault();
            sfxClick();

            const name = document.getElementById('c-name').value;
            const email = document.getElementById('c-email').value;
            const msg = document.getElementById('c-msg').value;

            const terminal = document.getElementById('contact-terminal');
            const success = document.getElementById('contact-success');

            gsap.to(terminal, {
                opacity: 0, duration: 0.3, onComplete: () => {
                    terminal.style.display = 'none';
                    success.style.display = 'flex';
                    gsap.set(success, { opacity: 0, scale: 0.95 });
                    gsap.to(success, { opacity: 1, scale: 1, duration: 0.4 });

                    const output = document.getElementById('terminal-console-output');
                    output.innerText = `${LANG_DATA[activeLang]?.contact_draft_note || LANG_DATA.en.contact_draft_note}\n\nhalitguns06@gmail.com`;
                    window.location.href = `mailto:halitguns06@gmail.com?subject=${encodeURIComponent("HaKING Contact - " + name)}&body=${encodeURIComponent("Sender Name: " + name + "\nSender Email: " + email + "\n\nMessage:\n" + msg)}`;
                }
            });
        }

        function resetContactForm() {
            sfxClick();
            const terminal = document.getElementById('contact-terminal');
            const success = document.getElementById('contact-success');

            document.getElementById('contact-form').reset();

            gsap.to(success, {
                opacity: 0, scale: 0.95, duration: 0.3, onComplete: () => {
                    success.style.display = 'none';
                    terminal.style.display = 'block';
                    gsap.set(terminal, { opacity: 0 });
                    gsap.to(terminal, { opacity: 1, duration: 0.4 });
                }
            });
        }

        /* ======================================= */
        /* SYNCHRONIZED BOOT SEQUENCE */
        /* ======================================= */
        function revealApp() {
            const loader = document.getElementById('loader');
            const app = document.getElementById('app');
            if (!loader || !app || app.dataset.ready === 'true') return;
            app.dataset.ready = 'true';
            loader.style.display = 'none';
            app.style.opacity = 1;
            app.style.pointerEvents = 'all';
        }

        async function runBootLoader() {
            const fill = document.querySelector('.load-fill');
            const logText = document.getElementById('ltxt');
            // A visual loader is decorative; never let a slow optional asset hide the site indefinitely.
            window.setTimeout(revealApp, 1800);

            const bootSfx = new HowlClass({
                src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.m4a'],
                volume: 0.25
            });

            const bootLogs = {
                tr: {
                    init: "SİSTEM BİLEŞENLERİ YÜKLENİYOR...",
                    pointer: "GİRİŞ AYGITLARI BAĞLANIYOR...",
                    steam: "STEAM VERİLERİ SENKRONİZE EDİLİYOR...",
                    cache: "GÖRSEL ÖĞELER PRELOAD EDİLİYOR...",
                    ready: "SİSTEM HAZIR, GİRİŞ YAPILIYOR..."
                },
                en: {
                    init: "LOADING SYSTEM COMPONENTS...",
                    pointer: "CONNECTING POINTER INTERFACE...",
                    steam: "SYNCING STEAM DATA PACKETS...",
                    cache: "PRELOADING GRAPHICAL ASSETS...",
                    ready: "SYSTEM READY, LAUNCHING..."
                }
            };
            const logs = bootLogs[activeLang] || bootLogs['en'];

            const updateProgress = (pct, labelText) => {
                gsap.to(fill, { width: pct + '%', duration: 0.3, ease: 'power1.out' });
                if (logText) logText.innerText = labelText;
            };
            let statsLoaded = false;

            try {
                // Phase 1: Initialize components
                updateProgress(20, logs.init);
                try {
                    initThree();
                } catch (error) {
                    console.warn('Background animation unavailable:', error);
                }
                await new Promise(r => setTimeout(r, 120));

                // Phase 2: Pointer tracking
                updateProgress(40, logs.pointer);
                initCur();
                await new Promise(r => setTimeout(r, 120));

                // Phase 3: Fetching stats from JSON file
                updateProgress(70, logs.steam);

                const statsController = new AbortController();
                const statsTimeout = window.setTimeout(() => statsController.abort(), 5000);
                const statsPromise = (async () => {
                    try {
                        const response = await fetch('./data/steam_stats.json', { cache: 'no-store', signal: statsController.signal });
                        if (!response.ok) throw new Error(`Steam stats request failed: ${response.status}`);
                        const data = await response.json();
                        if (!data || typeof data !== 'object') throw new Error('Steam stats JSON is invalid');
                        applySteamStats(data);
                        statsLoaded = true;
                    } finally {
                        window.clearTimeout(statsTimeout);
                    }
                })().catch(error => {
                    console.warn('Steam stats unavailable; using safe defaults:', error);
                    if (!statsLoaded) {
                        ['total-hours', 'total-games'].forEach(id => {
                            const value = document.getElementById(id);
                            if (value?.textContent === 'Loading...') value.textContent = '—';
                        });
                        const syncLabel = document.getElementById('steam-sync');
                        if (syncLabel) syncLabel.textContent = (LANG_DATA[activeLang] || LANG_DATA.en).steam_sync_unavailable;
                        const status = document.getElementById('sys-status');
                        if (status) {
                            status.setAttribute('data-k', 'sys_unknown');
                            status.style.color = 'var(--muted)';
                            status.style.textShadow = 'none';
                            status.style.animation = 'none';
                            setLang(activeLang);
                        }
                    }
                });

                // Statistics enhance the page, but must never hold the entire interface behind the loader.
                await Promise.race([statsPromise, new Promise(resolve => setTimeout(resolve, 180))]);

                // Phase 4: Cache graphics
                updateProgress(90, logs.cache);
                await Promise.race([new Promise((resolve) => {
                    const img = new Image();
                    img.src = "assets/images/HaKING2.png";
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                }), new Promise(resolve => setTimeout(resolve, 1500))]);
                await new Promise(r => setTimeout(r, 120));

                // Phase 5: Connection ready
                updateProgress(100, logs.ready);
                await new Promise(r => setTimeout(r, 180));

                bootSfx.play();

                gsap.to('#loader', {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        revealApp();

                        setTimeout(checkAndShowModalWithTimer, 30000);
                    }
                });

            } catch (err) {
                console.error("Bootloader Exception:", err);
                if (!statsLoaded) {
                    ['total-hours', 'total-games'].forEach(id => {
                        const value = document.getElementById(id);
                        if (value?.textContent === 'Loading...') value.textContent = '—';
                    });
                    const status = document.getElementById('sys-status');
                    if (status) {
                        status.setAttribute('data-k', 'sys_unknown');
                        status.style.color = 'var(--muted)';
                        status.style.textShadow = 'none';
                        status.style.animation = 'none';
                        setLang(activeLang);
                    }
                }
                updateProgress(100, LANG_DATA[activeLang]?.sys_unknown || LANG_DATA.en.sys_unknown);
                setTimeout(revealApp, 800);
            }
        }
