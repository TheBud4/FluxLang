'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { parseReport, rangeFor, check } = require('../lib/compiler');

const flux = path.resolve(__dirname, '../../../flux');
const hasFlux = fs.existsSync(flux);

test('parseReport lê os erros e ignora lixo', () => {
    const json = '{"accepted":false,"errors":[{"kind":"semântico","line":2,"column":15,"message":"x"}]}';
    assert.deepStrictEqual(parseReport(json), [{ kind: 'semântico', line: 2, column: 15, message: 'x' }]);
    assert.strictEqual(parseReport('não é json'), null);
    assert.strictEqual(parseReport('{"accepted":true}'), null);
});

test('rangeFor: palavra, string, símbolo, fim de linha e acentos', () => {
    assert.deepStrictEqual(rangeFor('  y = 2;', 3), { start: 2, end: 3 });
    assert.deepStrictEqual(rangeFor('var x = abc + 1;', 9), { start: 8, end: 11 });
    assert.deepStrictEqual(rangeFor('var s = "ab\\q";', 9), { start: 8, end: 14 });
    assert.deepStrictEqual(rangeFor('a @ b', 3), { start: 2, end: 3 });
    assert.deepStrictEqual(rangeFor('abc', 99), { start: 2, end: 3 });
    assert.deepStrictEqual(rangeFor('', 1), { start: 0, end: 0 });
    // 😀 vale 1 coluna do compilador e 2 posições UTF-16
    assert.deepStrictEqual(rangeFor('"😀" x', 6), { start: 5, end: 6 });
});

test('check: arquivo ausente devolve missing', async () => {
    const result = await check('/nao/existe/flux', 'func main () {}');
    assert.strictEqual(result.missing, true);
});

test('check: programa válido não tem erros', { skip: !hasFlux }, async () => {
    const result = await check(flux, 'func main () {\n  terminal.log("oi");\n}\n');
    assert.deepStrictEqual(result.errors, []);
});

test('check: léxico, sintático e semântico vêm com a posição certa', { skip: !hasFlux }, async () => {
    const semantic = await check(flux, 'func main () {\n  var x:int = "a";\n  y = 2;\n}\n');
    assert.deepStrictEqual(
        semantic.errors.map((e) => [e.kind, e.line, e.column]),
        [['semântico', 2, 15], ['semântico', 3, 3]],
    );
    const lexical = await check(flux, 'func main () {\n  var s = "ab\\q";\n}\n');
    assert.strictEqual(lexical.errors[0].kind, 'léxico');
    assert.strictEqual(lexical.errors[0].line, 2);
    const syntax = await check(flux, 'func main () {\n  var = 3;\n}\n');
    assert.strictEqual(syntax.errors[0].kind, 'sintático');
});

test('check: cancelar com AbortSignal', { skip: !hasFlux }, async () => {
    const controller = new AbortController();
    const pending = check(flux, 'func main () {}', { signal: controller.signal });
    controller.abort();
    assert.strictEqual((await pending).aborted, true);
});
