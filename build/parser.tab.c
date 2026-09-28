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
#line 1 "src/parser.y"

#include <stdio.h>
#include <string.h>
#include "fluxc.h"
    int yylex(void);
    void yyerror(const char *msg);

#line 79 "build/parser.tab.c"

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

#include "parser.tab.h"
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
  YYSYMBOL_MAIN = 7,                       /* MAIN  */
  YYSYMBOL_RETURN = 8,                     /* RETURN  */
  YYSYMBOL_IF = 9,                         /* IF  */
  YYSYMBOL_ELSE = 10,                      /* ELSE  */
  YYSYMBOL_WHILE = 11,                     /* WHILE  */
  YYSYMBOL_FOR = 12,                       /* FOR  */
  YYSYMBOL_IN = 13,                        /* IN  */
  YYSYMBOL_BREAK = 14,                     /* BREAK  */
  YYSYMBOL_CONTINUE = 15,                  /* CONTINUE  */
  YYSYMBOL_CALL = 16,                      /* CALL  */
  YYSYMBOL_RUN = 17,                       /* RUN  */
  YYSYMBOL_STOP = 18,                      /* STOP  */
  YYSYMBOL_ABORT = 19,                     /* ABORT  */
  YYSYMBOL_PROCEED = 20,                   /* PROCEED  */
  YYSYMBOL_TYPE_INT = 21,                  /* TYPE_INT  */
  YYSYMBOL_TYPE_FLOAT = 22,                /* TYPE_FLOAT  */
  YYSYMBOL_TYPE_STRING = 23,               /* TYPE_STRING  */
  YYSYMBOL_TYPE_BOOL = 24,                 /* TYPE_BOOL  */
  YYSYMBOL_TYPE_OBJECT = 25,               /* TYPE_OBJECT  */
  YYSYMBOL_TYPE_LIST = 26,                 /* TYPE_LIST  */
  YYSYMBOL_TRUE = 27,                      /* TRUE  */
  YYSYMBOL_FALSE = 28,                     /* FALSE  */
  YYSYMBOL_NULL_LITERAL = 29,              /* NULL_LITERAL  */
  YYSYMBOL_INT_LITERAL = 30,               /* INT_LITERAL  */
  YYSYMBOL_FLOAT_LITERAL = 31,             /* FLOAT_LITERAL  */
  YYSYMBOL_STRING_LITERAL = 32,            /* STRING_LITERAL  */
  YYSYMBOL_IDENTIFIER = 33,                /* IDENTIFIER  */
  YYSYMBOL_ASSIGN = 34,                    /* ASSIGN  */
  YYSYMBOL_EQUAL = 35,                     /* EQUAL  */
  YYSYMBOL_NOT_EQUAL = 36,                 /* NOT_EQUAL  */
  YYSYMBOL_LOWER_THAN = 37,                /* LOWER_THAN  */
  YYSYMBOL_LOWER_THAN_EQUAL = 38,          /* LOWER_THAN_EQUAL  */
  YYSYMBOL_GREATER_THAN = 39,              /* GREATER_THAN  */
  YYSYMBOL_GREATER_THAN_EQUAL = 40,        /* GREATER_THAN_EQUAL  */
  YYSYMBOL_PLUS = 41,                      /* PLUS  */
  YYSYMBOL_MINUS = 42,                     /* MINUS  */
  YYSYMBOL_MUL = 43,                       /* MUL  */
  YYSYMBOL_DIV = 44,                       /* DIV  */
  YYSYMBOL_MOD = 45,                       /* MOD  */
  YYSYMBOL_AND = 46,                       /* AND  */
  YYSYMBOL_OR = 47,                        /* OR  */
  YYSYMBOL_NOT = 48,                       /* NOT  */
  YYSYMBOL_LPAREN = 49,                    /* LPAREN  */
  YYSYMBOL_RPAREN = 50,                    /* RPAREN  */
  YYSYMBOL_LBRACE = 51,                    /* LBRACE  */
  YYSYMBOL_RBRACE = 52,                    /* RBRACE  */
  YYSYMBOL_LBRACKET = 53,                  /* LBRACKET  */
  YYSYMBOL_RBRACKET = 54,                  /* RBRACKET  */
  YYSYMBOL_COMMA = 55,                     /* COMMA  */
  YYSYMBOL_COLON = 56,                     /* COLON  */
  YYSYMBOL_SEMICOLON = 57,                 /* SEMICOLON  */
  YYSYMBOL_DOT = 58,                       /* DOT  */
  YYSYMBOL_YYACCEPT = 59,                  /* $accept  */
  YYSYMBOL_program = 60,                   /* program  */
  YYSYMBOL_before_main = 61,               /* before_main  */
  YYSYMBOL_after_func = 62,                /* after_func  */
  YYSYMBOL_after_main = 63,                /* after_main  */
  YYSYMBOL_global_no_func = 64,            /* global_no_func  */
  YYSYMBOL_variable_declaration = 65,      /* variable_declaration  */
  YYSYMBOL_variable_rest = 66,             /* variable_rest  */
  YYSYMBOL_initializer = 67,               /* initializer  */
  YYSYMBOL_constant_declaration = 68,      /* constant_declaration  */
  YYSYMBOL_constant_rest = 69,             /* constant_rest  */
  YYSYMBOL_identifier_list = 70,           /* identifier_list  */
  YYSYMBOL_identifier_list_rest = 71,      /* identifier_list_rest  */
  YYSYMBOL_rhs = 72,                       /* rhs  */
  YYSYMBOL_type = 73,                      /* type  */
  YYSYMBOL_workflow = 74,                  /* workflow  */
  YYSYMBOL_function_rest = 75,             /* function_rest  */
  YYSYMBOL_parameter_list = 76,            /* parameter_list  */
  YYSYMBOL_parameters = 77,                /* parameters  */
  YYSYMBOL_parameters_rest = 78,           /* parameters_rest  */
  YYSYMBOL_parameter = 79,                 /* parameter  */
  YYSYMBOL_return_type = 80,               /* return_type  */
  YYSYMBOL_block = 81,                     /* block  */
  YYSYMBOL_commands = 82,                  /* commands  */
  YYSYMBOL_command = 83,                   /* command  */
  YYSYMBOL_command_if = 84,                /* command_if  */
  YYSYMBOL_else_part = 85,                 /* else_part  */
  YYSYMBOL_command_while = 86,             /* command_while  */
  YYSYMBOL_command_for = 87,               /* command_for  */
  YYSYMBOL_command_return = 88,            /* command_return  */
  YYSYMBOL_return_values = 89,             /* return_values  */
  YYSYMBOL_command_break = 90,             /* command_break  */
  YYSYMBOL_command_continue = 91,          /* command_continue  */
  YYSYMBOL_command_error = 92,             /* command_error  */
  YYSYMBOL_error_action = 93,              /* error_action  */
  YYSYMBOL_command_expression = 94,        /* command_expression  */
  YYSYMBOL_assignment_rest = 95,           /* assignment_rest  */
  YYSYMBOL_expression = 96,                /* expression  */
  YYSYMBOL_or_expr = 97,                   /* or_expr  */
  YYSYMBOL_or_rest = 98,                   /* or_rest  */
  YYSYMBOL_and_expr = 99,                  /* and_expr  */
  YYSYMBOL_and_rest = 100,                 /* and_rest  */
  YYSYMBOL_equality_expr = 101,            /* equality_expr  */
  YYSYMBOL_equality_rest = 102,            /* equality_rest  */
  YYSYMBOL_equality_op = 103,              /* equality_op  */
  YYSYMBOL_relational_expr = 104,          /* relational_expr  */
  YYSYMBOL_relational_rest = 105,          /* relational_rest  */
  YYSYMBOL_relational_op = 106,            /* relational_op  */
  YYSYMBOL_additive_expr = 107,            /* additive_expr  */
  YYSYMBOL_additive_rest = 108,            /* additive_rest  */
  YYSYMBOL_additive_op = 109,              /* additive_op  */
  YYSYMBOL_multiplicative_expr = 110,      /* multiplicative_expr  */
  YYSYMBOL_multiplicative_rest = 111,      /* multiplicative_rest  */
  YYSYMBOL_multiplicative_op = 112,        /* multiplicative_op  */
  YYSYMBOL_unary_expr = 113,               /* unary_expr  */
  YYSYMBOL_unary_op = 114,                 /* unary_op  */
  YYSYMBOL_postfix_expr = 115,             /* postfix_expr  */
  YYSYMBOL_postfix_rest = 116,             /* postfix_rest  */
  YYSYMBOL_primary = 117,                  /* primary  */
  YYSYMBOL_list_literal = 118,             /* list_literal  */
  YYSYMBOL_list_items = 119,               /* list_items  */
  YYSYMBOL_list_rest = 120,                /* list_rest  */
  YYSYMBOL_list_after_comma = 121,         /* list_after_comma  */
  YYSYMBOL_object_literal = 122,           /* object_literal  */
  YYSYMBOL_object_items = 123,             /* object_items  */
  YYSYMBOL_fields_rest = 124,              /* fields_rest  */
  YYSYMBOL_fields_after_comma = 125,       /* fields_after_comma  */
  YYSYMBOL_field = 126,                    /* field  */
  YYSYMBOL_field_key = 127,                /* field_key  */
  YYSYMBOL_expression_list = 128,          /* expression_list  */
  YYSYMBOL_expression_list_rest = 129,     /* expression_list_rest  */
  YYSYMBOL_args = 130                      /* args  */
};
typedef enum yysymbol_kind_t yysymbol_kind_t;



