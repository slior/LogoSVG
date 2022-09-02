
const { SVG } = require('@svgdotjs/svg.js')

class DrawingContext
{
    constructor(x,y,_angle,drawingElement)
    {
        //TODO: validate inputs
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
        this.angle = a;
    }
}

module.exports = {
    DrawingContext
}