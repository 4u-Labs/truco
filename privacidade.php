<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
$v = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>Política de Privacidade & LGPD — Truco Pro Max</title>
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
            <h1><i class="fa-solid fa-shield-halved"></i> Política de Privacidade & LGPD</h1>
            <p class="legal-subtitle">Privacidade total, retenção zero e conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>

            <section class="legal-section">
                <h2><i class="fa-solid fa-microchip"></i> 1. Princípio de Retenção Zero</h2>
                <p>O <strong>Truco Pro Max</strong> opera sob o princípio de <strong>Retenção Zero</strong>. Todo o processamento do jogo — embaralhamento, distribuição de cartas, lógica de IA e pontuações — acontece <strong>exclusivamente na memória RAM do seu navegador</strong>.</p>
                <p>Nenhuma informação da sua partida ou escolhas de jogo é transmitida para servidores de terceiros ou armazenada em bancos de dados em nuvem.</p>
            </section>

            <section class="legal-section">
                <h2><i class="fa-solid fa-dice"></i> 2. Aleatoriedade Justa (Fair RNG)</h2>
                <p>Para garantir mãos e viras totalmente imprevisíveis e sem vícios estatísticos, o jogo utiliza a interface nativa <code>crypto.getRandomValues</code> da <em>Web Cryptography API</em>. Isso impede qualquer favorecimento artificial para o jogador ou para a CPU.</p>
            </section>

            <section class="legal-section">
                <h2><i class="fa-solid fa-database"></i> 3. Dados em LocalStorage</h2>
                <p>O navegador apenas grava em seu próprio dispositivo configurações como:</p>
                <ul>
                    <li>Preferência de efeitos sonoros (ligado/desligado);</li>
                    <li>Modo de jogo preferido (Paulista ou Mineiro);</li>
                    <li>Estatísticas de vitórias e derrotas da sessão local.</li>
                </ul>
                <p>Você pode zerar essas informações a qualquer momento limpando os dados de navegação.</p>
            </section>

            <section class="legal-section">
                <h2><i class="fa-solid fa-envelope"></i> 4. Contato do Encarregado de Dados (DPO)</h2>
                <p>
                    <strong>E-mail:</strong> <a href="mailto:contato@4u.ia.br" class="text-link">contato@4u.ia.br</a><br>
                    <strong>Portal Oficial:</strong> <a href="https://4u.ia.br" target="_blank" class="text-link">4u.ia.br</a>
                </p>
            </section>
        </main>

        <footer class="legal-footer">
            <p>&copy; <?= date('Y') ?> Truco Pro Max &bull; <a href="https://4u.ia.br" target="_blank" class="text-link">4U.IA.BR</a> &bull; Código Aberto no <a href="https://github.com/4u-Labs" target="_blank" class="text-link">GitHub</a></p>
        </footer>
    </div>
</body>
</html>
