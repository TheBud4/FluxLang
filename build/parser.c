/* A Bison parser, made by GNU Bison 3.8.2.  */

/* Bison implementation for Yacc-like parsers in C

   Copyright (C) 1984, 1989-1990, 2000-2015, 2018-2021 Free Software Foundation,
   Inc.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

/* As a special exception, you may create a larger work that contains
   part or all of the Bison parser skeleton and distribute that work
   under terms of your choice, so long as that work isn't itself a
   parser generator using the skeleton or a modified version thereof
   as a parser skeleton.  Alternatively, if you modify or redistribute
   the parser skeleton itself, you may (at your option) remove this
   special exception, which will cause the skeleton and the resulting
   Bison output files to be licensed under the GNU General Public
   License without this special exception.

   This special exception was added by the Free Software Foundation in
   version 2.2 of Bison.  */

/* C LALR(1) parser skeleton written by Richard Stallman, by
   simplifying the original so-called "semantic" parser.  */

/* DO NOT RELY ON FEATURES THAT ARE NOT DOCUMENTED in the manual,
   especially those whose name start with YY_ or yy_.  They are
   private implementation details that can be changed or removed.  */

/* All symbols defined below should begin with yy or YY, to avoid
   infringing on user name space.  This should be done even for local
   variables, as they might otherwise be expanded by user macros.
   There are some unavoidable exceptions within include files to
   define necessary library symbols; they are noted "INFRINGES ON
   USER NAME SPACE" below.  */

/* Identify Bison output, and Bison version.  */
#define YYBISON 30802

/* Bison version string.  */
#define YYBISON_VERSION "3.8.2"

/* Skeleton name.  */
#define YYSKELETON_NAME "yacc.c"

/* Pure parsers.  */
#define YYPURE 0

/* Push parsers.  */
#define YYPUSH 0

/* Pull parsers.  */
#define YYPULL 1




/* First part of user prologue.  */
#line 17 "src/parser.y"

#include <stdio.h>
#include <string.h>

#include "fluxc.h"

#define YYMAXDEPTH 100000

void yyerror(const char *msg);

#line 82 "build/parser.c"

# ifndef YY_CAST
#  ifdef __cplusplus
#   define YY_CAST(Type, Val) static_cast<Type> (Val)
#   define YY_REINTERPRET_CAST(Type, Val) reinterpret_cast<Type> (Val)
#  else
#   define YY_CAST(Type, Val) ((Type) (Val))
#   define YY_REINTERPRET_CAST(Type, Val) ((Type) (Val))
#  endif
# endif
# ifndef YY_NULLPTR
#  if defined __cplusplus
#   if 201103L <= __cplusplus
#    define YY_NULLPTR nullptr
#   else
#    define YY_NULLPTR 0
#   endif
#  else
#   define YY_NULLPTR ((void*)0)
#  endif
# endif

#include "parser.h"
/* Symbol kind.  */
enum yysymbol_kind_t
{
  YYSYMBOL_YYEMPTY = -2,
  YYSYMBOL_YYEOF = 0,                      /* "end of file"  */
  YYSYMBOL_YYerror = 1,                    /* error  */
  YYSYMBOL_YYUNDEF = 2,                    /* "invalid token"  */
  YYSYMBOL_VAR = 3,                        /* VAR  */
  YYSYMBOL_CONST = 4,                      /* CONST  */
  YYSYMBOL_FUNC = 5,                       /* FUNC  */
  YYSYMBOL_WORKFLOW = 6,                   /* WORKFLOW  */
  YYSYMBOL_CALL = 7,                       /* CALL  */
  YYSYMBOL_RETURN = 8,                     /* RETURN  */
  YYSYMBOL_IF = 9,                         /* IF  */
  YYSYMBOL_ELSE = 10,                      /* ELSE  */
  YYSYMBOL_WHILE = 11,                     /* WHILE  */
  YYSYMBOL_FOR = 12,                       /* FOR  */
  YYSYMBOL_IN = 13,                        /* IN  */
  YYSYMBOL_BREAK = 14,                     /* BREAK  */
  YYSYMBOL_CONTINUE = 15,                  /* CONTINUE  */
  YYSYMBOL_STOP = 16,                      /* STOP  */
  YYSYMBOL_ABORT = 17,                     /* ABORT  */
  YYSYMBOL_RUN = 18,                       /* RUN  */
  YYSYMBOL_TRUE = 19,                      /* TRUE  */
  YYSYMBOL_FALSE = 20,                     /* FALSE  */
  YYSYMBOL_NULL_LITERAL = 21,              /* NULL_LITERAL  */
  YYSYMBOL_TYPE_INT = 22,                  /* TYPE_INT  */
  YYSYMBOL_TYPE_FLOAT = 23,                /* TYPE_FLOAT  */
  YYSYMBOL_TYPE_STRING = 24,               /* TYPE_STRING  */
  YYSYMBOL_TYPE_BOOL = 25,                 /* TYPE_BOOL  */
  YYSYMBOL_TYPE_OBJECT = 26,               /* TYPE_OBJECT  */
  YYSYMBOL_TYPE_LIST = 27,                 /* TYPE_LIST  */
  YYSYMBOL_LPAREN = 28,                    /* LPAREN  */
  YYSYMBOL_RPAREN = 29,                    /* RPAREN  */
  YYSYMBOL_LBRACE = 30,                    /* LBRACE  */
  YYSYMBOL_RBRACE = 31,                    /* RBRACE  */
  YYSYMBOL_LBRACKET = 32,                  /* LBRACKET  */
  YYSYMBOL_RBRACKET = 33,                  /* RBRACKET  */
  YYSYMBOL_COMMA = 34,                     /* COMMA  */
  YYSYMBOL_COLON = 35,                     /* COLON  */
  YYSYMBOL_SEMICOLON = 36,                 /* SEMICOLON  */
  YYSYMBOL_DOT = 37,                       /* DOT  */
  YYSYMBOL_ASSIGN = 38,                    /* ASSIGN  */
  YYSYMBOL_EQ = 39,                        /* EQ  */
  YYSYMBOL_NEQ = 40,                       /* NEQ  */
  YYSYMBOL_LT = 41,                        /* LT  */
  YYSYMBOL_GT = 42,                        /* GT  */
  YYSYMBOL_LTE = 43,                       /* LTE  */
  YYSYMBOL_GTE = 44,                       /* GTE  */
  YYSYMBOL_PLUS = 45,                      /* PLUS  */
  YYSYMBOL_MINUS = 46,                     /* MINUS  */
  YYSYMBOL_MUL = 47,                       /* MUL  */
  YYSYMBOL_DIV = 48,                       /* DIV  */
  YYSYMBOL_MOD = 49,                       /* MOD  */
  YYSYMBOL_AND = 50,                       /* AND  */
  YYSYMBOL_OR = 51,                        /* OR  */
  YYSYMBOL_NOT = 52,                       /* NOT  */
  YYSYMBOL_IDENTIFIER = 53,                /* IDENTIFIER  */
  YYSYMBOL_STRING_LITERAL = 54,            /* STRING_LITERAL  */
  YYSYMBOL_INT_LITERAL = 55,               /* INT_LITERAL  */
  YYSYMBOL_FLOAT_LITERAL = 56,             /* FLOAT_LITERAL  */
  YYSYMBOL_ERRO_LEXICO = 57,               /* ERRO_LEXICO  */
  YYSYMBOL_YYACCEPT = 58,                  /* $accept  */
  YYSYMBOL_programa = 59,                  /* programa  */
  YYSYMBOL_globais = 60,                   /* globais  */
  YYSYMBOL_elemento_global = 61,           /* elemento_global  */
  YYSYMBOL_bloco = 62,                     /* bloco  */
  YYSYMBOL_comandos = 63,                  /* comandos  */
  YYSYMBOL_tipo = 64,                      /* tipo  */
  YYSYMBOL_declaracao_var = 65,            /* declaracao_var  */
  YYSYMBOL_declaracao_var_resto = 66,      /* declaracao_var_resto  */
  YYSYMBOL_inicializacao_opcional = 67,    /* inicializacao_opcional  */
  YYSYMBOL_declaracao_const = 68,          /* declaracao_const  */
  YYSYMBOL_lista_identificadores = 69,     /* lista_identificadores  */
  YYSYMBOL_lista_identificadores_resto = 70, /* lista_identificadores_resto  */
  YYSYMBOL_lista_expressoes = 71,          /* lista_expressoes  */
  YYSYMBOL_lista_expressoes_resto = 72,    /* lista_expressoes_resto  */
  YYSYMBOL_funcao = 73,                    /* funcao  */
  YYSYMBOL_tipo_retorno = 74,              /* tipo_retorno  */
  YYSYMBOL_parametros_opcionais = 75,      /* parametros_opcionais  */
  YYSYMBOL_parametros_resto = 76,          /* parametros_resto  */
  YYSYMBOL_parametro = 77,                 /* parametro  */
  YYSYMBOL_workflow = 78,                  /* workflow  */
  YYSYMBOL_chamada_workflow = 79,          /* chamada_workflow  */
  YYSYMBOL_argumentos_opcionais = 80,      /* argumentos_opcionais  */
  YYSYMBOL_comando = 81,                   /* comando  */
  YYSYMBOL_comando_expressao = 82,         /* comando_expressao  */
  YYSYMBOL_resto_comando_expressao = 83,   /* resto_comando_expressao  */
  YYSYMBOL_84_1 = 84,                      /* $@1  */
  YYSYMBOL_alvos_resto = 85,               /* alvos_resto  */
  YYSYMBOL_comando_if = 86,                /* comando_if  */
  YYSYMBOL_else_opcional = 87,             /* else_opcional  */
  YYSYMBOL_comando_while = 88,             /* comando_while  */
  YYSYMBOL_comando_for = 89,               /* comando_for  */
  YYSYMBOL_comando_return = 90,            /* comando_return  */
  YYSYMBOL_valor_retorno = 91,             /* valor_retorno  */
  YYSYMBOL_comando_break = 92,             /* comando_break  */
  YYSYMBOL_comando_continue = 93,          /* comando_continue  */
  YYSYMBOL_continue_resto = 94,            /* continue_resto  */
  YYSYMBOL_comando_erro = 95,              /* comando_erro  */
  YYSYMBOL_expressao = 96,                 /* expressao  */
  YYSYMBOL_expressao_or_resto = 97,        /* expressao_or_resto  */
  YYSYMBOL_expressao_and = 98,             /* expressao_and  */
  YYSYMBOL_expressao_and_resto = 99,       /* expressao_and_resto  */
  YYSYMBOL_expressao_igualdade = 100,      /* expressao_igualdade  */
  YYSYMBOL_expressao_igualdade_resto = 101, /* expressao_igualdade_resto  */
  YYSYMBOL_operador_igualdade = 102,       /* operador_igualdade  */
  YYSYMBOL_expressao_relacional = 103,     /* expressao_relacional  */
  YYSYMBOL_expressao_relacional_resto = 104, /* expressao_relacional_resto  */
  YYSYMBOL_operador_relacional = 105,      /* operador_relacional  */
  YYSYMBOL_expressao_aditiva = 106,        /* expressao_aditiva  */
  YYSYMBOL_expressao_aditiva_resto = 107,  /* expressao_aditiva_resto  */
  YYSYMBOL_operador_aditivo = 108,         /* operador_aditivo  */
  YYSYMBOL_expressao_multiplicativa = 109, /* expressao_multiplicativa  */
  YYSYMBOL_expressao_multiplicativa_resto = 110, /* expressao_multiplicativa_resto  */
  YYSYMBOL_operador_multiplicativo = 111,  /* operador_multiplicativo  */
  YYSYMBOL_expressao_unaria = 112,         /* expressao_unaria  */
  YYSYMBOL_expressao_posfixa = 113,        /* expressao_posfixa  */
  YYSYMBOL_sufixos = 114,                  /* sufixos  */
  YYSYMBOL_sufixo = 115,                   /* sufixo  */
  YYSYMBOL_primaria = 116,                 /* primaria  */
  YYSYMBOL_lista = 117,                    /* lista  */
  YYSYMBOL_elementos_lista = 118,          /* elementos_lista  */
  YYSYMBOL_elementos_lista_resto = 119,    /* elementos_lista_resto  */
  YYSYMBOL_literal_object = 120,           /* literal_object  */
  YYSYMBOL_campos_object = 121,            /* campos_object  */
  YYSYMBOL_campos_object_resto = 122,      /* campos_object_resto  */
  YYSYMBOL_campo_object = 123,             /* campo_object  */
  YYSYMBOL_run = 124                       /* run  */
};
typedef enum yysymbol_kind_t yysymbol_kind_t;



