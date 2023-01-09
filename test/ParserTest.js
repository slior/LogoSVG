const assert = require('assert');
const { createParser } = require("../src/Lang.js")
const {Forward,Right, Program, Loop,SetPenColor, PenActive, Comment, BinaryOp, NumberLiteral} = require("../src/IR");
const {number,binOp} = require("./util")

describe('Parser', function () {
  describe('Language Parser', function () {
    it('successfully parses a simple square drawing program', function () {
      
      let testProgram = String.raw`
        fd 100;
        rt 90;
        fd 100;
        rt 90;
        fd 100;
        rt 90;
        fd 100;
      `

      let p = createParser()

      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(number(100)),
        new Right(number(90)),
        new Forward(number(100)),
        new Right(number(90)),
        new Forward(number(100)),
        new Right(number(90)),
        new Forward(number(100))
      ]))
    });

    it('Can parse a loop',function() {
      let testProgram = String.raw`
        repeat 4 
          fd 100;
          rt 90;
        end;
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Loop(number(4),[
          new Forward(number(100)),
          new Right(number(90))
        ])
      ]))
    });

    it ('Can parse a pen color statement',function() {
      let testProgram = String.raw`
          fd 100;
          rt 90;
          pc red;
          fd 100;
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(number(100)),
        new Right(number(90)),
        new SetPenColor("red"),
        new Forward(number(100))

      ]))
    });

    it('Can parse a nested loop', function() {
      let testProgram = String.raw`
          repeat 6
            repeat 4
              fd 50;
              rt 90;
            end;
            rt 45;
          end;
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Loop(number(6),[
          new Loop(number(4),[
            new Forward(number(50)),
            new Right(number(90))
          ]),
          new Right(number(45))
        ])
      ]))

    });

    it ("Can parse a 'left' as an opposite of 'right'", function() {
      let testProgram = String.raw`
        fd 50;
        rt 90;
        lt 45;
        fd 50;
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(number(50)),
        new Right(number(90))
        , new Right(binOp("-",number(360),number(45)))
        , new Forward(number(50))
      ]))

    });

    it("Can parse a pen up and down statements correctly", function() {
      let testProgram = String.raw`
        fd 50;
        pu;
        fd 50;
        pd;
        fd 50;
      `

      let p = createParser()
      let result = p(testProgram)

      let expectedProgram = new Program([
        new Forward(number(50)),
        new PenActive(false),
        new Forward(number(50)),
        new PenActive(true),
        new Forward(number(50))
      ])

      assert.equal(expectedProgram.statements[1].isActive,false)

      assert.deepEqual(result,expectedProgram)
    });

    it("Can parse a comment successfully", function() {
      let testProgram = String.raw`
        // forward 50
        fd 50;
        //a long right branch
        rt 90;
        fd 100;
        //A square
        repeat 4
          //make a right
          rt 90;
          //and go forward
          fd 40;
        end;
        //Done!
      `

      let p = createParser()
      let result = p(testProgram)

      let expectedProgram = new Program([
        new Comment(" forward 50"),
        new Forward(number(50)),
        new Comment("a long right branch"),
        new Right(number(90)),
        new Forward(number(100)),
        new Comment("A square"),
        new Loop(number(4),[
          new Comment("make a right"),
          new Right(number(90)),
          new Comment("and go forward"),
          new Forward(number(40))
        ]),
        new Comment("Done!")
      ])

      assert.deepEqual(result,expectedProgram)
    })

    it("Can parse a back command properly",function() {
      let testProgram = String.raw`
        repeat 4
          bk 50;
          rt 90;
        end;

      `

      let expectedProgram = new Program([
        new Loop(number(4),[
          new Right(number(180)),
          new Forward(number(50)),
          new Right(number(180)),
          new Right(number(90))
        ])
      ])

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,expectedProgram)
    })

    it("Can parse a simple number literal", function() {
      let testProgram = String.raw`
        fd 10.1;
        fd .5;
        fd 50;
      `

      let p = createParser()
      let result = p(testProgram)

      let expectedProgram = new Program([
        new Forward(number(10.1))
        , new Forward(number(0.5))
        , new Forward(number(50))
      ])
      assert.deepEqual(result,expectedProgram)
    })

    it ("Can parse a binary operator expression when a number is expected", function() {
      let testProgram = String.raw`
        fd 10 + 2;
        rt 5 - .5;
        rt 10 - 2 + 5;
      `

      let p = createParser()
      let result = p(testProgram)

      let expectedProgram = new Program([
        new Forward(binOp('+',number(10),number(2)))
        , new Right(binOp('-',number(5),number(0.5)))
        , new Right(binOp('+',binOp('-',number(10),number(2)),number(5)))
      ])
      assert.deepEqual(result,expectedProgram)
    })

    it("Can parse a loop with an expression",function() {
      let testProgram = String.raw`
        repeat 350 + 10
          fd 1;
          rt 1;
        end;

      `

      let expectedProgram = new Program([
        new Loop(new BinaryOp('+',new NumberLiteral(350),new NumberLiteral(10)),[
          new Forward(number(1)),
          new Right(number(1)),
        ])
      ])

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,expectedProgram)
    })

    it ("Can parse multiplication",function() {
      let testProgram = String.raw`
        fd 10 * 2;
        rt 5 / .5;
        rt 10 - 2 * 5;
      `

      let p = createParser()
      let result = p(testProgram)

      let expectedProgram = new Program([
        new Forward(binOp('*',number(10),number(2)))
        , new Right(binOp('/',number(5),number(0.5)))
        , new Right(binOp('-',number(10),binOp('*',number(2),number(5))))
      ])
      assert.deepEqual(result,expectedProgram)
    })
  });
});