/* Unqualified %code blocks.  */
#line 9 "src/parser.y"

/* S3: onde está o "=" da atribuição, para a mensagem de erro */
static YYLTYPE assign_loc;

/* Último sufixo de uma expressão pós-fixa (postfix_rest) */
enum { SUFFIX_NONE, SUFFIX_ACCESS, SUFFIX_CALL };

#line 252 "build/parser.tab.c"

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
#define YYFINAL  18
/* YYLAST -- Last index in YYTABLE.  */
#define YYLAST   210

/* YYNTOKENS -- Number of terminals.  */
#define YYNTOKENS  59
/* YYNNTS -- Number of nonterminals.  */
#define YYNNTS  72
/* YYNRULES -- Number of rules.  */
#define YYNRULES  144
/* YYNSTATES -- Number of states.  */
#define YYNSTATES  245

/* YYMAXUTOK -- Last valid token kind.  */
#define YYMAXUTOK   313


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
      55,    56,    57,    58
};

#if YYDEBUG
/* YYRLINE[YYN] -- Source line where rule number YYN was defined.  */
static const yytype_int16 yyrline[] =
{
       0,    47,    47,    49,    49,    52,    52,    55,    55,    55,
      58,    58,    58,    61,    63,    63,    66,    66,    69,    72,
      72,    75,    78,    78,    81,    81,    81,    84,    84,    84,
      84,    84,    84,    87,    90,    93,    93,    96,    99,    99,
     102,   105,   105,   108,   111,   111,   114,   114,   114,   114,
     114,   114,   114,   114,   114,   114,   117,   120,   120,   123,
     126,   129,   132,   132,   135,   138,   141,   144,   144,   144,
     147,   156,   157,   158,   161,   164,   167,   167,   170,   173,
     173,   176,   179,   179,   182,   182,   185,   188,   188,   191,
     191,   191,   191,   194,   197,   197,   200,   200,   203,   206,
     206,   209,   209,   209,   212,   212,   215,   215,   218,   221,
     222,   223,   224,   227,   228,   228,   228,   229,   229,   229,
     230,   230,   230,   233,   236,   236,   239,   239,   242,   242,
     245,   248,   248,   251,   251,   254,   254,   257,   260,   260,
     263,   266,   266,   269,   269
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
  "WORKFLOW", "MAIN", "RETURN", "IF", "ELSE", "WHILE", "FOR", "IN",
  "BREAK", "CONTINUE", "CALL", "RUN", "STOP", "ABORT", "PROCEED",
  "TYPE_INT", "TYPE_FLOAT", "TYPE_STRING", "TYPE_BOOL", "TYPE_OBJECT",
  "TYPE_LIST", "TRUE", "FALSE", "NULL_LITERAL", "INT_LITERAL",
  "FLOAT_LITERAL", "STRING_LITERAL", "IDENTIFIER", "ASSIGN", "EQUAL",
  "NOT_EQUAL", "LOWER_THAN", "LOWER_THAN_EQUAL", "GREATER_THAN",
  "GREATER_THAN_EQUAL", "PLUS", "MINUS", "MUL", "DIV", "MOD", "AND", "OR",
  "NOT", "LPAREN", "RPAREN", "LBRACE", "RBRACE", "LBRACKET", "RBRACKET",
  "COMMA", "COLON", "SEMICOLON", "DOT", "$accept", "program",
  "before_main", "after_func", "after_main", "global_no_func",
  "variable_declaration", "variable_rest", "initializer",
  "constant_declaration", "constant_rest", "identifier_list",
  "identifier_list_rest", "rhs", "type", "workflow", "function_rest",
  "parameter_list", "parameters", "parameters_rest", "parameter",
  "return_type", "block", "commands", "command", "command_if", "else_part",
  "command_while", "command_for", "command_return", "return_values",
  "command_break", "command_continue", "command_error", "error_action",
  "command_expression", "assignment_rest", "expression", "or_expr",
  "or_rest", "and_expr", "and_rest", "equality_expr", "equality_rest",
  "equality_op", "relational_expr", "relational_rest", "relational_op",
  "additive_expr", "additive_rest", "additive_op", "multiplicative_expr",
  "multiplicative_rest", "multiplicative_op", "unary_expr", "unary_op",
  "postfix_expr", "postfix_rest", "primary", "list_literal", "list_items",
  "list_rest", "list_after_comma", "object_literal", "object_items",
  "fields_rest", "fields_after_comma", "field", "field_key",
  "expression_list", "expression_list_rest", "args", YY_NULLPTR
  };
  return yy_sname[yysymbol];
}
#endif

