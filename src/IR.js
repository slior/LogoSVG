
const assert = require("assert");

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
        assert(!isNaN(__howMuch),"_howMuch must be a number")
        assert(__howMuch >= 0,"number of steps must be non-negative");
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
        assert(!isNaN(_howMuch),"_howMuch must be a number")
        assert(_howMuch >= 0,"angle must be non-negative: " + _howMuch);
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

class Block
{
    constructor(_stmts)
    {
        this._statements = _stmts || [];
    }

    get statements()
    {
        return this._statements;
    }
}


class Loop extends Action
{
    constructor(_iterCount,_stmts)
    {
        super(Loop.action)
        assert(!isNaN(_iterCount),"iteration count must be a number");
        this.block = new Block(_stmts);
        this._iterCount = Math.max(0,_iterCount)
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


module.exports = {
    Forward,
    Right,
    Loop,
    Program,
    SetPenColor
}