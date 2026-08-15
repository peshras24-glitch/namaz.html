// ============================================================
// RADIO GAMES MODULE — с игрой Colony Runner
// ============================================================

(function () {
    if (window.RadioGames) return;

    // ---------- ОБЩИЕ ФУНКЦИИ ----------
    let overlay = null;
    let sheet = null;
    let currentLang = 'tg';

    const LANG = {
        tg: {
            hubTitle: '🎮 Бозиҳо',
            sortTitle: 'Сортировкаи рангҳо',
            sortDesc: 'Ҳама рангҳоро ҷудо кунед',
            matchTitle: '3 дар як қатор',
            matchDesc: 'Рангҳоро ҷой иваз кунед',
            runnerTitle: 'Colony Runner',
            runnerDesc: 'Платформер бо сатҳҳо',
            play: 'Бозидан',
            close: 'Пӯшидан',
            back: 'Бозгашт',
            score: 'Балл',
            moves: 'Ҳаракат',
            best: 'Беҳтарин',
            win: '✅ Ба итмом расид!',
            lose: '⏳ Вақт тамом!',
            restart: 'Аз нав',
            tap: 'Барои иваз кардан клик кунед',
            undo: 'Бозгашт'
        },
        ru: {
            hubTitle: '🎮 Игры',
            sortTitle: 'Сортировка цветов',
            sortDesc: 'Разделите все цвета',
            matchTitle: '3 в ряд',
            matchDesc: 'Меняйте цвета местами',
            runnerTitle: 'Colony Runner',
            runnerDesc: 'Платформер с уровнями',
            play: 'Играть',
            close: 'Закрыть',
            back: 'Назад',
            score: 'Очки',
            moves: 'Ходы',
            best: 'Лучший',
            win: '✅ Готово!',
            lose: '⏳ Время вышло!',
            restart: 'Заново',
            tap: 'Кликните, чтобы поменять',
            undo: 'Назад'
        }
    };

    // ---------- СТИЛИ (добавляем стили для игры) ----------
    const style = document.createElement('style');
    style.textContent = `
        .rg-overlay {
            position: fixed;
            inset: 0;
            background: rgba(6, 8, 24, 0.90);
            backdrop-filter: blur(12px);
            z-index: 9999;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            animation: rgFadeIn 0.2s ease;
            font-family: 'Inter', sans-serif;
        }
        @keyframes rgFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .rg-sheet {
            width: 100%;
            max-width: 500px;
            background: #12102A;
            border: 1px solid rgba(255,255,255,0.08);
            border-bottom: none;
            border-radius: 28px 28px 0 0;
            padding: 20px 18px calc(20px + env(safe-area-inset-bottom,0px));
            max-height: 92vh;
            overflow-y: auto;
            color: #F7F4EC;
            animation: rgSlideUp 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes rgSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .rg-title { font-weight: 700; font-size: 20px; }
        .rg-close { background: rgba(255,255,255,0.06); border: none; color: #F7F4EC; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; }
        .rg-close:hover { background: rgba(255,255,255,0.12); }
        .rg-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 14px; }
        .rg-card:hover { border-color: #F0B429; transform: translateY(-2px); }
        .rg-card .rg-icon { font-size: 28px; width: 44px; text-align: center; }
        .rg-card .rg-name { font-weight: 700; font-size: 16px; }
        .rg-card .rg-desc { font-size: 13px; color: rgba(247,244,236,0.55); }
        .rg-btn { background: #F0B429; border: none; border-radius: 40px; padding: 12px 20px; color: #0A0D24; font-weight: 700; cursor: pointer; width: 100%; font-size: 15px; margin-top: 8px; }
        .rg-btn:hover { background: #C8961F; }
        .rg-btn-secondary { background: rgba(255,255,255,0.06); color: #F7F4EC; border: 1px solid rgba(255,255,255,0.08); }
        .rg-btn-secondary:hover { background: rgba(255,255,255,0.12); }
        .rg-grid { display: grid; gap: 6px; margin: 12px auto; justify-content: center; }
        .rg-cell { aspect-ratio: 1; border-radius: 8px; cursor: pointer; transition: 0.15s; border: 2px solid transparent; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2); }
        .rg-cell.selected { border-color: #F0B429; transform: scale(1.04); }
        .rg-cell.empty { background: rgba(255,255,255,0.05) !important; border: 1px dashed rgba(255,255,255,0.1); cursor: default; }
        .rg-tube { display: flex; flex-direction: column-reverse; align-items: center; gap: 3px; padding: 6px 0; cursor: pointer; transition: 0.15s; }
        .rg-tube:hover { transform: scale(1.02); }
        .rg-tube .rg-cell { width: 32px; height: 32px; border-radius: 4px; }
        .rg-tubes { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 12px 0; }
        .rg-stats { display: flex; justify-content: space-between; font-size: 14px; color: rgba(247,244,236,0.7); margin-bottom: 8px; }
        .rg-stats b { color: #F0B429; font-size: 17px; }
        .rg-center { text-align: center; }

        /* Стили для Colony Runner */
        #colonyRunnerContainer {
            display: none;
            width: 100%;
            height: 400px;
            background: #0a0a1a;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
        }
        #colonyRunnerContainer canvas {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        }
        #colonyRunnerContainer .game-ui {
            position: absolute;
            top: 8px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-around;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            pointer-events: none;
        }
        #colonyRunnerContainer .game-ui span { color: #7fdbca; }
    `;
    document.head.appendChild(style);

    // ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
    function ensureOverlay() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'rg-overlay';
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAll(); });
        sheet = document.createElement('div');
        sheet.className = 'rg-sheet';
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);
    }

    function closeAll() {
        if (overlay) { overlay.remove(); overlay = null; sheet = null; }
    }

    function header(title) {
        return `<div class="rg-header"><div class="rg-title">${title}</div><button class="rg-close" onclick="RadioGames.close()"><i class="fas fa-times"></i></button></div>`;
    }

    // ---------- ХАБ ----------
    function openHub(lang) {
        currentLang = (lang === 'ru') ? 'ru' : 'tg';
        const t = LANG[currentLang];
        ensureOverlay();
        sheet.innerHTML = `
            ${header(t.hubTitle)}
            <div class="rg-card" onclick="RadioGames.startSort('${currentLang}')">
                <div class="rg-icon">🧪</div>
                <div><div class="rg-name">${t.sortTitle}</div><div class="rg-desc">${t.sortDesc}</div></div>
            </div>
            <div class="rg-card" onclick="RadioGames.startMatch('${currentLang}')">
                <div class="rg-icon">🍭</div>
                <div><div class="rg-name">${t.matchTitle}</div><div class="rg-desc">${t.matchDesc}</div></div>
            </div>
            <div class="rg-card" onclick="RadioGames.startRunner('${currentLang}')">
                <div class="rg-icon">🏃</div>
                <div><div class="rg-name">${t.runnerTitle}</div><div class="rg-desc">${t.runnerDesc}</div></div>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    // ---------- СОРТИРОВКА ЦВЕТОВ ----------
    const COLORS = ['#E8623D', '#F0B429', '#34C759', '#5AC8FA', '#AF52DE', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'];
    let sortState = { tubes: [], selected: -1, moves: 0, best: 0, lang: 'tg' };

    function generateSortPuzzle(numTubes = 5, numColors = 4) {
        const totalLayers = numColors * 4;
        let colors = [];
        for (let i = 0; i < numColors; i++) {
            for (let j = 0; j < 4; j++) colors.push(i);
        }
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }
        let tubes = [];
        let idx = 0;
        for (let i = 0; i < numTubes; i++) {
            let tube = [];
            for (let j = 0; j < 4; j++) {
                if (idx < colors.length) tube.push(colors[idx++]);
            }
            tubes.push(tube);
        }
        tubes.push([]);
        if (numTubes > 4) tubes.push([]);
        return tubes;
    }

    function isTubeSorted(tube) {
        if (tube.length === 0) return true;
        const first = tube[0];
        return tube.every(c => c === first);
    }

    function isPuzzleSolved(tubes) {
        return tubes.every(t => t.length === 0 || isTubeSorted(t));
    }

    function startSort(lang) {
        sortState.lang = lang;
        sortState.moves = 0;
        sortState.selected = -1;
        const numTubes = 5 + Math.floor(Math.random() * 3);
        const numColors = 3 + Math.floor(Math.random() * 3);
        sortState.tubes = generateSortPuzzle(numTubes, numColors);
        sortState.best = parseInt(localStorage.getItem('sortBestScore') || '0');
        renderSort();
    }

    function renderSort() {
        const t = LANG[sortState.lang];
        const tubes = sortState.tubes;
        const selected = sortState.selected;
        const moves = sortState.moves;
        const best = sortState.best;

        let tubesHTML = tubes.map((tube, idx) => {
            const isSelected = (idx === selected);
            let cells = tube.map(c => `<div class="rg-cell" style="background:${COLORS[c]};"></div>`).join('');
            for (let i = tube.length; i < 4; i++) {
                cells += `<div class="rg-cell empty"></div>`;
            }
            return `<div class="rg-tube" data-idx="${idx}">${cells}</div>`;
        }).join('');

        sheet.innerHTML = `
            ${header(t.sortTitle)}
            <div class="rg-stats">
                <div>${t.moves}: <b id="sortMoves">${moves}</b></div>
                <div>${t.best}: <b id="sortBest">${best}</b></div>
            </div>
            <div class="rg-tubes" id="sortTubes">${tubesHTML}</div>
            <button class="rg-btn rg-btn-secondary" onclick="RadioGames.openHub('${sortState.lang}')">${t.back}</button>
        `;

        document.getElementById('sortTubes').querySelectorAll('.rg-tube').forEach(el => {
            el.addEventListener('click', function () {
                const idx = parseInt(this.dataset.idx);
                onTubeClick(idx);
            });
        });

        if (isPuzzleSolved(tubes)) {
            const newBest = Math.max(best, moves);
            if (newBest > best) localStorage.setItem('sortBestScore', newBest);
            setTimeout(() => {
                const t2 = LANG[sortState.lang];
                sheet.innerHTML = `
                    ${header(t2.sortTitle)}
                    <div class="rg-center" style="padding: 20px 0;">
                        <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                        <div style="font-size: 22px; font-weight: 700;">${t2.win}</div>
                        <div style="color: rgba(247,244,236,0.6); margin: 8px 0;">${t2.moves}: ${moves}</div>
                        <button class="rg-btn" onclick="RadioGames.startSort('${sortState.lang}')">${t2.restart}</button>
                        <button class="rg-btn rg-btn-secondary" onclick="RadioGames.openHub('${sortState.lang}')">${t2.back}</button>
                    </div>
                `;
            }, 300);
        }
    }

    function onTubeClick(idx) {
        const tubes = sortState.tubes;
        const selected = sortState.selected;
        if (selected === -1) {
            if (tubes[idx].length === 0) return;
            if (isTubeSorted(tubes[idx]) && tubes[idx].length === 4) return;
            sortState.selected = idx;
            renderSort();
            return;
        }
        if (selected === idx) { sortState.selected = -1; renderSort(); return; }
        const from = tubes[selected];
        const to = tubes[idx];
        if (from.length === 0) { sortState.selected = -1; renderSort(); return; }
        const topColor = from[from.length - 1];
        if (to.length > 0 && to[to.length - 1] !== topColor) { sortState.selected = -1; renderSort(); return; }
        if (to.length >= 4) { sortState.selected = -1; renderSort(); return; }
        from.pop();
        to.push(topColor);
        sortState.moves++;
        sortState.selected = -1;
        renderSort();
    }

    // ---------- 3 В РЯД ----------
    const MATCH_COLORS = ['#E8623D', '#F0B429', '#34C759', '#5AC8FA', '#AF52DE', '#FF6B6B'];
    let matchState = { grid: [], score: 0, best: 0, selected: null, moves: 0, lang: 'tg' };

    function initMatchGrid(rows = 8, cols = 8) {
        let grid = [];
        for (let r = 0; r < rows; r++) {
            let row = [];
            for (let c = 0; c < cols; c++) {
                let color;
                do {
                    color = Math.floor(Math.random() * MATCH_COLORS.length);
                } while (
                    (r >= 2 && grid[r - 1][c] === color && grid[r - 2][c] === color) ||
                    (c >= 2 && row[c - 1] === color && row[c - 2] === color)
                );
                row.push(color);
            }
            grid.push(row);
        }
        return grid;
    }

    function findMatches(grid) {
        const matches = new Set();
        const rows = grid.length, cols = grid[0].length;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const color = grid[r][c];
                if (color === null) continue;
                if (c + 2 < cols && grid[r][c + 1] === color && grid[r][c + 2] === color) {
                    let len = 3;
                    while (c + len < cols && grid[r][c + len] === color) len++;
                    for (let i = 0; i < len; i++) matches.add(`${r},${c + i}`);
                }
                if (r + 2 < rows && grid[r + 1][c] === color && grid[r + 2][c] === color) {
                    let len = 3;
                    while (r + len < rows && grid[r + len][c] === color) len++;
                    for (let i = 0; i < len; i++) matches.add(`${r + i},${c}`);
                }
            }
        }
        return matches;
    }

    function applyGravity(grid) {
        const rows = grid.length, cols = grid[0].length;
        for (let c = 0; c < cols; c++) {
            let writeRow = rows - 1;
            for (let r = rows - 1; r >= 0; r--) {
                if (grid[r][c] !== null) {
                    grid[writeRow][c] = grid[r][c];
                    if (writeRow !== r) grid[r][c] = null;
                    writeRow--;
                }
            }
            for (let r = writeRow; r >= 0; r--) {
                grid[r][c] = Math.floor(Math.random() * MATCH_COLORS.length);
            }
        }
        return grid;
    }

    function startMatch(lang) {
        matchState.lang = lang;
        matchState.score = 0;
        matchState.moves = 0;
        matchState.selected = null;
        matchState.best = parseInt(localStorage.getItem('matchBestScore') || '0');
        matchState.grid = initMatchGrid(8, 8);
        let matches = findMatches(matchState.grid);
        let iterations = 0;
        while (matches.size > 0 && iterations < 100) {
            for (const key of matches) {
                const [r, c] = key.split(',').map(Number);
                matchState.grid[r][c] = null;
            }
            applyGravity(matchState.grid);
            matches = findMatches(matchState.grid);
            iterations++;
        }
        renderMatch();
    }

    function renderMatch() {
        const t = LANG[matchState.lang];
        const grid = matchState.grid;
        const score = matchState.score;
        const best = matchState.best;
        const rows = grid.length, cols = grid[0].length;

        let gridHTML = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const colorIdx = grid[r][c];
                const color = colorIdx !== null ? MATCH_COLORS[colorIdx] : '#2a2a4a';
                const selected = (matchState.selected && matchState.selected[0] === r && matchState.selected[1] === c) ? 'selected' : '';
                gridHTML += `<div class="rg-cell ${selected}" data-r="${r}" data-c="${c}" style="background:${color};"></div>`;
            }
        }

        sheet.innerHTML = `
            ${header(t.matchTitle)}
            <div class="rg-stats">
                <div>${t.score}: <b id="matchScore">${score}</b></div>
                <div>${t.best}: <b id="matchBest">${best}</b></div>
                <div>${t.moves}: <b id="matchMoves">${matchState.moves}</b></div>
            </div>
            <div class="rg-grid" style="grid-template-columns: repeat(${cols}, 1fr);">${gridHTML}</div>
            <button class="rg-btn rg-btn-secondary" onclick="RadioGames.openHub('${matchState.lang}')">${t.back}</button>
        `;

        document.querySelectorAll('.rg-grid .rg-cell').forEach(el => {
            el.addEventListener('click', function () {
                const r = parseInt(this.dataset.r);
                const c = parseInt(this.dataset.c);
                onMatchClick(r, c);
            });
        });
    }

    function onMatchClick(r, c) {
        const grid = matchState.grid;
        const selected = matchState.selected;
        if (grid[r][c] === null) return;
        if (!selected) { matchState.selected = [r, c]; renderMatch(); return; }
        const [sr, sc] = selected;
        if (sr === r && sc === c) { matchState.selected = null; renderMatch(); return; }
        if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { matchState.selected = [r, c]; renderMatch(); return; }
        const temp = grid[sr][sc];
        grid[sr][sc] = grid[r][c];
        grid[r][c] = temp;
        matchState.moves++;
        let matches = findMatches(grid);
        if (matches.size === 0) {
            const temp2 = grid[sr][sc];
            grid[sr][sc] = grid[r][c];
            grid[r][c] = temp2;
            matchState.moves--;
            matchState.selected = null;
            renderMatch();
            return;
        }
        let scoreGain = 0;
        let iterations = 0;
        while (matches.size > 0 && iterations < 100) {
            scoreGain += matches.size * 10;
            for (const key of matches) {
                const [rr, cc] = key.split(',').map(Number);
                grid[rr][cc] = null;
            }
            applyGravity(grid);
            matches = findMatches(grid);
            iterations++;
        }
        matchState.score += scoreGain;
        if (matchState.score > matchState.best) {
            localStorage.setItem('matchBestScore', matchState.score);
            matchState.best = matchState.score;
        }
        matchState.selected = null;
        renderMatch();
    }

    // ---------- COLONY RUNNER ----------
    let runnerInitialized = false;
    let runnerContainer = null;

    function startRunner(lang) {
        const t = LANG[lang];
        ensureOverlay();

        // Создаём контейнер для игры
        runnerContainer = document.createElement('div');
        runnerContainer.id = 'colonyRunnerContainer';
        runnerContainer.innerHTML = `
            <div class="game-ui">
                <div>SCORE: <span id="runnerScore">0</span></div>
                <div>LIVES: <span id="runnerLives">3</span></div>
                <div>LEVEL: <span id="runnerLevel">1</span></div>
            </div>
            <canvas id="runnerCanvas"></canvas>
        `;

        sheet.innerHTML = `
            ${header(t.runnerTitle)}
            <div style="margin-bottom: 12px; font-size: 14px; color: rgba(247,244,236,0.6);">
                🎮 ${t.runnerDesc}
            </div>
        `;
        sheet.appendChild(runnerContainer);

        // Загружаем скрипты игры
        if (!runnerInitialized) {
            loadRunnerScripts(() => {
                runnerInitialized = true;
                initRunnerGame();
            });
        } else {
            initRunnerGame();
        }
    }

    function loadRunnerScripts(callback) {
        // Проверяем, загружена ли игра
        if (typeof ColonyRunner !== 'undefined') {
            callback();
            return;
        }

        // Загружаем audio.js
        const audioScript = document.createElement('script');
        audioScript.src = 'audio.js';
        audioScript.onload = () => {
            // Загружаем game.js
            const gameScript = document.createElement('script');
            gameScript.src = 'game.js';
            gameScript.onload = () => {
                callback();
            };
            document.head.appendChild(gameScript);
        };
        document.head.appendChild(audioScript);
    }

    function initRunnerGame() {
        if (!runnerContainer) return;
        const canvas = runnerContainer.querySelector('#runnerCanvas');
        if (!canvas) return;

        // Инициализация игры
        if (typeof ColonyRunner !== 'undefined') {
            ColonyRunner.init(canvas, {
                onScoreUpdate: (score) => {
                    const el = document.getElementById('runnerScore');
                    if (el) el.textContent = score;
                },
                onLivesUpdate: (lives) => {
                    const el = document.getElementById('runnerLives');
                    if (el) el.textContent = lives;
                },
                onLevelUpdate: (level) => {
                    const el = document.getElementById('runnerLevel');
                    if (el) el.textContent = level;
                }
            });
        }
    }

    // ---------- ЭКСПОРТ ----------
    window.RadioGames = {
        openHub,
        close: closeAll,
        startSort,
        startMatch,
        startRunner
    };
})();
