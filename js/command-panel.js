/* ==========================================================
   COMMAND PANEL — js/command-panel.js  (v1.1 — bug fixes)
   ADDITIVE ONLY — fully IIFE-wrapped, no globals leaked.
   FIX: removed IntersectionObserver auto-focus (caused
        focus-steal during scroll, making terminal feel frozen).
   FIX: collapsed capture+bubble into one unified handler.
   FIX: input caret visible via explicit caret-color (CSS).
   ========================================================== */

(function CommandPanel() {
    'use strict';

    /* ── DOM refs ── */
    const output        = document.getElementById('cp-output');
    const form          = document.getElementById('cp-form');
    const input         = document.getElementById('cp-input');
    const termBody      = document.getElementById('cp-term-body');
    const gameContainer = document.getElementById('cp-game-container');
    const closeGameBtn  = document.getElementById('cp-close-game');
    const scoreEl       = document.getElementById('cp-score');
    const snakeCanvas   = document.getElementById('cp-snake-canvas');
    const section       = document.getElementById('command-panel');

    if (!output || !form || !input) return;

    /* ── State ── */
    const history  = [];
    let historyIdx = -1;

    /* ── Boot message ── */
    const BOOT = [
        { cls: 'cp-line--dim',   text: '┌──────────────────────────────────────────┐' },
        { cls: 'cp-line--dim',   text: '│  ARYAN SINGHVISHESH  //  ASV_TERMINAL  v1.0  │' },
        { cls: 'cp-line--dim',   text: '│  Engineer · Designer · Logician · India       │' },
        { cls: 'cp-line--dim',   text: '│  Type  help  to list available commands.     │' },
        { cls: 'cp-line--dim',   text: '└──────────────────────────────────────────┘' },
        { cls: 'cp-line--blank', text: '' },
    ];

    /* ── Command map ── */
    const COMMANDS = {
        'help':          cmdHelp,
        'about':         cmdAbout,
        'projects':      cmdProjects,
        'skills':        cmdSkills,
        'experience':    cmdExperience,
        'contact':       cmdContact,
        'clear':         cmdClear,
        'run game snake': cmdSnake,
        'exit':          cmdExit,
    };

    /* ════════════════════════════════════════════
       INIT
    ════════════════════════════════════════════ */
    function init() {
        renderLines(BOOT);

        /* Single unified submit handler — no capture trick needed */
        form.addEventListener('submit', onSubmit);

        /* History navigation */
        input.addEventListener('keydown', onKeyDown);

        /* Click anywhere in the terminal → focus input */
        if (section) {
            section.addEventListener('click', () => {
                if (!gameContainer || gameContainer.hidden) {
                    input.focus({ preventScroll: true });
                }
            });
        }

        /* Close game button */
        if (closeGameBtn) closeGameBtn.addEventListener('click', closeGame);
    }

    /* ════════════════════════════════════════════
       EVENT HANDLERS
    ════════════════════════════════════════════ */
    function onSubmit(e) {
        e.preventDefault();
        const raw = input.value.trim();
        input.value = '';
        historyIdx  = -1;

        if (!raw) return;

        /* If game is open and user typed 'exit' → close game */
        if (gameContainer && !gameContainer.hidden) {
            if (raw.toLowerCase() === 'exit') {
                closeGame();
            }
            /* Ignore all other commands while game is running */
            return;
        }

        history.unshift(raw);
        if (history.length > 60) history.pop();

        renderEcho(raw);

        const cmd = raw.toLowerCase();
        if (COMMANDS[cmd]) {
            COMMANDS[cmd]();
        } else {
            renderError(raw);
        }
    }

    function onKeyDown(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            historyIdx = Math.min(historyIdx + 1, history.length - 1);
            input.value = history[historyIdx] ?? '';
            moveCursorToEnd();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            historyIdx = Math.max(historyIdx - 1, -1);
            input.value = historyIdx >= 0 ? history[historyIdx] : '';
            moveCursorToEnd();
        }
    }

    function moveCursorToEnd() {
        const len = input.value.length;
        input.setSelectionRange(len, len);
    }

    /* ════════════════════════════════════════════
       RENDER HELPERS
    ════════════════════════════════════════════ */
    function renderLines(lines) {
        const frag = document.createDocumentFragment();
        lines.forEach(({ cls, text }) => {
            const span = document.createElement('span');
            span.className = `cp-line ${cls || ''}`.trim();
            span.textContent = text;
            frag.appendChild(span);
        });
        output.appendChild(frag);
        output.scrollTop = output.scrollHeight;
    }

    function renderEcho(cmd) {
        renderLines([{ cls: 'cp-line--cmd', text: `asv:~$ ${cmd}` }]);
    }

    function renderBlank() {
        renderLines([{ cls: 'cp-line--blank', text: '' }]);
    }

    function renderError(cmd) {
        renderLines([
            { cls: 'cp-line--err', text: `command not found: ${cmd}` },
            { cls: 'cp-line--dim', text: `run  help  to see all commands.` },
        ]);
        renderBlank();
    }

    /* ════════════════════════════════════════════
       COMMANDS
    ════════════════════════════════════════════ */
    function cmdHelp() {
        renderLines([
            { cls: 'cp-line--accent', text: 'AVAILABLE COMMANDS ─────────────────────────' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--out',    text: '  help          Show this reference' },
            { cls: 'cp-line--out',    text: '  about         Developer bio & philosophy' },
            { cls: 'cp-line--out',    text: '  projects       Go to project gallery' },
            { cls: 'cp-line--out',    text: '  skills         View tech skill matrix' },
            { cls: 'cp-line--out',    text: '  experience     Career timeline / log' },
            { cls: 'cp-line--out',    text: '  contact        Open the contact uplink' },
            { cls: 'cp-line--out',    text: '  clear          Clear this terminal' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--accent', text: '  run game snake         [ARCADE_MODE]' },
            { cls: 'cp-line--dim',    text: '  Arrow keys to play. Type exit to quit.' },
            { cls: 'cp-line--blank',  text: '' },
        ]);
    }

    function cmdAbout() {
        renderLines([
            { cls: 'cp-line--accent', text: '> ABOUT ARYAN SINGHVISHESH ─────────────────' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--info',   text: '  Handle: ASV | Location: India' },
            { cls: 'cp-line--out',    text: '  Versatile technologist with a strong foundation' },
            { cls: 'cp-line--out',    text: '  in C++ algorithmic problem-solving and Python-' },
            { cls: 'cp-line--out',    text: '  driven data analysis.' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--out',    text: '  Combines Linux admin, networking, and foundational' },
            { cls: 'cp-line--out',    text: '  cybersecurity with a creative eye for visual design.' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--out',    text: '  Domains: Algorithms & DSA  |  Data Science' },
            { cls: 'cp-line--out',    text: '           Systems & Security |  Visual Design' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--ok',     text: '  [STATUS: OPEN FOR OPPORTUNITIES]' },
            { cls: 'cp-line--out',    text: '  EMAIL:  singhvishesharyan@gmail.com' },
            { cls: 'cp-line--out',    text: '  GITHUB: github.com/Aryan-SinghV' },
            { cls: 'cp-line--blank',  text: '' },
        ]);
    }

    function cmdProjects() {
        renderLines([
            { cls: 'cp-line--ok',    text: '> LOADING A:/PORTFOLIO/PROJECTS ...' },
            { cls: 'cp-line--dim',   text: '  Scrolling to gallery in 400ms...' },
            { cls: 'cp-line--blank', text: '' },
        ]);
        setTimeout(() => {
            const t = document.getElementById('projects');
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    }

    function cmdSkills() {
        renderLines([
            { cls: 'cp-line--accent', text: '> SKILL_MATRIX ──────────────────────────────' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--info',   text: '  ── PROGRAMMING ──' },
            { cls: 'cp-line--out',    text: '  C++           [██████████]  Primary Language' },
            { cls: 'cp-line--out',    text: '  Python        [█████████░]  Data & Scripting' },
            { cls: 'cp-line--out',    text: '  JavaScript    [███████░░░]  Web / Logic' },
            { cls: 'cp-line--out',    text: '  HTML / CSS    [████████░░]  Frontend' },
            { cls: 'cp-line--out',    text: '  PHP           [█████░░░░░]  Backend / Web' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--info',   text: '  ── DATA SCIENCE ──' },
            { cls: 'cp-line--out',    text: '  Pandas/NumPy  [█████████░]  EDA, Analysis' },
            { cls: 'cp-line--out',    text: '  Seaborn       [███████░░░]  Visualisation' },
            { cls: 'cp-line--out',    text: '  Jupyter       [████████░░]  Notebooks' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--info',   text: '  ── DSA ──' },
            { cls: 'cp-line--out',    text: '  Graph algs, Combinatorics, Sliding Window' },
            { cls: 'cp-line--out',    text: '  2D Prefix Sums, Binary Search on Answer' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--info',   text: '  ── SYSTEMS & DESIGN ──' },
            { cls: 'cp-line--out',    text: '  Arch Linux (Hyprland) | macOS | Nmap' },
            { cls: 'cp-line--out',    text: '  Figma  [████████░░]  UI / Prototyping' },
            { cls: 'cp-line--out',    text: '  PS/AI  [███████░░░]  Vector Assets' },
            { cls: 'cp-line--out',    text: '  AE     [██████░░░░]  Motion Graphics' },
            { cls: 'cp-line--blank',  text: '' },
        ]);
    }

    function cmdExperience() {
        renderLines([
            { cls: 'cp-line--accent', text: '> LEARNING_LOG ──────────────────────────────' },
            { cls: 'cp-line--blank',  text: '' },
            { cls: 'cp-line--out',    text: '  2022  C++ & competitive programming begins.' },
            { cls: 'cp-line--out',    text: '        Graph algorithms, combinatorics, DSA patterns.' },
            { cls: 'cp-line--out',    text: '  2023  Python & data science pipeline.' },
            { cls: 'cp-line--out',    text: '        Pandas, NumPy, Seaborn, Jupyter, EDA workflows.' },
            { cls: 'cp-line--out',    text: '  2024  Systems & networking deep-dive.' },
            { cls: 'cp-line--out',    text: '        Arch Linux (Hyprland), TCP/ARQ, Nmap recon.' },
            { cls: 'cp-line--out',    text: '        Flex/Lex — built a lexical analyzer.' },
            { cls: 'cp-line--out',    text: '  2025  Visual design & multimedia production.' },
            { cls: 'cp-line--out',    text: '        Figma, Photoshop, Illustrator, After Effects.' },
            { cls: 'cp-line--out',    text: '  2026  Portfolio launched. Signal: ONLINE.' },
            { cls: 'cp-line--blank',  text: '' },
        ]);
    }

    function cmdContact() {
        renderLines([
            { cls: 'cp-line--ok',    text: '> OPENING CONTACT UPLINK ...' },
            { cls: 'cp-line--out',   text: '  EMAIL:  singhvishesharyan@gmail.com' },
            { cls: 'cp-line--out',   text: '  GITHUB: github.com/Aryan-SinghV' },
            { cls: 'cp-line--dim',   text: '  Scrolling to contact form...' },
            { cls: 'cp-line--blank', text: '' },
        ]);
        setTimeout(() => {
            const t = document.getElementById('uplink');
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    }

    function cmdClear() {
        while (output.firstChild) output.removeChild(output.firstChild);
        renderLines([
            { cls: 'cp-line--dim',   text: 'Terminal cleared. Type  help  for commands.' },
            { cls: 'cp-line--blank', text: '' },
        ]);
    }

    function cmdExit() {
        renderLines([
            { cls: 'cp-line--dim', text: 'No active session to exit. Type  help  for commands.' },
        ]);
        renderBlank();
    }

    function cmdSnake() {
        renderLines([
            { cls: 'cp-line--ok',  text: '> BOOTING SNAKE_GAME.exe ...' },
            { cls: 'cp-line--dim', text: '  ARROW KEYS to move. Type  exit  or press EXIT to quit.' },
        ]);
        setTimeout(openGame, 400);
    }

    /* ════════════════════════════════════════════
       GAME OPEN / CLOSE
    ════════════════════════════════════════════ */
    function openGame() {
        termBody.hidden      = true;
        gameContainer.hidden = false;
        snakeGame.start();
    }

    function closeGame() {
        snakeGame.stop();
        gameContainer.hidden = true;
        termBody.hidden      = false;
        renderLines([
            { cls: 'cp-line--ok',    text: `> SNAKE_GAME.exe exited. Final score: ${snakeGame.score}` },
            { cls: 'cp-line--blank', text: '' },
        ]);
        input.focus({ preventScroll: true });
    }

    /* ════════════════════════════════════════════
       SNAKE GAME ENGINE
    ════════════════════════════════════════════ */
    const snakeGame = (function () {
        const GRID = 18;
        const CELL = Math.floor(360 / GRID);
        const TICK = 125;

        const C_BG    = '#050505';
        const C_SNAKE = '#e85d04';
        const C_HEAD  = '#ff8f3a';
        const C_FOOD  = '#28c840';
        const C_GRID  = '#131313';
        const C_TEXT  = '#555555';

        let ctx, ticker, raf;
        let snake, dir, nextDir, food, _score, alive;

        function reset() {
            snake   = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
            dir     = { x: 1, y: 0 };
            nextDir = { x: 1, y: 0 };
            _score  = 0;
            alive   = true;
            placeFood();
            pushScore();
        }

        function placeFood() {
            let f;
            do {
                f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
            } while (snake.some(s => s.x === f.x && s.y === f.y));
            food = f;
        }

        function pushScore() {
            snakeGame.score = _score;
            if (scoreEl) scoreEl.textContent = `SCORE: ${_score}`;
        }

        function step() {
            if (!alive) return;
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
                snake.some(s => s.x === head.x && s.y === head.y)) {
                alive = false;
                clearInterval(ticker);
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                _score += 10;
                pushScore();
                placeFood();
            } else {
                snake.pop();
            }
        }

        function draw() {
            if (!ctx) return;
            const W = 360, H = 360;

            ctx.fillStyle = C_BG;
            ctx.fillRect(0, 0, W, H);

            /* Grid lines */
            ctx.strokeStyle = C_GRID;
            ctx.lineWidth   = 0.5;
            for (let i = 0; i <= GRID; i++) {
                ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
            }

            if (!alive) {
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle   = C_SNAKE;
                ctx.font        = 'bold 18px monospace';
                ctx.textAlign   = 'center';
                ctx.fillText('GAME OVER', 180, 162);
                ctx.fillStyle = C_TEXT;
                ctx.font      = '13px monospace';
                ctx.fillText(`SCORE: ${_score}`, 180, 188);
                ctx.fillText('Press EXIT button to return', 180, 212);
                ctx.textAlign = 'left';
                return;
            }

            /* Food — diamond shape */
            const hc = CELL / 2;
            ctx.fillStyle = C_FOOD;
            ctx.beginPath();
            ctx.moveTo(food.x * CELL + hc, food.y * CELL + 2);
            ctx.lineTo(food.x * CELL + CELL - 2, food.y * CELL + hc);
            ctx.lineTo(food.x * CELL + hc, food.y * CELL + CELL - 2);
            ctx.lineTo(food.x * CELL + 2, food.y * CELL + hc);
            ctx.closePath();
            ctx.fill();

            /* Snake segments */
            snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? C_HEAD : C_SNAKE;
                ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
                if (i === 0) {
                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.fillRect(seg.x * CELL + 3, seg.y * CELL + 3, 2, 2);
                }
            });

            raf = requestAnimationFrame(draw);
        }

        function handleKey(e) {
            const map = {
                ArrowUp:    { x: 0, y: -1 },
                ArrowDown:  { x: 0, y:  1 },
                ArrowLeft:  { x: -1, y: 0 },
                ArrowRight: { x: 1, y:  0 },
            };
            const nd = map[e.key];
            if (!nd) return;
            if (nd.x === -dir.x && nd.y === -dir.y) return; /* block 180° */
            e.preventDefault();
            nextDir = nd;
        }

        return {
            score: 0,
            start() {
                ctx = snakeCanvas.getContext('2d');
                reset();
                window.addEventListener('keydown', handleKey);
                ticker = setInterval(step, TICK);
                raf    = requestAnimationFrame(draw);
            },
            stop() {
                clearInterval(ticker);
                cancelAnimationFrame(raf);
                window.removeEventListener('keydown', handleKey);
                snakeGame.score = _score;
            },
        };
    })();

    /* ── Boot ── */
    init();

})();
