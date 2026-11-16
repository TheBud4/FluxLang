#ifndef MEM_H
#define MEM_H

#include <stddef.h>

void *mem_alloc(size_t size);
char *mem_strdup(const char *s);
void *mem_grow(void *old, size_t old_size, size_t new_size);
void mem_free_all(void);

#endif
