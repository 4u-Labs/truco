/**
 * Truco Pro Max 6.0 - Engine
 * 4U.IA.BR Labs - https://github.com/4u-Labs
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- HELPER SELECTORS ---
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    // --- GAME CONSTANTS ---
    const SUITS = ['♣', '♥', '♠', '♦'];
    const SUIT_NAMES = { '♣': 'paus', '♥': 'copas', '♠': 'espadas', '♦': 'ouros' };
    const BASE_VALUES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    const MANILHA_SUIT_ORDER = ['♣', '♥', '♠', '♦']; // Paus > Copas > Espadas > Ouros

    // Fixed Manilhas for Truco Mineiro: 4♣ > 7♥ > A♠ > 7♦
    const MINEIRO_FIXED_MANILHAS = [
        { value: '4', suit: '♣', strength: 204 }, // Zap
        { value: '7', suit: '♥', strength: 203 }, // Copas
        { value: 'A', suit: '♠', strength: 202 }, // Espadilha
        { value: '7', suit: '♦', strength: 201 }  // Picafumo
    ];

    const GAME_MODES = {
        paulista: {
            name: 'Paulista',
            values: [1, 3, 6, 9, 12],
            names: ['', 'TRUCO!', 'SEIS!', 'NOVE!', 'DOZE!'],
            fixedManilhas: false
        },
        mineiro: {
            name: 'Mineiro',
            values: [1, 2, 4, 8, 12],
            names: ['', 'TRUCO!', 'QUATRO!', 'OITO!', 'DOZE!'],
            fixedManilhas: true
        }
    };

    const CPU_TAUNTS = [
        "Aqui não, pato!",
        "Caiu na rede é peixe!",
        "Bota mais que tá barato!",
        "Chora cavaco!",
        "Pede que eu quero ver!",
        "Essa mesa tem dono!",
        "Foi jogar milho pra galinha?",
        "Tô lendo a sua mão de longe!",
        "Bate o pé e chora!"
    ];

    // --- STATE ---
    let selectedMode = 'paulista';
    let difficulty = 'malandro'; // iniciante, malandro, mestre
    let soundEnabled = true;

    let gameState = {
        playerScore: 0,
        opponentScore: 0,
        playerHand: [],
        opponentHand: [],
        vira: null,
        manilhaValue: null,
        currentRound: 0, // 0, 1, 2
        roundWins: [null, null, null], // 'player', 'opponent', 'draw'
        playerPlayed: null,
        opponentPlayed: null,
        isPlayerTurn: true,
        handStarter: 'player',
        trucoLevel: 0,
        canTruco: true,
        lastTrucoCaller: null,
        waitingForTrucoResponse: false,
        isResolvingRound: false,
        playFacedown: false,
        isMaoDeFerro: false,
        cpuBluffed: false,
        playerBluffed: false,
        gameOver: false
    };

    // --- WEB AUDIO API ENGINE ---
    let audioCtx = null;
    function playAudio(type) {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (type === 'slap') {
                // Percussive table thump
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'deal') {
                // Soft card slide
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'truco') {
                // Dramatic ascending power chords
                const chords = [220, 330, 440, 660];
                chords.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'sawtooth';
                    o.frequency.setValueAtTime(freq, now + idx * 0.06);
                    g.gain.setValueAtTime(0.2, now + idx * 0.06);
                    g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
                    o.start(now + idx * 0.06);
                    o.stop(now + idx * 0.06 + 0.25);
                });
            } else if (type === 'knock') {
                // Table knock
                osc.type = 'square';
                osc.frequency.setValueAtTime(120, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            } else if (type === 'win') {
                // Victory Fanfare
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const o = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o.connect(g);
                    g.connect(audioCtx.destination);
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(freq, now + idx * 0.12);
                    g.gain.setValueAtTime(0.25, now + idx * 0.12);
                    g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
                    o.start(now + idx * 0.12);
                    o.stop(now + idx * 0.12 + 0.4);
                });
            }
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    // --- WEB SPEECH API & HAPTIC VIBRATION ---
    function triggerHaptic(pattern = [50, 40, 80]) {
        if (!soundEnabled || !('vibrate' in navigator)) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {}
    }

    function speakTrucoPhrase(text, pitch = 1.0, rate = 1.1) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/[!🔥⚔️🏃👤🤖]/g, '').trim();
            if (!cleanText) return;
            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'pt-BR';
            utter.rate = rate;
            utter.pitch = pitch;

            const voices = window.speechSynthesis.getVoices();
            const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt'));
            if (ptVoice) utter.voice = ptVoice;

            window.speechSynthesis.speak(utter);
        } catch (e) {
            console.warn('Speech error:', e);
        }
    }

    // Preload speech synthesis voices
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }

    // --- CONFETTI CANNON (CANVAS) ---
    function launchVictoryConfetti() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#ffd700', '#ef4444', '#38ef7d', '#3b82f6', '#f59e0b', '#ec4899'];
        for (let i = 0; i < 90; i++) {
            pieces.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                w: Math.random() * 8 + 6,
                h: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.7) * 18,
                rot: Math.random() * 360,
                vrot: (Math.random() - 0.5) * 12,
                life: 1
            });
        }

        let animId;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.4;
                p.rot += p.vrot;
                p.life -= 0.012;
                if (p.life > 0) {
                    alive = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rot * Math.PI) / 180);
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, p.life);
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            });

            if (alive) {
                animId = requestAnimationFrame(render);
            } else {
                canvas.remove();
            }
        };
        render();
    }

    // --- STATS & ACHIEVEMENTS SYSTEM ---
    const STATS_STORAGE_KEY = 'truco_pro_max_stats_v1';
    const ACHIEVEMENTS_DEF = [
        { id: 'rei_do_zap', icon: '👑', title: 'Rei do Zap', desc: 'Bateu a última rodada da mão cravando o Zap na mesa.' },
        { id: 'blefador_nato', icon: '🎭', title: 'Malandro Nato', desc: 'Gritou Truco sem nenhuma manilha e fez a CPU correr.' },
        { id: 'doze_na_mesa', icon: '⚡', title: 'Doze na Mesa', desc: 'Venceu uma mão disputadíssima valendo 12 tentos!' },
        { id: 'mao_de_ferro', icon: '🛡️', title: 'Mão de Ferro', desc: 'Venceu a rodada jogada às cegas no 11x11.' },
        { id: 'buchuda', icon: '🦃', title: 'Buchuda de Ré', desc: 'Ganhou a partida completa da CPU por 12 a 0.' }
    ];

    let gameStats = {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        tentosScored: 0,
        trucosAccepted: 0,
        bluffsCaught: 0,
        achievements: {
            rei_do_zap: false,
            blefador_nato: false,
            doze_na_mesa: false,
            mao_de_ferro: false,
            buchuda: false
        }
    };

    function loadStats() {
        try {
            const raw = localStorage.getItem(STATS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                gameStats = { ...gameStats, ...parsed };
                if (parsed.achievements) {
                    gameStats.achievements = { ...gameStats.achievements, ...parsed.achievements };
                }
            }
        } catch (e) {}
    }

    function saveStats() {
        try {
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(gameStats));
        } catch (e) {}
    }

    function unlockAchievement(id, title) {
        if (!gameStats.achievements[id]) {
            gameStats.achievements[id] = true;
            saveStats();
            showBanner(`🏆 CONQUISTA: ${title}!`, 3200);
            playAudio('win');
            triggerHaptic([100, 50, 100, 50, 200]);
        }
    }

    function openRulesModal() {
        const box = $('#rulesActiveManilhasBox');
        if (box) {
            if (selectedMode === 'mineiro') {
                box.innerHTML = `
                    <div style="font-weight:700; color:var(--gold-accent); font-size:0.8rem; margin-bottom:6px; text-transform:uppercase;">
                        👑 Manilhas Fixas do Mineiro (Maior &gt; Menor):
                    </div>
                    <div style="display:flex; justify-content:space-around; text-align:center; margin-top:8px;">
                        <div><strong style="color:#38ef7d; font-size:1.1rem;">4♣</strong><div style="font-size:0.7rem; color:#ffd700;">ZAP</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#ef4444; font-size:1.1rem;">7♥</strong><div style="font-size:0.7rem; color:#ffd700;">COPETA</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#60a5fa; font-size:1.1rem;">A♠</strong><div style="font-size:0.7rem; color:#ffd700;">ESPADILHA</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#fbbf24; font-size:1.1rem;">7♦</strong><div style="font-size:0.7rem; color:#ffd700;">PICAFUMO</div></div>
                    </div>
                `;
            } else {
                const viraText = gameState.vira ? `${gameState.vira.value}${gameState.vira.suit}` : 'Ainda não virado';
                const manilhaVal = gameState.manilhaValue || '?';
                box.innerHTML = `
                    <div style="font-weight:700; color:var(--gold-accent); font-size:0.8rem; margin-bottom:6px; text-transform:uppercase;">
                        👑 Manilhas da Rodada (Vira: <span style="color:#fff;">${viraText}</span> &rarr; Manilha: <span style="color:#ffd700; font-size:1rem;">${manilhaVal}</span>):
                    </div>
                    <div style="display:flex; justify-content:space-around; text-align:center; margin-top:8px;">
                        <div><strong style="color:#38ef7d; font-size:1.1rem;">${manilhaVal}♣</strong><div style="font-size:0.7rem; color:#ffd700;">ZAP</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#ef4444; font-size:1.1rem;">${manilhaVal}♥</strong><div style="font-size:0.7rem; color:#ffd700;">COPAS</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#60a5fa; font-size:1.1rem;">${manilhaVal}♠</strong><div style="font-size:0.7rem; color:#ffd700;">ESPADILHA</div></div>
                        <div style="color:#9ca3af; align-self:center;">&gt;</div>
                        <div><strong style="color:#fbbf24; font-size:1.1rem;">${manilhaVal}♦</strong><div style="font-size:0.7rem; color:#ffd700;">PICAFUMO</div></div>
                    </div>
                `;
            }
        }
        $('#rulesModal').classList.add('active');
        playAudio('deal');
    }

    function openStatsModal() {
        $('#statMatchesPlayed').textContent = gameStats.matchesPlayed;
        const total = gameStats.matchesPlayed;
        const rate = total > 0 ? Math.round((gameStats.matchesWon / total) * 100) : 0;
        $('#statWinRate').textContent = `${rate}%`;
        $('#statTentosScored').textContent = gameStats.tentosScored;
        $('#statBluffsCaught').textContent = gameStats.bluffsCaught;

        const container = $('#achievementsContainer');
        if (container) {
            container.innerHTML = '';
            ACHIEVEMENTS_DEF.forEach(ach => {
                const unlocked = !!gameStats.achievements[ach.id];
                const div = document.createElement('div');
                div.className = `achievement-item ${unlocked ? 'unlocked' : ''}`;
                div.innerHTML = `
                    <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                    <div class="achievement-info">
                        <h4>${ach.title} ${unlocked ? '✓' : ''}</h4>
                        <p>${ach.desc}</p>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        $('#statsModal').classList.add('active');
        playAudio('deal');
    }

    // --- SCREEN SHAKE & EFFECTS ---
    function triggerScreenShake() {
        const vp = $('#gameViewport');
        if (!vp) return;
        vp.classList.remove('shake-screen');
        void vp.offsetWidth; // trigger reflow
        vp.classList.add('shake-screen');
        setTimeout(() => vp.classList.remove('shake-screen'), 450);
    }

    function showCpuTaunt(text) {
        const bubble = $('#cpuSpeechBubble');
        if (!bubble) return;
        bubble.textContent = text || CPU_TAUNTS[Math.floor(Math.random() * CPU_TAUNTS.length)];
        bubble.style.display = 'block';
        setTimeout(() => { bubble.style.display = 'none'; }, 2600);
    }

    function showBanner(text, duration = 1600) {
        const banner = $('#announcementBanner');
        if (!banner) return;
        banner.textContent = text;
        banner.style.display = 'block';
        setTimeout(() => { banner.style.display = 'none'; }, duration);
    }

    // --- DECK & RULES ENGINE ---
    function createDeck() {
        const deck = [];
        for (let suit of SUITS) {
            for (let value of BASE_VALUES) {
                deck.push({ value, suit });
            }
        }
        return deck;
    }

    function shuffleDeck(deck) {
        const d = [...deck];
        for (let i = d.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [d[i], d[j]] = [d[j], d[i]];
        }
        return d;
    }

    function calculateManilhaValue(viraVal) {
        const idx = BASE_VALUES.indexOf(viraVal);
        return BASE_VALUES[(idx + 1) % BASE_VALUES.length];
    }

    function isManilhaCard(card) {
        if (!card) return false;
        if (selectedMode === 'mineiro') {
            return MINEIRO_FIXED_MANILHAS.some(m => m.value === card.value && m.suit === card.suit);
        }
        return card.value === gameState.manilhaValue;
    }

    function getCardStrength(card) {
        if (!card) return -10;
        if (card.isFacedown) return -1; // Covered card loses to everything

        if (selectedMode === 'mineiro') {
            const m = MINEIRO_FIXED_MANILHAS.find(item => item.value === card.value && item.suit === card.suit);
            if (m) return m.strength;
            return BASE_VALUES.indexOf(card.value);
        } else {
            // Paulista
            if (card.value === gameState.manilhaValue) {
                return 100 + (3 - MANILHA_SUIT_ORDER.indexOf(card.suit)); // Paus (Zap)=103, Copas=102, Espadas=101, Ouros=100
            }
            return BASE_VALUES.indexOf(card.value);
        }
    }

    function compareCards(c1, c2) {
        const s1 = getCardStrength(c1);
        const s2 = getCardStrength(c2);
        if (s1 > s2) return 1;
        if (s1 < s2) return -1;
        return 0;
    }

    function getManilhaNickname(card) {
        if (!isManilhaCard(card)) return null;
        if (card.suit === '♣') return 'ZAP';
        if (card.suit === '♥') return selectedMode === 'mineiro' ? 'COPETA' : 'COPAS';
        if (card.suit === '♠') return 'ESPADILHA';
        if (card.suit === '♦') return 'PICAFUMO';
        return null;
    }

    // --- RENDERING FUNCTIONS ---
    function renderCard(card, isOpponent = false) {
        const div = document.createElement('div');
        div.className = 'card';

        const isBlind = gameState.isMaoDeFerro && !card.played;

        if (isOpponent || card.isFacedown || isBlind) {
            div.classList.add('card-back');
            if (isOpponent) div.classList.add('opponent-card');
            return div;
        }

        const isRed = card.suit === '♥' || card.suit === '♦';
        div.classList.add(isRed ? 'card-red' : 'card-black');

        const isManilha = isManilhaCard(card);
        const nickname = isManilha ? getManilhaNickname(card) : null;

        if (isManilha) {
            div.classList.add('manilha');
        }

        const badgeHtml = nickname ? `<span class="manilha-badge">${nickname}</span>` : '';

        div.innerHTML = `
            ${badgeHtml}
            <span class="card-value">${card.value}</span>
            <span class="card-suit-corner">${card.suit}</span>
            <span class="card-suit">${card.suit}</span>
            <span class="card-value-bottom">${card.value}</span>
            <span class="card-suit-bottom">${card.suit}</span>
        `;
        return div;
    }

    function renderPlayerHand() {
        const container = $('#playerHandContainer');
        if (!container) return;
        container.innerHTML = '';

        const canPlay = gameState.isPlayerTurn &&
            !gameState.waitingForTrucoResponse &&
            !gameState.isResolvingRound &&
            !gameState.gameOver &&
            gameState.playerPlayed === null;

        container.classList.toggle('my-turn', canPlay);

        gameState.playerHand.forEach((card, index) => {
            const cardEl = renderCard(card, false);
            if (!canPlay) {
                cardEl.classList.add('card-disabled');
            } else {
                cardEl.addEventListener('click', () => playPlayerCard(index));
            }
            container.appendChild(cardEl);
        });

        // Update Carta Coberta button visibility
        const btnCoberta = $('#btnCartaCoberta');
        if (btnCoberta) {
            // Can only play facedown on 2nd and 3rd round of a hand
            if (gameState.currentRound > 0 && canPlay) {
                btnCoberta.style.display = 'inline-flex';
                btnCoberta.classList.toggle('active', gameState.playFacedown);
            } else {
                btnCoberta.style.display = 'none';
                gameState.playFacedown = false;
            }
        }

        // Update Correr da Mão button visibility
        const btnDesistir = $('#btnDesistirMao');
        if (btnDesistir) {
            if (canPlay && !gameState.gameOver && gameState.playerScore < 11 && gameState.opponentScore < 11) {
                btnDesistir.style.display = 'inline-flex';
            } else {
                btnDesistir.style.display = 'none';
            }
        }
    }

    function renderOpponentHand() {
        const container = $('#opponentHandContainer');
        if (!container) return;
        container.innerHTML = '';

        gameState.opponentHand.forEach((card) => {
            const cardEl = renderCard(card, true);
            container.appendChild(cardEl);
        });
    }

    function renderVira() {
        const container = $('#viraCardContainer');
        const viraTitle = $('.vira-title');
        if (!container) return;
        container.innerHTML = '';

        if (selectedMode === 'mineiro') {
            if (viraTitle) viraTitle.textContent = 'MANILHAS';
            container.innerHTML = `
                <div class="card vira" style="font-size:0.68rem; padding: 4px; text-align:center; background:#0d1c14; border: 2px solid var(--gold-accent); color:var(--gold-accent); line-height: 1.3; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <span style="font-size:0.62rem; letter-spacing:0.5px; color:var(--gold-accent); font-weight:700; margin-bottom:2px;">FIXAS</span>
                    <span style="color:#38ef7d; font-weight:700;">4♣</span>
                    <span style="font-size:0.55rem; opacity:0.6;">▼</span>
                    <span style="color:#ef4444; font-weight:700;">7♥</span>
                    <span style="font-size:0.55rem; opacity:0.6;">▼</span>
                    <span style="color:#60a5fa; font-weight:700;">A♠</span>
                    <span style="font-size:0.55rem; opacity:0.6;">▼</span>
                    <span style="color:#fbbf24; font-weight:700;">7♦</span>
                </div>
            `;
            return;
        }

        if (viraTitle) viraTitle.textContent = 'VIRA';
        if (gameState.vira) {
            const cardEl = renderCard(gameState.vira, false);
            cardEl.classList.add('vira');
            container.appendChild(cardEl);
        }
    }

    function renderPlayedCards() {
        const playerSlot = $('#playerPlayedSlot');
        const cpuSlot = $('#cpuPlayedSlot');
        if (!playerSlot || !cpuSlot) return;

        playerSlot.innerHTML = '';
        cpuSlot.innerHTML = '';

        if (gameState.playerPlayed) {
            const pCard = renderCard(gameState.playerPlayed);
            pCard.classList.add('played');
            if (!gameState.playerPlayed.rotAngle) {
                gameState.playerPlayed.rotAngle = ((Math.random() * 8) - 4).toFixed(1);
            }
            pCard.style.transform = `rotate(${gameState.playerPlayed.rotAngle}deg)`;
            playerSlot.appendChild(pCard);
        } else {
            playerSlot.innerHTML = '<div class="slot-placeholder"><span style="font-size:0.75rem; color:var(--subtitle-color);">VOCÊ</span></div>';
        }

        if (gameState.opponentPlayed) {
            const oCard = renderCard(gameState.opponentPlayed);
            oCard.classList.add('played');
            if (!gameState.opponentPlayed.rotAngle) {
                gameState.opponentPlayed.rotAngle = ((Math.random() * 8) - 4).toFixed(1);
            }
            oCard.style.transform = `rotate(${gameState.opponentPlayed.rotAngle}deg)`;
            cpuSlot.appendChild(oCard);
        } else {
            cpuSlot.innerHTML = '<div class="slot-placeholder"><span style="font-size:0.75rem; color:var(--subtitle-color);">CPU</span></div>';
        }
    }

    function updateScoreboard() {
        $('#playerScoreVal').textContent = gameState.playerScore;
        $('#opponentScoreVal').textContent = gameState.opponentScore;

        const currentVal = GAME_MODES[selectedMode].values[gameState.trucoLevel];
        $('#currentRoundValue').textContent = currentVal;

        // Round dots
        gameState.roundWins.forEach((res, idx) => {
            const dot = $(`#roundDot${idx + 1}`);
            if (!dot) return;
            dot.className = 'round-dot';
            if (res === 'player') dot.classList.add('won-player');
            else if (res === 'opponent') dot.classList.add('won-opponent');
            else if (res === 'draw') dot.classList.add('draw');
        });

        // Truco button
        const btnTruco = $('#btnTrucoCall');
        if (btnTruco) {
            const isMax = gameState.trucoLevel >= GAME_MODES[selectedMode].values.length - 1;
            const isMao11 = gameState.playerScore === 11 || gameState.opponentScore === 11;
            const trickOver = gameState.playerPlayed !== null && gameState.opponentPlayed !== null;
            if (isMax || !gameState.canTruco || isMao11 || gameState.isResolvingRound || gameState.waitingForTrucoResponse || trickOver) {
                btnTruco.style.display = 'none';
            } else {
                btnTruco.style.display = 'inline-flex';
                const nextName = GAME_MODES[selectedMode].names[gameState.trucoLevel + 1];
                btnTruco.innerHTML = `🔥 ${nextName}`;
            }
        }
    }

    // --- GAME FLOW ---
    function startNewMatch() {
        gameState.playerScore = 0;
        gameState.opponentScore = 0;
        gameState.handStarter = 'player';
        gameState.gameOver = false;
        $('#gameoverModal').classList.remove('active');
        startNewHand();
    }

    function startNewHand() {
        if (gameState.gameOver) return;

        const is11x11 = gameState.playerScore === 11 && gameState.opponentScore === 11;
        gameState.isMaoDeFerro = is11x11;

        const deck = shuffleDeck(createDeck());
        playAudio('deal');

        gameState.playerHand = [deck.pop(), deck.pop(), deck.pop()];
        gameState.opponentHand = [deck.pop(), deck.pop(), deck.pop()];
        gameState.vira = deck.pop();

        if (selectedMode === 'paulista') {
            gameState.manilhaValue = calculateManilhaValue(gameState.vira.value);
        } else {
            gameState.manilhaValue = null;
        }

        gameState.currentRound = 0;
        gameState.roundWins = [null, null, null];
        gameState.playerPlayed = null;
        gameState.opponentPlayed = null;
        gameState.trucoLevel = 0;
        gameState.canTruco = !(gameState.playerScore === 11 || gameState.opponentScore === 11);
        gameState.lastTrucoCaller = null;
        gameState.waitingForTrucoResponse = false;
        gameState.isResolvingRound = false;
        gameState.playFacedown = false;

        // Alternate hand starter
        gameState.isPlayerTurn = gameState.handStarter === 'player';
        gameState.handStarter = gameState.handStarter === 'player' ? 'opponent' : 'player';

        renderVira();
        renderPlayerHand();
        renderOpponentHand();
        renderPlayedCards();
        updateScoreboard();

        // Mão de 11 logic
        if (gameState.playerScore === 11 && gameState.opponentScore !== 11) {
            handleMaoDeOnze('player');
            return;
        } else if (gameState.opponentScore === 11 && gameState.playerScore !== 11) {
            handleMaoDeOnze('opponent');
            return;
        } else if (is11x11) {
            showBanner('MÃO DE FERRO! NO ESCURO!', 2000);
            gameState.trucoLevel = 1;
        } else {
            if (selectedMode === 'paulista') {
                showBanner(`MANILHA: ${gameState.manilhaValue}`, 1500);
            }
        }

        // If CPU starts
        if (!gameState.isPlayerTurn) {
            setTimeout(executeCpuTurn, 1400);
        }
    }

    // --- MÃO DE 11 INTERACTIVE MODAL ---
    function handleMaoDeOnze(who) {
        if (who === 'player') {
            // Open modal to show cards and decide: play or run
            const modal = $('#modalMaoDeOnze');
            const cardsPreview = $('#mao11CardsPreview');
            cardsPreview.innerHTML = '';
            gameState.playerHand.forEach(c => cardsPreview.appendChild(renderCard(c)));
            modal.classList.add('active');
        } else {
            // CPU decides
            const manilhas = gameState.opponentHand.filter(c => isManilhaCard(c)).length;
            const highCards = gameState.opponentHand.filter(c => getCardStrength(c) >= 7).length;

            if (manilhas >= 1 || highCards >= 2 || Math.random() < 0.6) {
                showBanner('CPU ACEITOU JOGAR A MÃO DE 11!', 1800);
                if (!gameState.isPlayerTurn) setTimeout(executeCpuTurn, 1400);
                else renderPlayerHand();
            } else {
                showBanner('CPU CORREU DA MÃO DE 11!', 1800);
                showCpuTaunt('Tava horrível, fica com esse tento aí!');
                endHand('player', 1);
            }
        }
    }

    function respondMaoDeOnze(decision) {
        $('#modalMaoDeOnze').classList.remove('active');
        if (decision === 'accept') {
            showBanner('VOCÊ ACEITOU A MÃO DE 11!', 1500);
            if (!gameState.isPlayerTurn) setTimeout(executeCpuTurn, 1400);
            else renderPlayerHand();
        } else {
            playAudio('knock');
            showBanner('VOCÊ CORREU DA MÃO DE 11 (+1 CPU)', 1500);
            endHand('opponent', 1);
        }
    }

    // --- PLAYER ACTION ---
    function playPlayerCard(idx) {
        if (gameState.gameOver || gameState.waitingForTrucoResponse || gameState.isResolvingRound) return;
        if (!gameState.isPlayerTurn || gameState.playerPlayed !== null) return;
        if (!gameState.playerHand || !gameState.playerHand[idx]) return;

        gameState.isPlayerTurn = false; // Prevent rapid double-clicks immediately

        const card = gameState.playerHand.splice(idx, 1)[0];
        if (gameState.playFacedown && gameState.currentRound > 0) {
            card.isFacedown = true;
        }
        gameState.playerPlayed = card;
        gameState.playFacedown = false;

        playAudio('slap');
        if (isManilhaCard(card) && !card.isFacedown) {
            triggerScreenShake();
        }

        renderPlayerHand();
        renderPlayedCards();
        updateScoreboard();

        if (!gameState.opponentPlayed) {
            // Player played 1st -> schedule CPU turn
            setTimeout(executeCpuTurn, 1000);
        } else {
            // Player played 2nd -> both cards on table!
            gameState.isResolvingRound = true;
            renderPlayerHand();
            updateScoreboard();
            setTimeout(resolveCurrentRound, 900);
        }
    }

    // --- CPU LOGIC & DIFFICULTY ---
    function executeCpuTurn() {
        if (gameState.gameOver || gameState.waitingForTrucoResponse || gameState.isResolvingRound) return;
        if (gameState.opponentPlayed !== null) return;

        const hand = gameState.opponentHand;
        if (hand.length === 0) return;

        // Check if CPU wants to call Truco (only if trick is not already finished and CPU hasn't called yet)
        if (gameState.canTruco && gameState.lastTrucoCaller !== 'opponent' && gameState.playerScore < 11 && gameState.opponentScore < 11 && !gameState.opponentPlayed) {
            const hasManilha = hand.some(c => isManilhaCard(c));
            const manilhaCount = hand.filter(c => isManilhaCard(c)).length;
            const strongCards = hand.filter(c => getCardStrength(c) >= 8).length;

            let bluffChance = difficulty === 'iniciante' ? 0.08 : (difficulty === 'malandro' ? 0.28 : 0.20);
            let valueChance = (hasManilha && strongCards >= 1) || manilhaCount >= 2;

            if (valueChance || Math.random() < bluffChance) {
                triggerTrucoCall('opponent');
                return;
            }
        }

        // Choose card to play
        let chosenIdx = 0;
        if (gameState.playerPlayed) {
            // CPU plays 2nd: try to beat player's card with smallest winning card
            const playerStrength = getCardStrength(gameState.playerPlayed);
            const winningCards = hand.filter(c => getCardStrength(c) > playerStrength);

            if (winningCards.length > 0) {
                winningCards.sort((a, b) => getCardStrength(a) - getCardStrength(b));
                chosenIdx = hand.indexOf(winningCards[0]);
            } else {
                // Cannot win: play lowest card (or face down if in 2nd/3rd round)
                hand.sort((a, b) => getCardStrength(a) - getCardStrength(b));
                chosenIdx = hand.indexOf(hand[0]);
                if (gameState.currentRound > 0 && Math.random() < 0.4) {
                    hand[chosenIdx].isFacedown = true;
                }
            }
        } else {
            // CPU plays 1st
            const round1WonByCpu = gameState.roundWins[0] === 'opponent';
            const round1WonByPlayer = gameState.roundWins[0] === 'player';

            if (round1WonByPlayer) {
                // Must win this round! Play highest card
                hand.sort((a, b) => getCardStrength(b) - getCardStrength(a));
                chosenIdx = hand.indexOf(hand[0]);
            } else if (round1WonByCpu) {
                // Won 1st round: play medium card or try to finish
                hand.sort((a, b) => getCardStrength(a) - getCardStrength(b));
                chosenIdx = hand.indexOf(hand[Math.floor(hand.length / 2)] || hand[0]);
            } else {
                // 1st round: play medium
                hand.sort((a, b) => getCardStrength(a) - getCardStrength(b));
                chosenIdx = hand.indexOf(hand[Math.floor(hand.length / 2)] || hand[0]);
            }
        }

        const playedCard = hand.splice(chosenIdx, 1)[0];
        gameState.opponentPlayed = playedCard;

        playAudio('slap');
        if (isManilhaCard(playedCard) && !playedCard.isFacedown) {
            triggerScreenShake();
            showCpuTaunt('Toma essa pedrada na testa!');
        }

        renderOpponentHand();
        renderPlayedCards();

        if (!gameState.playerPlayed) {
            // CPU played 1st -> now it is player's turn to respond
            gameState.isPlayerTurn = true;
            gameState.isResolvingRound = false;
            renderPlayerHand();
            updateScoreboard();
        } else {
            // CPU played 2nd -> both cards played, resolve round!
            gameState.isPlayerTurn = false;
            gameState.isResolvingRound = true;
            renderPlayerHand();
            updateScoreboard();
            setTimeout(resolveCurrentRound, 900);
        }
    }

    // --- RESOLVE ROUND ---
    function resolveCurrentRound() {
        const pCard = gameState.playerPlayed;
        const oCard = gameState.opponentPlayed;
        if (!pCard || !oCard) {
            gameState.isResolvingRound = false;
            return;
        }

        gameState.isResolvingRound = true;
        const cmp = compareCards(pCard, oCard);

        let roundWinner;
        if (cmp > 0) {
            roundWinner = 'player';
            showBanner('VOCÊ FEZ A QUEDA! 🏆', 1400);
        } else if (cmp < 0) {
            roundWinner = 'opponent';
            showBanner('CPU FEZ A QUEDA! 💥', 1400);
            if (Math.random() < 0.6) showCpuTaunt();
        } else {
            roundWinner = 'draw';
            showBanner('EMPATOU / CANDEIOU! 🤝', 1400);
        }

        gameState.roundWins[gameState.currentRound] = roundWinner;

        // Check if player won 3rd round with Zap
        if (roundWinner === 'player' && gameState.currentRound === 2) {
            const pCard = gameState.playerPlayed;
            if (pCard && pCard.suit === '♣' && (selectedMode === 'mineiro' ? pCard.value === '4' : pCard.value === gameState.manilhaValue)) {
                unlockAchievement('rei_do_zap', 'Rei do Zap');
            }
        }

        updateScoreboard();

        setTimeout(() => {
            const handWinner = evaluateHandWinner();
            if (handWinner) {
                gameState.isResolvingRound = false;
                endHand(handWinner);
            } else {
                // Next round of this hand
                gameState.currentRound++;
                gameState.playerPlayed = null;
                gameState.opponentPlayed = null;
                gameState.isResolvingRound = false;
                renderPlayedCards();

                // Safety guard: if player or CPU has 0 cards left prematurely, end hand safely
                if (gameState.playerHand.length === 0 || gameState.opponentHand.length === 0) {
                    const fallbackWinner = evaluateHandWinner() || (gameState.playerHand.length > gameState.opponentHand.length ? 'player' : 'opponent');
                    endHand(fallbackWinner);
                    return;
                }

                if (roundWinner === 'player') {
                    gameState.isPlayerTurn = true;
                } else if (roundWinner === 'opponent') {
                    gameState.isPlayerTurn = false;
                    setTimeout(executeCpuTurn, 1000);
                } else {
                    // Draw: who started the previous round leads
                    if (!gameState.isPlayerTurn) {
                        setTimeout(executeCpuTurn, 1000);
                    }
                }
                renderPlayerHand();
                updateScoreboard();
            }
        }, 1400);
    }

    function evaluateHandWinner() {
        const pWins = gameState.roundWins.filter(r => r === 'player').length;
        const oWins = gameState.roundWins.filter(r => r === 'opponent').length;

        // Best 2 of 3
        if (pWins >= 2) return 'player';
        if (oWins >= 2) return 'opponent';

        // 3 rounds finished
        if (gameState.currentRound >= 2) {
            if (gameState.roundWins[0] === 'draw') {
                if (pWins > oWins) return 'player';
                if (oWins > pWins) return 'opponent';
                return gameState.handStarter === 'player' ? 'opponent' : 'player';
            }
            if (pWins === 1 && oWins === 1) {
                return gameState.roundWins[0]; // Winner of round 1 takes the hand
            }
        }

        // Draw on round 1 and someone won round 2
        if (gameState.roundWins[0] === 'draw' && gameState.currentRound === 1) {
            if (gameState.roundWins[1] === 'player') return 'player';
            if (gameState.roundWins[1] === 'opponent') return 'opponent';
        }

        // Someone won round 1 and drew round 2
        if (gameState.currentRound === 1 && gameState.roundWins[1] === 'draw') {
            if (gameState.roundWins[0] === 'player') return 'player';
            if (gameState.roundWins[0] === 'opponent') return 'opponent';
        }

        return null;
    }

    function endHand(winner, overridePoints = null) {
        const points = overridePoints !== null
            ? overridePoints
            : GAME_MODES[selectedMode].values[gameState.trucoLevel];

        if (winner === 'player') {
            gameState.playerScore += points;
            gameStats.tentosScored += points;
            saveStats();
            showBanner(`VOCÊ GANHOU +${points} TENTOS! 🎉`, 2000);
            playAudio('win');

            if (points >= 12) {
                unlockAchievement('doze_na_mesa', 'Doze na Mesa');
            }
            if (gameState.isMaoDeFerro) {
                unlockAchievement('mao_de_ferro', 'Mão de Ferro no Escuro');
            }
        } else {
            gameState.opponentScore += points;
            showBanner(`CPU GANHOU +${points} TENTOS! 😢`, 2000);
            showCpuTaunt('Entra na fila do pão, freguês!');
        }

        // Revelação de Blefes
        if (gameState.lastTrucoCaller === 'opponent' && gameState.cpuBluffed) {
            if (winner === 'opponent') {
                setTimeout(() => {
                    showBanner('🤡 A CPU TE BLEFOU! Gritou truco sem ter jogo!', 2800);
                }, 1200);
            } else if (winner === 'player') {
                gameStats.bluffsCaught++;
                saveStats();
                setTimeout(() => {
                    showBanner('🎯 VOCÊ PEGOU O BLEFE DA CPU!', 2800);
                }, 1200);
            }
        } else if (gameState.lastTrucoCaller === 'player' && gameState.playerBluffed && winner === 'player') {
            unlockAchievement('blefador_nato', 'Malandro Nato');
            setTimeout(() => {
                showBanner('🎭 BLEFE DE MESTRE! Fez a CPU correr sem manilha!', 2800);
            }, 1200);
        }

        updateScoreboard();

        // Check match end (12 points)
        if (gameState.playerScore >= 12) {
            setTimeout(() => endMatch('player'), 2200);
        } else if (gameState.opponentScore >= 12) {
            setTimeout(() => endMatch('opponent'), 2200);
        } else {
            setTimeout(startNewHand, 2400);
        }
    }

    function endMatch(winner) {
        gameState.gameOver = true;
        gameStats.matchesPlayed++;
        const modal = $('#gameoverModal');
        if (winner === 'player') {
            gameStats.matchesWon++;
            $('#gameoverEmoji').textContent = '🏆';
            $('#gameoverTitle').textContent = 'GRANDE CAMPEÃO!';
            $('#gameoverSubtitle').textContent = 'Você limpou a banca e deu um show no Truco!';
            playAudio('win');
            launchVictoryConfetti();
            triggerHaptic([100, 50, 100, 50, 200]);
            speakTrucoPhrase('Parabéns, você é o grande campeão!', 1.1, 1.1);

            if (gameState.opponentScore === 0) {
                unlockAchievement('buchuda', 'Buchuda de Ré (12 a 0)');
            }
        } else {
            gameStats.matchesLost++;
            $('#gameoverEmoji').textContent = '😢';
            $('#gameoverTitle').textContent = 'DERROTA NA MESA!';
            $('#gameoverSubtitle').textContent = 'A CPU foi mais esperta dessa vez... Vai amarelar?';
        }
        saveStats();
        $('#finalScoreText').textContent = `${gameState.playerScore} x ${gameState.opponentScore}`;
        modal.classList.add('active');
    }

    // --- TRUCO CALL & ESCALATION ---
    function triggerTrucoCall(caller) {
        if (gameState.gameOver || gameState.waitingForTrucoResponse || gameState.isResolvingRound) return;
        if (gameState.playerPlayed !== null && gameState.opponentPlayed !== null) return;

        const nextLevel = gameState.trucoLevel + 1;
        const maxLevel = GAME_MODES[selectedMode].values.length - 1;
        if (nextLevel > maxLevel) return;

        gameState.waitingForTrucoResponse = true;
        gameState.lastTrucoCaller = caller;

        playAudio('truco');
        triggerScreenShake();

        const callName = GAME_MODES[selectedMode].names[nextLevel];
        const modal = $('#trucoModal');
        $('#trucoModalCaller').textContent = caller === 'player' ? 'VOCÊ GRITOU:' : 'CPU GRITOU:';
        $('#trucoModalValue').textContent = callName;

        // Bluff tracking & Voice call
        if (caller === 'opponent') {
            const hand = gameState.opponentHand;
            const hasManilha = hand.some(c => isManilhaCard(c));
            const hasHigh = hand.some(c => getCardStrength(c) >= 7);
            gameState.cpuBluffed = (!hasManilha && !hasHigh);
            speakTrucoPhrase(callName, 0.9, 1.05);
            triggerHaptic([120, 60, 200]);
        } else if (caller === 'player') {
            const hand = gameState.playerHand;
            const hasManilha = hand.some(c => isManilhaCard(c));
            const hasHigh = hand.some(c => getCardStrength(c) >= 7);
            gameState.playerBluffed = (!hasManilha && !hasHigh);
            speakTrucoPhrase(callName, 1.15, 1.15);
            triggerHaptic([100, 50, 150]);
        }

        // Next escalation button (e.g. SEIS!, NOVE!, DOZE!)
        const btnRaise = $('#btnTrucoRaise');
        if (nextLevel < maxLevel) {
            btnRaise.style.display = 'inline-flex';
            btnRaise.textContent = GAME_MODES[selectedMode].names[nextLevel + 1];
        } else {
            btnRaise.style.display = 'none';
        }

        if (caller === 'player') {
            // CPU decision
            modal.classList.add('active');
            $('#trucoModalButtons').style.display = 'none';

            setTimeout(() => {
                modal.classList.remove('active');
                $('#trucoModalButtons').style.display = 'flex';

                const hand = gameState.opponentHand;
                const manilhas = hand.filter(c => isManilhaCard(c)).length;
                const highs = hand.filter(c => getCardStrength(c) >= 7).length;

                // Decision formula based on difficulty
                let acceptThreshold = difficulty === 'iniciante' ? 0.45 : (difficulty === 'malandro' ? 0.35 : 0.25);
                let willAccept = (manilhas >= 1 || highs >= 2 || Math.random() > acceptThreshold);

                if (willAccept) {
                    gameState.trucoLevel = nextLevel;
                    gameState.canTruco = gameState.trucoLevel < maxLevel;
                    showBanner(`CPU ACEITOU O ${callName}! ⚔️`, 1800);
                    showCpuTaunt('Caiu no meu laço, agora aguenta!');
                    speakTrucoPhrase('Aceito! Cai pra dentro!', 0.9, 1.1);
                    updateScoreboard();
                    gameState.waitingForTrucoResponse = false;

                    // Chance of CPU raising back
                    if (manilhas >= 2 && nextLevel < maxLevel && Math.random() < 0.5) {
                        setTimeout(() => triggerTrucoCall('opponent'), 1200);
                    } else {
                        if (!gameState.isPlayerTurn && gameState.opponentPlayed === null) {
                            setTimeout(executeCpuTurn, 1000);
                        } else if (gameState.isPlayerTurn) {
                            renderPlayerHand();
                        }
                    }
                } else {
                    playAudio('knock');
                    showBanner(`CPU CORREU DO ${callName}! 🏃`, 1800);
                    showCpuTaunt('Essa mão tava com cheiro de mofo...');
                    speakTrucoPhrase('Não quero, corre!', 0.9, 1.15);
                    gameState.waitingForTrucoResponse = false;
                    endHand('player');
                }
            }, 1600);
        } else {
            // Player decision
            showCpuTaunt();
            modal.classList.add('active');
            $('#trucoModalButtons').style.display = 'flex';
        }
    }

    function respondToTruco(action) {
        $('#trucoModal').classList.remove('active');

        if (action === 'run') {
            playAudio('knock');
            showBanner('VOCÊ CORREU! 🏃', 1500);
            speakTrucoPhrase('Correu!', 1.0, 1.1);
            gameState.waitingForTrucoResponse = false;
            endHand('opponent');
        } else if (action === 'accept') {
            gameState.trucoLevel++;
            const maxLevel = GAME_MODES[selectedMode].values.length - 1;
            gameState.canTruco = gameState.trucoLevel < maxLevel;
            gameStats.trucosAccepted++;
            saveStats();
            showBanner(`VOCÊ ACEITOU! VALE ${GAME_MODES[selectedMode].values[gameState.trucoLevel]} TENTOS!`, 1500);
            speakTrucoPhrase('Aceito!', 1.1, 1.15);
            updateScoreboard();
            gameState.waitingForTrucoResponse = false;

            if (!gameState.isPlayerTurn && gameState.opponentPlayed === null) {
                setTimeout(executeCpuTurn, 1000);
            } else if (gameState.isPlayerTurn) {
                renderPlayerHand();
            }
        } else if (action === 'raise') {
            gameState.trucoLevel++;
            gameState.waitingForTrucoResponse = false;
            triggerTrucoCall('player');
        }
    }

    // --- EVENT LISTENERS ---
    function bindEvents() {
        // Mode Selection Cards
        $('#modePaulistaCard').addEventListener('click', () => {
            selectedMode = 'paulista';
            $('#modePaulistaCard').classList.add('selected');
            $('#modeMineiroCard').classList.remove('selected');
            playAudio('deal');
        });

        $('#modeMineiroCard').addEventListener('click', () => {
            selectedMode = 'mineiro';
            $('#modeMineiroCard').classList.add('selected');
            $('#modePaulistaCard').classList.remove('selected');
            playAudio('deal');
        });

        // Difficulty Buttons
        $$('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                difficulty = btn.dataset.diff;
                playAudio('slap');
            });
        });

        // Start Match Button
        $('#btnStartGame').addEventListener('click', () => {
            $('#startScreen').style.display = 'none';
            $('#gameViewport').style.display = 'flex';
            $('#gameModePill').textContent = GAME_MODES[selectedMode].name.toUpperCase();
            startNewMatch();
        });

        // Restart / Menu
        $('#btnRestartMatch').addEventListener('click', () => {
            $('#gameoverModal').classList.remove('active');
            startNewMatch();
        });

        $('#btnReturnMenu').addEventListener('click', () => {
            $('#gameoverModal').classList.remove('active');
            $('#gameViewport').style.display = 'none';
            $('#startScreen').style.display = 'flex';
        });

        // Truco Call
        $('#btnTrucoCall').addEventListener('click', () => {
            if (gameState.gameOver || gameState.waitingForTrucoResponse || gameState.isResolvingRound) return;
            if (gameState.playerPlayed !== null && gameState.opponentPlayed !== null) return;
            if (gameState.canTruco && gameState.lastTrucoCaller !== 'player') {
                triggerTrucoCall('player');
            }
        });

        // Carta Coberta toggle
        $('#btnCartaCoberta').addEventListener('click', () => {
            if (gameState.currentRound > 0 && gameState.isPlayerTurn && !gameState.isResolvingRound && !gameState.waitingForTrucoResponse) {
                gameState.playFacedown = !gameState.playFacedown;
                $('#btnCartaCoberta').classList.toggle('active', gameState.playFacedown);
                playAudio('deal');
            }
        });

        // Modal Truco buttons
        $('#btnTrucoRun').addEventListener('click', () => respondToTruco('run'));
        $('#btnTrucoAccept').addEventListener('click', () => respondToTruco('accept'));
        $('#btnTrucoRaise').addEventListener('click', () => respondToTruco('raise'));

        // Modal Mão de 11 buttons
        $('#btnMao11Accept').addEventListener('click', () => respondMaoDeOnze('accept'));
        $('#btnMao11Run').addEventListener('click', () => respondMaoDeOnze('run'));

        // Rules Modal handlers
        const btnRules = $('#rulesCheatsheetBtn');
        if (btnRules) btnRules.addEventListener('click', openRulesModal);
        const btnCloseRules = $('#btnCloseRules');
        if (btnCloseRules) btnCloseRules.addEventListener('click', () => $('#rulesModal').classList.remove('active'));
        const btnGotItRules = $('#btnGotItRules');
        if (btnGotItRules) btnGotItRules.addEventListener('click', () => $('#rulesModal').classList.remove('active'));

        // Stats Modal handlers
        const btnStats = $('#statsBtn');
        if (btnStats) btnStats.addEventListener('click', openStatsModal);
        const btnStartStats = $('#startScreenStatsBtn');
        if (btnStartStats) btnStartStats.addEventListener('click', openStatsModal);
        const btnCloseStats = $('#btnCloseStats');
        if (btnCloseStats) btnCloseStats.addEventListener('click', () => $('#statsModal').classList.remove('active'));
        const btnCloseStatsBtn = $('#btnCloseStatsBtn');
        if (btnCloseStatsBtn) btnCloseStatsBtn.addEventListener('click', () => $('#statsModal').classList.remove('active'));

        // Correr da Mão (Desistir da mão)
        const btnDesistir = $('#btnDesistirMao');
        if (btnDesistir) {
            btnDesistir.addEventListener('click', () => {
                if (gameState.gameOver || gameState.waitingForTrucoResponse || gameState.isResolvingRound) return;
                if (confirm('Deseja desistir desta mão e entregar os tentos atuais para a CPU?')) {
                    playAudio('knock');
                    showBanner('VOCÊ DESISTIU DA MÃO! 🏳️', 1800);
                    speakTrucoPhrase('Desistiu da mão!', 1.0, 1.1);
                    endHand('opponent');
                }
            });
        }

        // Sound Toggle
        $('#soundToggleBtn').addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            $('#soundToggleBtn i').className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            const k = e.key.toLowerCase();
            if (k === 't') $('#btnTrucoCall').click();
            if (k === 'c') $('#btnCartaCoberta').click();
            if (k === '1' && gameState.playerHand[0]) playPlayerCard(0);
            if (k === '2' && gameState.playerHand[1]) playPlayerCard(1);
            if (k === '3' && gameState.playerHand[2]) playPlayerCard(2);
        });
    }

    // --- SERVICE WORKER REGISTRATION (Network-First & Cache Invalidation) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js?v=2.1.0', { updateViaCache: 'none' })
                .then(r => console.log('Truco SW Registered:', r.scope))
                .catch(err => console.warn('Truco SW Error:', err));
        });
    }

    // --- INIT ---
    loadStats();
    bindEvents();
});
