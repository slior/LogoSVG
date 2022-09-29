
const { SVG } = require('@svgdotjs/svg.js')
const {assertNonNegativeNum,assertNotNull} = require("./util")
const {Forward,Right, Loop, SetPenColor} = require("./IR")

var COMMAND_MAP = null;

function commandMap(processor,vmState)
{
    if (!COMMAND_MAP)
    {
        let commands = {}
        commands[Forward.action] = (st) => { processor.forward(st.howMuch,vmState); }
        commands[Right.action] = (st) => { processor.right(st.howMuch,vmState); }
        commands[Loop.action] = (st) => { processor.loop(st.iterCount,st.statements,vmState); }
        commands[SetPenColor.action] = (st) => { processor.setPenColor(st.penColor, vmState); }
        COMMAND_MAP = commands;
    }
    return COMMAND_MAP
}

class LogoVM
{
    constructor(drawingElement)
    {
        assertNotNull(drawingElement);
        this.draw = SVG().addTo(drawingElement).size('100%', '100%');
    }

    get drawingObj() {
        return this.draw
    }

    clearDrawing()
    {
        this.drawingObj.clear();
    }

    processStatement(st, vmState)
    {
        let commands = commandMap(this,vmState);
        let cmd = commands[st.action];
        if (cmd)
        {
            // console.log(`Executing: ${st.action}, ${JSON.stringify(st)}`)
            cmd.apply(this,[st])
        }
        else
        {
            console.log(`command ${st.action} not recognized`);
        }
    }

    forward(len,vmState)
    {
        let x2 = vmState.lastX + len * Math.cos(vmState.radianAngle())
        let y2 = vmState.lastY + len * Math.sin(vmState.radianAngle())
        this.drawingObj.line(vmState.lastX, vmState.lastY, x2, y2).stroke({ color: vmState.penColor,width: 1 }) 
        vmState.lastPointIs(x2,y2);
    }

    right(angle,vmState)
    {
        vmState.setAngle(vmState.angle + angle)
    }

    loop(iterCount,statements,vmState)
    {
        assertNonNegativeNum(iterCount)
        var iters = iterCount
        while (iters > 0)
        {
            statements.forEach(st => this.processStatement(st,vmState))
            iters--;
        }
    }

    setPenColor(color,vmState)
    {
        vmState.penColor = color
    }
}


module.exports = {
    LogoVM
}