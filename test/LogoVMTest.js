const assert = require('assert');
const { LogoVM } = require('../src/LogoVM')
const { VMState } = require('../src/VMState')
const { number,binOp } = require("./util")
const { Forward,VarDecl,VarEvaluation,VarAssign,Branch,
        WhileLoop,ProcedureDef,ProcedureCall,
        Loop,Right} = require('../src/IR')

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

        it("Executes a while loop correctly",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(150,50,0)
            let statements = [
                new Forward(number(25)),
                new VarAssign("iters",binOp("-",new VarEvaluation("iters"),number(1))) //iters -= 1
            ]

            let condVarDecl = new VarDecl("iters",number(3))
            let cond = binOp(">",new VarEvaluation("iters"),number(0))
            let whileStmt = new WhileLoop(cond,statements)
            let s2 = vm.processStatement(condVarDecl,s1) //need to declare the variable first
            let s3 = vm.processStatement(whileStmt,s2) //after declaring 'iters' - run the loop w/ the condition that tests 'iters' value

            assert.deepStrictEqual(s3.lastX,s1.lastX + (25*3))
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

        it("Assigns a new value to a declared variable",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.declareVar(new VarDecl("newvar",number(5)),s1)
            let s3 = vm.forward(new VarEvaluation("newvar"),s2)
            assert.strictEqual(s3.lastX,200+5)//the original 200 x location + 5 as value of 'newvar'
            let s4 = vm.assignVar(new VarAssign("newvar",number(8)),s3)
            assert.strictEqual(s4.valueOf("newvar"),8)
            let s5 = vm.forward(new VarEvaluation("newvar"),s4)
            assert.strictEqual(s5.lastX,200+5+8)//the original 200 x location + 5 as value of 'newvar' + 8 as new value of 'newvar'

        })

        it ("Rejects an assignment to undeclared variable",function() {
            assert.throws(() => {
                let vm = new LogoVM({},createMockVMImpl)
                let s1 = new VMState(200,300,0)
                let s2 = vm.assignVar(new VarAssign("newvar",number(8)),s1)
            },/Can't assign value to undeclared variable 'newvar'/,"assignment to undeclared variable")
        })
    })

    describe("Branch",function() {
        it("Executes a successful condition branch",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.branch(
                        new Branch(
                            binOp('==',number(2),number(2)),
                            [new Forward(number(5))]
                        )
                        ,s1
                    )
            assert.strictEqual(s2.lastX,200 + 5)
                
        })

        it("Executes the 'else' branch when condition is not met",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.declareVar(new VarDecl('x',number(5)),s1)
            let s3 = vm.branch(
                        new Branch(
                            binOp('==',new VarEvaluation('x'),number(2)),
                            [new Forward(number(5))],
                            [new Forward(number(10))]
                        )
                        ,s2
                    )
            assert.strictEqual(s3.lastX,200 + 10)
        })

        it("Executes nothing if 'else' is empty and condition not met",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.declareVar(new VarDecl('x',number(5)),s1)
            let s3 = vm.branch(
                        new Branch(
                            binOp('==',new VarEvaluation('x'),number(2)),
                            [new Forward(number(5))]
                        )
                        ,s2
                    )
            assert.strictEqual(s3.lastX,200)
        })
    })

    describe("Procedures",function() {
        it("Executes a procedure definition",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.defineProcedure(new ProcedureDef("shape",["sides","size"],
            [
              new Loop(new VarEvaluation("sides"),[
                new Forward(new VarEvaluation("size")),
                new Right(binOp("/",number(360),new VarEvaluation("sides")))
              ])
            ]),s1)

            assert.strictEqual(s1.getProcedure("shape"),null);
            assert.notStrictEqual(s2.getProcedure("shape"),null);

            let procDef = s2.getProcedure("shape")
            assert.deepEqual(procDef,new ProcedureDef("shape",["sides","size"],
            [
              new Loop(new VarEvaluation("sides"),[
                new Forward(new VarEvaluation("size")),
                new Right(binOp("/",number(360),new VarEvaluation("sides")))
              ])
            ]))
        })

        it("Executes a procedure call",function() {
            let vm = new LogoVM({},createMockVMImpl)
            let s1 = new VMState(200,300,0)
            let s2 = vm.defineProcedure(new ProcedureDef("shape",["sides","size"],
            [
              new Loop(new VarEvaluation("sides"),[
                new Forward(new VarEvaluation("size")),
                new Forward(number(20))
              ])
            ]),s1)

            let s3 = vm.callProcedure(new ProcedureCall("shape",[
                new VarAssign("sides",number(4)),
                new VarAssign("size",number(50))
            ]),s2)

            assert.strictEqual(s3.lastX,200 + 4 * (50+20))
            assert.strictEqual(s3.activeScope.definesVariable("sides"),false)

        })
    })
})