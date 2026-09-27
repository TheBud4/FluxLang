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

#ifndef YY_YY_BUILD_PARSER_TAB_H_INCLUDED
# define YY_YY_BUILD_PARSER_TAB_H_INCLUDED
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
    MAIN = 262,                    /* MAIN  */
    RETURN = 263,                  /* RETURN  */
    IF = 264,                      /* IF  */
    ELSE = 265,                    /* ELSE  */
    WHILE = 266,                   /* WHILE  */
    FOR = 267,                     /* FOR  */
    IN = 268,                      /* IN  */
    BREAK = 269,                   /* BREAK  */
    CONTINUE = 270,                /* CONTINUE  */
    CALL = 271,                    /* CALL  */
    RUN = 272,                     /* RUN  */
    STOP = 273,                    /* STOP  */
    ABORT = 274,                   /* ABORT  */
    PROCEED = 275,                 /* PROCEED  */
    TYPE_INT = 276,                /* TYPE_INT  */
    TYPE_FLOAT = 277,              /* TYPE_FLOAT  */
    TYPE_STRING = 278,             /* TYPE_STRING  */
    TYPE_BOOL = 279,               /* TYPE_BOOL  */
    TYPE_OBJECT = 280,             /* TYPE_OBJECT  */
    TYPE_LIST = 281,               /* TYPE_LIST  */
    TRUE = 282,                    /* TRUE  */
    FALSE = 283,                   /* FALSE  */
    NULL_LITERAL = 284,            /* NULL_LITERAL  */
    INT_LITERAL = 285,             /* INT_LITERAL  */
    FLOAT_LITERAL = 286,           /* FLOAT_LITERAL  */
    STRING_LITERAL = 287,          /* STRING_LITERAL  */
    IDENTIFIER = 288,              /* IDENTIFIER  */
    ASSIGN = 289,                  /* ASSIGN  */
    EQUAL = 290,                   /* EQUAL  */
    NOT_EQUAL = 291,               /* NOT_EQUAL  */
    LOWER_THAN = 292,              /* LOWER_THAN  */
    LOWER_THAN_EQUAL = 293,        /* LOWER_THAN_EQUAL  */
    GREATER_THAN = 294,            /* GREATER_THAN  */
    GREATER_THAN_EQUAL = 295,      /* GREATER_THAN_EQUAL  */
    PLUS = 296,                    /* PLUS  */
    MINUS = 297,                   /* MINUS  */
    MUL = 298,                     /* MUL  */
    DIV = 299,                     /* DIV  */
    MOD = 300,                     /* MOD  */
    AND = 301,                     /* AND  */
    OR = 302,                      /* OR  */
    NOT = 303,                     /* NOT  */
    LPAREN = 304,                  /* LPAREN  */
    RPAREN = 305,                  /* RPAREN  */
    LBRACE = 306,                  /* LBRACE  */
    RBRACE = 307,                  /* RBRACE  */
    LBRACKET = 308,                /* LBRACKET  */
    RBRACKET = 309,                /* RBRACKET  */
    COMMA = 310,                   /* COMMA  */
    COLON = 311,                   /* COLON  */
    SEMICOLON = 312,               /* SEMICOLON  */
    DOT = 313                      /* DOT  */
  };
  typedef enum yytokentype yytoken_kind_t;
#endif

/* Value type.  */
#if ! defined YYSTYPE && ! defined YYSTYPE_IS_DECLARED
typedef char * YYSTYPE;
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


#endif /* !YY_YY_BUILD_PARSER_TAB_H_INCLUDED  */