/* Unqualified %code blocks.  */
#line 28 "src/parser.y"

static void erro_atribuicao(const YYLTYPE *loc);

#line 245 "build/parser.c"

#ifdef short
# undef short
#endif

/* On compilers that do not define __PTRDIFF_MAX__ etc., make sure
   <limits.h> and (if available) <stdint.h> are included
   so that the code can choose integer types of a good width.  */

#ifndef __PTRDIFF_MAX__
# include <limits.h> /* INFRINGES ON USER NAME SPACE */
# if defined __STDC_VERSION__ && 199901 <= __STDC_VERSION__
#  include <stdint.h> /* INFRINGES ON USER NAME SPACE */
#  define YY_STDINT_H
# endif
#endif

/* Narrow types that promote to a signed type and that can represent a
   signed or unsigned integer of at least N bits.  In tables they can
   save space and decrease cache pressure.  Promoting to a signed type
   helps avoid bugs in integer arithmetic.  */

#ifdef __INT_LEAST8_MAX__
typedef __INT_LEAST8_TYPE__ yytype_int8;
#elif defined YY_STDINT_H
typedef int_least8_t yytype_int8;
#else
typedef signed char yytype_int8;
#endif

#ifdef __INT_LEAST16_MAX__
typedef __INT_LEAST16_TYPE__ yytype_int16;
#elif defined YY_STDINT_H
typedef int_least16_t yytype_int16;
#else
typedef short yytype_int16;
#endif

/* Work around bug in HP-UX 11.23, which defines these macros
   incorrectly for preprocessor constants.  This workaround can likely
   be removed in 2023, as HPE has promised support for HP-UX 11.23
   (aka HP-UX 11i v2) only through the end of 2022; see Table 2 of
   <https://h20195.www2.hpe.com/V2/getpdf.aspx/4AA4-7673ENW.pdf>.  */
#ifdef __hpux
# undef UINT_LEAST8_MAX
# undef UINT_LEAST16_MAX
# define UINT_LEAST8_MAX 255
# define UINT_LEAST16_MAX 65535
#endif

#if defined __UINT_LEAST8_MAX__ && __UINT_LEAST8_MAX__ <= __INT_MAX__
typedef __UINT_LEAST8_TYPE__ yytype_uint8;
#elif (!defined __UINT_LEAST8_MAX__ && defined YY_STDINT_H \
       && UINT_LEAST8_MAX <= INT_MAX)
typedef uint_least8_t yytype_uint8;
#elif !defined __UINT_LEAST8_MAX__ && UCHAR_MAX <= INT_MAX
typedef unsigned char yytype_uint8;
#else
typedef short yytype_uint8;
#endif

#if defined __UINT_LEAST16_MAX__ && __UINT_LEAST16_MAX__ <= __INT_MAX__
typedef __UINT_LEAST16_TYPE__ yytype_uint16;
#elif (!defined __UINT_LEAST16_MAX__ && defined YY_STDINT_H \
       && UINT_LEAST16_MAX <= INT_MAX)
typedef uint_least16_t yytype_uint16;
#elif !defined __UINT_LEAST16_MAX__ && USHRT_MAX <= INT_MAX
typedef unsigned short yytype_uint16;
#else
typedef int yytype_uint16;
#endif

#ifndef YYPTRDIFF_T
# if defined __PTRDIFF_TYPE__ && defined __PTRDIFF_MAX__
#  define YYPTRDIFF_T __PTRDIFF_TYPE__
#  define YYPTRDIFF_MAXIMUM __PTRDIFF_MAX__
# elif defined PTRDIFF_MAX
#  ifndef ptrdiff_t
#   include <stddef.h> /* INFRINGES ON USER NAME SPACE */
#  endif
#  define YYPTRDIFF_T ptrdiff_t
#  define YYPTRDIFF_MAXIMUM PTRDIFF_MAX
# else
#  define YYPTRDIFF_T long
#  define YYPTRDIFF_MAXIMUM LONG_MAX
# endif
#endif

#ifndef YYSIZE_T
# ifdef __SIZE_TYPE__
#  define YYSIZE_T __SIZE_TYPE__
# elif defined size_t
#  define YYSIZE_T size_t
# elif defined __STDC_VERSION__ && 199901 <= __STDC_VERSION__
#  include <stddef.h> /* INFRINGES ON USER NAME SPACE */
#  define YYSIZE_T size_t
# else
#  define YYSIZE_T unsigned
# endif
#endif

#define YYSIZE_MAXIMUM                                  \
  YY_CAST (YYPTRDIFF_T,                                 \
           (YYPTRDIFF_MAXIMUM < YY_CAST (YYSIZE_T, -1)  \
            ? YYPTRDIFF_MAXIMUM                         \
            : YY_CAST (YYSIZE_T, -1)))

#define YYSIZEOF(X) YY_CAST (YYPTRDIFF_T, sizeof (X))


/* Stored state numbers (used for stacks). */
typedef yytype_uint8 yy_state_t;

/* State numbers in computations.  */
typedef int yy_state_fast_t;

#ifndef YY_
# if defined YYENABLE_NLS && YYENABLE_NLS
#  if ENABLE_NLS
#   include <libintl.h> /* INFRINGES ON USER NAME SPACE */
#   define YY_(Msgid) dgettext ("bison-runtime", Msgid)
#  endif
# endif
# ifndef YY_
#  define YY_(Msgid) Msgid
# endif
#endif


#ifndef YY_ATTRIBUTE_PURE
# if defined __GNUC__ && 2 < __GNUC__ + (96 <= __GNUC_MINOR__)
#  define YY_ATTRIBUTE_PURE __attribute__ ((__pure__))
# else
#  define YY_ATTRIBUTE_PURE
# endif
#endif

#ifndef YY_ATTRIBUTE_UNUSED
# if defined __GNUC__ && 2 < __GNUC__ + (7 <= __GNUC_MINOR__)
#  define YY_ATTRIBUTE_UNUSED __attribute__ ((__unused__))
# else
#  define YY_ATTRIBUTE_UNUSED
# endif
#endif

/* Suppress unused-variable warnings by "using" E.  */
#if ! defined lint || defined __GNUC__
# define YY_USE(E) ((void) (E))
#else
# define YY_USE(E) /* empty */
#endif

/* Suppress an incorrect diagnostic about yylval being uninitialized.  */
#if defined __GNUC__ && ! defined __ICC && 406 <= __GNUC__ * 100 + __GNUC_MINOR__
# if __GNUC__ * 100 + __GNUC_MINOR__ < 407
#  define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN                           \
    _Pragma ("GCC diagnostic push")                                     \
    _Pragma ("GCC diagnostic ignored \"-Wuninitialized\"")
# else
#  define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN                           \
    _Pragma ("GCC diagnostic push")                                     \
    _Pragma ("GCC diagnostic ignored \"-Wuninitialized\"")              \
    _Pragma ("GCC diagnostic ignored \"-Wmaybe-uninitialized\"")
# endif
# define YY_IGNORE_MAYBE_UNINITIALIZED_END      \
    _Pragma ("GCC diagnostic pop")
#else
# define YY_INITIAL_VALUE(Value) Value
#endif
#ifndef YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
# define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
# define YY_IGNORE_MAYBE_UNINITIALIZED_END
#endif
#ifndef YY_INITIAL_VALUE
# define YY_INITIAL_VALUE(Value) /* Nothing. */
#endif

#if defined __cplusplus && defined __GNUC__ && ! defined __ICC && 6 <= __GNUC__
# define YY_IGNORE_USELESS_CAST_BEGIN                          \
    _Pragma ("GCC diagnostic push")                            \
    _Pragma ("GCC diagnostic ignored \"-Wuseless-cast\"")
# define YY_IGNORE_USELESS_CAST_END            \
    _Pragma ("GCC diagnostic pop")
#endif
#ifndef YY_IGNORE_USELESS_CAST_BEGIN
# define YY_IGNORE_USELESS_CAST_BEGIN
# define YY_IGNORE_USELESS_CAST_END
#endif


#define YY_ASSERT(E) ((void) (0 && (E)))

#if 1

/* The parser invokes alloca or malloc; define the necessary symbols.  */

# ifdef YYSTACK_USE_ALLOCA
#  if YYSTACK_USE_ALLOCA
#   ifdef __GNUC__
#    define YYSTACK_ALLOC __builtin_alloca
#   elif defined __BUILTIN_VA_ARG_INCR
#    include <alloca.h> /* INFRINGES ON USER NAME SPACE */
#   elif defined _AIX
#    define YYSTACK_ALLOC __alloca
#   elif defined _MSC_VER
#    include <malloc.h> /* INFRINGES ON USER NAME SPACE */
#    define alloca _alloca
#   else
#    define YYSTACK_ALLOC alloca
#    if ! defined _ALLOCA_H && ! defined EXIT_SUCCESS
#     include <stdlib.h> /* INFRINGES ON USER NAME SPACE */
      /* Use EXIT_SUCCESS as a witness for stdlib.h.  */
#     ifndef EXIT_SUCCESS
#      define EXIT_SUCCESS 0
#     endif
#    endif
#   endif
#  endif
# endif

# ifdef YYSTACK_ALLOC
   /* Pacify GCC's 'empty if-body' warning.  */
#  define YYSTACK_FREE(Ptr) do { /* empty */; } while (0)
#  ifndef YYSTACK_ALLOC_MAXIMUM
    /* The OS might guarantee only one guard page at the bottom of the stack,
       and a page size can be as small as 4096 bytes.  So we cannot safely
       invoke alloca (N) if N exceeds 4096.  Use a slightly smaller number
       to allow for a few compiler-allocated temporary stack slots.  */
#   define YYSTACK_ALLOC_MAXIMUM 4032 /* reasonable circa 2006 */
#  endif
# else
#  define YYSTACK_ALLOC YYMALLOC
#  define YYSTACK_FREE YYFREE
#  ifndef YYSTACK_ALLOC_MAXIMUM
#   define YYSTACK_ALLOC_MAXIMUM YYSIZE_MAXIMUM
#  endif
#  if (defined __cplusplus && ! defined EXIT_SUCCESS \
       && ! ((defined YYMALLOC || defined malloc) \
             && (defined YYFREE || defined free)))
