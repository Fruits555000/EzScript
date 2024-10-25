export type ValueType = "nil" | "number" | "boolean";

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