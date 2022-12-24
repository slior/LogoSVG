
const { assertInRange,assertIsNum, ifUndefined, ifNotUndefinedDo } = require('./util.js')

const BOUNDS = {
    X_LOW : 0,
    X_HIGH : 1000,
    Y_LOW : 0,
    Y_HIGH : 1000,
    ANGLE_LOW : 0,
    ANGLE_HIGH : 360
}

const DEFAULT_PEN_COLOR = "black";



class VMState
{
    constructor(x,y,_angle,_lastX = undefined, _lastY = undefined, _pc = undefined, _pa = undefined)
    {
        assertInRange(x,BOUNDS.X_LOW,BOUNDS.X_HIGH);
        assertInRange(y,BOUNDS.Y_LOW,BOUNDS.Y_HIGH);
        assertInRange(_angle,BOUNDS.ANGLE_LOW,BOUNDS.ANGLE_HIGH);
        this.originalX = x;
        this.originalY = y;
        ifNotUndefinedDo(_lastX,() => assertInRange(_lastX,BOUNDS.X_LOW,BOUNDS.X_HIGH));
        this.lastX = ifUndefined(_lastX,x)
        ifNotUndefinedDo(_lastY,() => assertInRange(_lastY,BOUNDS.Y_LOW,BOUNDS.Y_HIGH));
        this.lastY = ifUndefined(_lastY,y)
        this.angle = _angle;
        this._penColor = ifUndefined(_pc,DEFAULT_PEN_COLOR)
        this._penActive = ifUndefined(_pa,true);
    }

    static newFromExisting (otherVmState,overridden) //to be used internally, when creating new instances
    {
        let originalX = ifUndefined(overridden.originalX,otherVmState.originalX);
        let originalY = ifUndefined(overridden.originalY,otherVmState.originalY);
        let lastX = ifUndefined(overridden.lastX,otherVmState.lastX);
        let lastY = ifUndefined(overridden.lastY,otherVmState.lastY);
        let angle = ifUndefined(overridden.angle,otherVmState.angle);
        let _penColor = ifUndefined(overridden.penColor,otherVmState.penColor)
        let penActive = ifUndefined(overridden.penActive,otherVmState.penActive)
        return new VMState(originalX,originalY,angle,lastX,lastY,_penColor,penActive)
    }

    /**
     * Return the angle of this state, but in radians
     */
    radianAngle()
    {
        return this.angle * Math.PI / 180;
    }

    /**
     * Return a new state with the position set to the given arguments
     * @param {number} x The x of the position to set
     * @param {number} y The y of the position to set
     */
    withLastPoint(x,y)
    {
        return VMState.newFromExisting(this,{lastX : x, lastY : y});

    }

    withAngle(a)
    {
        assertIsNum(a);
        a = a % BOUNDS.ANGLE_HIGH;
        return VMState.newFromExisting(this,{angle : a})
    }

    get penColor() { return this._penColor; }
    withPenColor(c) { return VMState.newFromExisting(this,{penColor : c})}

    get penActive() { return this._penActive }
    withPenActive(b) { return VMState.newFromExisting(this,{penActive : b})}
}

module.exports = {
    VMState,
    DEFAULT_PEN_COLOR //for testing, otherwise don't see a reason to expose this (maybe move it?)
    , BOUNDS //also here
}