#   include <stdlib.h> /* INFRINGES ON USER NAME SPACE */
#   ifndef EXIT_SUCCESS
#    define EXIT_SUCCESS 0
#   endif
#  endif
#  ifndef YYMALLOC
#   define YYMALLOC malloc
#   if ! defined malloc && ! defined EXIT_SUCCESS
void *malloc (YYSIZE_T); /* INFRINGES ON USER NAME SPACE */
#   endif
#  endif
#  ifndef YYFREE
#   define YYFREE free
#   if ! defined free && ! defined EXIT_SUCCESS
void free (void *); /* INFRINGES ON USER NAME SPACE */
#   endif
#  endif
# endif
#endif /* 1 */

#if (! defined yyoverflow \
     && (! defined __cplusplus \
         || (defined YYLTYPE_IS_TRIVIAL && YYLTYPE_IS_TRIVIAL \
             && defined YYSTYPE_IS_TRIVIAL && YYSTYPE_IS_TRIVIAL)))

/* A type that is properly aligned for any stack member.  */
union yyalloc
{
  yy_state_t yyss_alloc;
  YYSTYPE yyvs_alloc;
  YYLTYPE yyls_alloc;
};

/* The size of the maximum gap between one aligned stack and the next.  */
# define YYSTACK_GAP_MAXIMUM (YYSIZEOF (union yyalloc) - 1)

/* The size of an array large to enough to hold all stacks, each with
   N elements.  */
# define YYSTACK_BYTES(N) \
     ((N) * (YYSIZEOF (yy_state_t) + YYSIZEOF (YYSTYPE) \
             + YYSIZEOF (YYLTYPE)) \
      + 2 * YYSTACK_GAP_MAXIMUM)

# define YYCOPY_NEEDED 1

/* Relocate STACK from its old location to the new one.  The
   local variables YYSIZE and YYSTACKSIZE give the old and new number of
   elements in the stack, and YYPTR gives the new location of the
   stack.  Advance YYPTR to a properly aligned location for the next
   stack.  */
# define YYSTACK_RELOCATE(Stack_alloc, Stack)                           \
    do                                                                  \
      {                                                                 \
        YYPTRDIFF_T yynewbytes;                                         \
        YYCOPY (&yyptr->Stack_alloc, Stack, yysize);                    \
        Stack = &yyptr->Stack_alloc;                                    \
        yynewbytes = yystacksize * YYSIZEOF (*Stack) + YYSTACK_GAP_MAXIMUM; \
        yyptr += yynewbytes / YYSIZEOF (*yyptr);                        \
      }                                                                 \
    while (0)

#endif

#if defined YYCOPY_NEEDED && YYCOPY_NEEDED
/* Copy COUNT objects from SRC to DST.  The source and destination do
   not overlap.  */
# ifndef YYCOPY
#  if defined __GNUC__ && 1 < __GNUC__
#   define YYCOPY(Dst, Src, Count) \
      __builtin_memcpy (Dst, Src, YY_CAST (YYSIZE_T, (Count)) * sizeof (*(Src)))
#  else
#   define YYCOPY(Dst, Src, Count)              \
      do                                        \
        {                                       \
          YYPTRDIFF_T yyi;                      \
          for (yyi = 0; yyi < (Count); yyi++)   \
            (Dst)[yyi] = (Src)[yyi];            \
        }                                       \
      while (0)
#  endif
# endif
#endif /* !YYCOPY_NEEDED */

/* YYFINAL -- State number of the termination state.  */
#define YYFINAL  17
/* YYLAST -- Last index in YYTABLE.  */
#define YYLAST   203

/* YYNTOKENS -- Number of terminals.  */
#define YYNTOKENS  58
/* YYNNTS -- Number of nonterminals.  */
#define YYNNTS  67
/* YYNRULES -- Number of rules.  */
#define YYNRULES  133
/* YYNSTATES -- Number of states.  */
#define YYNSTATES  232

/* YYMAXUTOK -- Last valid token kind.  */
#define YYMAXUTOK   312


/* YYTRANSLATE(TOKEN-NUM) -- Symbol number corresponding to TOKEN-NUM
   as returned by yylex, with out-of-bounds checking.  */
#define YYTRANSLATE(YYX)                                \
  (0 <= (YYX) && (YYX) <= YYMAXUTOK                     \
   ? YY_CAST (yysymbol_kind_t, yytranslate[YYX])        \
   : YYSYMBOL_YYUNDEF)

/* YYTRANSLATE[TOKEN-NUM] -- Symbol number corresponding to TOKEN-NUM
   as returned by yylex.  */
static const yytype_int8 yytranslate[] =
{
       0,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     1,     2,     3,     4,
       5,     6,     7,     8,     9,    10,    11,    12,    13,    14,
      15,    16,    17,    18,    19,    20,    21,    22,    23,    24,
      25,    26,    27,    28,    29,    30,    31,    32,    33,    34,
      35,    36,    37,    38,    39,    40,    41,    42,    43,    44,
      45,    46,    47,    48,    49,    50,    51,    52,    53,    54,
      55,    56,    57
};

#if YYDEBUG
/* YYRLINE[YYN] -- Source line where rule number YYN was defined.  */
static const yytype_int16 yyrline[] =
{
       0,    80,    80,    84,    85,    89,    90,    91,    92,    96,
     100,   101,   107,   108,   109,   110,   111,   112,   118,   122,
     123,   127,   128,   132,   136,   140,   141,   145,   149,   150,
     156,   160,   161,   165,   166,   170,   171,   175,   181,   185,
     189,   190,   196,   197,   198,   199,   200,   201,   202,   203,
     204,   205,   211,   217,   219,   218,   229,   230,   236,   240,
     241,   245,   249,   253,   257,   258,   262,   268,   272,   273,
     277,   278,   284,   288,   289,   293,   297,   298,   302,   306,
     307,   311,   312,   316,   320,   321,   325,   326,   327,   328,
     332,   336,   337,   341,   342,   346,   350,   351,   355,   356,
     357,   361,   362,   363,   369,   373,   374,   378,   379,   380,
     386,   387,   388,   389,   390,   391,   392,   393,   394,   395,
     396,   397,   403,   407,   408,   412,   413,   419,   423,   424,
     428,   429,   433,   439
};
#endif

/** Accessing symbol of state STATE.  */
#define YY_ACCESSING_SYMBOL(State) YY_CAST (yysymbol_kind_t, yystos[State])

#if 1
/* The user-facing name of the symbol whose (internal) number is
   YYSYMBOL.  No bounds checking.  */
static const char *yysymbol_name (yysymbol_kind_t yysymbol) YY_ATTRIBUTE_UNUSED;

static const char *
yysymbol_name (yysymbol_kind_t yysymbol)
{
  static const char *const yy_sname[] =
  {
  "end of file", "error", "invalid token", "VAR", "CONST", "FUNC",
  "WORKFLOW", "CALL", "RETURN", "IF", "ELSE", "WHILE", "FOR", "IN",
  "BREAK", "CONTINUE", "STOP", "ABORT", "RUN", "TRUE", "FALSE",
  "NULL_LITERAL", "TYPE_INT", "TYPE_FLOAT", "TYPE_STRING", "TYPE_BOOL",
  "TYPE_OBJECT", "TYPE_LIST", "LPAREN", "RPAREN", "LBRACE", "RBRACE",
  "LBRACKET", "RBRACKET", "COMMA", "COLON", "SEMICOLON", "DOT", "ASSIGN",
  "EQ", "NEQ", "LT", "GT", "LTE", "GTE", "PLUS", "MINUS", "MUL", "DIV",
  "MOD", "AND", "OR", "NOT", "IDENTIFIER", "STRING_LITERAL", "INT_LITERAL",
  "FLOAT_LITERAL", "ERRO_LEXICO", "$accept", "programa", "globais",
  "elemento_global", "bloco", "comandos", "tipo", "declaracao_var",
  "declaracao_var_resto", "inicializacao_opcional", "declaracao_const",
  "lista_identificadores", "lista_identificadores_resto",
  "lista_expressoes", "lista_expressoes_resto", "funcao", "tipo_retorno",
  "parametros_opcionais", "parametros_resto", "parametro", "workflow",
  "chamada_workflow", "argumentos_opcionais", "comando",
  "comando_expressao", "resto_comando_expressao", "$@1", "alvos_resto",
  "comando_if", "else_opcional", "comando_while", "comando_for",
  "comando_return", "valor_retorno", "comando_break", "comando_continue",
  "continue_resto", "comando_erro", "expressao", "expressao_or_resto",
  "expressao_and", "expressao_and_resto", "expressao_igualdade",
  "expressao_igualdade_resto", "operador_igualdade",
  "expressao_relacional", "expressao_relacional_resto",
  "operador_relacional", "expressao_aditiva", "expressao_aditiva_resto",
  "operador_aditivo", "expressao_multiplicativa",
  "expressao_multiplicativa_resto", "operador_multiplicativo",
  "expressao_unaria", "expressao_posfixa", "sufixos", "sufixo", "primaria",
  "lista", "elementos_lista", "elementos_lista_resto", "literal_object",
  "campos_object", "campos_object_resto", "campo_object", "run", YY_NULLPTR
  };
  return yy_sname[yysymbol];
}
#endif

#define YYPACT_NINF (-154)

#define yypact_value_is_default(Yyn) \
  ((Yyn) == YYPACT_NINF)

#define YYTABLE_NINF (-1)

#define yytable_value_is_error(Yyn) \
  0

/* YYPACT[STATE-NUM] -- Index in YYTABLE of the portion describing
   STATE-NUM.  */
static const yytype_int16 yypact[] =
{
      42,   -43,   -43,   -35,   -10,    54,  -154,    42,  -154,  -154,
    -154,  -154,    22,    17,    27,    35,    47,  -154,  -154,    15,
    -154,    81,    46,    41,    81,    34,    34,    22,  -154,  -154,
    -154,  -154,  -154,    48,    52,    43,    63,  -154,  -154,  -154,
      46,    44,    46,    46,    46,  -154,  -154,  -154,  -154,  -154,
    -154,    61,    58,    60,    -1,    38,    40,   -19,  -154,     4,
    -154,  -154,  -154,  -154,    73,    77,    84,    80,    86,  -154,
      81,    46,  -154,    88,  -154,    89,    82,    90,    85,    92,
      87,  -154,  -154,    46,  -154,    46,  -154,    46,  -154,  -154,
    -154,  -154,    46,  -154,  -154,  -154,  -154,  -154,    46,  -154,
    -154,  -154,    46,  -154,  -154,  -154,  -154,    46,    46,    46,
      69,  -154,     4,    46,    81,    93,    34,  -154,    93,    91,
    -154,    46,  -154,    46,  -154,    44,  -154,    46,  -154,  -154,
      61,    58,    60,    -1,    38,    40,   -19,  -154,    94,    96,
    -154,  -154,    95,  -154,    81,    97,    80,    97,  -154,   101,
    -154,  -154,  -154,  -154,  -154,  -154,  -154,  -154,  -154,  -154,
    -154,  -154,  -154,  -154,     5,  -154,  -154,  -154,  -154,    46,
     104,   106,    83,    99,    -2,   128,   129,   108,  -154,  -154,
       5,  -154,  -154,  -154,  -154,  -154,  -154,  -154,  -154,     6,
    -154,   107,    46,    46,   127,  -154,    98,  -154,  -154,   102,
     103,  -154,  -154,    46,  -154,  -154,   110,  -154,   113,   115,
      46,   109,   114,   116,   112,  -154,    97,    97,    97,  -154,
    -154,  -154,  -154,    46,   139,  -154,  -154,   121,    97,  -154,
    -154,  -154
};

