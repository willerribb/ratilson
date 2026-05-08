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
function dispararEventoMedo() {
    medoRevelado = true;
    braco.style.transform = `rotate(0deg)`; // Reseta a posição
    
    const medoParte2 = document.getElementById('medo-parte2');
    medoParte2.classList.remove('hidden');

    // Espera 4 segundos para o leitor ler os quadros 3 e 4, e então...
    setTimeout(() => {
        const quadroSusto = document.getElementById('quadro-susto');
        const audioSusto = document.getElementById('audio-susto');
        
        quadroSusto.src = "assets/webp/andar_05.webp"; // Troca a imagem
        audioSusto.play(); // Toca o som
        
        document.getElementById('fim-medo').classList.remove('hidden'); // Mostra botão
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
