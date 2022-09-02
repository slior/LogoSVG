
const { SVG } = require('@svgdotjs/svg.js')
const { assertInRange, assertNotNull,assertIsNum } = require('./util.js')

const BOUNDS = {
    X_LOW : 0,
    X_HIGH : 1000,
    Y_LOW : 0,
    Y_HIGH : 1000,
    ANGLE_LOW : 0,
    ANGLE_HIGH : 360
}


class DrawingContext
{
    constructor(x,y,_angle,drawingElement)
    {
        assertInRange(x,BOUNDS.X_LOW,BOUNDS.X_HIGH);
        assertInRange(y,BOUNDS.Y_LOW,BOUNDS.Y_HIGH);
        assertInRange(_angle,BOUNDS.ANGLE_LOW,BOUNDS.ANGLE_HIGH);
        assertNotNull(drawingElement);
        this.lastX = x;
        this.lastY = y;
        this.angle = _angle;
        this.draw = SVG().addTo(drawingElement).size('100%', '100%');
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

    drawingObj()
    {
        return this.draw;
    }

    setAngle(a)
    {
        assertIsNum(a);
        a = a % BOUNDS.ANGLE_HIGH;
        this.angle = a;
    }
}

module.exports = {
    DrawingContext
}