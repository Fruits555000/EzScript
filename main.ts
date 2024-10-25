import Parser from "./frontend/parser.ts";
import Enviroment from "./runtime/enviroment.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_BOOL, MK_NIL } from "./runtime/values.ts";

main()

async function main() {
    const code = await Deno.readTextFile("./test.txt");
    const parser = new Parser();
    const env = new Enviroment();

    // Global Variables
    env.declareVar("nil", MK_NIL(), true)
    env.declareVar("true", MK_BOOL(true), true)
    env.declareVar("false", MK_BOOL(false), true)

    const program = parser.produceAST(code)
    const result = evaluate(program, env)

    console.log(result)
}
