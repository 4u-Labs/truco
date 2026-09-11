<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
$version = time();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=5.0" name="viewport"/>
    <title>Truco Pro Max | 4U.IA.BR</title>
    <meta name="description" content="Jogo de Truco Paulista e Mineiro tradicional com manilhas fixas, inteligência artificial com blefes, carta coberta, mão de 11 e efeitos sonoros autênticos."/>
    
    <!-- PWA & Mobile -->
    <meta name="theme-color" content="#0d3d25"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    <link rel="manifest" href="manifest.json"/>
    <link rel="icon" type="image/png" sizes="64x64" href="favicon.png"/>
    <link rel="apple-touch-icon" href="apple-touch-icon.png"/>

    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@600;800;900&family=Poppins:wght@500;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>

    <!-- Anti-cache Stylesheet -->
    <link rel="stylesheet" href="style.css?v=<?= $version ?>"/>

    <!-- Service Worker auto-update to ensure fresh cache -->
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
                regs.forEach(function(r) { r.update(); });
            });
        }
    </script>
</head>
<body>

    <!-- ==================== TELA INICIAL (START SCREEN) ==================== -->
    <div class="start-screen" id="startScreen">
        <h1 class="start-title">
            <i class="fas fa-cards" style="color:var(--gold-accent);"></i> TRUCO PRO MAX
        </h1>
        <p class="start-subtitle">O TRADICIONAL JOGO DE TRUCO BRASILEIRO</p>

        <!-- Mode Selection Cards -->
        <div class="mode-cards-grid">
            <div class="mode-card selected" id="modePaulistaCard">
                <h3><i class="fas fa-city"></i> TRUCO PAULISTA</h3>
                <p>O estilo mais popular do Brasil! O Vira define a manilha a cada mão e os naipes desempatam.</p>
                <div class="mode-rule-box">
                    <strong>Sequência de Aposta:</strong> 1 &bull; 3 (Truco) &bull; 6 &bull; 9 &bull; 12<br>
                    <strong>Manilha:</strong> Carta imediatamente seguinte ao Vira.
                </div>
            </div>

            <div class="mode-card" id="modeMineiroCard">
                <h3><i class="fas fa-mountain"></i> TRUCO MINEIRO</h3>
                <p>O autêntico jogo das Alterosas! Manilhas fixas (Zap, Copas, Espadilha, Picafumo) e aposta que dobra.</p>
                <div class="mode-rule-box">
                    <strong>Sequência de Aposta:</strong> 1 &bull; 2 (Truco) &bull; 4 &bull; 8 &bull; 12<br>
                    <strong>Manilhas Velhas Fixas:</strong> 4♣ &gt; 7♥ &gt; A♠ &gt; 7♦
                </div>
            </div>
        </div>

        <!-- Difficulty Selection -->
        <div style="text-align:center; margin-bottom:12px;">
            <span style="font-size:0.8rem; font-family:'Orbitron', monospace; color:var(--gold-accent); text-transform:uppercase; letter-spacing:1px;">Nível da CPU:</span>
        </div>
        <div class="difficulty-picker">
            <button class="diff-btn" data-diff="iniciante">🟢 Iniciante</button>
            <button class="diff-btn active" data-diff="malandro">🟡 Malandro (Blefador)</button>
            <button class="diff-btn" data-diff="mestre">🔴 Mestre do Baralho</button>
        </div>

        <button class="btn-start-game" id="btnStartGame">
            <i class="fas fa-play"></i> SENTAR NA MESA!
        </button>

        <!-- Institutional Footer in Start Screen -->
        <footer class="legal-footer" style="padding-top:28px;">
            <p style="margin-bottom:8px;">
                <a href="privacidade.php" class="text-link" style="margin: 0 10px;">Privacidade</a> &bull;
                <a href="termos.php" class="text-link" style="margin: 0 10px;">Termos de Uso</a> &bull;
                <a href="suporte.php" class="text-link" style="margin: 0 10px;">Suporte & Regras</a> &bull;
                <a href="https://github.com/4u-Labs" target="_blank" rel="noopener noreferrer" class="text-link" style="margin: 0 10px;">
                    <i class="fab fa-github"></i> GitHub
                </a>
            </p>
            <p style="opacity:0.75; font-size:0.75rem;">&copy; <?= date('Y') ?> Truco Pro Max &bull; 4U.IA.BR Labs</p>
        </footer>
    </div>

    <!-- ==================== MESA DE JOGO (GAME VIEWPORT) ==================== -->
    <main class="game-viewport" id="gameViewport" style="display:none;">
        <!-- Scoreboard Bar -->
        <header class="score-bar">
            <div class="score-badge opponent">
                <span class="score-label" style="color:#ef4444;">🤖 CPU</span>
                <span class="score-val" id="opponentScoreVal">0</span>
            </div>

            <div class="score-center-info">
                <span class="game-mode-pill" id="gameModePill">PAULISTA</span>
                <div class="current-bet-display">
                    <span class="label">VALE</span>
                    <span class="value" id="currentRoundValue">1</span>
                </div>
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
                <div class="score-badge player">
                    <span class="score-val" id="playerScoreVal">0</span>
                    <span class="score-label" style="color:#22c55e;">VOCÊ 👤</span>
                </div>
                <button id="soundToggleBtn" class="score-badge" style="cursor:pointer; padding:8px 12px; color:var(--text-color);" title="Ligar/Desligar Som">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        </header>

        <!-- Table Area -->
        <div class="table-area">
            <!-- Round Indicators -->
            <div class="round-indicators">
                <span class="round-indicators-title">RODADAS</span>
                <div class="round-dots-row">
                    <div class="round-dot" id="roundDot1"></div>
                    <div class="round-dot" id="roundDot2"></div>
                    <div class="round-dot" id="roundDot3"></div>
                </div>
            </div>

            <!-- Vira Card Container -->
            <div class="vira-container">
                <span class="vira-title">VIRA</span>
                <div id="viraCardContainer"></div>
            </div>

            <!-- CPU Speech Bubble -->
            <div class="speech-bubble" id="cpuSpeechBubble" style="display:none;"></div>

            <!-- Announcement Banner -->
            <div class="announcement-banner" id="announcementBanner" style="display:none;"></div>

            <!-- Opponent Hand -->
            <div class="hands-container">
                <div class="opponent-cards-row" id="opponentHandContainer"></div>
            </div>

            <!-- Battlefield Center -->
            <div class="battlefield">
                <div class="played-slots">
                    <div class="played-slot">
                        <div id="cpuPlayedSlot">
                            <div class="slot-placeholder"><span style="font-size:0.75rem; color:var(--subtitle-color);">CPU</span></div>
                        </div>
                    </div>

                    <div class="vs-badge">VS</div>

                    <div class="played-slot">
                        <div id="playerPlayedSlot">
                            <div class="slot-placeholder"><span style="font-size:0.75rem; color:var(--subtitle-color);">VOCÊ</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="game-actions-bar">
                <button class="btn-truco-call" id="btnTrucoCall">
                    🔥 TRUCO!
                </button>
                <button class="btn-coberta" id="btnCartaCoberta" style="display:none;">
                    <i class="fas fa-eye-slash"></i> Carta Coberta
                </button>
            </div>

            <!-- Player Hand -->
            <div class="hands-container">
                <div class="player-cards-row" id="playerHandContainer"></div>
            </div>
        </div>
    </main>

    <!-- ==================== MODAL: TRUCO CALL & RESPONSE ==================== -->
    <div class="modal-overlay" id="trucoModal">
        <div class="modal-dialog">
            <h2 id="trucoModalCaller">CPU GRITOU:</h2>
            <div id="trucoModalValue" style="font-family:'Bebas Neue', sans-serif; font-size:4rem; color:#fff; text-shadow: 0 0 20px rgba(220,38,38,0.8); margin-bottom: 20px;">
                TRUCO!
            </div>
            <div class="modal-btn-row" id="trucoModalButtons">
                <button class="btn-run-call" id="btnTrucoRun">
                    <i class="fas fa-person-running"></i> CORRER
                </button>
                <button class="btn-accept-call" id="btnTrucoAccept">
                    <i class="fas fa-check"></i> ACEITO!
                </button>
                <button class="btn-raise-call" id="btnTrucoRaise">
                    <i class="fas fa-fire"></i> SEIS!
                </button>
            </div>
        </div>
    </div>

    <!-- ==================== MODAL: MÃO DE 11 ==================== -->
    <div class="modal-overlay" id="modalMaoDeOnze">
        <div class="modal-dialog">
            <h2>MÃO DE 11!</h2>
            <p>Você atingiu 11 tentos. Analise suas cartas e decida se joga a mão ou corre para entregar apenas 1 tento.</p>
            <div style="display:flex; justify-content:center; gap:10px; margin-bottom:24px;" id="mao11CardsPreview"></div>
            <div class="modal-btn-row">
                <button class="btn-run-call" id="btnMao11Run">
                    <i class="fas fa-person-running"></i> CORRER (+1 CPU)
                </button>
                <button class="btn-accept-call" id="btnMao11Accept">
                    <i class="fas fa-cards"></i> JOGAR A MÃO!
                </button>
            </div>
        </div>
    </div>

    <!-- ==================== MODAL: FIM DE PARTIDA ==================== -->
    <div class="modal-overlay" id="gameoverModal">
        <div class="modal-dialog">
            <div id="gameoverEmoji" style="font-size: 5rem; margin-bottom: 8px;">🏆</div>
            <h2 id="gameoverTitle">VITÓRIA!</h2>
            <p id="gameoverSubtitle">Você é o mestre da mesa de Truco!</p>
            <div id="finalScoreText" style="font-family:'Bebas Neue', sans-serif; font-size: 3rem; color:var(--gold-accent); margin-bottom: 24px;">
                12 x 8
            </div>
            <div class="modal-btn-row">
                <button class="btn-accept-call" id="btnRestartMatch" style="padding: 12px 28px;">
                    <i class="fas fa-rotate-left"></i> JOGAR NOVAMENTE
                </button>
                <button class="btn-run-call" id="btnReturnMenu" style="background:#374151;">
                    <i class="fas fa-bars"></i> MENU PRINCIPAL
                </button>
            </div>
        </div>
    </div>

    <!-- Anti-cache Script -->
    <script src="app.js?v=<?= $version ?>"></script>
</body>
</html>
