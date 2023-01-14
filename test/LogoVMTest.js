const assert = require('assert');
const { LogoVM } = require('../src/LogoVM')
const { VMState } = require('../src/VMState')
const { number } = require("./util")
const {Forward,VarDecl,VarEvaluation} = require('../src/IR')

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
            let s2 = vm.right(number(45),s1)
            assert.strictEqual(s1.lastX,s2.lastX)
            assert.strictEqual(s1.lastY,s2.lastY)
            assert.strictEqual(s2.angle,s1.angle + 45)
        })

        it("Calculates correct angle when it's more than 360 degrees", function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(50,50,150)
            let s2 = vm.right(number(250),s1)

            assert.strictEqual(s2.angle,(s1.angle + 250) % 360)
        })

        it("Reject negative values",function(){
            assert.throws(() => {
                let vm = new LogoVM({},createMockVMImpl)
                let s1 = new VMState(150,50,0)
                vm.right(number(-5),s1)
            }, /must be non-negative. Got -5/, "negative value for right")
    
        })
    })

    describe("forward", function() {
        it("Returns a new VM state with correct x,y coordinates", function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(150,50,0)
            let s2 = vm.forward(number(30),s1)

            assert.strictEqual(s2.lastX,s1.lastX+30,"Expected x to advance")
            assert.strictEqual(s1.lastY,s2.lastY)
            assert.strictEqual(s2.angle,s1.angle)

            let s3 = new VMState(150,50,90)
            let s4 = vm.forward(number(30.2),s3)

            assert.strictEqual(s4.lastX,s3.lastX)
            assert.strictEqual(s4.lastY,s3.lastY+30.2,"Expected y to advance")
            assert.strictEqual(s4.angle,s3.angle)

        })

        it("Rejects negative values",function() {
            assert.throws(() => {
                let vm = new LogoVM({},createMockVMImpl)
                let s1 = new VMState(150,50,0)
                vm.forward(number(-5),s1)
            }, /can only accept non-negative values/, "negative value for forward")
    
        })
    })

    describe("loop",function() {
        it("Iterates the number of times given",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(150,50,0)
            let statements = [
                new Forward(number(25))
            ]

            let itercount = 2;
            let s2 = vm.loop(number(itercount),statements,s1)

            assert.strictEqual(s2.lastX,s1.lastX + itercount * 25,"Expected forward to execute twice")
            assert.strictEqual(s2.lastY,s1.lastY)
            assert.strictEqual(s2.angle,s1.angle)
        })

        it("Reject negative values for iteration count",function(){
            assert.throws(() => {
                let vm = new LogoVM({},createMockVMImpl)
                let s1 = new VMState(150,50,0)
                let statements = [
                    new Forward(number(25))
                ]
    
                let itercount = -3;
                let s2 = vm.loop(number(itercount),statements,s1)
            }, /-3 is negative/, "negative value for iteration count")
    
        })
    })

    describe("variables",function() {
        it("defines a new variable on the state",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.declareVar(new VarDecl("newvar",number(5)),s1)
            assert.strictEqual(s2.valueOf("newvar"),5)
        })

        it("Evaluates a declared variable",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.declareVar(new VarDecl("newvar",number(5)),s1)
            let s3 = vm.forward(new VarEvaluation("newvar"),s2)
            assert.strictEqual(s3.lastX,200+5)//the original 200 x location + 5 as value of 'newvar'
        })
    })
})