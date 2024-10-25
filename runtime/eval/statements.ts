import type { Program, VarDeclaration } from "../../frontend/ast.ts";
import type Enviroment from "../enviroment.ts";
import { evaluate } from "../interpreter.ts";
import { type RuntimeVal, MK_NIL } from "../values.ts";

export function eval_program (program: Program, env: Enviroment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MK_NIL();

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env)
    }

    return lastEvaluated
}

export function eval_var_declaration(declaration: VarDeclaration, env: Enviroment):RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NIL();
    return env.declareVar(declaration.identifier, value, false)
}