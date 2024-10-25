import { ValueType, RuntimeVal, NumberVal, NilVal } from "./values.ts";
import { NodeType, Stmt, NumericLiteral, BinaryExpr, type Program } from "../frontend/ast.ts";

function eval_program (program: Program): RuntimeVal {
    let lastEvaluated: RuntimeVal = { type: "nil", value: "null"} as NilVal

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement)
    }

    return lastEvaluated
}

function eval_numeric_binary_expr (lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
    let result = 0;

    if (operator == "+") {
        result = lhs.value + rhs.value
    } else if (operator == "-") {
        result = lhs.value - rhs.value
    }  else if (operator == "*") {
        result = lhs.value * rhs.value
    }   else if (operator == "/") {
        result = lhs.value / rhs.value
    } else if (operator == "^") {
        result = Math.pow(lhs.value, rhs.value)
    } else {
        result = lhs.value % rhs.value
    }

    return { type: "number", value: result } as NumberVal
}   

function eval_binary_expr (binop: BinaryExpr) {
    const lhs = evaluate(binop.left)
    const rhs = evaluate(binop.right)

    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator)
    }

    return { type: "nil", value: "null" } as NilVal
}

export function evaluate (astNode: Stmt): RuntimeVal {

    switch (astNode.kind) {
        case "NumericLiteral":
            return { 
                value: (astNode as NumericLiteral).value,
                type: "number",
             } as NumberVal;
        case "NilLiteral":
            return { value: "null", type: "nil"} as NilVal;
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr);
        case "Program":
             return eval_program(astNode as Program);
        default:
            console.error("This AST Node has not yet been set up for interpretation.", astNode)
            Deno.exit(0)
    }
}