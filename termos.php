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
    <title>Termos de Uso — Truco Pro Max</title>
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
            <h1><i class="fa-solid fa-scale-balanced"></i> Termos de Uso</h1>
            <p class="legal-subtitle">Diretrizes de utilização recreativa da plataforma</p>

            <section class="legal-section">
                <h2><i class="fa-solid fa-gamepad"></i> 1. Finalidade Exclusivamente Recreativa</h2>
                <p>O <strong>Truco Pro Max</strong> é um software de entretenimento recreativo e educacional para simulação dos jogos tradicionais de Truco Paulista e Truco Mineiro contra inteligência artificial. Não envolve apostas com dinheiro real, comercialização de créditos ou qualquer modalidade de jogo de azar.</p>
            </section>

            <section class="legal-section">
                <h2><i class="fa-solid fa-shield"></i> 2. Disponibilidade Gratuita</h2>
                <p>O jogo é fornecido de maneira totalmente gratuita sob o modelo "como está" (*as-is*), sem mensalidades, sem microtransações para desbloquear cartas e sem anúncios intrusivos.</p>
            </section>

            <section class="legal-section">
                <h2><i class="fa-solid fa-copyright"></i> 3. Propriedade Intelectual</h2>
                <p>O código-fonte e os elementos audiovisuais são desenvolvidos pelo laboratório <strong>4U.IA.BR Labs</strong> e distribuídos em conformidade com licenças de código aberto no GitHub oficial.</p>
            </section>
        </main>

        <footer class="legal-footer">
            <p>&copy; <?= date('Y') ?> Truco Pro Max &bull; <a href="https://4u.ia.br" target="_blank" class="text-link">4U.IA.BR</a> &bull; Código Aberto no <a href="https://github.com/4u-Labs" target="_blank" class="text-link">GitHub</a></p>
        </footer>
    </div>
</body>
</html>
