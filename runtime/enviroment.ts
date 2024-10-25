import type { RuntimeVal } from "./values.ts";

export default class Enviroment {
    private parent?: Enviroment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor (parentENV?: Enviroment) {
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