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
    const trilha = document.getElementById(idTrilha);
    trilha.classList.remove('hidden');
    fluxoHistoria.appendChild(trilha);

    // Reaplica o observador de scroll para a nova trilha que acabou de aparecer
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

    if (shakeCount >= 6 && !medoRevelado) {
        dispararEventoMedo();
    }
}

// --- LÓGICA DO JUMPSCARE ---
function dispararEventoMedo() {
    medoRevelado = true;
    braco.style.transform = `rotate(0deg)`;
    
    const medoParte2 = document.getElementById('medo-parte2');
    medoParte2.classList.remove('hidden');
    prepararAnimacoesScroll(); // Ativa a animação de scroll para a parte 2

    // Espera 4s para leitura
    setTimeout(() => {
        const imagemJumpscare = document.getElementById('quadro-susto-jumpscare');
        const audioSusto = document.getElementById('audio-susto');
        
        // 1. O susto estoura na tela imediatamente (sem transição)
        imagemJumpscare.style.opacity = '1'; 
        audioSusto.play();

        // 2. A tela de Game Over é ativada no mesmo exato milissegundo.
        // Como o texto tem a classe ds-reveal, ele vai fazer o fade escuro
        // calmamente enquanto o usuário toma o susto com a imagem de cima.
        document.getElementById('fim-medo').classList.remove('hidden');
        prepararAnimacoesScroll();

    }, 4000);
}

// --- RESET GLOBAL ---
function resetarTudo() {
    const reserva = document.getElementById('reserva-trilhas');
    
    ['trilha-uber', 'trilha-carona', 'trilha-medo'].forEach(id => {
        const trilha = document.getElementById(id);
        trilha.classList.add('hidden');
        reserva.appendChild(trilha);
    });

    document.getElementById('fim-carona').classList.add('hidden');

    medoRevelado = false;
    shakeCount = 0;
    document.getElementById('medo-parte2').classList.add('hidden');
    document.getElementById('fim-medo').classList.add('hidden');
    document.getElementById('quadro-susto-jumpscare').style.opacity = '0'; // Esconde o monstro de novo

    // Remove as classes 'visivel' para que a animação aconteça de novo se o leitor repetir a trilha
    document.querySelectorAll('.animar-scroll').forEach(el => el.classList.remove('visivel'));

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
