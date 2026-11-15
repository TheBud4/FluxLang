#ifndef MEM_H
#define MEM_H

#include <stddef.h>

/* Memória do compilador: tudo o que ele aloca (a árvore de derivação, a AST,
 * as tabelas da análise semântica, os textos) vem de um arena: blocos grandes
 * dos quais se vai tirando pedaços, e que são liberados todos de uma vez no fim
 * (mem_free_all). Nada é liberado um a um, então não há vazamento nem free
 * duplo para errar; o compilador roda uma vez por arquivo. */

void *mem_alloc(size_t size);        /* zerado */
char *mem_strdup(const char *s);
/* Um bloco novo de new_size bytes com o conteúdo do antigo (que fica no arena). */
void *mem_grow(void *old, size_t old_size, size_t new_size);
void mem_free_all(void);

#endif
