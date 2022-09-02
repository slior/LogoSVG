
const { LogoProcessor } = require("./LogoProcessor.js")
const { DrawingContext } = require("./DrawingContext.js")

class Painter
{
    constructor(processor,context)
    {
        this.processor = processor;
        this.context = context;
    }

    processStatement(st)
    {
        this.processor.processStatement(st,this.context);
    }
}

function newPainter(drawingContainer,startingX,startingY,startingAngle)
{
    let context = new DrawingContext(startingX,startingY,startingAngle,drawingContainer);
    let p = new LogoProcessor();
    return new Painter(p,context);
}

module.exports = {
    newPainter

}