/* YYDEFACT[STATE-NUM] -- Default reduction number in state STATE-NUM.
   Performed when YYTABLE does not specify something else to do.  Zero
   means the default is an error.  */
static const yytype_uint8 yydefact[] =
{
       4,     0,     0,     0,     0,     0,     2,     4,     5,     6,
       7,     8,    26,     0,     0,     0,     0,     1,     3,     0,
      24,     0,     0,     0,     0,    34,    34,    26,    12,    13,
      14,    15,    16,     0,    22,     0,     0,   113,   114,   115,
       0,   129,   124,     0,     0,   116,   112,   110,   111,    20,
     120,    29,    74,    77,    80,    85,    92,    97,   103,   106,
     117,   118,   119,    18,     0,     0,     0,    36,     0,    25,
       0,     0,    19,     0,   133,     0,     0,     0,   131,   126,
       0,   102,   101,     0,    27,     0,    72,     0,    75,    81,
      82,    78,     0,    87,    86,    89,    88,    83,     0,    93,
      94,    90,     0,    98,    99,   100,    95,     0,    41,     0,
       0,   104,   106,     0,     0,    32,     0,    33,    32,     0,
      21,    41,   121,     0,   127,   129,   128,   124,   123,   122,
      29,    74,    77,    80,    85,    92,    97,    40,     0,     0,
     107,   105,     0,    37,     0,     0,    36,     0,    17,     0,
     132,   130,   125,    28,    73,    76,    79,    84,    91,    96,
     109,   108,    23,    31,    11,    30,    35,    38,    39,    65,
       0,     0,     0,     0,     0,     0,     0,     0,    42,    43,
      11,    51,    44,    45,    46,    47,    48,    49,    50,    57,
      64,     0,     0,     0,     0,    66,     0,    68,    67,     0,
       0,     9,    10,     0,    53,    52,     0,    63,     0,     0,
       0,     0,     0,     0,    57,    54,     0,     0,     0,    69,
      70,    71,    56,     0,    60,    61,    62,     0,     0,    58,
      55,    59
};

/* YYPGOTO[NTERM-NUM].  */
static const yytype_int16 yypgoto[] =
{
    -154,  -154,   151,  -154,  -145,   -21,   -20,  -153,  -154,  -154,
    -149,   158,   134,   -22,    32,  -154,    45,   140,    19,    51,
    -154,  -154,    49,  -154,  -154,  -154,  -154,   -46,  -154,  -154,
    -154,  -154,  -154,  -154,  -154,  -154,  -154,  -154,   -39,    50,
     100,    37,   105,    39,  -154,   111,    53,  -154,    75,    55,
    -154,    72,    57,  -154,   -38,  -154,    64,  -154,  -154,  -154,
      56,  -154,   141,    59,  -154,  -154,  -154
};

/* YYDEFGOTO[NTERM-NUM].  */
static const yytype_uint8 yydefgoto[] =
{
       0,     5,     6,     7,   165,   177,    34,     8,    23,    72,
       9,    13,    20,   137,    84,    10,   145,    66,   117,    67,
      11,    50,   138,   180,   181,   205,   223,   206,   182,   229,
     183,   184,   185,   191,   186,   187,   198,   188,    51,    86,
      52,    88,    53,    91,    92,    54,    97,    98,    55,   101,
     102,    56,   106,   107,    57,    58,   111,   112,    59,    60,
      80,   128,    61,    77,   126,    78,    62
};

/* YYTABLE[YYPACT[STATE-NUM]] -- What to do in state STATE-NUM.  If
   positive, shift that token.  If negative, reduce the rule whose
   number is the opposite.  If YYTABLE_NINF, syntax error.  */
static const yytype_uint8 yytable[] =
{
      49,    75,   167,    79,    64,    81,    82,   196,     1,     2,
      12,   178,    35,   169,   170,   179,   171,   172,    15,   173,
     174,   175,   176,    36,    37,    38,    39,   178,   103,   104,
     105,   179,   108,    40,   197,    41,   109,    42,    89,    90,
     203,   110,   204,    16,   130,     1,     2,     3,     4,   120,
     119,    43,    21,    35,    17,    22,    19,    44,    45,    46,
      47,    48,    24,    25,    36,    37,    38,    39,    27,   136,
     139,   224,   225,   226,    40,    26,    41,    63,    42,    93,
      94,    95,    96,   231,   150,    99,   100,    65,    79,    70,
      71,   142,    43,    41,   143,    83,    73,    76,    44,    45,
      46,    47,    48,    28,    29,    30,    31,    32,    33,    85,
      87,   113,   114,   115,   116,   118,   121,   123,   122,   125,
     129,   124,   140,   160,   163,   189,   127,   164,   144,   161,
     168,   162,   192,   148,   193,   195,   194,   199,   200,   201,
     210,   189,   216,   207,   217,   219,   203,   190,   215,   228,
     220,   211,   221,   208,   209,   212,   213,   230,    18,   202,
      14,    69,   153,   147,   214,   166,    68,   146,   222,   155,
     149,   218,   156,   134,   135,     0,   141,    74,     0,     0,
       0,   154,     0,   152,   151,   131,     0,   157,     0,     0,
     158,     0,   132,   159,     0,     0,     0,     0,     0,     0,
       0,   227,     0,   133
};

static const yytype_int16 yycheck[] =
{
      22,    40,   147,    42,    24,    43,    44,     9,     3,     4,
      53,   164,     7,     8,     9,   164,    11,    12,    53,    14,
      15,    16,    17,    18,    19,    20,    21,   180,    47,    48,
      49,   180,    28,    28,    36,    30,    32,    32,    39,    40,
      34,    37,    36,    53,    83,     3,     4,     5,     6,    71,
      70,    46,    35,     7,     0,    38,    34,    52,    53,    54,
      55,    56,    35,    28,    18,    19,    20,    21,    53,   107,
     109,   216,   217,   218,    28,    28,    30,    36,    32,    41,
      42,    43,    44,   228,   123,    45,    46,    53,   127,    41,
      38,   113,    46,    30,   114,    34,    53,    53,    52,    53,
      54,    55,    56,    22,    23,    24,    25,    26,    27,    51,
      50,    38,    35,    29,    34,    29,    28,    35,    29,    34,
      33,    31,    53,    29,   144,   164,    34,    30,    35,    33,
      29,    36,    28,    42,    28,    36,    53,     9,     9,    31,
      13,   180,    29,    36,    29,    36,    34,   169,    38,    10,
      36,    53,    36,   192,   193,    53,    53,    36,     7,   180,
       2,    27,   130,   118,   203,   146,    26,   116,   214,   132,
     121,   210,   133,    98,   102,    -1,   112,    36,    -1,    -1,
      -1,   131,    -1,   127,   125,    85,    -1,   134,    -1,    -1,
     135,    -1,    87,   136,    -1,    -1,    -1,    -1,    -1,    -1,
      -1,   223,    -1,    92
};

/* YYSTOS[STATE-NUM] -- The symbol kind of the accessing symbol of
   state STATE-NUM.  */
static const yytype_int8 yystos[] =
{
       0,     3,     4,     5,     6,    59,    60,    61,    65,    68,
      73,    78,    53,    69,    69,    53,    53,     0,    60,    34,
      70,    35,    38,    66,    35,    28,    28,    53,    22,    23,
      24,    25,    26,    27,    64,     7,    18,    19,    20,    21,
      28,    30,    32,    46,    52,    53,    54,    55,    56,    71,
      79,    96,    98,   100,   103,   106,   109,   112,   113,   116,
     117,   120,   124,    36,    64,    53,    75,    77,    75,    70,
      41,    38,    67,    53,   120,    96,    53,   121,   123,    96,
     118,   112,   112,    34,    72,    51,    97,    50,    99,    39,
      40,   101,   102,    41,    42,    43,    44,   104,   105,    45,
      46,   107,   108,    47,    48,    49,   110,   111,    28,    32,
      37,   114,   115,    38,    35,    29,    34,    76,    29,    64,
      71,    28,    29,    35,    31,    34,   122,    34,   119,    33,
      96,    98,   100,   103,   106,   109,   112,    71,    80,    96,
      53,   114,    71,    64,    35,    74,    77,    74,    42,    80,
      96,   121,   118,    72,    97,    99,   101,   104,   107,   110,
      29,    33,    36,    64,    30,    62,    76,    62,    29,     8,
       9,    11,    12,    14,    15,    16,    17,    63,    65,    68,
      81,    82,    86,    88,    89,    90,    92,    93,    95,    96,
      71,    91,    28,    28,    53,    36,     9,    36,    94,     9,
       9,    31,    63,    34,    36,    83,    85,    36,    96,    96,
      13,    53,    53,    53,    96,    38,    29,    29,    96,    36,
      36,    36,    85,    84,    62,    62,    62,    71,    10,    87,
      36,    62
};

/* YYR1[RULE-NUM] -- Symbol kind of the left-hand side of rule RULE-NUM.  */
static const yytype_int8 yyr1[] =
{
       0,    58,    59,    60,    60,    61,    61,    61,    61,    62,
      63,    63,    64,    64,    64,    64,    64,    64,    65,    66,
      66,    67,    67,    68,    69,    70,    70,    71,    72,    72,
      73,    74,    74,    75,    75,    76,    76,    77,    78,    79,
      80,    80,    81,    81,    81,    81,    81,    81,    81,    81,
      81,    81,    82,    83,    84,    83,    85,    85,    86,    87,
      87,    88,    89,    90,    91,    91,    92,    93,    94,    94,
      95,    95,    96,    97,    97,    98,    99,    99,   100,   101,
     101,   102,   102,   103,   104,   104,   105,   105,   105,   105,
     106,   107,   107,   108,   108,   109,   110,   110,   111,   111,
     111,   112,   112,   112,   113,   114,   114,   115,   115,   115,
     116,   116,   116,   116,   116,   116,   116,   116,   116,   116,
     116,   116,   117,   118,   118,   119,   119,   120,   121,   121,
     122,   122,   123,   124
};

/* YYR2[RULE-NUM] -- Number of symbols on the right-hand side of rule RULE-NUM.  */
static const yytype_int8 yyr2[] =
{
       0,     2,     1,     2,     0,     1,     1,     1,     1,     3,
       2,     0,     1,     1,     1,     1,     1,     4,     4,     3,
       2,     2,     0,     7,     2,     3,     0,     2,     3,     0,
       7,     2,     0,     2,     0,     3,     0,     3,     7,     5,
       1,     0,     1,     1,     1,     1,     1,     1,     1,     1,
       1,     1,     2,     1,     0,     5,     3,     0,     6,     2,
       0,     5,     5,     3,     1,     0,     2,     2,     1,     3,
       4,     4,     2,     3,     0,     2,     3,     0,     2,     3,
       0,     1,     1,     2,     3,     0,     1,     1,     1,     1,
       2,     3,     0,     1,     1,     2,     3,     0,     1,     1,
       1,     2,     2,     1,     2,     2,     0,     2,     3,     3,
       1,     1,     1,     1,     1,     1,     1,     1,     1,     1,
       1,     3,     3,     2,     0,     2,     0,     3,     2,     0,
       2,     0,     3,     2
};


