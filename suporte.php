<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
$v = time();
$msg_status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['nome']) && !empty($_POST['email'])) {
    $nome = htmlspecialchars(trim($_POST['nome']));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $assunto = htmlspecialchars(trim($_POST['assunto'] ?? 'Suporte Truco Pro Max'));
    $mensagem = htmlspecialchars(trim($_POST['mensagem']));
    
    $log_data = [
        'timestamp' => date('c'),
        'app' => 'truco',
        'nome' => $nome,
        'email' => $email,
        'assunto' => $assunto,
        'mensagem' => $mensagem,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'desconhecido'
    ];
    
    $log_dir = __DIR__ . '/uploads';
    if (!is_dir($log_dir)) {
        @mkdir($log_dir, 0755, true);
    }
    @file_put_contents($log_dir . '/messages_log.json', json_encode($log_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND);
    
    $to = 'contato@4u.ia.br';
    $headers = "From: contato@4u.ia.br\r\nReply-To: {$email}\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $body = "Novo contato via Suporte Truco Pro Max:\n\nNome: {$nome}\nE-mail: {$email}\nAssunto: {$assunto}\nMensagem:\n{$mensagem}\n";
    @mail($to, "Truco Pro - " . $assunto, $body, $headers);
    
    $msg_status = 'Mensagem enviada com sucesso! Responderemos o mais breve possível.';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Suporte & Regras do Truco — Truco Pro Max</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Poppins:wght@500;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css?v=<?= $v ?>">
    <link rel="icon" type="image/png" sizes="64x64" href="favicon.png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
</head>
<body class="legal-body">
    <div class="legal-container">
        <header class="legal-header">
            <a href="index.php" class="btn btn-secondary"><i class="fa-solid fa-arrow-left"></i> Voltar ao Jogo</a>
            <div class="brand-mini">
                <i class="fa-solid fa-dice-d20 brand-icon"></i>
                <span>Truco Pro Max</span>
            </div>
        </header>

        <main class="legal-card">
            <h1><i class="fa-solid fa-headset"></i> Central de Suporte & Regras</h1>
            <p class="legal-subtitle">Tire dúvidas sobre as regras dos estilos Paulista e Mineiro ou fale com a nossa equipe</p>

            <?php if (!empty($msg_status)): ?>
                <div class="alert-success-box">
                    <i class="fa-solid fa-circle-check" style="font-size:1.2rem;"></i> <?= $msg_status ?>
                </div>
            <?php endif; ?>

            <section class="legal-section">
                <h2><i class="fa-solid fa-book-open"></i> Guia Rápido de Regras</h2>
                
                <div class="faq-item">
                    <h3><i class="fa-solid fa-city"></i> Qual a diferença entre Truco Paulista e Mineiro?</h3>
                    <p>No <strong>Truco Paulista</strong>, a manilha muda a cada rodada conforme a carta virada ("Vira"), sendo a manilha a carta imediatamente seguinte (ex: se o vira for 7, a manilha é Q). A pontuação avança de 3 em 3 (1 ➔ 3 ➔ 6 ➔ 9 ➔ 12).<br><br>
                    No <strong>Truco Mineiro</strong>, as manilhas são <strong>fixas</strong> (4♣ Zap, 7♥, A♠ Espadilha, 7♦ Picafumo) e o valor dobra a cada aumento (1 ➔ 2 ➔ 4 ➔ 8 ➔ 12).</p>
                </div>

                <div class="faq-item">
                    <h3><i class="fa-solid fa-eye-slash"></i> O que é a Carta Coberta (Encoberta)?</h3>
                    <p>A partir da 2ª rodada da mão, qualquer jogador pode optar por jogar uma de suas cartas de costas (virada para baixo). Essa carta não tem poder de corte para vencer a rodada, mas esconde sua força para a rodada decisiva seguinte.</p>
                </div>

                <div class="faq-item">
                    <h3><i class="fa-solid fa-hand-fist"></i> Como funciona a Mão de 11 e Mão de Ferro?</h3>
                    <p>Na <strong>Mão de 11</strong>, quem atinge 11 pontos tem o direito de analisar suas cartas e decidir se aceita jogar (valendo 3 ou 4 tentos) ou corre (entregando 1 ponto ao adversário).<br><br>
                    Na <strong>Mão de Ferro (11x11)</strong>, a rodada final é jogada totalmente no escuro, sem que ninguém veja as cartas antes de jogá-las.</p>
                </div>
            </section>

            <section class="legal-section" style="margin-bottom:0;">
                <h2><i class="fa-solid fa-paper-plane"></i> Envie uma Mensagem ou Sugestão</h2>
                <form method="POST" action="suporte.php" class="support-form">
                    <div class="form-row-2">
                        <div class="form-field">
                            <label for="nome"><i class="fa-solid fa-user"></i> Seu Nome:</label>
                            <input type="text" id="nome" name="nome" required placeholder="Ex: Rodrigo Silva" class="support-input">
                        </div>
                        <div class="form-field">
                            <label for="email"><i class="fa-solid fa-envelope"></i> Seu E-mail:</label>
                            <input type="email" id="email" name="email" required placeholder="seuemail@exemplo.com" class="support-input">
                        </div>
                    </div>
                    <div class="form-field">
                        <label for="assunto"><i class="fa-solid fa-tag"></i> Assunto:</label>
                        <input type="text" id="assunto" name="assunto" required placeholder="Dúvida sobre regras ou sugestão" class="support-input">
                    </div>
                    <div class="form-field">
                        <label for="mensagem"><i class="fa-solid fa-message"></i> Mensagem:</label>
                        <textarea id="mensagem" name="mensagem" rows="4" required placeholder="Conte para a gente como podemos melhorar o jogo..." class="support-input"></textarea>
                    </div>
                    <button type="submit" class="btn-glow">
                        <i class="fa-solid fa-paper-plane"></i> Enviar Mensagem
                    </button>
                </form>
            </section>
        </main>

        <footer class="legal-footer">
            <p>&copy; <?= date('Y') ?> Truco Pro Max &bull; <a href="https://4u.ia.br" target="_blank" class="text-link">4U.IA.BR</a> &bull; Código Aberto no <a href="https://github.com/4u-Labs" target="_blank" class="text-link">GitHub</a></p>
        </footer>
    </div>
</body>
</html>