#define YYPACT_NINF (-174)

#define yypact_value_is_default(Yyn) \
  ((Yyn) == YYPACT_NINF)

#define YYTABLE_NINF (-1)

#define yytable_value_is_error(Yyn) \
  0

/* YYPACT[STATE-NUM] -- Index in YYTABLE of the portion describing
   STATE-NUM.  */
static const yytype_int16 yypact[] =
{
      67,   -16,   -16,     7,     3,    19,  -174,    67,  -174,  -174,
    -174,   -34,   -19,   -14,   -10,    25,  -174,    25,  -174,  -174,
      57,  -174,    -4,     9,    34,    56,     9,    43,    46,    68,
      67,  -174,   -34,    69,    59,  -174,  -174,  -174,  -174,  -174,
    -174,  -174,  -174,  -174,    56,    21,    56,  -174,    53,  -174,
      70,    72,    45,    39,    15,    23,    56,  -174,    -3,  -174,
    -174,  -174,  -174,  -174,  -174,  -174,  -174,    79,    88,  -174,
    -174,    92,  -174,    81,    77,    87,  -174,    83,  -174,  -174,
      90,  -174,    91,  -174,  -174,    98,    85,    86,    96,    99,
      56,  -174,    56,  -174,    56,  -174,  -174,  -174,  -174,    56,
    -174,  -174,  -174,  -174,  -174,    56,  -174,  -174,  -174,    56,
    -174,  -174,  -174,  -174,    56,  -174,    56,    56,   119,  -174,
       9,    -4,  -174,    56,   116,   109,     9,   100,    68,  -174,
      56,  -174,  -174,    21,  -174,    56,    56,  -174,  -174,    53,
      70,    72,    45,    39,    15,    23,  -174,   104,   101,    -3,
     120,  -174,  -174,    56,   113,   114,   133,   111,   115,  -174,
    -174,  -174,  -174,  -174,   118,   116,  -174,  -174,  -174,  -174,
    -174,  -174,  -174,   162,  -174,   -12,   140,  -174,   109,  -174,
       9,    81,    83,   124,  -174,    85,  -174,    96,  -174,  -174,
    -174,  -174,  -174,  -174,  -174,  -174,    -3,    -3,  -174,  -174,
     121,  -174,    56,    56,   163,  -174,  -174,  -174,  -174,   142,
      -4,    56,   122,    25,  -174,  -174,  -174,  -174,  -174,  -174,
    -174,  -174,  -174,  -174,   127,   130,    56,   125,  -174,   147,
    -174,   109,    81,    81,    81,  -174,    -4,  -174,   173,  -174,
    -174,  -174,    81,  -174,  -174
};

/* YYDEFACT[STATE-NUM] -- Default reduction number in state STATE-NUM.
   Performed when YYTABLE does not specify something else to do.  Zero
   means the default is an error.  */
