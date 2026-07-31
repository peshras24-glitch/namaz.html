/* ============================================================
   RADIO GAMES MODULE — квиз + ритм-игра
   Полностью самостоятельный файл. Ничего не трогает в index.html,
   только добавляет свою модалку и вызывается через RadioGames.openHub()
   ============================================================ */

(function () {
    if (window.RadioGames) return; // защита от повторного подключения

    // ---------- ДАННЫЕ КВИЗА ----------
    const QUIZ_QUESTIONS = [
        { q: { tg: 'Баландтарин қуллаи Тоҷикистон кадом аст?', ru: 'Какая вершина самая высокая в Таджикистане?' },
          options: { tg: ['Кӯҳи Исмоили Сомонӣ', 'Кӯҳи Чимтарга', 'Кӯҳи Зардолу', 'Кӯҳи Хазрати Султон'], ru: ['Пик Исмоила Сомони', 'Чимтарга', 'Зардолу', 'Хазрати Султон'] },
          correct: 0 },
        { q: { tg: 'Кӯли Сарез дар натиҷаи чӣ ба вуҷуд омадааст?', ru: 'В результате чего образовалось озеро Сарез?' },
          options: { tg: ['Заминларза', 'Сел', 'Обхезӣ', 'Сохтмон'], ru: ['Землетрясение', 'Сель', 'Наводнение', 'Строительство'] },
          correct: 0 },
        { q: { tg: 'Тоҷикистон чанд макони мероси ҷаҳонии ЮНЕСКО дорад?', ru: 'Сколько объектов ЮНЕСКО в Таджикистане?' },
          options: { tg: ['2', '4', '6', '8'], ru: ['2', '4', '6', '8'] },
          correct: 1 },
        { q: { tg: 'Пойтахти Тоҷикистон дар кадом аср таъсис ёфтааст?', ru: 'В каком веке основан Душанбе как город?' },
          options: { tg: ['Асри 12', 'Асри 15', 'Асри 17', 'Асри 20'], ru: ['12 век', '15 век', '17 век', '20 век'] },
          correct: 2 },
        { q: { tg: 'Помирро чӣ гуна меноманд?', ru: 'Как называют Памир?' },
          options: { tg: ['Боми ҷаҳон', 'Дари шарқ', 'Кишвари офтоб', 'Замини сабз'], ru: ['Крыша мира', 'Восточные врата', 'Страна солнца', 'Зелёная земля'] },
          correct: 0 },
        { q: { tg: 'Дарозии дарёи Панҷ тахминан чанд км аст?', ru: 'Примерная длина реки Пяндж?' },
          options: { tg: ['524 км', '700 км', '921 км', '1200 км'], ru: ['524 км', '700 км', '921 км', '1200 км'] },
          correct: 2 },
        { q: { tg: 'Забони давлатии Тоҷикистон кадом аст?', ru: 'Какой язык является государственным в Таджикистане?' },
          options: { tg: ['Тоҷикӣ', 'Форсӣ', 'Ӯзбекӣ', 'Русӣ'], ru: ['Таджикский', 'Персидский', 'Узбекский', 'Русский'] },
          correct: 0 },
        { q: { tg: 'Шаҳри Хуҷанд дар кадом асрҳо таъсис шудааст?', ru: 'В каких веках основан Худжанд?' },
          options: { tg: ['I–II милодӣ', 'VI–V пеш аз милод', 'X милодӣ', 'XV милодӣ'], ru: ['I–II н.э.', 'VI–V до н.э.', 'X век', 'XV век'] },
          correct: 1 },
        { q: { tg: 'Кӯли Искандаркӯл дар кадом баландӣ ҷойгир аст?', ru: 'На какой высоте расположено озеро Искандеркуль?' },
          options: { tg: ['~800 м', '~1500 м', '~2195 м', '~3000 м'], ru: ['~800 м', '~1500 м', '~2195 м', '~3000 м'] },
          correct: 2 },
        { q: { tg: 'Кадоме аз инҳо ҳайвони Тоҷикистон аст?', ru: 'Какое из этих животных обитает в Таджикистане?' },
          options: { tg: ['Паланги Помир', 'Панда', 'Кенгуру', 'Зурофа'], ru: ['Памирский барс', 'Панда', 'Кенгуру', 'Жираф'] },
          correct: 0 }
    ];

    const T = {
        tg: {
            hubTitle: '🎮 Бозиҳо', quizTitle: 'Тоҷикистон-квиз', quizDesc: 'Дониши худро дар бораи Тоҷикистон санҷед',
            rhythmTitle: 'Ритм-бозӣ', rhythmDesc: 'Дар лаҳзаи дуруст пахш кунед',
            play: 'Бозидан', close: 'Пӯшидан', score: 'Бал', question: 'Савол', of: 'аз',
            correct: '✅ Дуруст!', wrong: '❌ Хато', next: 'Идома', finish: 'Анҷом',
            quizDone: 'Квиз тамом шуд!', yourScore: 'Балли шумо', playAgain: 'Дубора бозидан',
            tapZone: 'Пахш кунед', rhythmDone: 'Вақт тамом!', best: 'Беҳтарин натиҷа', start: 'Сар кардан', back: 'Бозгашт'
        },
        ru: {
            hubTitle: '🎮 Игры', quizTitle: 'Квиз о Таджикистане', quizDesc: 'Проверь свои знания о Таджикистане',
            rhythmTitle: 'Ритм-игра', rhythmDesc: 'Нажимай в нужный момент',
            play: 'Играть', close: 'Закрыть', score: 'Очки', question: 'Вопрос', of: 'из',
            correct: '✅ Верно!', wrong: '❌ Неверно', next: 'Далее', finish: 'Завершить',
            quizDone: 'Квиз завершён!', yourScore: 'Ваш результат', playAgain: 'Играть снова',
            tapZone: 'Нажми', rhythmDone: 'Время вышло!', best: 'Лучший результат', start: 'Начать', back: 'Назад'
        }
    };

    // ---------- СТИЛИ ----------
    const style = document.createElement('style');
    style.textContent = `
    .rg-overlay { position: fixed; inset: 0; background: rgba(6,8,24,0.88); backdrop-filter: blur(10px);
        z-index: 500; display: flex; align-items: flex-end; justify-content: center; animation: rgFadeIn 0.25s ease; }
    @keyframes rgFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .rg-sheet { width: 100%; max-width: 480px; background: linear-gradient(180deg, #171338, #0A0D24);
        border: 1px solid rgba(255,255,255,0.1); border-bottom: none; border-radius: 26px 26px 0 0;
        padding: 20px 20px calc(20px + env(safe-area-inset-bottom,0px)); max-height: 86vh; overflow-y: auto;
        font-family: 'Inter', sans-serif; color: #F7F4EC; animation: rgSlideUp 0.3s cubic-bezier(0.4,0,0.2,1); }
    @keyframes rgSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .rg-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .rg-title { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 18px; }
    .rg-close { background: rgba(255,255,255,0.06); border: none; color: #F7F4EC; width: 34px; height: 34px;
        border-radius: 50%; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .rg-close:hover { background: rgba(255,255,255,0.12); }
    .rg-card { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.09); border-radius: 18px;
        padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 14px; }
    .rg-card:hover { border-color: rgba(240,180,41,0.45); transform: translateY(-2px); }
    .rg-card .rg-icon { font-size: 26px; width: 46px; text-align: center; }
    .rg-card .rg-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15.5px; }
    .rg-card .rg-desc { font-size: 12.5px; color: rgba(247,244,236,0.6); margin-top: 2px; }
    .rg-progress { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(247,244,236,0.5); margin-bottom: 10px; }
    .rg-question { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 17px; margin-bottom: 16px; line-height: 1.4; }
    .rg-option { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.045);
        border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 13px 16px; margin-bottom: 9px;
        color: #F7F4EC; font-size: 14.5px; cursor: pointer; transition: all 0.2s ease; font-family: 'Inter', sans-serif; }
    .rg-option:hover { border-color: rgba(240,180,41,0.4); }
    .rg-option.rg-correct { background: rgba(52,199,89,0.18); border-color: #34C759; }
    .rg-option.rg-wrong { background: rgba(232,98,61,0.18); border-color: #E8623D; }
    .rg-option:disabled { cursor: default; }
    .rg-btn { background: #F0B429; border: none; border-radius: 40px; padding: 13px 22px; color: #0A0D24;
        font-weight: 700; font-family: 'Sora', sans-serif; cursor: pointer; width: 100%; font-size: 15px; margin-top: 6px; }
    .rg-btn:hover { background: #C8961F; }
    .rg-btn-secondary { background: rgba(255,255,255,0.06); color: #F7F4EC; border: 1px solid rgba(255,255,255,0.12); }
    .rg-result { text-align: center; padding: 20px 0; }
    .rg-result .rg-big-score { font-family: 'Sora', sans-serif; font-size: 44px; font-weight: 800; color: #F0B429; margin: 10px 0; }
    .rg-rhythm-zone { position: relative; height: 220px; display: flex; align-items: center; justify-content: center; margin: 10px 0 18px; }
    .rg-rhythm-target { position: absolute; width: 110px; height: 110px; border-radius: 50%; border: 3px solid rgba(240,180,41,0.4); }
    .rg-rhythm-pulse { width: 40px; height: 40px; border-radius: 50%; background: #E8623D; box-shadow: 0 0 30px rgba(232,98,61,0.6);
        transition: transform 0.05s linear; cursor: pointer; }
    .rg-rhythm-stats { display: flex; justify-content: space-around; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(247,244,236,0.7); }
    .rg-rhythm-stats b { color: #F0B429; font-size: 17px; display: block; }
    `;
    document.head.appendChild(style);

    // ---------- СОСТОЯНИЕ ----------
    let overlay = null;
    let sheet = null;
    let currentLang = 'tg';

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
        stopRhythmLoop();
        if (overlay) { overlay.remove(); overlay = null; sheet = null; }
    }

    function header(title) {
        return `<div class="rg-header"><div class="rg-title">${title}</div>
            <button class="rg-close" onclick="RadioGames.close()"><i class="fas fa-times"></i></button></div>`;
    }

    // ---------- ХАБ ----------
    function openHub(lang) {
        currentLang = (lang === 'ru') ? 'ru' : 'tg';
        const t = T[currentLang];
        ensureOverlay();
        sheet.innerHTML = `
            ${header(t.hubTitle)}
            <div class="rg-card" onclick="RadioGames.startQuiz()">
                <div class="rg-icon">🧠</div>
                <div><div class="rg-name">${t.quizTitle}</div><div class="rg-desc">${t.quizDesc}</div></div>
            </div>
            <div class="rg-card" onclick="RadioGames.startRhythm()">
                <div class="rg-icon">🎵</div>
                <div><div class="rg-name">${t.rhythmTitle}</div><div class="rg-desc">${t.rhythmDesc}</div></div>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    // ---------- КВИЗ ----------
    let quizIdx = 0, quizScore = 0, quizOrder = [];

    function shuffledIndices(n) {
        const arr = Array.from({ length: n }, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function startQuiz() {
        const t = T[currentLang];
        quizIdx = 0; quizScore = 0;
        quizOrder = shuffledIndices(QUIZ_QUESTIONS.length);
        renderQuizQuestion();
    }

    function renderQuizQuestion() {
        const t = T[currentLang];
        const qData = QUIZ_QUESTIONS[quizOrder[quizIdx]];
        const opts = qData.options[currentLang];
        sheet.innerHTML = `
            ${header(T[currentLang].quizTitle)}
            <div class="rg-progress">${t.question} ${quizIdx + 1} ${t.of} ${QUIZ_QUESTIONS.length} · ${t.score}: ${quizScore}</div>
            <div class="rg-question">${qData.q[currentLang]}</div>
            <div id="rgOptions">
                ${opts.map((o, i) => `<button class="rg-option" onclick="RadioGames.answerQuiz(${i})">${o}</button>`).join('')}
            </div>
        `;
    }

    function answerQuiz(choice) {
        const qData = QUIZ_QUESTIONS[quizOrder[quizIdx]];
        const t = T[currentLang];
        const buttons = sheet.querySelectorAll('.rg-option');
        buttons.forEach((b, i) => {
            b.disabled = true;
            if (i === qData.correct) b.classList.add('rg-correct');
            else if (i === choice) b.classList.add('rg-wrong');
        });
        if (choice === qData.correct) quizScore++;

        setTimeout(() => {
            quizIdx++;
            if (quizIdx < QUIZ_QUESTIONS.length) renderQuizQuestion();
            else finishQuiz();
        }, 700);
    }

    function finishQuiz() {
        const t = T[currentLang];
        const best = parseInt(localStorage.getItem('quizBestScore') || '0');
        if (quizScore > best) localStorage.setItem('quizBestScore', quizScore);
        sheet.innerHTML = `
            ${header(t.quizTitle)}
            <div class="rg-result">
                <div>${t.quizDone}</div>
                <div class="rg-big-score">${quizScore}/${QUIZ_QUESTIONS.length}</div>
                <div style="color:rgba(247,244,236,0.6);font-size:13px;">${t.best}: ${Math.max(best, quizScore)}/${QUIZ_QUESTIONS.length}</div>
            </div>
            <button class="rg-btn" onclick="RadioGames.startQuiz()">${t.playAgain}</button>
            <button class="rg-btn rg-btn-secondary" onclick="RadioGames.openHub('${currentLang}')">${t.back}</button>
        `;
    }

    // ---------- РИТМ-ИГРА ----------
    let rhythmActive = false;
    let rhythmScore = 0, rhythmCombo = 0;
    let rhythmStartTs = 0;
    let rhythmRAF = null;
    const RHYTHM_DURATION = 25000; // 25 сек
    const RHYTHM_CYCLE = 1200; // мс на один пульс

    function startRhythm() {
        const t = T[currentLang];
        rhythmScore = 0; rhythmCombo = 0;
        sheet.innerHTML = `
            ${header(t.rhythmTitle)}
            <div class="rg-rhythm-stats">
                <div><b id="rgRScore">0</b>${t.score}</div>
                <div><b id="rgRCombo">0</b>Combo</div>
                <div><b id="rgRTime">25</b>сек</div>
            </div>
            <div class="rg-rhythm-zone">
                <div class="rg-rhythm-target"></div>
                <div class="rg-rhythm-pulse" id="rgPulse"></div>
            </div>
            <div style="text-align:center;color:rgba(247,244,236,0.55);font-size:13px;margin-bottom:6px;">${t.tapZone} 🎯</div>
        `;
        rhythmActive = true;
        rhythmStartTs = performance.now();
        const pulse = document.getElementById('rgPulse');
        pulse.addEventListener('click', onRhythmTap);
        pulse.addEventListener('touchstart', (e) => { e.preventDefault(); onRhythmTap(); }, { passive: false });
        runRhythmLoop();
    }

    function runRhythmLoop() {
        if (!rhythmActive) return;
        const now = performance.now();
        const elapsed = now - rhythmStartTs;
        const remain = Math.max(0, RHYTHM_DURATION - elapsed);

        const cyclePos = (elapsed % RHYTHM_CYCLE) / RHYTHM_CYCLE; // 0..1
        const scale = 0.4 + 0.6 * Math.abs(Math.sin(cyclePos * Math.PI));
        const pulse = document.getElementById('rgPulse');
        if (pulse) pulse.style.transform = `scale(${(0.5 + scale).toFixed(3)})`;

        const timeEl = document.getElementById('rgRTime');
        if (timeEl) timeEl.textContent = Math.ceil(remain / 1000);

        if (remain <= 0) { finishRhythm(); return; }
        rhythmRAF = requestAnimationFrame(runRhythmLoop);
    }

    function stopRhythmLoop() {
        rhythmActive = false;
        if (rhythmRAF) cancelAnimationFrame(rhythmRAF);
        rhythmRAF = null;
    }

    function onRhythmTap() {
        if (!rhythmActive) return;
        const elapsed = performance.now() - rhythmStartTs;
        const cyclePos = (elapsed % RHYTHM_CYCLE) / RHYTHM_CYCLE;
        // ближе к пику (0.5) — лучше очки
        const distanceFromPeak = Math.abs(cyclePos - 0.5);
        let gained = 0;
        if (distanceFromPeak < 0.06) { gained = 100; rhythmCombo++; }
        else if (distanceFromPeak < 0.14) { gained = 50; rhythmCombo++; }
        else { gained = 10; rhythmCombo = 0; }
        rhythmScore += gained + rhythmCombo * 2;

        const scoreEl = document.getElementById('rgRScore');
        const comboEl = document.getElementById('rgRCombo');
        if (scoreEl) scoreEl.textContent = rhythmScore;
        if (comboEl) comboEl.textContent = rhythmCombo;

        const pulse = document.getElementById('rgPulse');
        if (pulse) {
            pulse.style.background = gained >= 100 ? '#34C759' : (gained >= 50 ? '#F0B429' : '#E8623D');
            setTimeout(() => { if (pulse) pulse.style.background = '#E8623D'; }, 150);
        }
    }

    function finishRhythm() {
        stopRhythmLoop();
        const t = T[currentLang];
        const best = parseInt(localStorage.getItem('rhythmBestScore') || '0');
        if (rhythmScore > best) localStorage.setItem('rhythmBestScore', rhythmScore);
        sheet.innerHTML = `
            ${header(t.rhythmTitle)}
            <div class="rg-result">
                <div>${t.rhythmDone}</div>
                <div class="rg-big-score">${rhythmScore}</div>
                <div style="color:rgba(247,244,236,0.6);font-size:13px;">${t.best}: ${Math.max(best, rhythmScore)}</div>
            </div>
            <button class="rg-btn" onclick="RadioGames.startRhythm()">${t.playAgain}</button>
            <button class="rg-btn rg-btn-secondary" onclick="RadioGames.openHub('${currentLang}')">${t.back}</button>
        `;
    }

    // ---------- ЭКСПОРТ ----------
    window.RadioGames = {
        openHub, close: closeAll,
        startQuiz, answerQuiz,
        startRhythm
    };
})();
