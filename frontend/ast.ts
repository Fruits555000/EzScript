export type NodeType = 
    // Statements
    |"Program"
    |"VarDeclaration"
    |"ForNumericStmt"
    |"ForGenericStmt"

    // Expressions
    | "AssignmentExpr"
    | "MemberExpr"
    | "CallExpr"

    // Literals
    | "Property"
    | "ObjectLiteral"
    | "NumericLiteral" 
    | "BinaryExpr"
    | "Identifier" ;

export interface Stmt {
    kind: NodeType
}

export interface Program extends Stmt {
    kind: "Program";
    body: Stmt[];
}

export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    identifier: string;
    value?: Expr;
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
    kind: "AssignmentExpr";
    assigne: Expr;
    value: Expr;
}

export interface BinaryExpr extends Expr {
    kind: "BinaryExpr";
    left: Expr;
    right: Expr;
    operator: string;
}

export interface CallExpr extends Expr {
    kind: "CallExpr";
    args: Expr[];
    caller: Expr;
}

export interface MemberExpr extends Expr {
    kind: "MemberExpr";
    object: Expr;
    property: Expr;
    computed: boolean;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends Expr {
    kind: "NumericLiteral";
    value: number;
}

export interface Property extends Expr {
    type: "Property";
    key: string;
    value?: Expr;
}

export interface ObjectLiteral extends Expr {
    kind: "ObjectLiteral";
    properties: Property[];
}

export interface ForNumericStmt extends Stmt {
    kind: "ForNumericStmt";
    variable: Identifier;
    start: NumericLiteral;
    end: NumericLiteral;
    step: NumericLiteral;
    body: Expr[];
}

export interface ForGenericStmt extends Stmt {
    kind: "ForGenericStmt"
    variables: Identifier[];
    iterators: Expr[]
    body: Expr[]
}    