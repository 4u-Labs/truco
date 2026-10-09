# 🃏 Truco Pro Max 6.5

Jogo clássico e autêntico de **Truco Paulista e Mineiro** desenvolvido com HTML5, CSS3, Web Audio API, Web Speech API e Inteligência Artificial pela **4U.IA.BR Labs**.

🔗 **Acesse e jogue online:** [https://4u.ia.br/app/truco/](https://4u.ia.br/app/truco/)

---

## 🌟 Funcionalidades Principais

- 👑 **Badges Oficiais das Manilhas**: Identificação instantânea na carta com selos dourados (**ZAP**, **COPAS/COPETA**, **ESPADILHA**, **PICAFUMO**).
- 🗣️ **Voz Falada Realista (Web Speech API pt-BR)**: A CPU e o jogador gritam **"TRUUUCO!"**, **"SEEEEIS!"**, **"ACEITO!"** e **"CORRE!"** com entonação dramática brasileira em tempo real.
- 📳 **Feedback Háptico (Vibração Tátil)**: Sensação física na mão ao bater a carta na mesa ou sofrer um grito de truco no smartphone.
- 🤡 **Detector e Revelação de Blefes**: Revela após a mão se a CPU ou o jogador estava blefando no truco ou se correu de bobeira.
- ❓ **Cola das Manilhas & Hierarquia**: Modal dinâmico na mesa exibindo a manilha da rodada, os 4 naipes e a ordem das cartas comuns.
- 🏆 **Estatísticas e Conquistas (LocalStorage)**: Rastreamento de vitórias, tentos e conquistas como *Rei do Zap*, *Malandro Nato*, *Doze na Mesa* e *Buchuda de Ré*.
- 🏳️ **Correr da Mão (Desistir Rápido)**: Permite entregar a mão em andamento quando estiver sem jogo para acelerar a partida.
- 🎊 **Confetes & Cartas Orgânicas**: Explosão de confetes em Canvas na vitória e cartas caindo na mesa com ângulos naturais.
- 🏙️ **Truco Paulista**: Vira dinâmico com manilhas calculadas pela carta seguinte (`4, 5, 6, 7, Q, J, K, A, 2, 3`) e força de naipes (♣ Zap > ♥ Copas > ♠ Espadilha > ♦ Picafumo). Aposta: 1 &bull; 3 &bull; 6 &bull; 9 &bull; 12.
- ⛰️ **Truco Mineiro Tradicional**: Manilhas fixas clássicas (**4♣ Zap > 7♥ Copeta > A♠ Espadilha > 7♦ Picafumo**) e progressão de aposta que dobra a cada aumento: 1 &bull; 2 &bull; 4 &bull; 8 &bull; 12.
- 🙈 **Carta Coberta (Encoberta)**: Tática clássica permitida na 2ª e 3ª rodada da mão para jogar carta virada para baixo e ocultar o jogo do adversário.
- 🖐️ **Mão de 11 Interativa**: Modal para analisar a força das cartas antes de iniciar a mão e decidir entre aceitar o desafio ou correr concedendo apenas 1 ponto.
- ⛓️ **Mão de Ferro (11x11)**: Decisão jogada totalmente às cegas no escuro.
- 🔊 **Efeitos Sonoros com Web Audio API**: Estalo de bater a carta com força na mesa ("slap"), baralho embaralhando e fanfarra de vitória.
- 📳 **Screen Shake (Tremor de Tela)**: A mesa treme com impacto visual na jogada do Zap ou no grito de Truco!
- 🧠 **IA com 3 Níveis & Provocações**: Iniciante, Malandro (blefador astuto) e Mestre do Baralho, acompanhados de balões de fala clássicos de botequim.
- 📱 **PWA & Mobile Ready**: Pode ser instalado como aplicativo nativo no celular (Android e iOS), funciona offline com Service Worker Network-First.

---

## 🛠️ Stack Tecnológica

- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Semântico, CSS3 Moderno (3D transforms, Glassmorphism, animations).
- **Áudio**: Web Audio API pura (sem dependência de arquivos MP3 externos pesados).
- **Offline**: Web App Manifest & Service Worker Network-First.
- **Privacidade**: 100% Client-side (Retenção Zero / LGPD).

---

## 📄 Páginas Institucionais

- [Política de Privacidade](privacidade.php)
- [Termos de Uso](termos.php)
- [Suporte & Regras do Truco](suporte.php)

---

## 👤 Licença & Créditos

Desenvolvido por **[4U.IA.BR Labs](https://github.com/4u-Labs)**.  
Distribuído sob a licença MIT.
