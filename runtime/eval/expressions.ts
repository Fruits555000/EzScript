import type { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { type NumberVal, MK_NIL, type RuntimeVal, type ObjectVal, type NativeFnVal } from "../values.ts";

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

export function eval_assignment (node: AssignmentExpr, env: Enviroment): RuntimeVal {
   if (node.assigne.kind !== "Identifier") {
    throw `Invalid LHS inaide assignment expr ${JSON.stringify(node.assigne)}`;
   }

   const varname = (node.assigne as Identifier).symbol;
   return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr (obj: ObjectLiteral, env:Enviroment): RuntimeVal {
    const object = { type: "object", properties: new Map() } as ObjectVal;

        for (const {key, value} of obj.properties) {

            const runtimeVal = (value == undefined) 
                ? env.lookupVar(key) 
                : evaluate(value, env)

            object.properties.set(key, runtimeVal)
    
        }

    return object;
}

export function eval_call_expr (expr: CallExpr, env:Enviroment): RuntimeVal {
    const args = expr.args.map((arg) => evaluate(arg, env))
    const fn = evaluate(expr.caller, env)

    if (fn.type !== "native-fn") {
        throw "Cannot call value that is not a function: " + JSON.stringify(fn)
    }

    const result = (fn as NativeFnVal).call(args, env)
    return result
}