enum { YYENOMEM = -2 };

#define yyerrok         (yyerrstatus = 0)
#define yyclearin       (yychar = YYEMPTY)

#define YYACCEPT        goto yyacceptlab
#define YYABORT         goto yyabortlab
#define YYERROR         goto yyerrorlab
#define YYNOMEM         goto yyexhaustedlab


#define YYRECOVERING()  (!!yyerrstatus)

#define YYBACKUP(Token, Value)                                    \
  do                                                              \
    if (yychar == YYEMPTY)                                        \
      {                                                           \
        yychar = (Token);                                         \
        yylval = (Value);                                         \
        YYPOPSTACK (yylen);                                       \
        yystate = *yyssp;                                         \
        goto yybackup;                                            \
      }                                                           \
    else                                                          \
      {                                                           \
        yyerror (YY_("syntax error: cannot back up")); \
        YYERROR;                                                  \
      }                                                           \
  while (0)

/* Backward compatibility with an undocumented macro.
   Use YYerror or YYUNDEF. */
#define YYERRCODE YYUNDEF

/* YYLLOC_DEFAULT -- Set CURRENT to span from RHS[1] to RHS[N].
   If N is 0, then set CURRENT to the empty location which ends
   the previous symbol: RHS[0] (always defined).  */

#ifndef YYLLOC_DEFAULT
# define YYLLOC_DEFAULT(Current, Rhs, N)                                \
    do                                                                  \
      if (N)                                                            \
        {                                                               \
          (Current).first_line   = YYRHSLOC (Rhs, 1).first_line;        \
          (Current).first_column = YYRHSLOC (Rhs, 1).first_column;      \
          (Current).last_line    = YYRHSLOC (Rhs, N).last_line;         \
          (Current).last_column  = YYRHSLOC (Rhs, N).last_column;       \
        }                                                               \
      else                                                              \
        {                                                               \
          (Current).first_line   = (Current).last_line   =              \
            YYRHSLOC (Rhs, 0).last_line;                                \
          (Current).first_column = (Current).last_column =              \
            YYRHSLOC (Rhs, 0).last_column;                              \
        }                                                               \
    while (0)
#endif

#define YYRHSLOC(Rhs, K) ((Rhs)[K])


/* Enable debugging if requested.  */
#if YYDEBUG

# ifndef YYFPRINTF
#  include <stdio.h> /* INFRINGES ON USER NAME SPACE */
#  define YYFPRINTF fprintf
# endif

# define YYDPRINTF(Args)                        \
do {                                            \
  if (yydebug)                                  \
    YYFPRINTF Args;                             \
} while (0)


/* YYLOCATION_PRINT -- Print the location on the stream.
   This macro was not mandated originally: define only if we know
   we won't break user code: when these are the locations we know.  */

# ifndef YYLOCATION_PRINT

#  if defined YY_LOCATION_PRINT

   /* Temporary convenience wrapper in case some people defined the
      undocumented and private YY_LOCATION_PRINT macros.  */
#   define YYLOCATION_PRINT(File, Loc)  YY_LOCATION_PRINT(File, *(Loc))

#  elif defined YYLTYPE_IS_TRIVIAL && YYLTYPE_IS_TRIVIAL

/* Print *YYLOCP on YYO.  Private, do not rely on its existence. */

YY_ATTRIBUTE_UNUSED
static int
yy_location_print_ (FILE *yyo, YYLTYPE const * const yylocp)
{
  int res = 0;
  int end_col = 0 != yylocp->last_column ? yylocp->last_column - 1 : 0;
  if (0 <= yylocp->first_line)
    {
      res += YYFPRINTF (yyo, "%d", yylocp->first_line);
      if (0 <= yylocp->first_column)
        res += YYFPRINTF (yyo, ".%d", yylocp->first_column);
    }
  if (0 <= yylocp->last_line)
    {
      if (yylocp->first_line < yylocp->last_line)
        {
          res += YYFPRINTF (yyo, "-%d", yylocp->last_line);
          if (0 <= end_col)
            res += YYFPRINTF (yyo, ".%d", end_col);
        }
      else if (0 <= end_col && yylocp->first_column < end_col)
        res += YYFPRINTF (yyo, "-%d", end_col);
    }
  return res;
}

#   define YYLOCATION_PRINT  yy_location_print_

    /* Temporary convenience wrapper in case some people defined the
       undocumented and private YY_LOCATION_PRINT macros.  */
#   define YY_LOCATION_PRINT(File, Loc)  YYLOCATION_PRINT(File, &(Loc))

#  else

#   define YYLOCATION_PRINT(File, Loc) ((void) 0)
    /* Temporary convenience wrapper in case some people defined the
       undocumented and private YY_LOCATION_PRINT macros.  */
#   define YY_LOCATION_PRINT  YYLOCATION_PRINT

#  endif
# endif /* !defined YYLOCATION_PRINT */


# define YY_SYMBOL_PRINT(Title, Kind, Value, Location)                    \
do {                                                                      \
  if (yydebug)                                                            \
    {                                                                     \
      YYFPRINTF (stderr, "%s ", Title);                                   \
      yy_symbol_print (stderr,                                            \
                  Kind, Value, Location); \
      YYFPRINTF (stderr, "\n");                                           \
    }                                                                     \
} while (0)


/*-----------------------------------.
| Print this symbol's value on YYO.  |
`-----------------------------------*/

static void
yy_symbol_value_print (FILE *yyo,
                       yysymbol_kind_t yykind, YYSTYPE const * const yyvaluep, YYLTYPE const * const yylocationp)
{
  FILE *yyoutput = yyo;
  YY_USE (yyoutput);
  YY_USE (yylocationp);
  if (!yyvaluep)
    return;
  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  YY_USE (yykind);
  YY_IGNORE_MAYBE_UNINITIALIZED_END
}


/*---------------------------.
| Print this symbol on YYO.  |
`---------------------------*/

static void
yy_symbol_print (FILE *yyo,
                 yysymbol_kind_t yykind, YYSTYPE const * const yyvaluep, YYLTYPE const * const yylocationp)
{
  YYFPRINTF (yyo, "%s %s (",
             yykind < YYNTOKENS ? "token" : "nterm", yysymbol_name (yykind));

  YYLOCATION_PRINT (yyo, yylocationp);
  YYFPRINTF (yyo, ": ");
  yy_symbol_value_print (yyo, yykind, yyvaluep, yylocationp);
  YYFPRINTF (yyo, ")");
}

/*------------------------------------------------------------------.
| yy_stack_print -- Print the state stack from its BOTTOM up to its |
| TOP (included).                                                   |
`------------------------------------------------------------------*/

static void
yy_stack_print (yy_state_t *yybottom, yy_state_t *yytop)
{
  YYFPRINTF (stderr, "Stack now");
  for (; yybottom <= yytop; yybottom++)
    {
      int yybot = *yybottom;
      YYFPRINTF (stderr, " %d", yybot);
    }
  YYFPRINTF (stderr, "\n");
}

# define YY_STACK_PRINT(Bottom, Top)                            \
do {                                                            \
  if (yydebug)                                                  \
    yy_stack_print ((Bottom), (Top));                           \
} while (0)


/*------------------------------------------------.
| Report that the YYRULE is going to be reduced.  |
`------------------------------------------------*/

static void
yy_reduce_print (yy_state_t *yyssp, YYSTYPE *yyvsp, YYLTYPE *yylsp,
                 int yyrule)
{
  int yylno = yyrline[yyrule];
  int yynrhs = yyr2[yyrule];
  int yyi;
  YYFPRINTF (stderr, "Reducing stack by rule %d (line %d):\n",
             yyrule - 1, yylno);
  /* The symbols being reduced.  */
  for (yyi = 0; yyi < yynrhs; yyi++)
    {
      YYFPRINTF (stderr, "   $%d = ", yyi + 1);
      yy_symbol_print (stderr,
                       YY_ACCESSING_SYMBOL (+yyssp[yyi + 1 - yynrhs]),
                       &yyvsp[(yyi + 1) - (yynrhs)],
                       &(yylsp[(yyi + 1) - (yynrhs)]));
      YYFPRINTF (stderr, "\n");
    }
}

# define YY_REDUCE_PRINT(Rule)          \
do {                                    \
  if (yydebug)                          \
    yy_reduce_print (yyssp, yyvsp, yylsp, Rule); \
} while (0)

/* Nonzero means print parse trace.  It is left uninitialized so that
   multiple parsers can coexist.  */
int yydebug;
#else /* !YYDEBUG */
# define YYDPRINTF(Args) ((void) 0)
# define YY_SYMBOL_PRINT(Title, Kind, Value, Location)
# define YY_STACK_PRINT(Bottom, Top)
# define YY_REDUCE_PRINT(Rule)
#endif /* !YYDEBUG */


/* YYINITDEPTH -- initial size of the parser's stacks.  */
#ifndef YYINITDEPTH
# define YYINITDEPTH 200
#endif

/* YYMAXDEPTH -- maximum size the stacks can grow to (effective only
   if the built-in stack extension method is used).

   Do not make this value too large; the results are undefined if
   YYSTACK_ALLOC_MAXIMUM < YYSTACK_BYTES (YYMAXDEPTH)
   evaluated with infinite-precision integer arithmetic.  */

#ifndef YYMAXDEPTH
# define YYMAXDEPTH 10000
#endif


/* Context of a parse error.  */
typedef struct
{
  yy_state_t *yyssp;
  yysymbol_kind_t yytoken;
  YYLTYPE *yylloc;
} yypcontext_t;

/* Put in YYARG at most YYARGN of the expected tokens given the
   current YYCTX, and return the number of tokens stored in YYARG.  If
   YYARG is null, return the number of expected tokens (guaranteed to
   be less than YYNTOKENS).  Return YYENOMEM on memory exhaustion.
   Return 0 if there are more than YYARGN expected tokens, yet fill
   YYARG up to YYARGN. */
static int
yypcontext_expected_tokens (const yypcontext_t *yyctx,
                            yysymbol_kind_t yyarg[], int yyargn)
{
  /* Actual size of YYARG. */
  int yycount = 0;
  int yyn = yypact[+*yyctx->yyssp];
  if (!yypact_value_is_default (yyn))
    {
      /* Start YYX at -YYN if negative to avoid negative indexes in
         YYCHECK.  In other words, skip the first -YYN actions for
         this state because they are default actions.  */
      int yyxbegin = yyn < 0 ? -yyn : 0;
      /* Stay within bounds of both yycheck and yytname.  */
      int yychecklim = YYLAST - yyn + 1;
      int yyxend = yychecklim < YYNTOKENS ? yychecklim : YYNTOKENS;
      int yyx;
      for (yyx = yyxbegin; yyx < yyxend; ++yyx)
        if (yycheck[yyx + yyn] == yyx && yyx != YYSYMBOL_YYerror
            && !yytable_value_is_error (yytable[yyx + yyn]))
          {
            if (!yyarg)
              ++yycount;
            else if (yycount == yyargn)
              return 0;
            else
              yyarg[yycount++] = YY_CAST (yysymbol_kind_t, yyx);
          }
    }
  if (yyarg && yycount == 0 && 0 < yyargn)
    yyarg[0] = YYSYMBOL_YYEMPTY;
  return yycount;
}




