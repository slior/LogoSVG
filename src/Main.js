
const { LogoProcessor } = require("./LogoProcessor.js")
const { DrawingContext } = require("./DrawingContext.js")
const { createParser } = require("./Lang")

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


function parseCode(programCode)
{
    let parser = createParser({
        createForward(howMuch) {
            return { action : "fd", params : [howMuch]};
        },
        createRight(howMuch) {
            return { action : "rt", params : [howMuch]};
        }
    })

    let program = parser(programCode);
    console.log(`Parsed program: ${JSON.stringify(program)}`)
    return program;
}

module.exports = {
    newPainter,
    parseCode
}
