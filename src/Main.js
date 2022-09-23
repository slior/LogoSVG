
const { LogoProcessor } = require("./LogoProcessor.js")
const { DrawingContext } = require("./DrawingContext.js")
const { createParser } = require("./Lang")

const CURSOR_SIZE = 10;

function radians(deg)
{
    return (deg % 360) * Math.PI / 180
}


class Painter
{
    constructor(processor,context)
    {
        this.processor = processor;
        this.context = context;
        this.cursorObj = this.createCursor(this.context);
        this.moveCursorToContext()
    }

    createCursor(dc)
    {
        let x1 = dc.lastX
        let y1 = dc.lastY
        let angleTo1stArm = radians(135);
        let x2 = x1 + CURSOR_SIZE * Math.cos(angleTo1stArm)
        let y2 = y1 + CURSOR_SIZE * Math.sin(angleTo1stArm)
        
        let angleTo2ndArm = radians(225);
        let x3 = x1 + CURSOR_SIZE * Math.cos(angleTo2ndArm)
        let y3 = y1 + CURSOR_SIZE * Math.sin(angleTo2ndArm)
        
        let points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x1},${y1}`
        
        return dc.drawingObj().polygon(points).fill('red').stroke({ width: 1 })
    }

    processProgram(program)
    {
        this.empty();
        program.statements.forEach(st => this.processStatement(st))
        this.moveCursorToContext()

    }

    processStatement(st)
    {
        this.processor.processStatement(st,this.context);
    }

    empty()
    {
        this.context.drawingObj().clear();
        this.context.drawingObj().add(this.cursorObj);
    }

    moveCursorToContext()
    {
        this.cursorObj.center(this.context.lastX,this.context.lastY)
        let currentCursorAngle = this.cursorObj.transform().rotate;
        let dAngle = this.context.angle - currentCursorAngle;
        this.cursorObj.rotate(dAngle);
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
    let parser = createParser()

    let program = parser(programCode);
    // console.log(`Parsed program: ${JSON.stringify(program)}`)
    return program;
}

module.exports = {
    newPainter,
    parseCode
}
