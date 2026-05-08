const fluxoHistoria = document.getElementById('fluxo-historia');
let medoRevelado = false;
let shakeCount = 0;

// --- SISTEMA DE FADE NO SCROLL ---
// Cria um observador que vê quando os quadros entram na tela
const observerScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visivel');
        }
    });
}, { threshold: 0.1 }); // Dispara quando 10% do quadro aparece
// Gerenciamento de Áudio
const somAmbiente = document.getElementById('audio-ambiente');
const somMedo1 = document.getElementById('audio-medo-1');
const somMedo2 = document.getElementById('audio-medo-2');
const somJumpscare = document.getElementById('audio-jumpscare');

// Função para iniciar o som ambiente (chamada na primeira interação)
function iniciarMusicaAmbiente() {
    if (somAmbiente.paused) {
        somAmbiente.play().catch(e => console.log("Aguardando interação para áudio"));
    }
}

// Função para aplicar a animação em elementos novos ou já existentes
function prepararAnimacoesScroll() {
    // Pega todos os quadros e containers interativos que NÃO sejam do jumpscare ou botão
    const elementos = document.querySelectorAll('.comic-grid > .quadro:not(.jumpscare-imagem), .quadro-interativo');
    
    elementos.forEach(el => {
        if (!el.classList.contains('animar-scroll')) {
            el.classList.add('animar-scroll');
            observerScroll.observe(el);
        }
    });
}

// Inicializa no carregamento da página
prepararAnimacoesScroll();


// --- LÓGICA DE TRILHAS ---
function escolherTrilha(idTrilha) {
    iniciarMusicaAmbiente(); // Tenta dar o play no início caso ainda não tenha tocado

    // 1. Desabilita APENAS os botões da seção atual onde o clique aconteceu
    // Isso resolve o problema da trilha do Uber (os novos botões estarão em outra seção)
    const botaoClicado = event.currentTarget;
    const containerAtual = botaoClicado.closest('.comic-grid');
    if (containerAtual) {
        const botoesNessaSecao = containerAtual.querySelectorAll('.opt-btn');
        botoesNessaSecao.forEach(btn => btn.classList.add('desativado'));
    }

    // 2. Lógica específica da Trilha do Medo
    if (idTrilha === 'trilha-medo') {
        somAmbiente.pause();    // Para o som ambiente
        somAmbiente.currentTime = 0;
        somMedo1.play();        // Toca o primeiro áudio de tensão
    }

    // 3. Exibe a trilha
    const trilha = document.getElementById(idTrilha);
    trilha.classList.remove('hidden');
    fluxoHistoria.appendChild(trilha);
    prepararAnimacoesScroll();

    if (idTrilha === 'trilha-carona') {
        iniciarObserverCarona();
    }
}

// Observador para a Trilha Carona
function iniciarObserverCarona() {
    const ultimoQuadro = document.getElementById('ultimo-quadro-carona');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            setTimeout(() => {
                document.getElementById('fim-carona').classList.remove('hidden');
                prepararAnimacoesScroll(); // Garante que o final anime se precisar
            }, 3000);
            observer.disconnect();
        }
    });
    observer.observe(ultimoQuadro);
}

// --- INTERAÇÃO DO BRAÇO (TRILHA MEDO) ---
const quadroBraco = document.getElementById('quadro-braco');
const braco = document.getElementById('braco-personagem');
let lastMouseX = null;
let currentDirection = null;

quadroBraco.addEventListener('mousemove', (e) => {
    if (medoRevelado) return;
    if (lastMouseX === null) lastMouseX = e.clientX;
    
    let dir = e.clientX > lastMouseX ? 'direita' : 'esquerda';
    
    if (currentDirection && dir !== currentDirection) {
        animarBraco(dir);
    }
    currentDirection = dir;
    lastMouseX = e.clientX;
});

quadroBraco.addEventListener('click', () => {
    if (medoRevelado) return;
    let dir = currentDirection === 'direita' ? 'esquerda' : 'direita';
    currentDirection = dir;
    animarBraco(dir);
});

function animarBraco(direcao) {
    shakeCount++;
    let angulo = direcao === 'direita' ? 25 : -25;
    braco.style.transform = `rotate(${angulo}deg)`;

    // Sucesso na interação da lanterna
    if (shakeCount >= 6 && !medoRevelado) {
        somMedo1.pause(); // Para o áudio de tensão inicial
        somMedo2.play();  // Toca o áudio de sucesso/transição
        dispararEventoMedo();
    }
}

// --- LÓGICA DO JUMPSCARE ---
function dispararEventoMedo() {
    medoRevelado = true;
    braco.style.transform = `rotate(0deg)`;
    
    const medoParte2 = document.getElementById('medo-parte2');
    medoParte2.classList.remove('hidden');
    prepararAnimacoesScroll();

    // Timing do susto
    setTimeout(() => {
        const imagemJumpscare = document.getElementById('quadro-susto-jumpscare');
        
        imagemJumpscare.style.opacity = '1'; 
        somMedo2.pause();      // Interrompe o áudio 2 para dar lugar ao susto
        somJumpscare.play();   // O susto grita!

        setTimeout(() => {
            document.getElementById('fim-medo').classList.remove('hidden');
            prepararAnimacoesScroll();
        }, 2500);

    }, 4000);
}

// --- RESET GLOBAL (CORRIGIDO) ---
function resetarTudo() {
    const reserva = document.getElementById('reserva-trilhas');
    
    // 1. Esconde as trilhas e devolve para a reserva
    ['trilha-uber', 'trilha-carona', 'trilha-medo'].forEach(id => {
        const trilha = document.getElementById(id);
        if (trilha) {
            trilha.classList.add('hidden');
            reserva.appendChild(trilha);
        }
    });

    // 2. CORREÇÃO: Reativa todos os botões de opção da comic
    document.querySelectorAll('.opt-btn').forEach(btn => {
        btn.classList.remove('desativado');
    });

    // 3. Reseta estados internos da Trilha do Medo
    medoRevelado = false;
    shakeCount = 0;
    document.getElementById('medo-parte2').classList.add('hidden');
    document.getElementById('fim-medo').classList.add('hidden');
    document.getElementById('quadro-susto-jumpscare').style.opacity = '0';

    // 4. Reseta a Trilha da Carona
    document.getElementById('fim-carona').classList.add('hidden');

    // 5. Controle de Áudio: Para tudo e volta pro ambiente
    [somMedo1, somMedo2, somJumpscare].forEach(s => {
        s.pause();
        s.currentTime = 0;
    });
    iniciarMusicaAmbiente();

    // 6. Limpa as animações de scroll para que elas aconteçam de novo
    document.querySelectorAll('.animar-scroll').forEach(el => el.classList.remove('visivel'));

    // 7. Rola para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