static const yytype_uint8 yydefact[] =
{
       0,     0,     0,     0,     0,     0,     2,     0,    10,    11,
      12,    23,     0,     0,     0,     0,     4,     0,     1,     3,
       0,    21,     0,     0,     0,     0,     0,     0,     0,    36,
       0,    33,    23,     0,     0,   117,   118,   119,   114,   115,
     116,   113,   107,   106,     0,   132,   125,    15,   142,    74,
      77,    80,    83,    88,    95,   100,     0,   105,   112,   121,
     122,    26,    27,    28,    29,    30,    31,     0,    17,    13,
      20,     0,    18,     0,     0,     0,    35,    39,     6,    22,
       0,    25,     0,   139,   138,     0,   134,     0,   127,     0,
       0,   140,     0,    75,     0,    78,    84,    85,    81,     0,
      89,    91,    90,    92,    86,     0,    96,    97,    93,     0,
     101,   102,   103,    98,     0,   104,   144,     0,     0,   108,
       0,     0,    14,     0,    45,     9,     0,    42,     0,    37,
     144,   120,   130,   136,   131,     0,   129,   124,   123,   142,
      77,    80,    83,    88,    95,   100,   143,     0,     0,   112,
       0,    16,    19,    63,     0,     0,     0,     0,     0,    67,
      68,    69,    46,    47,     0,    45,    48,    49,    50,    51,
      52,    53,    54,     0,    55,    73,     0,     5,     9,    40,
       0,     0,    39,     0,   133,   134,   137,   127,   126,   141,
      76,    79,    82,    87,    94,    99,   112,   112,   109,    32,
       0,    62,     0,     0,     0,    64,    65,    43,    44,     0,
       0,     0,     0,     0,     7,    41,    34,    38,    24,   135,
     128,   111,   110,    61,     0,     0,     0,     0,    71,     0,
      70,     9,     0,     0,     0,    66,     0,     8,    58,    59,
      60,    72,     0,    56,    57
};

/* YYPGOTO[NTERM-NUM].  */
static const yytype_int16 yypgoto[] =
{
    -174,  -174,    11,  -174,  -169,  -120,  -114,  -174,  -174,  -113,
    -174,   183,   154,  -115,   -23,  -174,   -17,  -174,  -174,     6,
      61,  -174,  -173,    26,  -174,  -174,  -174,  -174,  -174,  -174,
    -174,  -174,  -174,  -174,  -174,  -174,  -174,   -42,  -174,    50,
     102,    51,   103,    58,  -174,    94,    52,  -174,    93,    55,
    -174,    95,    60,  -174,   -49,  -174,  -174,  -133,  -174,  -174,
    -174,    14,  -174,   168,  -174,    18,  -174,    73,  -174,   -24,
      71,    78
};

/* YYDEFGOTO[NTERM-NUM].  */
static const yytype_uint8 yydefgoto[] =
{
       0,     5,     6,    16,   177,     7,     8,    24,   122,     9,
      27,    12,    21,    47,    68,    10,    30,    75,    76,   129,
      77,   181,   125,   164,   165,   166,   243,   167,   168,   169,
     200,   170,   171,   172,   173,   174,   212,    48,    49,    93,
      50,    95,    51,    98,    99,    52,   104,   105,    53,   108,
     109,    54,   113,   114,    55,    56,    57,   119,    58,    59,
      89,   137,   188,    60,    85,   134,   184,    86,    87,    61,
      91,   147
};

/* YYTABLE[YYPACT[STATE-NUM]] -- What to do in state STATE-NUM.  If
   positive, shift that token.  If negative, reduce the rule whose
   number is the opposite.  If YYTABLE_NINF, syntax error.  */
static const yytype_uint8 yytable[] =
{
      31,    70,    82,    71,    88,   178,   151,   115,   216,   214,
     162,   163,    33,    34,    14,    22,   198,    11,    19,    18,
      25,    20,   210,    35,    36,    37,    38,    39,    40,    41,
      62,    63,    64,    65,    66,    67,    17,    23,    42,    28,
      15,    78,    26,   211,    43,    44,   116,    45,   139,    46,
     117,   162,   163,    83,    84,   118,   106,   107,   178,   238,
     239,   240,   237,   221,   222,   145,   110,   111,   112,   244,
       1,     2,     3,     4,    29,   148,   100,   101,   102,   103,
      96,    97,   175,    35,    36,    37,    38,    39,    40,    41,
      32,    69,   146,   186,   187,   228,    73,   150,    42,   152,
      72,    74,    80,   179,    43,    44,   146,    45,    90,    46,
      45,   178,     1,     2,   176,     4,   120,    92,    94,     1,
       2,   241,   121,   175,   153,   154,   123,   155,   156,   201,
     157,   158,   124,   126,   159,   160,   161,   127,   128,   130,
     133,   131,   135,    35,    36,    37,    38,    39,    40,    41,
     132,   136,   149,   138,   196,   197,   180,   215,    42,   199,
     224,   225,   202,   203,    43,    44,   204,    45,   205,    46,
     207,   209,   206,   213,   218,   227,   226,   232,   223,   230,
     233,   236,   235,   242,   234,    13,    79,   229,   217,   182,
     190,   208,   191,   142,   140,   193,   231,   141,   143,   194,
     192,   220,    81,   219,   144,   195,   185,     0,   183,     0,
     189
};

static const yytype_int16 yycheck[] =
{
      17,    25,    44,    26,    46,   125,   121,    56,   181,   178,
     124,   124,    16,    17,     7,    34,   149,    33,     7,     0,
      34,    55,    34,    27,    28,    29,    30,    31,    32,    33,
      21,    22,    23,    24,    25,    26,    33,    56,    42,    49,
      33,    30,    56,    55,    48,    49,    49,    51,    90,    53,
      53,   165,   165,    32,    33,    58,    41,    42,   178,   232,
     233,   234,   231,   196,   197,   114,    43,    44,    45,   242,
       3,     4,     5,     6,    49,   117,    37,    38,    39,    40,
      35,    36,   124,    27,    28,    29,    30,    31,    32,    33,
      33,    57,   116,   135,   136,   210,    50,   120,    42,   123,
      57,    33,    33,   126,    48,    49,   130,    51,    55,    53,
      51,   231,     3,     4,     5,     6,    37,    47,    46,     3,
       4,   236,    34,   165,     8,     9,    34,    11,    12,   153,
      14,    15,    51,    56,    18,    19,    20,    50,    55,    49,
      55,    50,    56,    27,    28,    29,    30,    31,    32,    33,
      52,    55,    33,    54,    50,    54,    56,   180,    42,    39,
     202,   203,    49,    49,    48,    49,    33,    51,    57,    53,
      52,     9,    57,    33,    50,    33,    13,    50,    57,    57,
      50,    34,    57,    10,   226,     2,    32,   211,   182,   128,
     140,   165,   141,    99,    92,   143,   213,    94,   105,   144,
     142,   187,    34,   185,   109,   145,   133,    -1,   130,    -1,
     139
};

