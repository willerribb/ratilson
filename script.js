function navegarPara(idDestino) {
    // 1. Pega todas as seções que têm a classe 'cena'
    const todasAsCenas = document.querySelectorAll('.cena');

    // 2. Esconde todas elas adicionando a classe 'hidden'
    todasAsCenas.forEach(cena => {
        cena.classList.add('hidden');
    });

    // 3. Pega a cena de destino e remove a classe 'hidden'
    const cenaDestino = document.getElementById(idDestino);
    cenaDestino.classList.remove('hidden');
}