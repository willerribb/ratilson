const fluxoHistoria = document.getElementById('fluxo-historia');
let medoRevelado = false;
let shakeCount = 0;

// Lógica de empilhamento: move a trilha selecionada para o final do fluxo visível
function escolherTrilha(idTrilha) {
    const trilha = document.getElementById(idTrilha);
    trilha.classList.remove('hidden');
    fluxoHistoria.appendChild(trilha); // Move para baixo fisicamente no HTML

    // Se for Carona, inicia o observador para contar os segundos só quando o usuário chegar no final
    if (idTrilha === 'trilha-carona') {
        iniciarObserverCarona();
    }
}

// Observador para a Trilha Carona
function iniciarObserverCarona() {
    const ultimoQuadro = document.getElementById('ultimo-quadro-carona');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // Conta 3 segundos após o usuário ver o último quadro
            setTimeout(() => {
                document.getElementById('fim-carona').classList.remove('hidden');
            }, 3000);
            observer.disconnect(); // Roda apenas uma vez
        }
    });
    observer.observe(ultimoQuadro);
}

// --- INTERAÇÃO DO BRAÇO (TRILHA MEDO) ---
const quadroBraco = document.getElementById('quadro-braco');
const braco = document.getElementById('braco-personagem');
let lastMouseX = null;
let currentDirection = null;

// Rotação via Movimento do Mouse
quadroBraco.addEventListener('mousemove', (e) => {
    if (medoRevelado) return;

    if (lastMouseX === null) lastMouseX = e.clientX;
    
    let dir = e.clientX > lastMouseX ? 'direita' : 'esquerda';
    
    // Se mudou de direção, conta como uma "sacodida"
    if (currentDirection && dir !== currentDirection) {
        animarBraco(dir);
    }
    
    currentDirection = dir;
    lastMouseX = e.clientX;
});

// Rotação via Clique (Fallback para facilitar)
quadroBraco.addEventListener('click', () => {
    if (medoRevelado) return;
    let dir = currentDirection === 'direita' ? 'esquerda' : 'direita';
    currentDirection = dir;
    animarBraco(dir);
});

function animarBraco(direcao) {
    shakeCount++;
    let angulo = direcao === 'direita' ? 30 : -30;
    braco.style.transform = `rotate(${angulo}deg)`;

    // Após 6 "sacodidas" (3 para cada lado), revela os próximos quadros
    if (shakeCount >= 6 && !medoRevelado) {
        dispararEventoMedo();
    }
}

// --- LÓGICA DO JUMPSCARE ---
// --- LÓGICA DO JUMPSCARE COM NOVO TIMING ---
function dispararEventoMedo() {
    medoRevelado = true;
    braco.style.transform = `rotate(0deg)`; // Reseta a posição
    
    // Revela os quadros 3 e 4 (o container do susto)
    const medoParte2 = document.getElementById('medo-parte2');
    medoParte2.classList.remove('hidden');

    // TIMEOUT 1: Espera 4 segundos para o leitor ler os quadros 3 e 4
    setTimeout(() => {
        // Pega os novos elementos do HTML para o susto suave
        const imagemJumpscare = document.getElementById('quadro-susto-jumpscare');
        const audioSusto = document.getElementById('audio-susto');
        
        // Ativa a transição suave de opacidade definida no CSS
        imagemJumpscare.style.opacity = '1';
        audioSusto.play(); // Toca o som

        // TIMEOUT 2 (Aninhado): Espera o susto acontecer (2.5s) e revela o Final Screen
        setTimeout(() => {
            // Revela o container estilo Dark Souls do Medo
            // A classe 'ds-reveal' no HTML já cuidará do fade do preto
            document.getElementById('fim-medo').classList.remove('hidden'); 
        }, 2500);

    }, 4000);
}

// --- RESET GLOBAL ---
function resetarTudo() {
    // Retorna as trilhas para a "reserva" e esconde todas
    const reserva = document.getElementById('reserva-trilhas');
    
    ['trilha-uber', 'trilha-carona', 'trilha-medo'].forEach(id => {
        const trilha = document.getElementById(id);
        trilha.classList.add('hidden');
        reserva.appendChild(trilha);
    });

    // Reseta estado Carona
    document.getElementById('fim-carona').classList.add('hidden');

    // Reseta estado Medo
    medoRevelado = false;
    shakeCount = 0;
    document.getElementById('medo-parte2').classList.add('hidden');
    document.getElementById('fim-medo').classList.add('hidden');
    document.getElementById('quadro-susto').src = "assets/webp/andar_04.webp";

    // Rola a tela suavemente para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