/* YYSTOS[STATE-NUM] -- The symbol kind of the accessing symbol of
   state STATE-NUM.  */
static const yytype_uint8 yystos[] =
{
       0,     3,     4,     5,     6,    60,    61,    64,    65,    68,
      74,    33,    70,    70,     7,    33,    62,    33,     0,    61,
      55,    71,    34,    56,    66,    34,    56,    69,    49,    49,
      75,    75,    33,    16,    17,    27,    28,    29,    30,    31,
      32,    33,    42,    48,    49,    51,    53,    72,    96,    97,
      99,   101,   104,   107,   110,   113,   114,   115,   117,   118,
     122,   128,    21,    22,    23,    24,    25,    26,    73,    57,
     128,    73,    57,    50,    33,    76,    77,    79,    61,    71,
      33,   122,    96,    32,    33,   123,   126,   127,    96,   119,
      55,   129,    47,    98,    46,   100,    35,    36,   102,   103,
      37,    38,    39,    40,   105,   106,    41,    42,   108,   109,
      43,    44,    45,   111,   112,   113,    49,    53,    58,   116,
      37,    34,    67,    34,    51,    81,    56,    50,    55,    78,
      49,    50,    52,    55,   124,    56,    55,   120,    54,    96,
      99,   101,   104,   107,   110,   113,   128,   130,    96,    33,
      73,    72,   128,     8,     9,    11,    12,    14,    15,    18,
      19,    20,    65,    68,    82,    83,    84,    86,    87,    88,
      90,    91,    92,    93,    94,    96,     5,    63,    64,    73,
      56,    80,    79,   130,   125,   126,    96,    96,   121,   129,
      98,   100,   102,   105,   108,   111,    50,    54,   116,    39,
      89,   128,    49,    49,    33,    57,    57,    52,    82,     9,
      34,    55,    95,    33,    63,    73,    81,    78,    50,   124,
     120,   116,   116,    57,    96,    96,    13,    33,    72,   128,
      57,    75,    50,    50,    96,    57,    34,    63,    81,    81,
      81,    72,    10,    85,    81
};

/* YYR1[RULE-NUM] -- Symbol kind of the left-hand side of rule RULE-NUM.  */
static const yytype_uint8 yyr1[] =
{
       0,    59,    60,    61,    61,    62,    62,    63,    63,    63,
      64,    64,    64,    65,    66,    66,    67,    67,    68,    69,
      69,    70,    71,    71,    72,    72,    72,    73,    73,    73,
      73,    73,    73,    74,    75,    76,    76,    77,    78,    78,
      79,    80,    80,    81,    82,    82,    83,    83,    83,    83,
      83,    83,    83,    83,    83,    83,    84,    85,    85,    86,
      87,    88,    89,    89,    90,    91,    92,    93,    93,    93,
      94,    95,    95,    95,    96,    97,    98,    98,    99,   100,
     100,   101,   102,   102,   103,   103,   104,   105,   105,   106,
     106,   106,   106,   107,   108,   108,   109,   109,   110,   111,
     111,   112,   112,   112,   113,   113,   114,   114,   115,   116,
     116,   116,   116,   117,   117,   117,   117,   117,   117,   117,
     117,   117,   117,   118,   119,   119,   120,   120,   121,   121,
     122,   123,   123,   124,   124,   125,   125,   126,   127,   127,
     128,   129,   129,   130,   130
};

