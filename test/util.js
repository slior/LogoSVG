
const {NumberLiteral,BinaryOp,TextLiteral} = require("../src/IR")

const number = (num) => new NumberLiteral(num)
const binOp = (op,arg1,arg2) => new BinaryOp(op,arg1,arg2)
const text = (t) => new TextLiteral(t)

module.exports = {
    number,
    text,
    binOp
}