/* The kind of the lookahead of this context.  */
static yysymbol_kind_t
yypcontext_token (const yypcontext_t *yyctx) YY_ATTRIBUTE_UNUSED;

static yysymbol_kind_t
yypcontext_token (const yypcontext_t *yyctx)
{
  return yyctx->yytoken;
}

/* The location of the lookahead of this context.  */
static YYLTYPE *
yypcontext_location (const yypcontext_t *yyctx) YY_ATTRIBUTE_UNUSED;

static YYLTYPE *
yypcontext_location (const yypcontext_t *yyctx)
{
  return yyctx->yylloc;
}

/* User defined function to report a syntax error.  */
static int
yyreport_syntax_error (const yypcontext_t *yyctx);

/*-----------------------------------------------.
| Release the memory associated to this symbol.  |
`-----------------------------------------------*/

static void
yydestruct (const char *yymsg,
            yysymbol_kind_t yykind, YYSTYPE *yyvaluep, YYLTYPE *yylocationp)
{
  YY_USE (yyvaluep);
  YY_USE (yylocationp);
  if (!yymsg)
    yymsg = "Deleting";
  YY_SYMBOL_PRINT (yymsg, yykind, yyvaluep, yylocationp);

  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  YY_USE (yykind);
  YY_IGNORE_MAYBE_UNINITIALIZED_END
}


/* Lookahead token kind.  */
int yychar;

/* The semantic value of the lookahead symbol.  */
YYSTYPE yylval;
/* Location data for the lookahead symbol.  */
YYLTYPE yylloc
# if defined YYLTYPE_IS_TRIVIAL && YYLTYPE_IS_TRIVIAL
  = { 1, 1, 1, 1 }
# endif
;
/* Number of syntax errors so far.  */
int yynerrs;




/*----------.
| yyparse.  |
`----------*/

