
const assert = require("assert");
const {assertNotNull,assertIsNum} = require("./util")

class Comment
{
    constructor (txt)
    {
        this._text = txt || ""
    }

    get text() { return this._text }
}


class Action
{
    constructor (act)
    {
        assert (act !== "" && act !== null)
        this._action = act;
    }

    get action()
    {
        return this._action;
    }
}

class Forward extends Action
{
    
    constructor (__howMuch)
    {
        super(Forward.action)
        assert(__howMuch instanceof Expr,"__howMuch must be an expression")
        this._howMuch = __howMuch
    }

    get howMuch()
    {
        return this._howMuch;
    }
}

Forward.action = 'fd'

class Right extends Action
{
    constructor(_howMuch)
    {
        super(Right.action)
        assert(_howMuch instanceof Expr,"__howMuch must be an expression")
        this.howMuch = _howMuch
    }
}
Right.action = 'rt'

class SetPenColor extends Action
{
    constructor(newColor)
    {
        super(SetPenColor.action)
        this.penColor = newColor;
    }

    get color() { return this.penColor }
}
SetPenColor.action = "pc"

class PenActive extends Action
{
    constructor(isUp)
    {
        super(PenActive.action);
        this.active = isUp;
    }

    get isActive() { return this.active }
}
PenActive.action = "pa"

class Block
{
    constructor(_stmts)
    {
        this._statements = _stmts || [];
    }

    get statements()
    {
        return this._statements.filter(st => !(st instanceof Comment));
    }
}


class Loop extends Action
{
    constructor(_iterCount,_stmts)
    {
        super(Loop.action)
        assert(_iterCount instanceof Expr, "Iteration count must be a numeric expression")
        this.block = new Block(_stmts);
        this._iterCount = _iterCount;
    }

    get iterCount() { return this._iterCount }
    get statements() { return this.block.statements }
}

Loop.action = 'loop'

class Program extends Block
{
    constructor(_stmts)
    {
        super(_stmts)
    }
}


//Intermediate representation for expressions
class Expr {}

class NumberLiteral extends Expr
{
    constructor(num)
    {
        super();
        assertIsNum(num)
        this._number = num;
    }

    get number() { return this._number }
}

class BinaryOp extends Expr
{
    constructor(operator,op1,op2)
    {
        super();
        assertNotNull(operator)
        assertNotNull(op1)
        assertNotNull(op2)
        this._operator = operator;
        this._op1 = op1;
        this._op2 = op2;
    }

    get operator() { return this._operator }
    get operand1() { return this._op1 }
    get operand2() { return this._op2 }
}

class VarEvaluation extends Expr
{
    constructor(_varName)
    {
        super();
        assertNotNull(_varName)
        this._varName = _varName
    }

    get varName() { return this._varName }
}

class VarDecl extends Action
{
    constructor(_varName,_initialValueExpr)
    {
        super(VarDecl.action)
        assertNotNull(_varName)
        assertNotNull(_initialValueExpr)

        this._varName = _varName;
        this._initialValueExpr = _initialValueExpr
    }

    get varName() { return this._varName }
    get initializer() { return this._initialValueExpr }
}

VarDecl.action = 'VarDecl'

class VarAssign extends Action
{
    constructor(_varName,_assignedExpr)
    {
        super(VarAssign.action)
        assertNotNull(_varName)
        assertNotNull(_assignedExpr)

        this._varName = _varName;
        this._assignedExpr = _assignedExpr
    }

    get varName() { return this._varName }
    get rhs() { return this._assignedExpr} //right hand side of the assignment
}

VarAssign.action = 'VarAssign'

module.exports = {
    Forward,
    Right,
    Loop,
    Program,
    SetPenColor,
    PenActive,
    Comment,
    BinaryOp,
    NumberLiteral,
    VarDecl,
    VarEvaluation,
    VarAssign
}