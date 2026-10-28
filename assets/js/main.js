import { LANG_DATA, LANG_OPTIONS } from './translations.js';

let activeLang = LANG_DATA[document.documentElement.dataset.initialLang] ? document.documentElement.dataset.initialLang : 'en';
let steamStats = null;
const htmlLangTags = { jp: 'ja', cn: 'zh-CN', kr: 'ko' };
const numberLocales = {
    tr: 'tr-TR', en: 'en-US', es: 'es-ES', ru: 'ru-RU', de: 'de-DE', fr: 'fr-FR', jp: 'ja-JP',
    cn: 'zh-CN', pt: 'pt-BR', it: 'it-IT', kr: 'ko-KR', ar: 'ar', hi: 'hi-IN', bn: 'bn-BD',
    nl: 'nl-NL', pl: 'pl-PL', sv: 'sv-SE', vi: 'vi-VN', el: 'el-GR', th: 'th-TH'
};

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

function setLang(c, remember = false) {
            activeLang = LANG_DATA[c] ? c : 'en';
            document.documentElement.lang = htmlLangTags[activeLang] || activeLang;
            document.documentElement.dir = activeLang === 'ar' ? 'rtl' : 'ltr';
            if (remember) {
                try { localStorage.setItem('haking.language', activeLang); } catch (_) {}
            }
            let t = LANG_DATA[activeLang] || LANG_DATA['en'];
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
                option.setAttribute('aria-pressed', String(option.dataset.language === activeLang));
            });
            document.getElementById('curr-lang').innerText = activeLang.toUpperCase();
            document.getElementById('lang-menu').classList.remove('show');
            if (steamStats) {
                updateLibrarySummary(steamStats);
                renderGameLibrary(steamStats.games?.length ? steamStats.games : steamStats.top_games);
                updateFeaturedGame(steamStats.top_games?.[0] || steamStats.games?.[0]);
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
                d.addEventListener('click', () => setLang(l.c, true));
                m.appendChild(d);
            });

            setLang(activeLang); // Browser preference, timezone fallback, or saved choice
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
            const locale = numberLocales[activeLang] || 'en-US';
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(hours);
            return `${formatted} ${labels.hours_short || 'h'}`;
        }

        function formatLocalizedNumber(value) {
            const number = Number(value);
            return Number.isFinite(number)
                ? new Intl.NumberFormat(numberLocales[activeLang] || 'en-US', { maximumFractionDigits: 0 }).format(number)
                : '—';
        }

        function formatTotalHours(value) {
            const hours = Number(String(value ?? '').replace(/[^\d]/g, ''));
            if (!Number.isFinite(hours)) return '—';
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            return `${formatLocalizedNumber(hours)} ${labels.hours_short || 'h'}`;
        }

        function updateLibrarySummary(data) {
            const totalGames = Number(data.total_games);
            const totalHours = formatTotalHours(data.total_hours);
            const games = Array.isArray(data.games) ? data.games : (data.top_games || []);
            const longplayCount = games.filter(game => Number(game.playtime_minutes) >= 6000).length;
            const gameText = formatLocalizedNumber(data.total_games);
            const longplayText = formatLocalizedNumber(longplayCount);

            const homeHours = document.getElementById('total-hours');
            const homeGames = document.getElementById('total-games');
            const libraryGames = document.getElementById('library-game-count');
            const libraryHours = document.getElementById('library-total-hours');
            const libraryLongplay = document.getElementById('library-longplay-count');
            if (homeHours && data.total_hours) homeHours.textContent = totalHours;
            if (homeGames && Number.isFinite(totalGames)) homeGames.textContent = gameText;
            if (libraryGames && Number.isFinite(totalGames)) libraryGames.textContent = gameText;
            if (libraryHours && data.total_hours) libraryHours.textContent = totalHours;
            if (libraryLongplay) libraryLongplay.textContent = longplayText;
        }

        function steamImageCandidates(game) {
            const appid = Number(game?.appid);
            if (!Number.isSafeInteger(appid) || appid <= 0) return [];

            const base = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/' + appid;
            const candidates = [];
            if (typeof game.cover_url === 'string' && game.cover_url.startsWith('https://')) {
                candidates.push(game.cover_url);
            }
            candidates.push(
                base + '/header.jpg',
                base + '/capsule_616x353.jpg',
                'https://cdn.akamai.steamstatic.com/steam/apps/' + appid + '/header.jpg',
                'https://cdn.cloudflare.steamstatic.com/steam/apps/' + appid + '/header.jpg'
            );
            const iconHash = typeof game.icon_hash === 'string' ? game.icon_hash.trim() : '';
            if (/^[a-f0-9]{32}$/i.test(iconHash)) {
                candidates.push('https://media.steampowered.com/steamcommunity/public/images/apps/' + appid + '/' + iconHash + '.jpg');
            }
            return [...new Set(candidates)];
        }

        function gameMonogram(name) {
            return String(name || 'Steam')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map(word => Array.from(word)[0] || '')
                .join('')
                .toLocaleUpperCase('en');
        }

        function setSteamCover(element, game) {
            if (!element || !game) return;
            const candidates = steamImageCandidates(game);
            if (!candidates.length) return;

            if (element instanceof HTMLImageElement) {
                let candidateIndex = 0;
                element.onerror = () => {
                    candidateIndex += 1;
                    if (candidateIndex < candidates.length) {
                        element.src = candidates[candidateIndex];
                    } else {
                        element.classList.add('is-missing');
                        element.removeAttribute('src');
                    }
                };
                element.src = candidates[0];
                return;
            }

            let candidateIndex = 0;
            const tryNextImage = () => {
                if (candidateIndex >= candidates.length) {
                    element.classList.add('is-missing');
                    element.style.backgroundImage = 'linear-gradient(135deg, rgba(243, 189, 99, 0.11), transparent 58%), linear-gradient(145deg, #1c1a19, #090a0c)';
                    return;
                }
                const image = new Image();
                const imageUrl = candidates[candidateIndex];
                image.onload = () => {
                    element.classList.remove('is-missing');
                    element.style.backgroundImage = 'linear-gradient(0deg, rgba(5, 6, 9, 0.94), rgba(5, 6, 9, 0.08) 76%), url("' + imageUrl + '")';
                };
                image.onerror = () => {
                    candidateIndex += 1;
                    tryNextImage();
                };
                image.src = imageUrl;
            };
            tryNextImage();
        }

        function updateFeaturedGame(game) {
            if (!game) return;
            const title = document.getElementById('featured-game-title');
            const hours = document.getElementById('featured-game-hours');
            const cover = document.getElementById('featured-game-cover');
            if (title) title.textContent = game.name || 'Steam';
            if (hours) hours.textContent = formatSteamHours(game.playtime_minutes);
            setSteamCover(cover, game);
        }

        function renderGameLibrary(games) {
            const grid = document.querySelector('#armory .grid');
            if (!grid || !Array.isArray(games) || games.length === 0) return;

            const validGames = games
                .filter(game => Number.isSafeInteger(Number(game.appid)) && Number(game.appid) > 0 && typeof game.name === 'string')
                .sort((a, b) => Number(b.playtime_minutes) - Number(a.playtime_minutes));
            if (!validGames.length) return;

            const fragment = document.createDocumentFragment();
            validGames.forEach(game => {
                const appid = Number(game.appid);
                const minutes = Math.max(0, Number(game.playtime_minutes) || 0);
                const playtime = formatSteamHours(minutes);
                const card = document.createElement('a');
                card.className = 'game';
                card.dataset.appid = String(appid);
                card.dataset.playtimeMinutes = String(minutes);
                card.href = 'https://store.steampowered.com/app/' + appid + '/';
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
                card.setAttribute('aria-label', game.name + ' — ' + playtime);

                const cover = document.createElement('div');
                cover.className = 'game-bg';
                cover.setAttribute('aria-hidden', 'true');
                const fallback = document.createElement('span');
                fallback.className = 'game-art-fallback';
                fallback.textContent = gameMonogram(game.name);
                const art = document.createElement('img');
                art.className = 'game-art';
                art.alt = '';
                art.loading = 'lazy';
                art.decoding = 'async';
                setSteamCover(art, game);
                cover.append(fallback, art);

                const overlay = document.createElement('div');
                overlay.className = 'game-ov';
                const rank = document.createElement('span');
                rank.className = 'game-rank';
                const title = document.createElement('div');
                title.className = 'g-tit';
                title.textContent = game.name;
                const time = document.createElement('span');
                time.className = 'g-time';
                time.textContent = playtime;
                overlay.append(rank, title, time);
                card.append(cover, overlay);
                fragment.append(card);
            });

            grid.replaceChildren(fragment);
            refreshGameCollection();
        }

        function applySteamStats(data) {
            steamStats = data;
            updateLibrarySummary(data);

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
            const query = search.value.trim().toLocaleLowerCase('en');
            const sortMode = sort.value;
            games.sort((a, b) => {
                if (sortMode === 'name') {
                    return a.querySelector('.g-tit').textContent.localeCompare(b.querySelector('.g-tit').textContent, document.documentElement.lang);
                }
                return (Number(b.dataset.playtimeMinutes) || 0) - (Number(a.dataset.playtimeMinutes) || 0);
            });

            let visibleCount = 0;
            games.forEach(game => {
                const matches = game.querySelector('.g-tit').textContent.toLocaleLowerCase('en').includes(query);
                game.hidden = !matches;
                if (matches) {
                    visibleCount += 1;
                    const rank = game.querySelector('.game-rank');
                    if (rank) rank.textContent = String(visibleCount).padStart(2, '0');
                }
                grid.append(game);
            });

            const resultCount = document.getElementById('game-results');
            const emptyState = document.getElementById('game-empty');
            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            const indexedCount = Math.max(games.length, Number(steamStats?.total_games) || 0);
            resultCount.textContent = visibleCount + ' / ' + indexedCount + ' ' + (indexedCount === 1 ? labels.library_result_one : labels.library_result_many);
            emptyState.hidden = visibleCount > 0;
        }

        function initCur() {
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
            const c = document.getElementById('cursor');
            if (!c) return;
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
            const canvasHost = document.getElementById('canvas');
            if (!THREE || !canvasHost || canvasHost.dataset.initialized === 'true') return;
            canvasHost.dataset.initialized = 'true';

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const compactScreen = window.matchMedia('(max-width: 768px)').matches;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 300);
            camera.position.z = 54;

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactScreen ? 1 : 1.4));
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.domElement.setAttribute('aria-hidden', 'true');
            canvasHost.appendChild(renderer.domElement);

            const pointCount = compactScreen ? 260 : 1450;
            const positions = new Float32Array(pointCount * 3);
            const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
            for (let index = 0; index < pointCount; index += 1) {
                const offset = index * 3;
                positions[offset] = (Math.random() - 0.5) * 92 * aspect;
                positions[offset + 1] = (Math.random() - 0.5) * 86;
                positions[offset + 2] = -Math.random() * 125;
            }

            const stars = new THREE.BufferGeometry();
            stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const starMaterial = new THREE.PointsMaterial({
                color: 0xf3bd63,
                size: compactScreen ? 0.1 : 0.16,
                transparent: true,
                opacity: compactScreen ? 0.32 : 0.58,
                sizeAttenuation: true,
                depthWrite: false
            });
            const field = new THREE.Points(stars, starMaterial);
            scene.add(field);

            const emberCount = compactScreen ? 65 : 340;
            const emberPositions = new Float32Array(emberCount * 3);
            for (let index = 0; index < emberCount; index += 1) {
                const offset = index * 3;
                emberPositions[offset] = (Math.random() - 0.5) * 86 * aspect;
                emberPositions[offset + 1] = (Math.random() - 0.5) * 42;
                emberPositions[offset + 2] = -Math.random() * 72;
            }
            const embers = new THREE.BufferGeometry();
            embers.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
            const emberField = new THREE.Points(embers, new THREE.PointsMaterial({
                color: 0xff493f,
                size: compactScreen ? 0.08 : 0.12,
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            }));
            scene.add(emberField);

            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xc58c50,
                transparent: true,
                opacity: compactScreen ? 0.08 : 0.16,
                wireframe: true,
                depthWrite: false
            });
            const orbit = new THREE.Mesh(new THREE.TorusGeometry(14, 0.018, 4, 180), orbitMaterial);
            orbit.position.set(18, 3, -38);
            orbit.rotation.set(0.7, 0.22, -0.28);
            scene.add(orbit);

            let targetX = 0;
            let targetY = 0;
            if (!compactScreen) {
                window.addEventListener('pointermove', event => {
                    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
                    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
                }, { passive: true });
            }

            const resize = () => {
                camera.aspect = window.innerWidth / Math.max(window.innerHeight, 1);
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', resize, { passive: true });

            let frame = 0;
            const draw = () => {
                if (document.hidden) {
                    frame = 0;
                    return;
                }
                camera.position.x += (targetX * 2.2 - camera.position.x) * 0.018;
                camera.position.y += (-targetY * 1.4 - camera.position.y) * 0.018;
                field.rotation.y += compactScreen ? 0.00008 : 0.00016;
                field.rotation.x += 0.000025;
                emberField.rotation.y -= 0.00011;
                orbit.rotation.z += 0.00016;
                renderer.render(scene, camera);
                frame = window.requestAnimationFrame(draw);
            };
            const resume = () => {
                if (document.hidden) {
                    if (frame) window.cancelAnimationFrame(frame);
                    frame = 0;
                } else if (!reducedMotion && !compactScreen && !frame) {
                    frame = window.requestAnimationFrame(draw);
                } else {
                    renderer.render(scene, camera);
                }
            };
            document.addEventListener('visibilitychange', resume);
            if (reducedMotion || compactScreen) renderer.render(scene, camera);
            else resume();
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
            app.classList.add('is-ready');
            if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const heroItems = Array.from(document.querySelectorAll('#sanctum .home-overview > *'));
                if (heroItems.length) {
                    window.gsap.fromTo(heroItems, { opacity: 0, y: 24 }, {
                        opacity: 1, y: 0, duration: 0.85, stagger: 0.13, ease: 'power3.out', delay: 0.08
                    });
                }
            }
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

            const labels = LANG_DATA[activeLang] || LANG_DATA.en;
            const logs = {
                init: labels.boot_init || LANG_DATA.en.boot_init,
                pointer: labels.boot_pointer || LANG_DATA.en.boot_pointer,
                steam: labels.boot_steam || LANG_DATA.en.boot_steam,
                cache: labels.boot_cache || LANG_DATA.en.boot_cache,
                ready: labels.boot_ready || LANG_DATA.en.boot_ready
            };

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
