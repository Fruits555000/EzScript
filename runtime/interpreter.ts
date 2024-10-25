import { RuntimeVal, NumberVal} from "./values.ts";
import { Stmt, NumericLiteral, BinaryExpr, type Program, type Identifier, type VarDeclaration, type AssignmentExpr } from "../frontend/ast.ts";
import Enviroment from "./enviroment.ts";
import { eval_program, eval_var_declaration} from "./eval/statements.ts";
import { eval_identifier, eval_binary_expr, eval_assignment } from "./eval/expressions.ts";

export function evaluate (astNode: Stmt, env: Enviroment): RuntimeVal {

    switch (astNode.kind) {
        case "NumericLiteral":
            return { 
                value: (astNode as NumericLiteral).value,
                type: "number",
             } as NumberVal;
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);
        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env)
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);
        case "Program":
             return eval_program(astNode as Program, env);
        case "VarDeclaration":
            return eval_var_declaration (astNode as VarDeclaration, env)
        default:
            console.error("This AST Node has not yet been set up for interpretation.", astNode)
            Deno.exit(0)
    }
}