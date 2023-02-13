const assert = require('assert');
const { createParser } = require("../src/Lang.js")
const {Forward,Right, Program, Loop,SetPenColor,
       PenActive, Comment, BinaryOp,
       NumberLiteral,VarDecl,VarEvaluation,
       VarAssign,Branch,WhileLoop,
       ProcedureDef,ProcedureCall,Output,
       TextLiteral} = require("../src/IR");
const {number,binOp,text} = require("./util")

function createDefaultParser()
{
  if (!createDefaultParser.cached)
    createDefaultParser.cached = createParser('english_terse') //tests are for the default variant
  return createDefaultParser.cached
}

function parseAndCompare(testSource,expectedIR) 
{
  let p = createDefaultParser()
  let result = p(testSource)
  assert.deepStrictEqual(result,expectedIR)
}

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
      parseAndCompare(testProgram,
                      new Program([
                        new Forward(number(100)),
                        new Right(number(90)),
                        new Forward(number(100)),
                        new Right(number(90)),
                        new Forward(number(100)),
                        new Right(number(90)),
                        new Forward(number(100))
                      ])
                    )
    });

    it('Can parse a loop',function() {
      let testProgram = String.raw`
        repeat 4 
          fd 100;
          rt 90;
        end;
      `
      parseAndCompare(testProgram,
                      new Program([
                        new Loop(number(4),[
                          new Forward(number(100)),
                          new Right(number(90))
                        ])
                      ])
                    )
    });

    it ('Can parse a pen color statement',function() {
      let testProgram = String.raw`
          fd 100;
          rt 90;
          pc 'red';
          fd 100;
      `
      parseAndCompare(testProgram,
                      new Program([
                        new Forward(number(100)),
                        new Right(number(90)),
                        new SetPenColor("red"),
                        new Forward(number(100))
                
                      ])
                    )
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
      parseAndCompare(testProgram,
                      new Program([
                        new Loop(number(6),[
                          new Loop(number(4),[
                            new Forward(number(50)),
                            new Right(number(90))
                          ]),
                          new Right(number(45))
                        ])
                      ])
                    )
    });

    it ("Can parse a 'left' as an opposite of 'right'", function() {
      let testProgram = String.raw`
        fd 50;
        rt 90;
        lt 45;
        fd 50;
      `
      parseAndCompare(testProgram,
                      new Program([
                        new Forward(number(50)),
                        new Right(number(90))
                        , new Right(binOp("-",number(360),number(45)))
                        , new Forward(number(50))
                      ])
                    )
    });

    it("Can parse a pen up and down statements correctly", function() {
      let testProgram = String.raw`
        fd 50;
        pu;
        fd 50;
        pd;
        fd 50;
      `
      let expectedProgram = new Program([
        new Forward(number(50)),
        new PenActive(false),
        new Forward(number(50)),
        new PenActive(true),
        new Forward(number(50))
      ])

      assert.equal(expectedProgram.statements[1].isActive,false) //testing the IR
      parseAndCompare(testProgram,expectedProgram)
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

      parseAndCompare(testProgram,expectedProgram)
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

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Can parse a simple number literal", function() {
      let testProgram = String.raw`
        fd 10.1;
        fd .5;
        fd 50;
      `
      let expectedProgram = new Program([
        new Forward(number(10.1))
        , new Forward(number(0.5))
        , new Forward(number(50))
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it ("Can parse a binary operator expression when a number is expected", function() {
      let testProgram = String.raw`
        fd 10 + 2;
        rt 5 - .5;
        rt 10 - 2 + 5;
      `
      let expectedProgram = new Program([
        new Forward(binOp('+',number(10),number(2)))
        , new Right(binOp('-',number(5),number(0.5)))
        , new Right(binOp('+',binOp('-',number(10),number(2)),number(5)))
      ])
      
      parseAndCompare(testProgram,expectedProgram)
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

      parseAndCompare(testProgram,expectedProgram)
    })

    it ("Can parse multiplication and division",function() {
      let testProgram = String.raw`
        fd 10 * 2;
        rt 5 / .5;
        rt 10 - 2 * 5;
        fd 10 % 2;
      `
      let expectedProgram = new Program([
        new Forward(binOp('*',number(10),number(2)))
        , new Right(binOp('/',number(5),number(0.5)))
        , new Right(binOp('-',number(10),binOp('*',number(2),number(5))))
        , new Forward(binOp('%',number(10),number(2)))
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Can parse an exponent",function() {
      let testProgram = String.raw`
        fd 10 ^ 2;
      `
      let expectedProgram = new Program([
        new Forward(binOp('^',number(10),number(2)))
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Parses parenthesis correctly",function() {
      let testProgram = String.raw`
        fd (10 ^ 2);
        rt 3^(90/45);
      `

      let expectedProgram = new Program([
        new Forward(binOp('^',number(10),number(2)))
        , new Right(binOp('^',number(3),binOp('/',number(90),number(45))))
      ])

      parseAndCompare(testProgram,expectedProgram)
    }),

    it("Rewrites a negation into -1*expr",function() {
      let testProgram = String.raw`
        fd -5;
        rt 3^(2 + -1);
      `
      let expectedProgram = new Program([
        new Forward(binOp('*',number(-1),number(5)))
        , new Right(binOp('^',number(3),
                              binOp('+',number(2),
                                        binOp('*',number(-1),
                                                  number(1)))))
      ])
      
      parseAndCompare(testProgram,expectedProgram)
    })

    it("Parses a variable declaration correctly",function() {
      let testProgram = String.raw`
        let iterations = 5;
      `
      let expectedProgram = new Program([
        new VarDecl("iterations",number(5))
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Parses an expression with a variable correctly",function() {
      let testProgram = String.raw`
        let iterations = 5;
        repeat iterations
          fd 10;
          rt 360 / iterations;
        end;
      `
      let expectedProgram = new Program([
        new VarDecl("iterations",number(5))
        , new Loop(new VarEvaluation("iterations"),[
          new Forward(number(10)),
          new Right(new BinaryOp('/',number(360),new VarEvaluation("iterations")))
        ])
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Parses a variable assignment correctly",function() {
      let testProgram = String.raw`
        let iterations = 5;
        iterations = 9;
      `
      let expectedProgram = new Program([
        new VarDecl("iterations",number(5))
        , new VarAssign("iterations",number(9))
      ])

      parseAndCompare(testProgram,expectedProgram)
    })

    it("Rejects identifiers that are reserved words",function() {
      assert.throws(() => {
        let problemSource = String.raw`
          repeat fd
            rt 90;
            bk 50;
          end;
        `
        createDefaultParser()(problemSource)
      },/not a reserved_word/,"trying to parse 'fd' as an identifier")

      assert.throws(() => {
        let problemSource = String.raw`
          let repeat = 5;
        `
        createDefaultParser()(problemSource)
      },/not a reserved_word/,"trying to parse 'repeat' as a variable name")


    })

    it("Parses a simple branch correctly",function() {
      let testSource = String.raw`
        if 4 == 5 then
          fd 50;
        end;
      `

      let expectedProgram = new Program([
        new Branch(binOp('==',number(4),number(5)),[new Forward(number(50))])
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses an if-else correctly",function() {
      let testSource = String.raw`
        if 4 == 5 then
          fd 50;
        else
          fd 100;
        end;
      `

      let expectedProgram = new Program([
        new Branch(binOp('==',number(4),number(5)),
                  [new Forward(number(50))],
                  [new Forward(number(100))])
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a branch with a compound expression",function() {
      it("Parses an if-else correctly",function() {
        let testSource = String.raw`
          let iters = 5;
          if iters =/= 0 then
            repeat iters
              fd 50;
              rt 90;
            end;
          else
            fd 100;
          end;
        `
  
        let expectedProgram = new Program([
          new VarDecl('iters',number(5)),
          new Branch(binOp('=/=',new VarEvaluation('iters'),number(0)),
                      [new Loop(new VarEvaluation('iters'),
                                [new Forward(number(50)), new Right(90)])],
                      [new Forward(number(100))])
        ])
  
        parseAndCompare(testSource,expectedProgram)
      })
    })

    it("Parses a greater than operator correctly",function(){
      let testSource = String.raw`
        if 2 > 1 then
          fd 10;
        end;
      `

      let expectedProgram = new Program([
        new Branch(binOp('>',number(2),number(1)),[new Forward(number(10))])
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a while loop correctly",function() {
      let testSource = String.raw`
        let iters = 4;
        while iters > 0
          fd 50;
          rt 90;
          iters = iters - 1;
        end;
      `

      let expectedProgram = new Program([
        new VarDecl('iters',number(4)),
        new WhileLoop(binOp('>',new VarEvaluation('iters'),number(0)),[
          new Forward(number(50)),
          new Right(number(90)),
          new VarAssign('iters',binOp('-',new VarEvaluation('iters'),number(1)))
        ])
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a procedure definition with 2 params",function() {
      let testSource = String.raw`
        procedure shape(sides,size):
          repeat sides
            fd size;
            rt 360/sides;
          end;
        end;
      `

      let expectedProgram = new Program([
        new ProcedureDef("shape",["sides","size"],
            [
              new Loop(new VarEvaluation("sides"),[
                new Forward(new VarEvaluation("size")),
                new Right(binOp("/",number(360),new VarEvaluation("sides")))
              ])
            ])
      ])
      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a procedure definition with 0 params",function() {
      let testSource = String.raw`
        procedure square():
          repeat 4
            fd 50;
            rt 90;
          end;
        end;
      `

      let expectedProgram = new Program([
        new ProcedureDef("square",[],
            [
              new Loop(number(4),[
                new Forward(number(50)),
                new Right(number(90))
              ])
            ])
      ])
      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a procedure definition with 1 param",function() {
      let testSource = String.raw`
        procedure square(size):
          repeat 4
            fd size;
            rt 90;
          end;
        end;
      `

      let expectedProgram = new Program([
        new ProcedureDef("square",["size"],
            [
              new Loop(number(4),[
                new Forward(new VarEvaluation("size")),
                new Right(number(90))
              ])
            ])
      ])
      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses a procedure definition with 3 params",function() {
      let testSource = String.raw`
        procedure shape(sides,size,interval):
          repeat sides
            fd size;
            rt 360/sides;
            pu;
            fd interval;
            pd;
          end;
        end;
      `

      let expectedProgram = new Program([
        new ProcedureDef("shape",["sides","size","interval"],
            [
              new Loop(new VarEvaluation("sides"),[
                new Forward(new VarEvaluation("size")),
                new Right(binOp("/",number(360),new VarEvaluation("sides"))),
                new PenActive(false),
                new Forward(new VarEvaluation("interval")),
                new PenActive(true)
              ])
            ])
      ])
      parseAndCompare(testSource,expectedProgram)
    })

    it("parses a simple procedure call",function() {
      let testSource = String.raw`
        call add2 with x = 5;
      `

      let expectedProgram = new Program([
        new ProcedureCall("add2",[
          new VarAssign("x",number(5))
        ])
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("parses a procedure call with 2 parameters and other statements around it",function() {
      let testSource = String.raw`
        let x = 5;
        call shape with sides = x * 2, size=10;
        fd 100;
      `

      let expectedProgram = new Program([
        new VarDecl("x",number(5)),
        new ProcedureCall("shape",[
          new VarAssign("sides",binOp("*",new VarEvaluation("x"),number(2))),
          new VarAssign("size",number(10))
        ]),
        new Forward(number(100))
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it ("parses a procedure call with 0 arguments",function() {
      let testSource = String.raw`
      call add2;
      `

      let expectedProgram = new Program([
        new ProcedureCall("add2",[
          
        ])
      ])

      parseAndCompare(testSource,expectedProgram)   
    })

    it ("parses a 'say' command",function() {
      let testSource = String.raw`
      say 'hello world';
      `

      let expectedProgram = new Program([
        new Output(new TextLiteral("hello world"))
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it ("parses a 'say' command with a simple concatenation",function() {
      let testSource = String.raw`
        say 'hello' ++ 'world';
      `

      let expectedProgram = new Program([
        new Output(binOp('++',new TextLiteral('hello'),new TextLiteral('world')) )
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it ("parses string literals with spaces correctly",function() {
      let testSource = String.raw`
        say ' hello world ';
      `

      let expectedProgram = new Program([
        new Output(new TextLiteral(' hello world ') )
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("preserves spaces in concatenation",function() {
      let testSource = String.raw`
        say ' hello' ++ ' ' ++ 'world ';
      `

      let expectedProgram = new Program([
        new Output(binOp('++',binOp('++',text(' hello'),text(' ')),text('world ')))
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parses concatenation with numeric expressions correctly",function() {
      let testSource = String.raw`
      let x = 8;
      say 'x is' ++ x ;
      `

      let expectedProgram = new Program([
        new VarDecl('x',number(8)),
        new Output(binOp('++',text('x is'),new VarEvaluation('x')))
      ])

      parseAndCompare(testSource,expectedProgram)
    })

    it("Parse concatenation with numeric expression first",function() {
      let testSource = String.raw`
      let x = 8;
      say (x+1) ++ ' is x' ;
      `

      let expectedProgram = new Program([
        new VarDecl('x',number(8)),
        new Output(binOp('++',binOp('+',new VarEvaluation('x'),number(1)),text(' is x')))
      ])

      parseAndCompare(testSource,expectedProgram)
    })
  });
});