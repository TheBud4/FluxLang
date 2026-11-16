import type { DocPage } from '../../types'
import { Arena } from './arena'
import { ArvoreJson } from './arvore-json'
import { Ast } from './ast'
import { Coletor } from './coletor'
import { GeradorC } from './gerador-c'
import { Lexico } from './lexico'
import { LinhaDeComando } from './linha-de-comando'
import { MapaEBuild } from './mapa-e-build'
import { ModoPanico } from './modo-panico'
import { Parser } from './parser'
import { Runtime } from './runtime'
import { Semantica } from './semantica'
import { TiposInternos } from './tipos-internos'
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
  {
    id: 'compilador/arvore-json',
    section: 'compilador',
    title: 'Árvore de derivação e JSON',
    summary: 'tree.c e json.c: o tipo Node, mknode e os nós de folha, a saída de --tree, o esquema exato do --json e o contrato com a interface web.',
    Component: ArvoreJson,
  },
  {
    id: 'compilador/ast',
    section: 'compilador',
    title: 'AST',
    summary: 'ast.h, ast.c e ast_build.c: cada nó da AST enxuta, como a árvore de derivação vira AST, a saída de --ast e o que a AST descarta.',
    Component: Ast,
  },
  {
    id: 'compilador/tipos-internos',
    section: 'compilador',
    title: 'Tipos internos',
    summary: 'types.c e types.h: TypeKind e Type, os tipos internos (erro, nada, null, dinâmico), igualdade, compatibilidade (type_assignable) e os nomes das mensagens.',
    Component: TiposInternos,
  },
  {
    id: 'compilador/semantica',
    section: 'compilador',
    title: 'Análise semântica',
    summary: 'sema.c: as três passadas, a pilha de escopos, a tipagem das expressões, o estado de fluxo do E3 e do E20, call e run, e qual função levanta cada erro E1 a E24.',
    Component: Semantica,
  },
  {
    id: 'compilador/gerador-c',
    section: 'compilador',
    title: 'Gerador de C',
    summary: 'codegen_c.c: como --c, --build e --run viram um programa C e um executável, o C de cada construção, os temporários, o curto-circuito e a chamada do gcc.',
    Component: GeradorC,
  },
  {
    id: 'compilador/runtime',
    section: 'compilador',
    title: 'Biblioteca de execução',
    summary: 'flux_rt.h: o FxValue, os operadores e os erros R1 a R7, terminal (cores e saída etiquetada), run, a entrada do programa e o que muda entre POSIX e Windows.',
    Component: Runtime,
  },
  {
    id: 'compilador/coletor',
    section: 'compilador',
    title: 'Coletor de lixo',
    summary: 'O coletor conservador de marca e varre da biblioteca: blocos, raízes, varredura da pilha, fx_gc_find, registradores salvos, limites e as variáveis FLUX_GC*.',
    Component: Coletor,
  },
]
