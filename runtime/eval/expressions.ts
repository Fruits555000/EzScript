import type { AssignmentExpr, BinaryExpr, Identifier } from "../../frontend/ast.ts";
import type Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { type NumberVal, MK_NIL, type RuntimeVal } from "../values.ts";

function eval_numeric_binary_expr (lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
    let result = 0;

    if (operator == "+") {
        result = lhs.value + rhs.value
    } else if (operator == "-") {
        result = lhs.value - rhs.value
    } else if (operator == "*") {
        result = lhs.value * rhs.value
    } else if (operator == "/") {
        result = lhs.value / rhs.value
    } else if (operator == "^") {
        result = Math.pow(lhs.value, rhs.value)
    } else {
        result = lhs.value % rhs.value
    }

    return { type: "number", value: result } as NumberVal
}   

export function eval_binary_expr (binop: BinaryExpr, env: Enviroment) {
    const lhs = evaluate(binop.left, env)
    const rhs = evaluate(binop.right, env)

    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator)
    }

    return MK_NIL();
}

export function eval_identifier(ident: Identifier, env: Enviroment): RuntimeVal {
    const val = env.lookupVar(ident.symbol);
    return val;
}

export function eval_assignment (node: AssignmentExpr, env: Enviroment) {
   if (node.assigne.kind !== "Identifier") {
    throw `Invalid LHS inaide assignment expr ${JSON.stringify(node.assigne)}`;
   }

   const varname = (node.assigne as Identifier).symbol;
   return env.assignVar(varname, evaluate(node.value, env));
}