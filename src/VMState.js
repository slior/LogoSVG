
const { assertInRange,assertIsNum } = require('./util.js')

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
    constructor(x,y,_angle)
    {
        assertInRange(x,BOUNDS.X_LOW,BOUNDS.X_HIGH);
        assertInRange(y,BOUNDS.Y_LOW,BOUNDS.Y_HIGH);
        assertInRange(_angle,BOUNDS.ANGLE_LOW,BOUNDS.ANGLE_HIGH);
        this.originalX = x;
        this.originalY = y;
        this.lastX = x;
        this.lastY = y;
        this.angle = _angle;
        this._penColor = DEFAULT_PEN_COLOR
    }

    radianAngle()
    {
        return this.angle * Math.PI / 180;
    }

    lastPointIs(x,y)
    {
        this.lastX = x;
        this.lastY = y;
    }

    setAngle(a)
    {
        assertIsNum(a);
        a = a % BOUNDS.ANGLE_HIGH;
        this.angle = a;
    }

    get penColor() { return this._penColor; }
    set penColor(c) { this._penColor = c }
}

module.exports = {
    VMState
}