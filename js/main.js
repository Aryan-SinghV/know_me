/* ==============================================
   OS 九 — main.js
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
        '> BIOS_九 v9.1 ...',
        '> CHECKING MEMORY .... [16MB OK]',
        '> LOADING KERNEL .... [OK]',
        '> MOUNTING FILESYSTEM ... [OK]',
        '> INITIALIZING DISPLAY .... [CRT 640x480]',
        '> WELCOME TO OS 九.',
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
       CONTACT / TRANSMIT
    ───────────────────────────────────────── */
    const transmitBtn = document.getElementById('transmit-btn');
    const termFeedback = document.getElementById('term-feedback');
    if (transmitBtn && termFeedback) {
        transmitBtn.addEventListener('click', () => {
            const name = document.getElementById('contact-name')?.value.trim();
            const msg  = document.getElementById('contact-msg')?.value.trim();
            if (!name || !msg) {
                termFeedback.textContent = '> ERROR: EMPTY PAYLOAD DETECTED.';
                termFeedback.style.color = '#ff5f57';
                return;
            }
            termFeedback.textContent = '> TRANSMITTING...';
            termFeedback.style.color = 'var(--orange)';
            setTimeout(() => {
                termFeedback.textContent = '> PACKET DELIVERED. ACK_九_OK.';
                termFeedback.style.color = '#28c840';
            }, 1200);
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
