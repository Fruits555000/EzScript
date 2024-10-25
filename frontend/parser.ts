import {Stmt, Program, Expr, BinaryExpr, NumericLiteral , Identifier, type VarDeclaration, type AssignmentExpr} from "./ast.ts";
import { tokenise, Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = []

    private not_eof (): boolean {
        return this.tokens[0].type != TokenType.EOF
    }

    private at () {
        return this.tokens[0] as Token;
    }

    private eat () {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect (type: TokenType, err: string) {
        const prev = this.tokens.shift() as Token;

        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            Deno.exit(1);
        }

        return prev
    }

    public produceAST (sourceCode: string): Program {
        this.tokens = tokenise(sourceCode)

        const program: Program = {
            kind: "Program",
            body: []
        }

        // Parse until the end of the file

        while (this.not_eof()) {
            program.body.push(this.parse_stmt())
        }

        return program;
    }

    private parse_stmt (): Stmt {
        switch (this.at().type) {
            case TokenType.Local:
                return this.parse_var_declaration();
            default:
                return this.parse_expr();
        }
    }

    private parse_var_declaration(): Stmt {
      this.eat() // Eat the var declaration

      const identifier = this.expect(TokenType.Identifier, "Expected identifier name following a 'local' keyword").value
      
      if (this.at().type == TokenType.Semicolon) {
        this.eat() // Expect semicolon
        return { kind: "VarDeclaration", identifier, value: undefined} as VarDeclaration
      }

      this.expect(TokenType.Equals, "Expected an equals sign following identifier in var declaration.")

      const declaration = { kind: "VarDeclaration", identifier, value: this.parse_expr()} as VarDeclaration

      this.expect(TokenType.Semicolon, "Variable declaration statement must end with a semicolon.")

      return declaration
    }

    private parse_expr(): Expr {
        return this.parse_assignment_expr();
    }

    private parse_assignment_expr(): Expr {
      const left = this.parse_additive_expr(); // Switch this out with objectExpr later

      if (this.at().type == TokenType.Equals) {
        this.eat();

        const value = this.parse_additive_expr();
        return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
      }

      return left;
    }

    private parse_additive_expr (): Expr {
        let left = this.parse_multiplicative_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_multiplicative_expr (): Expr {
        let left = this.parse_exponeplicative_expr();

        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parse_exponeplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_exponeplicative_expr (): Expr {
        let left = this.parse_primary_expr();

        while (this.at().value == "^") {
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_primary_expr (): Expr {
        const tk = this.at().type

        switch (tk) {
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value} as Identifier;

            case TokenType.Number:
                 return { kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;

            case TokenType.OpenParen: {
                this.eat()
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "Unexpected Token found inside parenthesised expression. Expected closing parenthesis.")
                return value
            }

            default:
                console.error("Unexpected token found during parsing!", this.at());
                Deno.exit(1)
        }
    }
}