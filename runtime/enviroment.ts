import { MK_BOOL, MK_NATIVE_FN, MK_NIL, MK_NUMBER, MK_OBJECT, type BooleanVal, type RuntimeVal } from "./values.ts";

export function createGlobalEnviroment() {
    const env = new Enviroment()

    env.declareVar("nil", MK_NIL(), true)
    env.declareVar("true", MK_BOOL(true), true)
    env.declareVar("false", MK_BOOL(false), true)

    // Function Handles
    function tickFunc() {
        return MK_NUMBER(Date.now())
    }

    // Functions

    env.declareVar("print", MK_NATIVE_FN((args, _scope) => {console.log(...args); return MK_NIL();}), true)
    env.declareVar("warn", MK_NATIVE_FN((args, _scope) => {console.warn(...args); return MK_NIL();}), true)
    env.declareVar("error", MK_NATIVE_FN((args, _scope) => {console.error(...args); return MK_NIL();}), true)

    env.declareVar("tick", MK_NATIVE_FN(tickFunc), true)

    // Libraries

    env.declareVar("math", MK_OBJECT(
        new Map()
        .set("pi", MK_NUMBER(Math.PI))
        .set("tau", MK_NUMBER(Math.PI * 2))
        .set("goldr", MK_NUMBER((1 + Math.sqrt(5))/2))
        ), true)

    return env
}

export default class Enviroment {
    private parent?: Enviroment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor (parentENV?: Enviroment) {
        const global = parentENV ? true : false
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar (varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname}, as it already is defined.`
        }

        this.variables.set(varname, value)

        if (constant) {
            this.constants.add(varname)
        }

        return value
    }

    public assignVar (varname: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varname)

        // Can't reassign a constant (Only used for in-built variables)
        if (env.constants.has(varname)) {
            throw `Couldn't reasign the in-built variable '${varname}' as in-built variables can't be modified`
        }

        env.variables.set(varname, value)

        return value
    }

    public lookupVar (varname: string): RuntimeVal {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }

    public resolve (varname: string): Enviroment {
        if (this.variables.has(varname)) 
            return this;

        if (this.parent == undefined)
            throw `Can't resolve '${varname}' as it does not exist`

        return this.parent.resolve(varname);
    }
}