const assert = require('assert');
const {VMState,DEFAULT_PEN_COLOR} = require('../src/VMState')

describe("VMState",function() {
    it("Sets initialization values correctly",function() {
        let vms = new VMState(10,10,0)

        assert.strictEqual(vms.originalX,10)
        assert.strictEqual(vms.originalY,10);
        assert.strictEqual(vms.lastX,vms.originalX);
        assert.strictEqual(vms.lastY,vms.originalY);
        assert.strictEqual(vms.angle,0);
        assert.strictEqual(vms.penActive,true)
        assert.strictEqual(vms.penColor,DEFAULT_PEN_COLOR)

        let vms2 = new VMState(5,6,0,20,30,"red",false);

        assert.strictEqual(vms2.originalX,5)
        assert.strictEqual(vms2.originalY,6);
        assert.strictEqual(vms2.lastX,20);
        assert.strictEqual(vms2.lastY,30);
        assert.strictEqual(vms2.angle,0);
        assert.strictEqual(vms2.penActive,false)
        assert.strictEqual(vms2.penColor,"red")


    })

    it("Modifies values correctly, w/o changing original",function() {
        let vms = new VMState(10,20,90)

        var newState = vms.withAngle(100);
        assert.strictEqual(newState.angle,100)
        assert.strictEqual(vms.angle,90)
        
        newState = vms.withLastPoint(10,25)
        assert.strictEqual(newState.lastX,10)
        assert.strictEqual(newState.lastY,25)
        assert.strictEqual(vms.lastY,20)

        newState = vms.withPenActive(false);
        assert.strictEqual(newState.penActive,false)
        assert.strictEqual(vms.penActive,true)


        newState = vms.withPenColor("red")
        assert.strictEqual(newState.penColor,"red")
        assert.strictEqual(vms.penColor,DEFAULT_PEN_COLOR)
    })
})