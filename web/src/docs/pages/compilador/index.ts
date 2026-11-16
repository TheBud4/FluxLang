import type { DocPage } from '../../types'
import { Arena } from './arena'
import { Lexico } from './lexico'
import { LinhaDeComando } from './linha-de-comando'
import { MapaEBuild } from './mapa-e-build'
import { ModoPanico } from './modo-panico'
import { Parser } from './parser'
import { VisaoGeral } from './visao-geral'

export const compiladorPages: DocPage[] = [
  {
    id: 'compilador/visao-geral',
    section: 'compilador',
    title: 'Visão geral',
    summary: 'O caminho de um programa do texto ao executável: cada etapa, o arquivo, a entrada, a saída e a opção que para nela.',
    Component: VisaoGeral,
  },
  {
    id: 'compilador/mapa-e-build',
    section: 'compilador',
    title: 'Mapa do repositório e build',
    summary: 'As pastas do projeto, as dependências, o Makefile (vpath, objetos planos, runtime_src.c) e a suíte tests/run.sh.',
    Component: MapaEBuild,
  },
  {
    id: 'compilador/linha-de-comando',
    section: 'compilador',
    title: 'Linha de comando e variáveis de ambiente',
    summary: 'Todas as opções do ./flux, os códigos de saída, as variáveis FLUX_*, NO_COLOR e FORCE_COLOR, o driver main.c e o fluxc.h.',
    Component: LinhaDeComando,
  },
  {
    id: 'compilador/arena',
    section: 'compilador',
    title: 'Arena de memória',
    summary: 'mem.c: o alocador de arena do compilador, mem_alloc, mem_strdup, mem_grow, a liberação no fim e o LeakSanitizer.',
    Component: Arena,
  },
  {
    id: 'compilador/lexico',
    section: 'compilador',
    title: 'Analisador léxico',
    summary: 'lexer.l: como os tokens saem do texto, RET e a posição, palavras reservadas, números, strings, comentários e os erros L1 a L6.',
    Component: Lexico,
  },
  {
    id: 'compilador/parser',
    section: 'compilador',
    title: 'Parser',
    summary: 'parser.y: a transcrição da BNF em forma LL(1), as ações mknode, a checagem S3 com o campo flag e as mensagens de erro sintático.',
    Component: Parser,
  },
  {
    id: 'compilador/modo-panico',
    section: 'compilador',
    title: 'Modo pânico',
    summary: 'As regras com error, como a recuperação sincroniza em ; ou em blocos, a cascata de erros, a árvore e o exemplo inválido de ponta a ponta.',
    Component: ModoPanico,
  },
]
