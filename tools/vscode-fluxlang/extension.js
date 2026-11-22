'use strict';
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { check, rangeFor } = require('./lib/compiler');

const LANGUAGE = 'fluxlang';
const DEBOUNCE_MS = 300;

let diagnostics;
let output;
let warnedMissing = false;
const pending = new Map(); // uri -> { timer, controller }

function config() {
    return vscode.workspace.getConfiguration('fluxlang');
}

// Configuração explícita; senão o binário `flux`/`fluxc` na raiz do workspace
// (só em workspace confiável, porque é um executável que a gente roda); senão o PATH.
function resolveCompiler(document) {
    const configured = config().get('compilerPath');
    if (configured) return configured;
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (folder && vscode.workspace.isTrusted) {
        for (const name of ['flux', 'fluxc']) {
            const candidate = path.join(folder.uri.fsPath, name);
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
        }
    }
    return 'flux';
}

function toDiagnostics(document, errors) {
    return errors.map(({ line, column, message, kind }) => {
        const row = Math.min(Math.max(line - 1, 0), document.lineCount - 1);
        const { start, end } = rangeFor(document.lineAt(row).text, column);
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(row, start, row, end),
            message,
            vscode.DiagnosticSeverity.Error,
        );
        diagnostic.source = `fluxc (${kind})`;
        return diagnostic;
    });
}

async function validate(document) {
    const key = document.uri.toString();
    pending.get(key)?.controller?.abort();
    const controller = new AbortController();
    pending.set(key, { controller });

    const compiler = resolveCompiler(document);
    const folder = vscode.workspace.getWorkspaceFolder(document.uri);
    const result = await check(compiler, document.getText(), {
        cwd: folder?.uri.fsPath,
        signal: controller.signal,
    });
    if (result.aborted || document.isClosed) return;
    const entry = pending.get(key);
    if (entry?.controller === controller) pending.set(key, { timer: entry.timer });

    if (result.errors) {
        diagnostics.set(document.uri, toDiagnostics(document, result.errors));
        return;
    }
    output.appendLine(`[${document.uri.fsPath}] ${compiler}: ${result.failure}`);
    if (result.missing && !warnedMissing) {
        warnedMissing = true;
        const open = 'Abrir configuração';
        vscode.window
            .showWarningMessage(
                `FluxLang: compilador "${compiler}" não encontrado; os erros não aparecem no editor. ` +
                    'Compile com `make` ou aponte o caminho em fluxlang.compilerPath.',
                open,
            )
            .then((choice) => {
                if (choice === open) vscode.commands.executeCommand('workbench.action.openSettings', 'fluxlang.compilerPath');
            });
    }
}

function schedule(document, delay) {
    if (document.languageId !== LANGUAGE || config().get('diagnostics') === 'off') return;
    const key = document.uri.toString();
    clearTimeout(pending.get(key)?.timer);
    const timer = setTimeout(() => validate(document), delay);
    pending.set(key, { ...pending.get(key), timer });
}

function forget(document) {
    const key = document.uri.toString();
    clearTimeout(pending.get(key)?.timer);
    pending.get(key)?.controller?.abort();
    pending.delete(key);
    diagnostics.delete(document.uri);
}

function activate(context) {
    diagnostics = vscode.languages.createDiagnosticCollection(LANGUAGE);
    output = vscode.window.createOutputChannel('FluxLang');
    context.subscriptions.push(diagnostics, output);

    const onType = () => config().get('diagnostics') === 'onType';
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((d) => schedule(d, 0)),
        vscode.workspace.onDidChangeTextDocument((e) => {
            if (onType() && e.contentChanges.length) schedule(e.document, DEBOUNCE_MS);
        }),
        vscode.workspace.onDidSaveTextDocument((d) => schedule(d, 0)),
        vscode.workspace.onDidCloseTextDocument(forget),
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (!e.affectsConfiguration('fluxlang')) return;
            warnedMissing = false;
            if (config().get('diagnostics') === 'off') diagnostics.clear();
            else vscode.workspace.textDocuments.forEach((d) => schedule(d, 0));
        }),
        vscode.workspace.onDidGrantWorkspaceTrust(() => vscode.workspace.textDocuments.forEach((d) => schedule(d, 0))),
    );
    vscode.workspace.textDocuments.forEach((d) => schedule(d, 0));
}

function deactivate() {
    for (const { timer, controller } of pending.values()) {
        clearTimeout(timer);
        controller?.abort();
    }
    pending.clear();
}

module.exports = { activate, deactivate };
