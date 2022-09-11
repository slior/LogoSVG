
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
    constructor (_howMuch)
    {
        super('fd')
        assert(!isNaN(_howMuch),"_howMuch must be a number")
        assert(_howMuch >= 0,"number of steps must be non-negative");
        this.howMuch = _howMuch
    }
}

class Right extends Action
{
    constructor(_howMuch)
    {
        super('rt')
        assert(!isNaN(_howMuch),"_howMuch must be a number")
        assert(_howMuch >= 0,"angle must be non-negative");
        this.howMuch = _howMuch
    }
}

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

class Loop extends Block
{
    constructor(_iterCount,_stmts)
    {
        assert(!isNaN(_iterCount),"iteration count must be a number");
        super(_stmts)
        this._iterCount = Math.max(0,_iterCount)
    }

    get iterCount() { return this._iterCount }
}

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
    Program
}