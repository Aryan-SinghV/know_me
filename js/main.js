/* ==============================================
   ASV — main.js
   Vanilla JS: boot, cursor, canvas bg, clock,
   VHS counter, scroll reveals, interactions.
   ============================================== */

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       BOOT SEQUENCE
    ───────────────────────────────────────── */
    const bootScreen   = document.getElementById('boot-screen');
    const bootBar      = document.getElementById('boot-bar');
    const bootLinesEl  = document.getElementById('boot-lines');

    const bootMessages = [
        '> BIOS_ASV v1.0 ...',
        '> CHECKING MEMORY .... [16MB OK]',
        '> LOADING KERNEL .... [OK]',
        '> MOUNTING FILESYSTEM ... [OK]',
        '> INITIALIZING DISPLAY .... [CRT 640x480]',
        '> WELCOME TO ASV.',
    ];

    let bootProgress  = 0;
    let bootMsgIndex  = 0;
    const bootInterval = setInterval(() => {
        bootProgress += Math.random() * 12 + 4;
        if (bootProgress > 100) bootProgress = 100;
        bootBar.style.width = bootProgress + '%';

        if (bootMsgIndex < bootMessages.length) {
            const line = document.createElement('div');
            line.className = 'boot-line';
            line.textContent = bootMessages[bootMsgIndex];
            bootLinesEl.appendChild(line);
            bootMsgIndex++;
        }

        if (bootProgress >= 100) {
            clearInterval(bootInterval);
            setTimeout(() => {
                bootScreen.classList.add('done');
            }, 500);
        }
    }, 300);

    /* ─────────────────────────────────────────
       CUSTOM CURSOR
    ───────────────────────────────────────── */
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, input, textarea, .project-card, .gal-card, .nav-a').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('expanded'));
        el.addEventListener('mouseleave', () => ring.classList.remove('expanded'));
    });

    /* ─────────────────────────────────────────
       ANIMATED BACKGROUND CANVAS
       (pixel grid + floating particles + circuit dots)
    ───────────────────────────────────────── */
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H;
    const particles = [];

    function resizeCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* Generate particles */
    function createParticles() {
        particles.length = 0;
        const count = Math.floor((W * H) / 20000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: Math.random() > 0.8 ? 2 : 1,
                speed: 0.1 + Math.random() * 0.3,
                opacity: 0.1 + Math.random() * 0.3,
            });
        }
    }
    createParticles();
    window.addEventListener('resize', createParticles);

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    function drawBg() {
        ctx.clearRect(0, 0, W, H);

        /* Pixel grid */
        ctx.strokeStyle = 'rgba(42,42,42,0.5)';
        ctx.lineWidth   = 0.5;
        const gridSize  = 40;
        for (let x = 0; x < W; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        /* Crosshairs at intersections (sparse) */
        ctx.fillStyle = 'rgba(232,93,4,0.15)';
        for (let x = 0; x < W; x += gridSize * 4) {
            for (let y = 0; y < H; y += gridSize * 4) {
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        }

        /* Floating particles (slow parallax) */
        const pyOffset = scrollY * 0.04;
        particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < -5) {
                p.y = H + 5;
                p.x = Math.random() * W;
            }
            ctx.fillStyle = `rgba(232,93,4,${p.opacity})`;
            ctx.fillRect(p.x, (p.y + pyOffset) % (H + 10), p.size, p.size);
        });

        requestAnimationFrame(drawBg);
    }
    drawBg();

    /* ─────────────────────────────────────────
       CLOCK
    ───────────────────────────────────────── */
    const clockEl = document.getElementById('clock');
    function updateClock() {
        const now  = new Date();
        const h    = String(now.getHours()).padStart(2, '0');
        const m    = String(now.getMinutes()).padStart(2, '0');
        const s    = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    /* ─────────────────────────────────────────
       VHS COUNTER
    ───────────────────────────────────────── */
    const vhsCounter = document.getElementById('vhs-counter');
    if (vhsCounter) {
        let seconds = 47 * 60 + 22;
        setInterval(() => {
            seconds++;
            const h  = Math.floor(seconds / 3600);
            const m  = Math.floor((seconds % 3600) / 60);
            const s  = seconds % 60;
            vhsCounter.textContent = 
                String(h).padStart(2,'0') + ':' +
                String(m).padStart(2,'0') + ':' +
                String(s).padStart(2,'0');
        }, 1000);
    }

    /* ─────────────────────────────────────────
       PACKET COUNTER (fake network)
    ───────────────────────────────────────── */
    const pktEl = document.getElementById('pkt-count');
    if (pktEl) {
        let pktCount = 1024;
        setInterval(() => {
            pktCount += Math.floor(Math.random() * 12 + 1);
            pktEl.textContent = pktCount.toLocaleString();
        }, 800);
    }

    /* ─────────────────────────────────────────
       SIGNAL BARS — ANIMATE LAST BAR
    ───────────────────────────────────────── */
    const lastBar = document.querySelector('.sb--4');
    if (lastBar) {
        setInterval(() => {
            lastBar.classList.toggle('on');
            lastBar.classList.toggle('off');
        }, 900);
    }

    /* ─────────────────────────────────────────
       BATTERY SIMULATION
    ───────────────────────────────────────── */
    const battFill = document.getElementById('batt-fill');
    const battPct  = document.getElementById('batt-pct');
    let battLevel  = 82;

    if (battFill && battPct) {
        function updateBattery() {
            battLevel -= 0.5;
            if (battLevel < 5) battLevel = 100;
            battFill.style.width = battLevel + '%';
            battPct.textContent = Math.round(battLevel) + '%';
            if (battLevel < 20) {
                battFill.style.background = '#ff5f57';
            } else {
                battFill.style.background = 'var(--orange)';
            }
        }
        setInterval(updateBattery, 10000);
        updateBattery();
    }

    /* ─────────────────────────────────────────
       UPLINK CONSOLE TELEMETRY STREAM GENERATOR
    ───────────────────────────────────────── */
    const contactNameEl = document.getElementById('contact-name');
    const contactMsgEl  = document.getElementById('contact-msg');
    const transmitBtn   = document.getElementById('transmit-btn');
    const termFeedback  = document.getElementById('term-feedback');

    if (termFeedback) {
        termFeedback.textContent = '> TELEMETRY STREAM: RUNNING [ONLINE].';
        termFeedback.style.color = 'var(--text-muted)';
    }

    // Disable all manual user editing/filling
    [contactNameEl, contactMsgEl].forEach(el => {
        if (!el) return;
        el.setAttribute('readonly', 'true');
        el.addEventListener('keydown', e => e.preventDefault());
        el.addEventListener('paste', e => e.preventDefault());
        el.addEventListener('cut', e => e.preventDefault());
        el.addEventListener('drop', e => e.preventDefault());
    });

    // 1. YOUR NAME: Randomly generating identity stream motion
    const nameIdentPool = [
        'CLIENT_NODE::[0x9F41] // SYNC_BURST',
        'IP:192.168.9.42 // MTU:1500 // ACK',
        'STREAM_ORIGIN: HYPRLAND::ARCH_PROBE',
        'HASH_ROT32::7A4B-09CE-F102',
        'PORT_LISTEN:[TCP/8080] >> ESTABLISHED',
        'BUFFER_INSPECT::SIG_CARRIER_LOCK',
        'COMBINATORIC_GRAPH_WALK::0xBE41',
        'ICMP_ECHO_REQ [SEQ_ID:8849]',
        'LEXICAL_STREAM_SCAN::TOKEN_SYNC',
        'TELEMETRY_TX: ASV_NODE_09 [OK]',
        'EDA_SIGNAL: DENSITY_ESTIMATE_PASS',
        'UTILITY_VECTOR_MODEL: 0.9841_EVAL'
    ];
    const GLYPHS = '0123456789ABCDEF!_#/*-<>~';

    let currentNameTarget = nameIdentPool[0];
    let nameScrambleProgress = 0;
    let nameTargetIndex = 0;

    function stepNameMotion() {
        if (!contactNameEl) return;
        if (nameScrambleProgress < currentNameTarget.length) {
            nameScrambleProgress++;
            let rendered = '';
            for (let i = 0; i < currentNameTarget.length; i++) {
                if (i < nameScrambleProgress) {
                    rendered += currentNameTarget[i];
                } else {
                    rendered += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
            }
            contactNameEl.value = rendered;
        } else {
            const cursor = (Math.floor(Date.now() / 400) % 2 === 0) ? ' █' : ' _';
            contactNameEl.value = currentNameTarget + cursor;
        }
    }

    setInterval(stepNameMotion, 40);

    setInterval(() => {
        nameTargetIndex = (nameTargetIndex + 1) % nameIdentPool.length;
        currentNameTarget = nameIdentPool[nameTargetIndex];
        nameScrambleProgress = 0;
    }, 2800);

    // 2. MESSAGE PAYLOAD: Continuous rolling packet stream motion
    const payloadGenerators = [
        () => `> [TX_PKT: 0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}] ADDR: 0x7FFE${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()} LEN: ${32 + Math.floor(Math.random() * 224)}B`,
        () => `> TCP_DUPLICATE_CHECK: 0 DROPS // RTT: ${(10 + Math.random() * 8).toFixed(1)}ms`,
        () => `> BUFFER_DUMP: ${Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ')} ... [VALID]`,
        () => `> EDA_LOG: np.log1p(sample_distribution) -> STD_ERR: 0.00${Math.floor(Math.random() * 90 + 10)}`,
        () => `> LEX_ANALYZER: PARSED TOK_IDENT[0x${Math.floor(Math.random() * 255).toString(16).toUpperCase()}] => SYMBOL_TABLE_OK`,
        () => `> UTILITY_MODEL: MAXIMIZING REWARD_VECTOR [U=${(0.92 + Math.random() * 0.07).toFixed(4)}]`,
        () => `> SLIDING_WINDOW_ARQ: FRAME #${1000 + Math.floor(Math.random() * 9000)} ACK_RECEIVED`,
        () => `> MONOTONIC_DEQUE: WINDOW_QUERY_VAL=${Math.floor(Math.random() * 512)} O(1)_OK`,
        () => `> NMAP_RECON: PORT ${[22, 80, 443, 8080][Math.floor(Math.random() * 4)]}/TCP OPEN [STATUS: 200]`,
        () => `> HYPRLAND_IPC: DISPATCH WORKSPACE_EVENT -> ID_${Math.floor(Math.random() * 9 + 1)}`,
        () => `> GRAPH_ALGO: BFS_TRAVERSAL QUEUE_LEN=${Math.floor(Math.random() * 32 + 8)} VISITED=TRUE`,
        () => `> SYSTEM_TELEMETRY: ARCH_LINUX KERNEL 6.9 // LOAD: ${(0.1 + Math.random() * 0.4).toFixed(2)}`
    ];

    let messageQueue = '';
    if (contactMsgEl) {
        contactMsgEl.value = '> INITIALIZING LIVE TELEMETRY STREAM...\n> CARRIER LOCK ACQUIRED [CHANNEL_9]';
    }

    function enqueuePayloadLine() {
        if (!contactMsgEl) return;
        const generator = payloadGenerators[Math.floor(Math.random() * payloadGenerators.length)];
        messageQueue += '\n' + generator();
    }

    // Stream characters into textarea for continuous visual motion
    setInterval(() => {
        if (!contactMsgEl) return;
        if (messageQueue.length > 0) {
            const chunk = messageQueue.slice(0, 3);
            messageQueue = messageQueue.slice(3);
            contactMsgEl.value += chunk;

            const lines = contactMsgEl.value.split('\n');
            if (lines.length > 12) {
                contactMsgEl.value = lines.slice(lines.length - 10).join('\n');
            }
            contactMsgEl.scrollTop = contactMsgEl.scrollHeight;
        }
    }, 24);

    setInterval(enqueuePayloadLine, 1100);

    // Interactive burst injection on Send Message
    if (transmitBtn && termFeedback) {
        transmitBtn.addEventListener('click', () => {
            messageQueue = '';
            const burst = '\n>>> [OPERATOR_BURST] PACKET OVERRIDE DISPATCHED' +
                          '\n>>> ROUTE: singhvishesharyan@gmail.com' +
                          '\n>>> ACK_STATUS: 200_OK // LINK_ESTABLISHED';
            messageQueue = burst;
            termFeedback.textContent = '> PACKET BURST DELIVERED. ACK_200_OK.';
            termFeedback.style.color = '#28c840';
            setTimeout(() => {
                termFeedback.textContent = '> TELEMETRY STREAM: RUNNING [ONLINE].';
                termFeedback.style.color = 'var(--text-muted)';
            }, 2500);
        });
    }

    /* ─────────────────────────────────────────
       HERO CTA SCROLL
    ───────────────────────────────────────── */
    const heroCta = document.getElementById('hero-cta');
    if (heroCta) {
        heroCta.addEventListener('click', () => {
            document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ─────────────────────────────────────────
       SCROLL REVEAL
    ───────────────────────────────────────── */
    const revealEls = document.querySelectorAll(
        '.section-split, .section-strip, .section-cream, #uplink, .feature-main, .stack-card, .gal-card'
    );
    revealEls.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ─────────────────────────────────────────
       ACTIVE NAV ON SCROLL
    ───────────────────────────────────────── */
    const navLinks   = document.querySelectorAll('.nav-a');
    const sections   = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-a[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => navObserver.observe(s));

})();