int
yyparse (void)
{
    yy_state_fast_t yystate = 0;
    /* Number of tokens to shift before error messages enabled.  */
    int yyerrstatus = 0;

    /* Refer to the stacks through separate pointers, to allow yyoverflow
       to reallocate them elsewhere.  */

    /* Their size.  */
    YYPTRDIFF_T yystacksize = YYINITDEPTH;

    /* The state stack: array, bottom, top.  */
    yy_state_t yyssa[YYINITDEPTH];
    yy_state_t *yyss = yyssa;
    yy_state_t *yyssp = yyss;

    /* The semantic value stack: array, bottom, top.  */
    YYSTYPE yyvsa[YYINITDEPTH];
    YYSTYPE *yyvs = yyvsa;
    YYSTYPE *yyvsp = yyvs;

    /* The location stack: array, bottom, top.  */
    YYLTYPE yylsa[YYINITDEPTH];
    YYLTYPE *yyls = yylsa;
    YYLTYPE *yylsp = yyls;

  int yyn;
  /* The return value of yyparse.  */
  int yyresult;
  /* Lookahead symbol kind.  */
  yysymbol_kind_t yytoken = YYSYMBOL_YYEMPTY;
  /* The variables used to return semantic value and location from the
     action routines.  */
  YYSTYPE yyval;
  YYLTYPE yyloc;

  /* The locations where the error started and ended.  */
  YYLTYPE yyerror_range[3];



#define YYPOPSTACK(N)   (yyvsp -= (N), yyssp -= (N), yylsp -= (N))

  /* The number of symbols on the RHS of the reduced rule.
     Keep to zero when no symbol should be popped.  */
  int yylen = 0;

  YYDPRINTF ((stderr, "Starting parse\n"));

  yychar = YYEMPTY; /* Cause a token to be read.  */

  yylsp[0] = yylloc;
  goto yysetstate;


/*------------------------------------------------------------.
| yynewstate -- push a new state, which is found in yystate.  |
`------------------------------------------------------------*/
yynewstate:
  /* In all cases, when you get here, the value and location stacks
     have just been pushed.  So pushing a state here evens the stacks.  */
  yyssp++;


/*--------------------------------------------------------------------.
| yysetstate -- set current state (the top of the stack) to yystate.  |
`--------------------------------------------------------------------*/
yysetstate:
  YYDPRINTF ((stderr, "Entering state %d\n", yystate));
  YY_ASSERT (0 <= yystate && yystate < YYNSTATES);
  YY_IGNORE_USELESS_CAST_BEGIN
  *yyssp = YY_CAST (yy_state_t, yystate);
  YY_IGNORE_USELESS_CAST_END
  YY_STACK_PRINT (yyss, yyssp);

  if (yyss + yystacksize - 1 <= yyssp)
#if !defined yyoverflow && !defined YYSTACK_RELOCATE
    YYNOMEM;
#else
    {
      /* Get the current used size of the three stacks, in elements.  */
      YYPTRDIFF_T yysize = yyssp - yyss + 1;

# if defined yyoverflow
      {
        /* Give user a chance to reallocate the stack.  Use copies of
           these so that the &'s don't force the real ones into
           memory.  */
        yy_state_t *yyss1 = yyss;
        YYSTYPE *yyvs1 = yyvs;
        YYLTYPE *yyls1 = yyls;

        /* Each stack pointer address is followed by the size of the
           data in use in that stack, in bytes.  This used to be a
           conditional around just the two extra args, but that might
           be undefined if yyoverflow is a macro.  */
        yyoverflow (YY_("memory exhausted"),
                    &yyss1, yysize * YYSIZEOF (*yyssp),
                    &yyvs1, yysize * YYSIZEOF (*yyvsp),
                    &yyls1, yysize * YYSIZEOF (*yylsp),
                    &yystacksize);
        yyss = yyss1;
        yyvs = yyvs1;
        yyls = yyls1;
      }
# else /* defined YYSTACK_RELOCATE */
      /* Extend the stack our own way.  */
      if (YYMAXDEPTH <= yystacksize)
        YYNOMEM;
      yystacksize *= 2;
      if (YYMAXDEPTH < yystacksize)
        yystacksize = YYMAXDEPTH;

      {
        yy_state_t *yyss1 = yyss;
        union yyalloc *yyptr =
          YY_CAST (union yyalloc *,
                   YYSTACK_ALLOC (YY_CAST (YYSIZE_T, YYSTACK_BYTES (yystacksize))));
        if (! yyptr)
          YYNOMEM;
        YYSTACK_RELOCATE (yyss_alloc, yyss);
        YYSTACK_RELOCATE (yyvs_alloc, yyvs);
        YYSTACK_RELOCATE (yyls_alloc, yyls);
#  undef YYSTACK_RELOCATE
        if (yyss1 != yyssa)
          YYSTACK_FREE (yyss1);
      }
# endif

      yyssp = yyss + yysize - 1;
      yyvsp = yyvs + yysize - 1;
      yylsp = yyls + yysize - 1;

      YY_IGNORE_USELESS_CAST_BEGIN
      YYDPRINTF ((stderr, "Stack size increased to %ld\n",
                  YY_CAST (long, yystacksize)));
      YY_IGNORE_USELESS_CAST_END

      if (yyss + yystacksize - 1 <= yyssp)
        YYABORT;
    }
#endif /* !defined yyoverflow && !defined YYSTACK_RELOCATE */


  if (yystate == YYFINAL)
    YYACCEPT;

  goto yybackup;


/*-----------.
| yybackup.  |
`-----------*/
yybackup:
  /* Do appropriate processing given the current state.  Read a
     lookahead token if we need one and don't already have one.  */

  /* First try to decide what to do without reference to lookahead token.  */
  yyn = yypact[yystate];
  if (yypact_value_is_default (yyn))
    goto yydefault;

  /* Not known => get a lookahead token if don't already have one.  */

  /* YYCHAR is either empty, or end-of-input, or a valid lookahead.  */
  if (yychar == YYEMPTY)
    {
      YYDPRINTF ((stderr, "Reading a token\n"));
      yychar = yylex ();
    }

  if (yychar <= YYEOF)
    {
      yychar = YYEOF;
      yytoken = YYSYMBOL_YYEOF;
      YYDPRINTF ((stderr, "Now at end of input.\n"));
    }
  else if (yychar == YYerror)
    {
      /* The scanner already issued an error message, process directly
         to error recovery.  But do not keep the error token as
         lookahead, it is too special and may lead us to an endless
         loop in error recovery. */
      yychar = YYUNDEF;
      yytoken = YYSYMBOL_YYerror;
      yyerror_range[1] = yylloc;
      goto yyerrlab1;
    }
  else
    {
      yytoken = YYTRANSLATE (yychar);
      YY_SYMBOL_PRINT ("Next token is", yytoken, &yylval, &yylloc);
    }

  /* If the proper action on seeing token YYTOKEN is to reduce or to
     detect an error, take that action.  */
  yyn += yytoken;
  if (yyn < 0 || YYLAST < yyn || yycheck[yyn] != yytoken)
    goto yydefault;
  yyn = yytable[yyn];
  if (yyn <= 0)
    {
      if (yytable_value_is_error (yyn))
        goto yyerrlab;
      yyn = -yyn;
      goto yyreduce;
    }

  /* Count tokens shifted since error; after three, turn off error
     status.  */
  if (yyerrstatus)
    yyerrstatus--;

  /* Shift the lookahead token.  */
  YY_SYMBOL_PRINT ("Shifting", yytoken, &yylval, &yylloc);
  yystate = yyn;
  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  *++yyvsp = yylval;
  YY_IGNORE_MAYBE_UNINITIALIZED_END
  *++yylsp = yylloc;

  /* Discard the shifted token.  */
  yychar = YYEMPTY;
  goto yynewstate;


/*-----------------------------------------------------------.
| yydefault -- do the default action for the current state.  |
`-----------------------------------------------------------*/
yydefault:
  yyn = yydefact[yystate];
  if (yyn == 0)
    goto yyerrlab;
  goto yyreduce;


/*-----------------------------.
| yyreduce -- do a reduction.  |
`-----------------------------*/
yyreduce:
  /* yyn is the number of a rule to reduce with.  */
  yylen = yyr2[yyn];

  /* If YYLEN is nonzero, implement the default value of the action:
     '$$ = $1'.

     Otherwise, the following line sets YYVAL to garbage.
     This behavior is undocumented and Bison
     users should not rely upon it.  Assigning to YYVAL
     unconditionally makes the parser a bit smaller, and it avoids a
     GCC warning that YYVAL may be used uninitialized.  */
  yyval = yyvsp[1-yylen];

  /* Default location. */
  YYLLOC_DEFAULT (yyloc, (yylsp - yylen), yylen);
  yyerror_range[1] = yyloc;
  YY_REDUCE_PRINT (yyn);
  switch (yyn)
    {
  case 54: /* $@1: %empty  */
#line 219 "src/parser.y"
      {
        if (!(yyvsp[-2].flag) || !(yyvsp[-1].flag)) {
            erro_atribuicao(&(yylsp[0]));
            YYABORT;
        }
      }
#line 1566 "build/parser.c"
    break;

  case 56: /* alvos_resto: COMMA expressao alvos_resto  */
#line 229 "src/parser.y"
                                  { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1572 "build/parser.c"
    break;

  case 57: /* alvos_resto: %empty  */
#line 230 "src/parser.y"
                                  { (yyval.flag) = 1; }
#line 1578 "build/parser.c"
    break;

  case 72: /* expressao: expressao_and expressao_or_resto  */
#line 284 "src/parser.y"
                                       { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1584 "build/parser.c"
    break;

  case 73: /* expressao_or_resto: OR expressao_and expressao_or_resto  */
#line 288 "src/parser.y"
                                          { (yyval.flag) = 0; }
#line 1590 "build/parser.c"
    break;

  case 74: /* expressao_or_resto: %empty  */
#line 289 "src/parser.y"
                                          { (yyval.flag) = 1; }
#line 1596 "build/parser.c"
    break;

  case 75: /* expressao_and: expressao_igualdade expressao_and_resto  */
#line 293 "src/parser.y"
                                              { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1602 "build/parser.c"
    break;

  case 76: /* expressao_and_resto: AND expressao_igualdade expressao_and_resto  */
#line 297 "src/parser.y"
                                                  { (yyval.flag) = 0; }
#line 1608 "build/parser.c"
    break;

  case 77: /* expressao_and_resto: %empty  */
#line 298 "src/parser.y"
                                                  { (yyval.flag) = 1; }
#line 1614 "build/parser.c"
    break;

  case 78: /* expressao_igualdade: expressao_relacional expressao_igualdade_resto  */
#line 302 "src/parser.y"
                                                     { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1620 "build/parser.c"
    break;

  case 79: /* expressao_igualdade_resto: operador_igualdade expressao_relacional expressao_igualdade_resto  */
#line 306 "src/parser.y"
                                                                        { (yyval.flag) = 0; }
#line 1626 "build/parser.c"
    break;

  case 80: /* expressao_igualdade_resto: %empty  */
#line 307 "src/parser.y"
                                                                        { (yyval.flag) = 1; }
#line 1632 "build/parser.c"
    break;

  case 83: /* expressao_relacional: expressao_aditiva expressao_relacional_resto  */
#line 316 "src/parser.y"
                                                   { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1638 "build/parser.c"
    break;

  case 84: /* expressao_relacional_resto: operador_relacional expressao_aditiva expressao_relacional_resto  */
#line 320 "src/parser.y"
                                                                       { (yyval.flag) = 0; }
#line 1644 "build/parser.c"
    break;

  case 85: /* expressao_relacional_resto: %empty  */
#line 321 "src/parser.y"
                                                                       { (yyval.flag) = 1; }
#line 1650 "build/parser.c"
    break;

  case 90: /* expressao_aditiva: expressao_multiplicativa expressao_aditiva_resto  */
#line 332 "src/parser.y"
                                                       { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1656 "build/parser.c"
    break;

  case 91: /* expressao_aditiva_resto: operador_aditivo expressao_multiplicativa expressao_aditiva_resto  */
#line 336 "src/parser.y"
                                                                        { (yyval.flag) = 0; }
#line 1662 "build/parser.c"
    break;

  case 92: /* expressao_aditiva_resto: %empty  */
#line 337 "src/parser.y"
                                                                        { (yyval.flag) = 1; }
#line 1668 "build/parser.c"
    break;

  case 95: /* expressao_multiplicativa: expressao_unaria expressao_multiplicativa_resto  */
#line 346 "src/parser.y"
                                                      { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1674 "build/parser.c"
    break;

  case 96: /* expressao_multiplicativa_resto: operador_multiplicativo expressao_unaria expressao_multiplicativa_resto  */
#line 350 "src/parser.y"
                                                                              { (yyval.flag) = 0; }
#line 1680 "build/parser.c"
    break;

  case 97: /* expressao_multiplicativa_resto: %empty  */
#line 351 "src/parser.y"
                                                                              { (yyval.flag) = 1; }
#line 1686 "build/parser.c"
    break;

  case 101: /* expressao_unaria: NOT expressao_unaria  */
#line 361 "src/parser.y"
                             { (yyval.flag) = 0; }
#line 1692 "build/parser.c"
    break;

  case 102: /* expressao_unaria: MINUS expressao_unaria  */
#line 362 "src/parser.y"
                             { (yyval.flag) = 0; }
#line 1698 "build/parser.c"
    break;

  case 103: /* expressao_unaria: expressao_posfixa  */
#line 363 "src/parser.y"
                             { (yyval.flag) = (yyvsp[0].flag); }
#line 1704 "build/parser.c"
    break;

  case 104: /* expressao_posfixa: primaria sufixos  */
#line 369 "src/parser.y"
                       { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1710 "build/parser.c"
    break;

  case 105: /* sufixos: sufixo sufixos  */
#line 373 "src/parser.y"
                     { (yyval.flag) = (yyvsp[-1].flag) && (yyvsp[0].flag); }
#line 1716 "build/parser.c"
    break;

  case 106: /* sufixos: %empty  */
#line 374 "src/parser.y"
                     { (yyval.flag) = 1; }
#line 1722 "build/parser.c"
    break;

  case 107: /* sufixo: DOT IDENTIFIER  */
#line 378 "src/parser.y"
                                                { (yyval.flag) = 1; }
#line 1728 "build/parser.c"
    break;

  case 108: /* sufixo: LBRACKET expressao RBRACKET  */
#line 379 "src/parser.y"
                                                { (yyval.flag) = 1; }
#line 1734 "build/parser.c"
    break;

  case 109: /* sufixo: LPAREN argumentos_opcionais RPAREN  */
#line 380 "src/parser.y"
                                                { (yyval.flag) = 0; }
#line 1740 "build/parser.c"
    break;

  case 110: /* primaria: INT_LITERAL  */
#line 386 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1746 "build/parser.c"
    break;

  case 111: /* primaria: FLOAT_LITERAL  */
#line 387 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1752 "build/parser.c"
    break;

  case 112: /* primaria: STRING_LITERAL  */
#line 388 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1758 "build/parser.c"
    break;

  case 113: /* primaria: TRUE  */
#line 389 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1764 "build/parser.c"
    break;

  case 114: /* primaria: FALSE  */
#line 390 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1770 "build/parser.c"
    break;

  case 115: /* primaria: NULL_LITERAL  */
#line 391 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1776 "build/parser.c"
    break;

  case 116: /* primaria: IDENTIFIER  */
#line 392 "src/parser.y"
                               { (yyval.flag) = 1; }
#line 1782 "build/parser.c"
    break;

  case 117: /* primaria: lista  */
#line 393 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1788 "build/parser.c"
    break;

  case 118: /* primaria: literal_object  */
#line 394 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1794 "build/parser.c"
    break;

  case 119: /* primaria: run  */
#line 395 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1800 "build/parser.c"
    break;

  case 120: /* primaria: chamada_workflow  */
#line 396 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1806 "build/parser.c"
    break;

  case 121: /* primaria: LPAREN expressao RPAREN  */
#line 397 "src/parser.y"
                               { (yyval.flag) = 0; }
#line 1812 "build/parser.c"
    break;


#line 1816 "build/parser.c"

      default: break;
    }
  /* User semantic actions sometimes alter yychar, and that requires
     that yytoken be updated with the new translation.  We take the
     approach of translating immediately before every use of yytoken.
     One alternative is translating here after every semantic action,
     but that translation would be missed if the semantic action invokes
     YYABORT, YYACCEPT, or YYERROR immediately after altering yychar or
     if it invokes YYBACKUP.  In the case of YYABORT or YYACCEPT, an
     incorrect destructor might then be invoked immediately.  In the
     case of YYERROR or YYBACKUP, subsequent parser actions might lead
     to an incorrect destructor call or verbose syntax error message
     before the lookahead is translated.  */
  YY_SYMBOL_PRINT ("-> $$ =", YY_CAST (yysymbol_kind_t, yyr1[yyn]), &yyval, &yyloc);

  YYPOPSTACK (yylen);
  yylen = 0;

  *++yyvsp = yyval;
  *++yylsp = yyloc;

  /* Now 'shift' the result of the reduction.  Determine what state
     that goes to, based on the state we popped back to and the rule
     number reduced by.  */
  {
    const int yylhs = yyr1[yyn] - YYNTOKENS;
    const int yyi = yypgoto[yylhs] + *yyssp;
    yystate = (0 <= yyi && yyi <= YYLAST && yycheck[yyi] == *yyssp
               ? yytable[yyi]
               : yydefgoto[yylhs]);
  }

  goto yynewstate;


/*--------------------------------------.
| yyerrlab -- here on detecting error.  |
`--------------------------------------*/
yyerrlab:
  /* Make sure we have latest lookahead translation.  See comments at
     user semantic actions for why this is necessary.  */
  yytoken = yychar == YYEMPTY ? YYSYMBOL_YYEMPTY : YYTRANSLATE (yychar);
  /* If not already recovering from an error, report this error.  */
  if (!yyerrstatus)
    {
      ++yynerrs;
      {
        yypcontext_t yyctx
          = {yyssp, yytoken, &yylloc};
        if (yyreport_syntax_error (&yyctx) == 2)
          YYNOMEM;
      }
    }

  yyerror_range[1] = yylloc;
  if (yyerrstatus == 3)
    {
      /* If just tried and failed to reuse lookahead token after an
         error, discard it.  */

      if (yychar <= YYEOF)
        {
          /* Return failure if at end of input.  */
          if (yychar == YYEOF)
            YYABORT;
        }
      else
        {
          yydestruct ("Error: discarding",
                      yytoken, &yylval, &yylloc);
          yychar = YYEMPTY;
        }
    }

  /* Else will try to reuse lookahead token after shifting the error
     token.  */
  goto yyerrlab1;


/*---------------------------------------------------.
| yyerrorlab -- error raised explicitly by YYERROR.  |
`---------------------------------------------------*/
yyerrorlab:
  /* Pacify compilers when the user code never invokes YYERROR and the
     label yyerrorlab therefore never appears in user code.  */
  if (0)
    YYERROR;
  ++yynerrs;

  /* Do not reclaim the symbols of the rule whose action triggered
     this YYERROR.  */
  YYPOPSTACK (yylen);
  yylen = 0;
  YY_STACK_PRINT (yyss, yyssp);
  yystate = *yyssp;
  goto yyerrlab1;


/*-------------------------------------------------------------.
| yyerrlab1 -- common code for both syntax error and YYERROR.  |
`-------------------------------------------------------------*/
yyerrlab1:
  yyerrstatus = 3;      /* Each real token shifted decrements this.  */

  /* Pop stack until we find a state that shifts the error token.  */
  for (;;)
    {
      yyn = yypact[yystate];
      if (!yypact_value_is_default (yyn))
        {
          yyn += YYSYMBOL_YYerror;
          if (0 <= yyn && yyn <= YYLAST && yycheck[yyn] == YYSYMBOL_YYerror)
            {
              yyn = yytable[yyn];
              if (0 < yyn)
                break;
            }
        }

      /* Pop the current state because it cannot handle the error token.  */
      if (yyssp == yyss)
        YYABORT;

      yyerror_range[1] = *yylsp;
      yydestruct ("Error: popping",
                  YY_ACCESSING_SYMBOL (yystate), yyvsp, yylsp);
      YYPOPSTACK (1);
      yystate = *yyssp;
      YY_STACK_PRINT (yyss, yyssp);
    }

  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  *++yyvsp = yylval;
  YY_IGNORE_MAYBE_UNINITIALIZED_END

  yyerror_range[2] = yylloc;
  ++yylsp;
  YYLLOC_DEFAULT (*yylsp, yyerror_range, 2);

  /* Shift the error token.  */
  YY_SYMBOL_PRINT ("Shifting", YY_ACCESSING_SYMBOL (yyn), yyvsp, yylsp);

  yystate = yyn;
  goto yynewstate;


/*-------------------------------------.
| yyacceptlab -- YYACCEPT comes here.  |
`-------------------------------------*/
yyacceptlab:
  yyresult = 0;
  goto yyreturnlab;


/*-----------------------------------.
| yyabortlab -- YYABORT comes here.  |
`-----------------------------------*/
yyabortlab:
  yyresult = 1;
  goto yyreturnlab;


/*-----------------------------------------------------------.
| yyexhaustedlab -- YYNOMEM (memory exhaustion) comes here.  |
`-----------------------------------------------------------*/
yyexhaustedlab:
  yyerror (YY_("memory exhausted"));
  yyresult = 2;
  goto yyreturnlab;


/*----------------------------------------------------------.
| yyreturnlab -- parsing is finished, clean up and return.  |
`----------------------------------------------------------*/
yyreturnlab:
  if (yychar != YYEMPTY)
    {
      /* Make sure we have latest lookahead translation.  See comments at
         user semantic actions for why this is necessary.  */
      yytoken = YYTRANSLATE (yychar);
      yydestruct ("Cleanup: discarding lookahead",
                  yytoken, &yylval, &yylloc);
    }
  /* Do not reclaim the symbols of the rule whose action triggered
     this YYABORT or YYACCEPT.  */
  YYPOPSTACK (yylen);
  YY_STACK_PRINT (yyss, yyssp);
  while (yyssp != yyss)
    {
      yydestruct ("Cleanup: popping",
                  YY_ACCESSING_SYMBOL (+*yyssp), yyvsp, yylsp);
      YYPOPSTACK (1);
    }
#ifndef yyoverflow
  if (yyss != yyssa)
    YYSTACK_FREE (yyss);
#endif

  return yyresult;
}

#line 442 "src/parser.y"


/* ---- Mensagens de erro em português (formato em ERROS.md) ---- */

/* Como um token esperado aparece na mensagem. */
static const char *descrever(yysymbol_kind_t s)
{
    switch (s) {
    case YYSYMBOL_YYEOF:          return "fim do arquivo";
    case YYSYMBOL_IDENTIFIER:     return "identificador";
    case YYSYMBOL_INT_LITERAL:    return "número inteiro";
    case YYSYMBOL_FLOAT_LITERAL:  return "número real";
    case YYSYMBOL_STRING_LITERAL: return "texto";
    case YYSYMBOL_VAR:            return "'var'";
    case YYSYMBOL_CONST:          return "'const'";
    case YYSYMBOL_FUNC:           return "'func'";
    case YYSYMBOL_WORKFLOW:       return "'workflow'";
    case YYSYMBOL_CALL:           return "'call'";
    case YYSYMBOL_RETURN:         return "'return'";
    case YYSYMBOL_IF:             return "'if'";
    case YYSYMBOL_ELSE:           return "'else'";
    case YYSYMBOL_WHILE:          return "'while'";
    case YYSYMBOL_FOR:            return "'for'";
    case YYSYMBOL_IN:             return "'in'";
    case YYSYMBOL_BREAK:          return "'break'";
    case YYSYMBOL_CONTINUE:       return "'continue'";
    case YYSYMBOL_STOP:           return "'stop'";
    case YYSYMBOL_ABORT:          return "'abort'";
    case YYSYMBOL_RUN:            return "'run'";
    case YYSYMBOL_TRUE:           return "'true'";
    case YYSYMBOL_FALSE:          return "'false'";
    case YYSYMBOL_NULL_LITERAL:   return "'null'";
    case YYSYMBOL_TYPE_INT:       return "'int'";
    case YYSYMBOL_TYPE_FLOAT:     return "'float'";
    case YYSYMBOL_TYPE_STRING:    return "'string'";
    case YYSYMBOL_TYPE_BOOL:      return "'bool'";
    case YYSYMBOL_TYPE_OBJECT:    return "'object'";
    case YYSYMBOL_TYPE_LIST:      return "'list'";
    case YYSYMBOL_ASSIGN:         return "'='";
    case YYSYMBOL_EQ:             return "'=='";
    case YYSYMBOL_NEQ:            return "'!='";
    case YYSYMBOL_LT:             return "'<'";
    case YYSYMBOL_GT:             return "'>'";
    case YYSYMBOL_LTE:            return "'<='";
    case YYSYMBOL_GTE:            return "'>='";
    case YYSYMBOL_PLUS:           return "'+'";
    case YYSYMBOL_MINUS:          return "'-'";
    case YYSYMBOL_MUL:            return "'*'";
    case YYSYMBOL_DIV:            return "'/'";
    case YYSYMBOL_MOD:            return "'%'";
    case YYSYMBOL_AND:            return "'&&'";
    case YYSYMBOL_OR:             return "'||'";
    case YYSYMBOL_NOT:            return "'!'";
    case YYSYMBOL_LPAREN:         return "'('";
    case YYSYMBOL_RPAREN:         return "')'";
    case YYSYMBOL_LBRACE:         return "'{'";
    case YYSYMBOL_RBRACE:         return "'}'";
    case YYSYMBOL_LBRACKET:       return "'['";
    case YYSYMBOL_RBRACKET:       return "']'";
    case YYSYMBOL_COMMA:          return "','";
    case YYSYMBOL_COLON:          return "':'";
    case YYSYMBOL_SEMICOLON:      return "';'";
    case YYSYMBOL_DOT:            return "'.'";
    default:                      return yysymbol_name(s);
    }
}

static int eh_palavra_reservada(yysymbol_kind_t s)
{
    return s >= YYSYMBOL_VAR && s <= YYSYMBOL_TYPE_LIST;
}

/* Como o token encontrado aparece: inclui o lexema quando ajuda. */
static void imprimir_encontrado(yysymbol_kind_t s)
{
    switch (s) {
    case YYSYMBOL_IDENTIFIER:
        fprintf(stderr, "identificador '%s'", flux_lexema);
        break;
    case YYSYMBOL_INT_LITERAL:
        fprintf(stderr, "número inteiro %s", flux_lexema);
        break;
    case YYSYMBOL_FLOAT_LITERAL:
        fprintf(stderr, "número real %s", flux_lexema);
        break;
    case YYSYMBOL_STRING_LITERAL:
        fprintf(stderr, "texto %s", flux_lexema);
        break;
    default:
        if (eh_palavra_reservada(s))
            fprintf(stderr, "palavra reservada %s", descrever(s));
        else
            fputs(descrever(s), stderr);
    }
}

/* Conjuntos que viram uma palavra só na lista de esperados. */
static const yysymbol_kind_t inicio_expressao[] = {
    YYSYMBOL_CALL, YYSYMBOL_FALSE, YYSYMBOL_FLOAT_LITERAL, YYSYMBOL_IDENTIFIER,
    YYSYMBOL_INT_LITERAL, YYSYMBOL_LBRACE, YYSYMBOL_LBRACKET, YYSYMBOL_LPAREN,
    YYSYMBOL_MINUS, YYSYMBOL_NOT, YYSYMBOL_NULL_LITERAL, YYSYMBOL_RUN,
    YYSYMBOL_STRING_LITERAL, YYSYMBOL_TRUE,
};
static const yysymbol_kind_t inicio_tipo[] = {
    YYSYMBOL_TYPE_INT, YYSYMBOL_TYPE_FLOAT, YYSYMBOL_TYPE_STRING,
    YYSYMBOL_TYPE_BOOL, YYSYMBOL_TYPE_OBJECT, YYSYMBOL_TYPE_LIST,
};

#define TAMANHO(v) (sizeof (v) / sizeof *(v))

/* Se todos os tokens do grupo são esperados, marca-os como cobertos. */
static int cobrir_grupo(const yysymbol_kind_t *grupo, size_t n_grupo,
                        const yysymbol_kind_t *esperados, int n, int *coberto)
{
    int achados[YYNTOKENS];
    for (size_t g = 0; g < n_grupo; g++) {
        achados[g] = -1;
        for (int i = 0; i < n; i++)
            if (esperados[i] == grupo[g])
                achados[g] = i;
        if (achados[g] < 0)
            return 0;
    }
    for (size_t g = 0; g < n_grupo; g++)
        coberto[achados[g]] = 1;
    return 1;
}

static void imprimir_esperados(const yysymbol_kind_t *esperados, int n)
{
    const char *itens[YYNTOKENS + 2];
    int coberto[YYNTOKENS] = {0};
    int k = 0;

    /* Após "programa: globais" só resta $end, mas qualquer elemento
       global ainda poderia vir: a redução de <globais> por ε foi
       feita antes de olhar o token. */
    if (n == 1 && esperados[0] == YYSYMBOL_YYEOF) {
        fputs("'var', 'const', 'func', 'workflow' ou fim do arquivo", stderr);
        return;
    }

    if (cobrir_grupo(inicio_expressao, TAMANHO(inicio_expressao), esperados, n, coberto))
        itens[k++] = "expressão";
    if (cobrir_grupo(inicio_tipo, TAMANHO(inicio_tipo), esperados, n, coberto))
        itens[k++] = "tipo";
    for (int i = 0; i < n; i++)
        if (!coberto[i])
            itens[k++] = descrever(esperados[i]);

    for (int i = 0; i < k; i++) {
        if (i > 0)
            fputs(i == k - 1 ? " ou " : ", ", stderr);
        fputs(itens[i], stderr);
    }
}

static int yyreport_syntax_error(const yypcontext_t *ctx)
{
    yysymbol_kind_t encontrado = yypcontext_token(ctx);
    if (encontrado == YYSYMBOL_ERRO_LEXICO)
        return 0;   /* o lexer já reportou o erro */

    const YYLTYPE *loc = yypcontext_location(ctx);
    yysymbol_kind_t esperados[YYNTOKENS];
    int n = yypcontext_expected_tokens(ctx, esperados, YYNTOKENS);

    flux_erro("sintático", loc->first_line, loc->first_column);
    fputs("Token encontrado: ", stderr);
    imprimir_encontrado(encontrado);
    fputs("\nEsperado: ", stderr);
    imprimir_esperados(esperados, n);
    fputc('\n', stderr);
    return 0;
}

/* Erro S3: o "=" veio depois de algo que não é variável, campo ou índice. */
static void erro_atribuicao(const YYLTYPE *loc)
{
    flux_erro("sintático", loc->first_line, loc->first_column);
    fputs("Token encontrado: '='\n"
          "Esperado: ';' (o lado esquerdo não é variável, campo ou índice)\n",
          stderr);
}

void yyerror(const char *msg)
{
    if (strcmp(msg, "memory exhausted") == 0)
        msg = "memória esgotada (programa grande demais para a pilha do parser)";
    fprintf(stderr, "Erro: %s\n", msg);
}

const char *flux_nome_token(int token)
{
    return yysymbol_name(YYTRANSLATE(token));
}
