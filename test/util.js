
const {NumberLiteral,BinaryOp} = require("../src/IR")

const number = (num) => new NumberLiteral(num)
const binOp = (op,arg1,arg2) => new BinaryOp(op,arg1,arg2)

module.exports = {
    number,
    binOp
}