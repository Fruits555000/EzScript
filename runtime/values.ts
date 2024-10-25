export type ValueType = "nil" | "number";

export interface RuntimeVal {
    type: ValueType;
}

export interface NilVal extends RuntimeVal {
    type: "nil";
    value: "null";
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}