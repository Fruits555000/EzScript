import {Stmt, Program, Expr, BinaryExpr, NumericLiteral , Identifier,  VarDeclaration,  AssignmentExpr,  ObjectLiteral,  Property, CallExpr, MemberExpr} from "./ast.ts";
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
      const left = this.parse_object_expr(); // Switch this out with objectExpr later

      if (this.at().type == TokenType.Equals) {
        this.eat();

        const value = this.parse_object_expr();
        return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
      }

      return left;
    }
    private parse_object_expr(): Expr {
        if (this.at().type !== TokenType.OpenBracket)

        this.eat(); 

        const properties = new Array<Property>();

        while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
            this.expect(TokenType.Dot, "Dot expected following 'Object' expression")

            if(this.at().type != TokenType.Identifier) {
                throw "Dot ('.') expected following the 'Object' expression";
            }
            const key = this.eat().value;

            if (this.at().type == TokenType.Comma) {
                this.eat();
                properties.push({ key, kind: "Property" } as Property);
                continue;
            }
            else if (this.at().type == TokenType.CloseBrace) {
                properties.push({ key, kind: "Property" } as Property);
                continue;
            }

            this.expect(TokenType.Colon, "Colon (':') expected following 'identifier' in 'Object' expression.");
            const value = this.parse_expr();

            properties.push({ key, value, kind: "Property" } as Property);

            if (this.at().type != TokenType.CloseBracket) {
                this.expect(TokenType.Comma, "Comma (',') or closing bracket ']' expected after 'property' declaration.");
            }
        }

        this.expect(TokenType.CloseBracket, "Closing bracket (']') expected at the end of 'Object' expression.");
        return { kind: "ObjectLiteral", properties } as ObjectLiteral;
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
        let left = this.parse_call_member_expr();

        while (this.at().value == "^") {
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    private parse_call_member_expr(): Expr {
      const member = this.parse_member_expr()

      if (this.at().type == TokenType.OpenParen) {
        return this.parse_call_expr(member)
      }

      return member
    }

    private parse_call_expr(caller: Expr): Expr {
        let call_expr: Expr = {
            kind: "CallExpr",
            caller,
            args: this.parse_args()
        } as CallExpr

        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expr(call_expr);
        }

        return call_expr;
    }

    private parse_args(): Expr[] {
        this.expect(TokenType.OpenParen, "Expected open parenthesis.")
        const args = this.at().type == TokenType.OpenParen 
          ? []
          : this.parse_arguments_list();

        this.expect(TokenType.CloseParen, "Mising closing parenthesis inside arguments list.");

        return args;
    }

    private parse_arguments_list(): Expr[] {
        const args = [this.parse_assignment_expr()];

        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr())
        }

        return args;
    }

    private parse_member_expr(): Expr {
       let object = this.parse_primary_expr()

       while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
        const operator = this.eat();
        let computed = false
        let property = this.parse_primary_expr()

            if (operator.type == TokenType.Dot) {
                computed = false
                property = this.parse_primary_expr()

                if (property.kind != "Identifier") {
                    throw `Couldn't use dot operator without right hand side being a identifier.`
             }
            } else {
                computed = true
                property = this.parse_expr()

                this.expect(TokenType.CloseBracket, "Missing closing bracket in computing value")
            }

            object = {
                kind: "MemberExpr",
                object,
                property,
                computed
            } as MemberExpr;
        }

        return object;
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