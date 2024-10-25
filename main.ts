import Parser from "./frontend/parser.ts";
import { evaluate } from "./runtime/interpreter.ts";

main()

async function main() {
    const code = await Deno.readTextFile("./test.txt")
    const parser = new Parser()

    const program = parser.produceAST(code)
    const result = evaluate(program)

    console.log(result)
}
