import { MK_BOOL, MK_NATIVE_FN, MK_NIL, MK_NUMBER, MK_OBJECT, type BooleanVal, type NumberVal, type RuntimeVal } from "./values.ts";

export function createGlobalEnviroment() {
    const env = new Enviroment()

    env.declareVar("nil", MK_NIL(), true)
    env.declareVar("true", MK_BOOL(true), true)
    env.declareVar("false", MK_BOOL(false), true)

    // Functions

    env.declareVar("print", MK_NATIVE_FN((args, _scope) => {console.log(...args); return MK_NIL();}), true)
    env.declareVar("warn", MK_NATIVE_FN((args, _scope) => {console.warn(...args); return MK_NIL();}), true)
    env.declareVar("error", MK_NATIVE_FN((args, _scope) => {console.error(...args); return MK_NIL();}), true)

    // Libraries

    env.declareVar("math", MK_OBJECT(
        new Map()

        // Constants
        .set("pi", MK_NUMBER(Math.PI))
        .set("tau", MK_NUMBER(Math.PI * 2))
        .set("goldr", MK_NUMBER((1 + Math.sqrt(5))/2))
        .set("sgoldr", MK_NUMBER((1/3)*(1+Math.cbrt((29+3*Math.sqrt(93))/2)+Math.cbrt((29-3*Math.sqrt(93))/2))))
        .set("e", MK_NUMBER(Math.E))
        .set("ln2", MK_NUMBER(Math.LN2))
        .set("huge", MK_NUMBER(Number.POSITIVE_INFINITY))
        .set("nan", MK_NUMBER(NaN))

        // Math Functions
        .set("rad", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(arg * (Math.PI / 180));}))

        // Trigonometric Funcions
        .set("sin", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.sin(arg));}))
        .set("cos", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.cos(arg));}))
        .set("tan", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.tan(arg));}))
        .set("cot", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(1/Math.tan(arg));}))
        .set("sec", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(1/Math.cos(arg));}))
        .set("csc", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(1/Math.sin(arg));}))

        .set("asin", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.asin(arg));}))
        .set("acos", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.acos(arg));}))
        .set("atan", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.atan(arg));}))
        .set("atan2", MK_NATIVE_FN((args) => {const arg1 = (args[0] as NumberVal).value; const arg2 = (args[1] as NumberVal).value; return MK_NUMBER(Math.atan2(arg1, arg2));}))
        .set("acot", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER((-Math.atan(arg)) + Math.PI/2)}))
        .set("acot2", MK_NATIVE_FN((args) => {const arg1 = (args[0] as NumberVal).value; const arg2 = (args[1] as NumberVal).value; return MK_NUMBER((-Math.atan2(arg1, arg2)) + Math.PI/2);}))
        .set("asec", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.acos(1/arg));}))
        .set("acsc", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.asin(1/arg));}))

        .set("sinh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.sinh(arg));}))
        .set("cosh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.cosh(arg));}))
        .set("tanh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.tanh(arg));}))
        .set("coth", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.cosh(arg)/Math.sinh(arg));}))
        .set("sech", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(1/Math.cosh(arg));}))
        .set("csch", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(1/Math.sinh(arg));}))

        .set("asinh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.asinh(arg));}))
        .set("acosh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.acosh(arg));}))
        .set("atanh", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.atanh(arg));}))
        .set("acoth", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.log((arg+1)/(arg-1))/2);}))
        .set("asech", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.log(1/arg + Math.sqrt(1/(Math.pow(arg, 2))-1)));}))
        .set("acsch", MK_NATIVE_FN((args) => {const arg = (args[0] as NumberVal).value; return MK_NUMBER(Math.log(1/arg + Math.sqrt(1/(Math.pow(arg, 2))+1)));}))
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