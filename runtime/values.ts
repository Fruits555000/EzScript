import Enviroment from "./enviroment.ts";

export type ValueType = "nil" | "number" | "boolean" | "object" | "native-fn";

export interface RuntimeVal {
    type: ValueType;
}

export interface NilVal extends RuntimeVal {
    type: "nil";
    value: null;
}

export function MK_NIL() {
    return { type: "nil", value: null} as NilVal
}

export interface BooleanVal extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export function MK_BOOL(b = true) {
    return { type: "boolean", value: b} as BooleanVal
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export function MK_NUMBER(n = 0) {
    return { type: "number", value: n} as NumberVal
}

export interface ObjectVal extends RuntimeVal {
    type: "object";
    properties: Map<string, RuntimeVal>
}

export function MK_OBJECT(obj: Map<string, RuntimeVal>): ObjectVal {
    return { type: "object", properties: obj } as ObjectVal;
}


export type FunctionCall = (args:RuntimeVal[], env: Enviroment) => RuntimeVal

export interface NativeFnVal extends RuntimeVal {
    type: "native-fn"
    call: FunctionCall
}

export function MK_NATIVE_FN(call:FunctionCall) {
    return { type: "native-fn", call} as NativeFnVal
}
