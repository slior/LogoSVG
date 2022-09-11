
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

module.exports = {
    Forward,
    Right
}