
const { LogoVM } = require("./LogoVM.js")

const CURSOR_SIZE = 10;

function radians(deg)
{
    return (deg % 360) * Math.PI / 180
}


class ProgramRunner
{
    constructor(context,_drawingElement)
    {
        this.vm = new LogoVM(_drawingElement);
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
        
        return this.vm.drawingObj.polygon(points).fill('red').stroke({ width: 1 })
    }

    run(program)
    {
        program.statements.forEach(st => this.processStatement(st))
        this.moveCursorToContext()

    }

    processStatement(st)
    {
        this.vm.processStatement(st,this.context);
    }

    empty()
    {
        this.vm.clearDrawing()
        this.vm.drawingObj.add(this.cursorObj)
    }

    moveCursorToContext()
    {
        let lastCursorX = this.cursorObj.cx()
        let lastCursorY = this.cursorObj.cy()
        let dx = this.context.lastX - lastCursorX
        let dy = this.context.lastY - lastCursorY
        this.cursorObj.transform({
            translateX : dx,
            translateY : dy,
            rotate : this.context.angle
        })
    }

    resetTo(newState)
    {//todo: validate input
        this.empty();
        this.context = newState
        this.moveCursorToContext();
    }

}

module.exports = { ProgramRunner }