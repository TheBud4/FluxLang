'use strict';
// Lógica sem dependência do VS Code: roda o compilador e traduz o JSON dele.
const { spawn } = require('child_process');

const KINDS = { 'léxico': 'léxico', 'sintático': 'sintático', 'semântico': 'semântico' };

// Lê o relatório de `flux --json --semantic`. Devolve null se não for JSON válido.
function parseReport(stdout) {
    let report;
    try {
        report = JSON.parse(stdout);
    } catch {
        return null;
    }
    if (!report || !Array.isArray(report.errors)) return null;
    return report.errors
        .filter((e) => Number.isInteger(e.line) && Number.isInteger(e.column))
        .map((e) => ({
            kind: KINDS[e.kind] ?? String(e.kind),
            line: e.line,
            column: e.column,
            message: String(e.message),
        }));
}

// O compilador conta colunas em caracteres (code points), o VS Code em UTF-16.
function toUtf16Index(lineText, column) {
    let index = 0;
    for (let seen = 1; seen < column && index < lineText.length; seen++) {
        index += lineText.codePointAt(index) > 0xffff ? 2 : 1;
    }
    return Math.min(index, lineText.length);
}

// Trecho a sublinhar a partir da coluna do erro: a palavra, a string inteira
// ou um caractere. No fim da linha, o último caractere (ou a linha vazia).
function rangeFor(lineText, column) {
    const start = toUtf16Index(lineText, column);
    if (start >= lineText.length) {
        return { start: Math.max(0, lineText.length - 1), end: lineText.length };
    }
    const rest = lineText.slice(start);
    let length = 1;
    if (rest[0] === '"') {
        const m = /^"(?:[^"\\]|\\.)*"?/.exec(rest);
        length = m ? m[0].length : 1;
    } else {
        const m = /^[A-Za-z0-9_]+/.exec(rest);
        if (m) length = m[0].length;
        else length = rest.codePointAt(0) > 0xffff ? 2 : 1;
    }
    return { start, end: start + length };
}

// Roda `<compiler> --json --semantic` com o texto na entrada padrão.
// Resolve com { errors } ou { failure } (nunca rejeita); { aborted: true } se cancelado.
function check(compiler, text, { cwd, timeoutMs = 10000, signal } = {}) {
    return new Promise((resolve) => {
        let child;
        try {
            child = spawn(compiler, ['--json', '--semantic'], { cwd, signal, timeout: timeoutMs });
        } catch (error) {
            resolve({ failure: String(error.message), missing: error.code === 'ENOENT' });
            return;
        }
        const out = [];
        child.stdout.on('data', (chunk) => out.push(chunk));
        child.on('error', (error) => {
            if (error.name === 'AbortError') resolve({ aborted: true });
            else resolve({ failure: error.message, missing: error.code === 'ENOENT' });
        });
        child.on('close', (code, killedBy) => {
            if (signal?.aborted) return resolve({ aborted: true });
            const errors = parseReport(Buffer.concat(out).toString('utf8'));
            if (errors) resolve({ errors });
            else resolve({ failure: `o compilador terminou sem um relatório JSON (código ${code ?? killedBy})` });
        });
        child.stdin.on('error', () => {}); // o compilador pode sair antes de ler tudo
        child.stdin.end(text);
    });
}

module.exports = { parseReport, rangeFor, toUtf16Index, check };
