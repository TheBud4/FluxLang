/* A Bison parser, made by GNU Bison 3.8.2.  */

/* Bison interface for Yacc-like parsers in C

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

/* DO NOT RELY ON FEATURES THAT ARE NOT DOCUMENTED in the manual,
   especially those whose name start with YY_ or yy_.  They are
   private implementation details that can be changed or removed.  */

#ifndef YY_YY_BUILD_PARSER_H_INCLUDED
# define YY_YY_BUILD_PARSER_H_INCLUDED
/* Debug traces.  */
#ifndef YYDEBUG
# define YYDEBUG 0
#endif
#if YYDEBUG
extern int yydebug;
#endif

/* Token kinds.  */
#ifndef YYTOKENTYPE
# define YYTOKENTYPE
  enum yytokentype
  {
    YYEMPTY = -2,
    YYEOF = 0,                     /* "end of file"  */
    YYerror = 256,                 /* error  */
    YYUNDEF = 257,                 /* "invalid token"  */
    VAR = 258,                     /* VAR  */
    CONST = 259,                   /* CONST  */
    FUNC = 260,                    /* FUNC  */
    WORKFLOW = 261,                /* WORKFLOW  */
    CALL = 262,                    /* CALL  */
    RETURN = 263,                  /* RETURN  */
    IF = 264,                      /* IF  */
    ELSE = 265,                    /* ELSE  */
    WHILE = 266,                   /* WHILE  */
    FOR = 267,                     /* FOR  */
    IN = 268,                      /* IN  */
    BREAK = 269,                   /* BREAK  */
    CONTINUE = 270,                /* CONTINUE  */
    STOP = 271,                    /* STOP  */
    ABORT = 272,                   /* ABORT  */
    RUN = 273,                     /* RUN  */
    TRUE = 274,                    /* TRUE  */
    FALSE = 275,                   /* FALSE  */
    NULL_LITERAL = 276,            /* NULL_LITERAL  */
    TYPE_INT = 277,                /* TYPE_INT  */
    TYPE_FLOAT = 278,              /* TYPE_FLOAT  */
    TYPE_STRING = 279,             /* TYPE_STRING  */
    TYPE_BOOL = 280,               /* TYPE_BOOL  */
    TYPE_OBJECT = 281,             /* TYPE_OBJECT  */
    TYPE_LIST = 282,               /* TYPE_LIST  */
    LPAREN = 283,                  /* LPAREN  */
    RPAREN = 284,                  /* RPAREN  */
    LBRACE = 285,                  /* LBRACE  */
    RBRACE = 286,                  /* RBRACE  */
    LBRACKET = 287,                /* LBRACKET  */
    RBRACKET = 288,                /* RBRACKET  */
    COMMA = 289,                   /* COMMA  */
    COLON = 290,                   /* COLON  */
    SEMICOLON = 291,               /* SEMICOLON  */
    DOT = 292,                     /* DOT  */
    ASSIGN = 293,                  /* ASSIGN  */
    EQ = 294,                      /* EQ  */
    NEQ = 295,                     /* NEQ  */
    LT = 296,                      /* LT  */
    GT = 297,                      /* GT  */
    LTE = 298,                     /* LTE  */
    GTE = 299,                     /* GTE  */
    PLUS = 300,                    /* PLUS  */
    MINUS = 301,                   /* MINUS  */
    MUL = 302,                     /* MUL  */
    DIV = 303,                     /* DIV  */
    MOD = 304,                     /* MOD  */
    AND = 305,                     /* AND  */
    OR = 306,                      /* OR  */
    NOT = 307,                     /* NOT  */
    IDENTIFIER = 308,              /* IDENTIFIER  */
    STRING_LITERAL = 309,          /* STRING_LITERAL  */
    INT_LITERAL = 310,             /* INT_LITERAL  */
    FLOAT_LITERAL = 311,           /* FLOAT_LITERAL  */
    ERRO_LEXICO = 312              /* ERRO_LEXICO  */
  };
  typedef enum yytokentype yytoken_kind_t;
#endif

/* Value type.  */
#if ! defined YYSTYPE && ! defined YYSTYPE_IS_DECLARED
union YYSTYPE
{
#line 35 "src/parser.y"

    int    ival;
    double fval;
    char  *sval;
    int    flag;

#line 128 "build/parser.h"

};
typedef union YYSTYPE YYSTYPE;
# define YYSTYPE_IS_TRIVIAL 1
# define YYSTYPE_IS_DECLARED 1
#endif

/* Location type.  */
#if ! defined YYLTYPE && ! defined YYLTYPE_IS_DECLARED
typedef struct YYLTYPE YYLTYPE;
struct YYLTYPE
{
  int first_line;
  int first_column;
  int last_line;
  int last_column;
};
# define YYLTYPE_IS_DECLARED 1
# define YYLTYPE_IS_TRIVIAL 1
#endif


extern YYSTYPE yylval;
extern YYLTYPE yylloc;

int yyparse (void);


#endif /* !YY_YY_BUILD_PARSER_H_INCLUDED  */
