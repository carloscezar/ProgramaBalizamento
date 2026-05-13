/**
 * time-utils.js
 * Funções centralizadas para conversão e comparação de tempos
 * Suporta formatos: MM:SS.CC e SS.CC
 */

/**
 * Converte tempo para segundos
 * Suporta formatos:
 * - "MM:SS.CC" (minutos:segundos.centésimos)
 * - "SS.CC" (apenas segundos.centésimos)
 * 
 * @param {string} tempoStr - Tempo em formato string
 * @returns {number} Tempo em segundos (número decimal)
 */
function tempoParaSegundos(tempoStr) {
    if (!tempoStr || typeof tempoStr !== 'string') {
        return Infinity; // Sem tempo = infinito (classifica por último)
    }
    
    // Se não contém ":", é apenas segundos (ex: "20.55")
    if (!tempoStr.includes(':')) {
        return parseFloat(tempoStr) || Infinity;
    }
    
    // Formato MM:SS.CC
    const partes = tempoStr.split(':');
    if (partes.length !== 2) return Infinity;
    
    const minutos = parseInt(partes[0], 10);
    const segundosMs = parseFloat(partes[1]);
    
    return minutos * 60 + segundosMs;
}

/**
 * Alias para tempoParaSegundos para compatibilidade
 * @param {string} tempo - Tempo em formato string
 * @returns {number} Tempo em segundos
 */
function converterTempoParaSegundos(tempo) {
    if (!tempo) return Infinity;
    
    // Se não contém ":", é apenas segundos (ex: "20.55")
    if (!tempo.includes(':')) {
        return parseFloat(tempo) || Infinity;
    }
    
    // Formato MM:SS.CC ou MM:SS
    const [minSeg, ms] = tempo.split('.');
    const [min, seg] = minSeg.split(':');
    return parseInt(min) * 60 + parseInt(seg) + (parseInt(ms) || 0) / 100;
}

/**
 * Compara dois tempos e retorna se o primeiro é melhor (menor)
 * @param {string} novoTempo - Novo tempo
 * @param {string} tempoAnterior - Tempo anterior
 * @returns {boolean} true se novoTempo < tempoAnterior
 */
function isMelhorTempo(novoTempo, tempoAnterior) {
    const novoSeg = tempoParaSegundos(novoTempo);
    const anteriorSeg = tempoParaSegundos(tempoAnterior);
    return novoSeg < anteriorSeg;
}

/**
 * Formata segundos para formato MM:SS.CC
 * @param {number} segundos - Tempo em segundos
 * @returns {string} Tempo formatado MM:SS.CC
 */
function formatarTempo(segundos) {
    if (isNaN(segundos) || !isFinite(segundos)) return '00:00.00';
    
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    
    const min = String(minutos).padStart(2, '0');
    const seg = segs.toFixed(2);
    
    return `${min}:${seg}`;
}

/**
 * Ordena array de tempos em ordem crescente
 * @param {string[]} tempos - Array de tempos em string
 * @returns {string[]} Array ordenado
 */
function ordenarTempos(tempos) {
    return tempos.sort((a, b) => tempoParaSegundos(a) - tempoParaSegundos(b));
}

/**
 * Encontra o melhor (menor) tempo de um array
 * @param {string[]} tempos - Array de tempos
 * @returns {string|null} Melhor tempo ou null se vazio
 */
function encontrarMelhorTempo(tempos) {
    if (!tempos || tempos.length === 0) return null;
    return tempos.reduce((melhor, atual) => 
        isMelhorTempo(atual, melhor) ? atual : melhor
    );
}

/**
 * Calcula diferença entre dois tempos em segundos
 * @param {string} tempo1 - Primeiro tempo
 * @param {string} tempo2 - Segundo tempo
 * @returns {number} Diferença em segundos (tempo1 - tempo2)
 */
function diferencaTempos(tempo1, tempo2) {
    return tempoParaSegundos(tempo1) - tempoParaSegundos(tempo2);
}

/**
 * Valida se uma string é um tempo válido
 * @param {string} tempo - String a validar
 * @returns {boolean} true se válido
 */
function isTempoValido(tempo) {
    if (!tempo || typeof tempo !== 'string') return false;
    
    // Sem ":" = apenas segundos
    if (!tempo.includes(':')) {
        const n = parseFloat(tempo);
        return !isNaN(n) && n > 0;
    }
    
    // Com ":" = MM:SS ou MM:SS.CC
    const regex = /^\d{1,2}:\d{1,2}(\.\d{1,2})?$/;
    return regex.test(tempo);
}
