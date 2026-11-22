#include "mem.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CHUNK_SIZE (256 * 1024)

typedef struct Chunk {
  struct Chunk *next;
  size_t used, size;
} __attribute__((aligned(16))) Chunk;

static Chunk *chunks;

static void die_no_memory(void) {
  fprintf(stderr, "Memória esgotada.\n");
  exit(2);
}

void *mem_alloc(size_t size) {
  size = (size + 15) & ~(size_t)15;
  if (size == 0)
    size = 16;
  if (!chunks || chunks->used + size > chunks->size) {
    size_t chunk_size = size > CHUNK_SIZE ? size : CHUNK_SIZE;
    Chunk *c = calloc(1, sizeof(Chunk) + chunk_size);
    if (!c)
      die_no_memory();
    c->size = chunk_size;
    c->next = chunks;
    chunks = c;
  }
  void *p = (char *)(chunks + 1) + chunks->used;
  chunks->used += size;
  return p;
}

char *mem_strdup(const char *s) {
  size_t n = strlen(s) + 1;
  char *copy = mem_alloc(n);
  memcpy(copy, s, n);
  return copy;
}

void *mem_grow(void *old, size_t old_size, size_t new_size) {
  void *p = mem_alloc(new_size);
  if (old)
    memcpy(p, old, old_size < new_size ? old_size : new_size);
  return p;
}

void mem_free_all(void) {
  while (chunks) {
    Chunk *next = chunks->next;
    free(chunks);
    chunks = next;
  }
}
