import type { DocPage } from '../../types'
import { Arena } from './arena'
import { LinhaDeComando } from './linha-de-comando'
import { MapaEBuild } from './mapa-e-build'
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
]