/* YYR2[RULE-NUM] -- Number of symbols on the right-hand side of rule RULE-NUM.  */
static const yytype_int8 yyr2[] =
{
       0,     2,     1,     2,     2,     5,     3,     2,     4,     0,
       1,     1,     1,     4,     3,     2,     2,     0,     4,     4,
       2,     2,     3,     0,     5,     2,     1,     1,     1,     1,
       1,     1,     4,     3,     5,     1,     0,     2,     3,     0,
       3,     2,     0,     3,     2,     0,     1,     1,     1,     1,
       1,     1,     1,     1,     1,     1,     6,     2,     0,     5,
       5,     3,     1,     0,     2,     2,     4,     1,     1,     1,
       3,     2,     4,     0,     1,     2,     3,     0,     2,     3,
       0,     2,     3,     0,     1,     1,     2,     3,     0,     1,
       1,     1,     1,     2,     3,     0,     1,     1,     2,     3,
       0,     1,     1,     1,     2,     1,     1,     1,     2,     3,
       4,     4,     0,     1,     1,     1,     1,     1,     1,     1,
       3,     1,     1,     3,     2,     0,     2,     0,     2,     0,
       3,     2,     0,     2,     0,     2,     0,     3,     1,     1,
       2,     3,     0,     1,     0
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
  case 70: /* command_expression: expression assignment_rest SEMICOLON  */
#line 147 "src/parser.y"
                                           {
        if ((yyvsp[-1].assignable) != 0 && (!(yyvsp[-2].assignable) || (yyvsp[-1].assignable) == 2)) {
          report_error("sintático", assign_loc.first_line, assign_loc.first_column,
                       "Token encontrado: '='\nEsperado: ';' (o lado esquerdo não é variável, campo ou índice)");
          YYABORT;
        }
      }
#line 1583 "build/parser.tab.c"
    break;

  case 71: /* assignment_rest: ASSIGN rhs  */
#line 156 "src/parser.y"
                                            { assign_loc = (yylsp[-1]); (yyval.assignable) = 1; }
#line 1589 "build/parser.tab.c"
    break;

  case 72: /* assignment_rest: COMMA expression_list ASSIGN rhs  */
#line 157 "src/parser.y"
                                            { assign_loc = (yylsp[-1]); (yyval.assignable) = (yyvsp[-2].assignable) ? 1 : 2; }
#line 1595 "build/parser.tab.c"
    break;

  case 73: /* assignment_rest: %empty  */
#line 158 "src/parser.y"
                                            { (yyval.assignable) = 0; }
#line 1601 "build/parser.tab.c"
    break;

  case 75: /* or_expr: and_expr or_rest  */
#line 164 "src/parser.y"
                       { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1607 "build/parser.tab.c"
    break;

  case 76: /* or_rest: OR and_expr or_rest  */
#line 167 "src/parser.y"
                          { (yyval.assignable) = 1; }
#line 1613 "build/parser.tab.c"
    break;

  case 77: /* or_rest: %empty  */
#line 167 "src/parser.y"
                                               { (yyval.assignable) = 0; }
#line 1619 "build/parser.tab.c"
    break;

  case 78: /* and_expr: equality_expr and_rest  */
#line 170 "src/parser.y"
                             { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1625 "build/parser.tab.c"
    break;

  case 79: /* and_rest: AND equality_expr and_rest  */
#line 173 "src/parser.y"
                                 { (yyval.assignable) = 1; }
#line 1631 "build/parser.tab.c"
    break;

  case 80: /* and_rest: %empty  */
#line 173 "src/parser.y"
                                                      { (yyval.assignable) = 0; }
#line 1637 "build/parser.tab.c"
    break;

  case 81: /* equality_expr: relational_expr equality_rest  */
#line 176 "src/parser.y"
                                    { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1643 "build/parser.tab.c"
    break;

  case 82: /* equality_rest: equality_op relational_expr equality_rest  */
#line 179 "src/parser.y"
                                                { (yyval.assignable) = 1; }
#line 1649 "build/parser.tab.c"
    break;

  case 83: /* equality_rest: %empty  */
#line 179 "src/parser.y"
                                                                     { (yyval.assignable) = 0; }
#line 1655 "build/parser.tab.c"
    break;

  case 86: /* relational_expr: additive_expr relational_rest  */
#line 185 "src/parser.y"
                                    { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1661 "build/parser.tab.c"
    break;

  case 87: /* relational_rest: relational_op additive_expr relational_rest  */
#line 188 "src/parser.y"
                                                  { (yyval.assignable) = 1; }
#line 1667 "build/parser.tab.c"
    break;

  case 88: /* relational_rest: %empty  */
#line 188 "src/parser.y"
                                                                       { (yyval.assignable) = 0; }
#line 1673 "build/parser.tab.c"
    break;

  case 93: /* additive_expr: multiplicative_expr additive_rest  */
#line 194 "src/parser.y"
                                        { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1679 "build/parser.tab.c"
    break;

  case 94: /* additive_rest: additive_op multiplicative_expr additive_rest  */
#line 197 "src/parser.y"
                                                    { (yyval.assignable) = 1; }
#line 1685 "build/parser.tab.c"
    break;

  case 95: /* additive_rest: %empty  */
#line 197 "src/parser.y"
                                                                         { (yyval.assignable) = 0; }
#line 1691 "build/parser.tab.c"
    break;

  case 98: /* multiplicative_expr: unary_expr multiplicative_rest  */
#line 203 "src/parser.y"
                                     { (yyval.assignable) = (yyvsp[-1].assignable) && !(yyvsp[0].assignable); }
#line 1697 "build/parser.tab.c"
    break;

  case 99: /* multiplicative_rest: multiplicative_op unary_expr multiplicative_rest  */
#line 206 "src/parser.y"
                                                       { (yyval.assignable) = 1; }
#line 1703 "build/parser.tab.c"
    break;

  case 100: /* multiplicative_rest: %empty  */
#line 206 "src/parser.y"
                                                                            { (yyval.assignable) = 0; }
#line 1709 "build/parser.tab.c"
    break;

  case 104: /* unary_expr: unary_op unary_expr  */
#line 212 "src/parser.y"
                          { (yyval.assignable) = 0; }
#line 1715 "build/parser.tab.c"
    break;

  case 108: /* postfix_expr: primary postfix_rest  */
#line 218 "src/parser.y"
                           { (yyval.assignable) = ((yyvsp[0].assignable) == SUFFIX_NONE) ? (yyvsp[-1].assignable) : ((yyvsp[0].assignable) == SUFFIX_ACCESS); }
#line 1721 "build/parser.tab.c"
    break;

  case 109: /* postfix_rest: DOT IDENTIFIER postfix_rest  */
#line 221 "src/parser.y"
                                                 { (yyval.assignable) = (yyvsp[0].assignable) ? (yyvsp[0].assignable) : SUFFIX_ACCESS; }
#line 1727 "build/parser.tab.c"
    break;

  case 110: /* postfix_rest: LBRACKET expression RBRACKET postfix_rest  */
#line 222 "src/parser.y"
                                                 { (yyval.assignable) = (yyvsp[0].assignable) ? (yyvsp[0].assignable) : SUFFIX_ACCESS; }
#line 1733 "build/parser.tab.c"
    break;

  case 111: /* postfix_rest: LPAREN args RPAREN postfix_rest  */
#line 223 "src/parser.y"
                                                 { (yyval.assignable) = (yyvsp[0].assignable) ? (yyvsp[0].assignable) : SUFFIX_CALL; }
#line 1739 "build/parser.tab.c"
    break;

  case 112: /* postfix_rest: %empty  */
#line 224 "src/parser.y"
                                                 { (yyval.assignable) = SUFFIX_NONE; }
#line 1745 "build/parser.tab.c"
    break;

  case 113: /* primary: IDENTIFIER  */
#line 227 "src/parser.y"
                 { (yyval.assignable) = 1; }
#line 1751 "build/parser.tab.c"
    break;

  case 114: /* primary: INT_LITERAL  */
#line 228 "src/parser.y"
                  { (yyval.assignable) = 0; }
#line 1757 "build/parser.tab.c"
    break;

  case 115: /* primary: FLOAT_LITERAL  */
#line 228 "src/parser.y"
                                              { (yyval.assignable) = 0; }
#line 1763 "build/parser.tab.c"
    break;

  case 116: /* primary: STRING_LITERAL  */
#line 228 "src/parser.y"
                                                                           { (yyval.assignable) = 0; }
#line 1769 "build/parser.tab.c"
    break;

  case 117: /* primary: TRUE  */
#line 229 "src/parser.y"
           { (yyval.assignable) = 0; }
#line 1775 "build/parser.tab.c"
    break;

  case 118: /* primary: FALSE  */
#line 229 "src/parser.y"
                               { (yyval.assignable) = 0; }
#line 1781 "build/parser.tab.c"
    break;

  case 119: /* primary: NULL_LITERAL  */
#line 229 "src/parser.y"
                                                          { (yyval.assignable) = 0; }
#line 1787 "build/parser.tab.c"
    break;

  case 120: /* primary: LPAREN expression RPAREN  */
#line 230 "src/parser.y"
                               { (yyval.assignable) = 0; }
#line 1793 "build/parser.tab.c"
    break;

  case 121: /* primary: list_literal  */
#line 230 "src/parser.y"
                                                          { (yyval.assignable) = 0; }
#line 1799 "build/parser.tab.c"
    break;

  case 122: /* primary: object_literal  */
#line 230 "src/parser.y"
                                                                                       { (yyval.assignable) = 0; }
#line 1805 "build/parser.tab.c"
    break;

  case 140: /* expression_list: expression expression_list_rest  */
#line 263 "src/parser.y"
                                      { (yyval.assignable) = (yyvsp[-1].assignable) && (yyvsp[0].assignable); }
#line 1811 "build/parser.tab.c"
    break;

  case 141: /* expression_list_rest: COMMA expression expression_list_rest  */
#line 266 "src/parser.y"
                                            { (yyval.assignable) = (yyvsp[-1].assignable) && (yyvsp[0].assignable); }
#line 1817 "build/parser.tab.c"
    break;

  case 142: /* expression_list_rest: %empty  */
#line 266 "src/parser.y"
                                                                        { (yyval.assignable) = 1; }
#line 1823 "build/parser.tab.c"
    break;


#line 1827 "build/parser.tab.c"

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

#line 272 "src/parser.y"


const char *token_name(int tok) { return yysymbol_name(YYTRANSLATE(tok)); }

void yyerror(const char *msg) { fprintf(stderr, "%s\n", msg); }

/* ---------- Mensagens de erro sintático (docs/ERROS.md, seções 1 e 3) ---------- */

/* Como o token é escrito no código-fonte ("if", ";"...), ou NULL para
   identificadores, literais e fim do arquivo. */
static const char *spelling(yysymbol_kind_t s) {
  switch (s) {
  case YYSYMBOL_VAR: return "var";           case YYSYMBOL_CONST: return "const";
  case YYSYMBOL_FUNC: return "func";         case YYSYMBOL_WORKFLOW: return "workflow";
  case YYSYMBOL_MAIN: return "main";         case YYSYMBOL_RETURN: return "return";
  case YYSYMBOL_IF: return "if";             case YYSYMBOL_ELSE: return "else";
  case YYSYMBOL_WHILE: return "while";       case YYSYMBOL_FOR: return "for";
  case YYSYMBOL_IN: return "in";             case YYSYMBOL_BREAK: return "break";
  case YYSYMBOL_CONTINUE: return "continue"; case YYSYMBOL_CALL: return "call";
  case YYSYMBOL_RUN: return "run";           case YYSYMBOL_STOP: return "stop";
  case YYSYMBOL_ABORT: return "abort";       case YYSYMBOL_PROCEED: return "proceed";
  case YYSYMBOL_TYPE_INT: return "int";      case YYSYMBOL_TYPE_FLOAT: return "float";
  case YYSYMBOL_TYPE_STRING: return "string"; case YYSYMBOL_TYPE_BOOL: return "bool";
  case YYSYMBOL_TYPE_OBJECT: return "object"; case YYSYMBOL_TYPE_LIST: return "list";
  case YYSYMBOL_TRUE: return "true";         case YYSYMBOL_FALSE: return "false";
  case YYSYMBOL_NULL_LITERAL: return "null";
  case YYSYMBOL_ASSIGN: return "=";          case YYSYMBOL_EQUAL: return "==";
  case YYSYMBOL_NOT_EQUAL: return "!=";      case YYSYMBOL_LOWER_THAN: return "<";
  case YYSYMBOL_LOWER_THAN_EQUAL: return "<="; case YYSYMBOL_GREATER_THAN: return ">";
  case YYSYMBOL_GREATER_THAN_EQUAL: return ">="; case YYSYMBOL_PLUS: return "+";
  case YYSYMBOL_MINUS: return "-";           case YYSYMBOL_MUL: return "*";
  case YYSYMBOL_DIV: return "/";             case YYSYMBOL_MOD: return "%";
  case YYSYMBOL_AND: return "&&";            case YYSYMBOL_OR: return "||";
  case YYSYMBOL_NOT: return "!";             case YYSYMBOL_LPAREN: return "(";
  case YYSYMBOL_RPAREN: return ")";          case YYSYMBOL_LBRACE: return "{";
  case YYSYMBOL_RBRACE: return "}";          case YYSYMBOL_LBRACKET: return "[";
  case YYSYMBOL_RBRACKET: return "]";        case YYSYMBOL_COMMA: return ",";
  case YYSYMBOL_COLON: return ":";           case YYSYMBOL_SEMICOLON: return ";";
  case YYSYMBOL_DOT: return ".";
  default: return NULL;
  }
}

static int is_keyword(yysymbol_kind_t s) {
  return s >= YYSYMBOL_VAR && s <= YYSYMBOL_NULL_LITERAL;
}

/* Nome de um token esperado: 'if', ';', identificador... */
static const char *expected_name(yysymbol_kind_t s, char *buf, size_t size) {
  switch (s) {
  case YYSYMBOL_YYEOF:          return "fim do arquivo";
  case YYSYMBOL_IDENTIFIER:     return "identificador";
  case YYSYMBOL_INT_LITERAL:    return "número inteiro";
  case YYSYMBOL_FLOAT_LITERAL:  return "número real";
  case YYSYMBOL_STRING_LITERAL: return "texto";
  default:
    snprintf(buf, size, "'%s'", spelling(s));
    return buf;
  }
}

/* O token encontrado, com o texto quando houver: identificador 'total'... */
static void found_name(yysymbol_kind_t s, char *buf, size_t size) {
  const char *text = yylval.text ? yylval.text : "";
  switch (s) {
  case YYSYMBOL_YYEOF:          snprintf(buf, size, "fim do arquivo"); break;
  case YYSYMBOL_IDENTIFIER:     snprintf(buf, size, "identificador '%s'", text); break;
  case YYSYMBOL_INT_LITERAL:    snprintf(buf, size, "número inteiro %s", text); break;
  case YYSYMBOL_FLOAT_LITERAL:  snprintf(buf, size, "número real %s", text); break;
  case YYSYMBOL_STRING_LITERAL: snprintf(buf, size, "texto %s", text); break;
  default:
    if (is_keyword(s)) snprintf(buf, size, "palavra reservada '%s'", spelling(s));
    else snprintf(buf, size, "'%s'", spelling(s));
  }
}

/* Categorias: quando todos os tokens que iniciam uma expressão, um tipo ou
   um comando são esperados, a lista vira uma palavra só. */
static const yysymbol_kind_t EXPRESSION_START[] = {
  YYSYMBOL_INT_LITERAL, YYSYMBOL_FLOAT_LITERAL, YYSYMBOL_STRING_LITERAL,
  YYSYMBOL_TRUE, YYSYMBOL_FALSE, YYSYMBOL_NULL_LITERAL, YYSYMBOL_IDENTIFIER,
  YYSYMBOL_LPAREN, YYSYMBOL_LBRACKET, YYSYMBOL_LBRACE, YYSYMBOL_NOT, YYSYMBOL_MINUS,
  YYSYMBOL_YYEMPTY};
static const yysymbol_kind_t TYPE_START[] = {
  YYSYMBOL_TYPE_INT, YYSYMBOL_TYPE_FLOAT, YYSYMBOL_TYPE_STRING,
  YYSYMBOL_TYPE_BOOL, YYSYMBOL_TYPE_OBJECT, YYSYMBOL_TYPE_LIST, YYSYMBOL_YYEMPTY};
static const yysymbol_kind_t COMMAND_KEYWORDS[] = {
  YYSYMBOL_VAR, YYSYMBOL_CONST, YYSYMBOL_IF, YYSYMBOL_WHILE, YYSYMBOL_FOR,
  YYSYMBOL_RETURN, YYSYMBOL_BREAK, YYSYMBOL_CONTINUE, YYSYMBOL_STOP,
  YYSYMBOL_ABORT, YYSYMBOL_PROCEED, YYSYMBOL_YYEMPTY};

/* Se todos os tokens de "group" estão marcados em "expected", desmarca-os e
   devolve 1. */
static int take_group(int *expected, const yysymbol_kind_t *group) {
  for (int i = 0; group[i] != YYSYMBOL_YYEMPTY; i++)
    if (!expected[group[i]]) return 0;
  for (int i = 0; group[i] != YYSYMBOL_YYEMPTY; i++)
    expected[group[i]] = 0;
  return 1;
}

int yyreport_syntax_error(const yypcontext_t *ctx) {
  yysymbol_kind_t list[YYNTOKENS];
  int n = yypcontext_expected_tokens(ctx, list, YYNTOKENS);
  int expected[YYNTOKENS] = {0};
  for (int i = 0; i < n; i++) expected[list[i]] = 1;

  /* "comando" inclui o início de expressão, então é testado primeiro */
  const char *words[40];
  char bufs[40][16];
  int count = 0;
  int has_command = 0;
  if (take_group(expected, COMMAND_KEYWORDS)) {
    if (take_group(expected, EXPRESSION_START)) { words[count++] = "comando"; has_command = 1; }
    else for (int i = 0; COMMAND_KEYWORDS[i] != YYSYMBOL_YYEMPTY; i++) expected[COMMAND_KEYWORDS[i]] = 1;
  }
  if (!has_command && take_group(expected, EXPRESSION_START)) words[count++] = "expressão";
  if (take_group(expected, TYPE_START)) words[count++] = "tipo";
  for (int i = 0; i < n; i++)
    if (expected[list[i]]) { words[count] = expected_name(list[i], bufs[count], sizeof bufs[count]); count++; }

  char found[256], wanted[512] = "";
  yysymbol_kind_t token = yypcontext_token(ctx);
  found_name(token, found, sizeof found);
  for (int i = 0; i < count; i++) {
    if (i > 0) strcat(wanted, i == count - 1 ? " ou " : ", ");
    strcat(wanted, words[i]);
  }
  if (token == YYSYMBOL_CALL || token == YYSYMBOL_RUN)
    strcat(wanted, " (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)");

  const YYLTYPE *loc = yypcontext_location(ctx);
  if (count > 0)
    report_error("sintático", loc->first_line, loc->first_column,
                 "Token encontrado: %s\nEsperado: %s", found, wanted);
  else
    report_error("sintático", loc->first_line, loc->first_column,
                 "Token encontrado: %s", found);
  return 0;
}
