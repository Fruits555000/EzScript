import {Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier} from "./ast.ts";
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

    private expect (type: TokenType, err: any) {
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
        return this.parse_expr();
    }

    private parse_expr(): Expr {
        return this.parse_additive_expr();
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
        let left = this.parse_primary_expr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
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