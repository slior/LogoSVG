const assert = require('assert');
const { LogoVM } = require('../src/LogoVM')
const { VMState } = require('../src/VMState')


const createMockVMImpl = (drawingEl) => { return {
    line : (x1,y1,x2,y2) => {
        return {
            stroke : (strokeProps) => {
                return {}
            }
        }
    },
    clear : () => {
        //do nothing in mock
    }
}}

describe("LogoVM",function() {
    describe("right",function() {
        it("Returns a new VM state with the updated angle", function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(50,50,0)
            let s2 = vm.right(45,s1)
            assert.strictEqual(s1.lastX,s2.lastX)
            assert.strictEqual(s1.lastY,s2.lastY)
            assert.strictEqual(s2.angle,s1.angle + 45)
        })

        it("Calculates correct angle when it's more than 360 degrees", function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(50,50,150)
            let s2 = vm.right(250,s1)

            assert.strictEqual(s2.angle,(s1.angle + 250) % 360)
        })
    })

    describe("forward", function() {
        it("Returns a new VM state with correct x,y coordinates", function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(150,50,0)
            let s2 = vm.forward(30,s1)

            assert.strictEqual(s2.lastX,s1.lastX+30,"Expected x to advance")
            assert.strictEqual(s1.lastY,s2.lastY)
            assert.strictEqual(s2.angle,s1.angle)

            let s3 = new VMState(150,50,90)
            let s4 = vm.forward(30,s3)

            assert.strictEqual(s4.lastX,s3.lastX)
            assert.strictEqual(s4.lastY,s3.lastY+30,"Expected y to advance")
            assert.strictEqual(s4.angle,s3.angle)

        })
    })
})