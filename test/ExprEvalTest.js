const assert = require('assert');
const rewire = require("rewire");
const {number,binOp} = require('./util')

const ExprEval = rewire('../src/LogoVM.js').__get__("ExprEval")

describe("Expr Evaluator",function() {
    it("Should evaluate number literals",function() {
        let ee = new ExprEval()

        let result = ee.eval(number(5))
        assert.strictEqual(result,5)
    })

    it("Should evaluate add expr",function() {
        let ee = new ExprEval()
        assert.strictEqual(
            ee.eval(binOp('+',number(5),number(100)))
            ,105)

        assert.strictEqual(
            ee.eval(binOp('+',binOp('+',number(4),number(2)),number(10))),
            16)
    })

    it("Should evaluate subtraction expr",function() {
        let ee = new ExprEval()
        assert.strictEqual(
            ee.eval(binOp('-',number(500),number(220)))
            ,280)

        assert.strictEqual(
            ee.eval(binOp('-',binOp('-',number(4),number(2)),number(5))),
            -3)
    })

    it("Should evaluate multiplication expr",function() {
        let ee = new ExprEval()
        assert.strictEqual(
            ee.eval(binOp('*',number(-1),number(45)))
            ,-45)

        assert.strictEqual(
            ee.eval(binOp('*',binOp('*',number(4),number(2)),number(5))),
            40)
    })

    it("Should evaluate division expr",function() {
        let ee = new ExprEval()
        assert.strictEqual(
            ee.eval(binOp('/',number(1),number(4)))
            ,0.25)

        assert.strictEqual(
            ee.eval(binOp('/',binOp('/',number(4),number(1)),number(2))),
            2)
    })

    it("Should evaluate mixed operators",function() {
        let ee = new ExprEval()

        assert.strictEqual(
            ee.eval(binOp('*',binOp('/',number(4),number(1)),number(8))),
            32)

        assert.strictEqual(
            ee.eval(binOp('*',binOp('+',number(4),number(5)),number(3))),
            27)
    })

    it("Should evaluate an exponent",function() {
        let ee = new ExprEval()

        assert.strictEqual(
            ee.eval(binOp('^',number(10),number(3))),
            1000)
    })

    it("should evaluate comparison operators",function() {
        let ee = new ExprEval()

        assert.strictEqual(ee.eval(binOp('<',number(10),number(12))), true)
        assert.strictEqual(ee.eval(binOp('<',number(10),number(2))), false)

        assert.strictEqual(ee.eval(binOp('>',number(10),number(12))), false)
        assert.strictEqual(ee.eval(binOp('>',number(10),number(2))), true)

        assert.strictEqual(ee.eval(binOp('<=',number(10),number(12))), true)
        assert.strictEqual(ee.eval(binOp('<=',number(10),number(2))), false)
        assert.strictEqual(ee.eval(binOp('<=',number(10),number(10))), true)

        assert.strictEqual(ee.eval(binOp('>=',number(10),number(12))), false)
        assert.strictEqual(ee.eval(binOp('>=',number(10),number(2))), true)
        assert.strictEqual(ee.eval(binOp('>=',number(2),number(2))), true)

        assert.strictEqual(ee.eval(binOp('==',binOp('+',number(1),number(1)),number(2))), true)
        assert.strictEqual(ee.eval(binOp('==',binOp('-',number(1),number(1)),number(2))), false)

        assert.strictEqual(ee.eval(binOp('=/=',binOp('+',number(1),number(1)),number(2))), false)
        assert.strictEqual(ee.eval(binOp('=/=',binOp('+',number(1),number(1)),binOp('-',number(10),number(3)))), true)
    })
})
