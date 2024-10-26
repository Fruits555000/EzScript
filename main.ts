import Parser from "./frontend/parser.ts";
import Enviroment, { createGlobalEnviroment } from "./runtime/enviroment.ts";
import { evaluate } from "./runtime/interpreter.ts";

main()

async function main() {
    const code = await Deno.readTextFile("./test.txt");
    const parser = new Parser();
    const env = createGlobalEnviroment()

    const program = parser.produceAST(code)
    const result = evaluate(program, env)

    console.log(result)
}
