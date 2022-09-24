const assert = require('assert');
const { createParser } = require("../src/Lang.js")
const {Forward,Right, Program, Loop,SetPenColor} = require("../src/IR")


describe('Parser', function () {
  describe('Language Parser', function () {
    it('successfully parse a simple square drawing program', function () {
      
      let testProgram = String.raw`
        fd 100
        rt 90
        fd 100
        rt 90
        fd 100
        rt 90
        fd 100
      `

      let p = createParser()

      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(100),
        new Right(90),
        new Forward(100),
        new Right(90),
        new Forward(100),
        new Right(90),
        new Forward(100)
      ]))
    });

    it('Can parse a loop',function() {
      let testProgram = String.raw`
        repeat 4 
          fd 100
          rt 90
        end
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Loop(4,[
          new Forward(100),
          new Right(90)
        ])
      ]))
    });

    it ('Can parse a pen color statement',function() {
      let testProgram = String.raw`
          fd 100
          rt 90
          pc red
          fd 100
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(100),
        new Right(90),
        new SetPenColor("red"),
        new Forward(100)

      ]))
    });

    it('Can parse a nested loop', function() {
      let testProgram = String.raw`
          repeat 6
            repeat 4
              fd 50
              rt 90
            end
            rt 45
          end
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Loop(6,[
          new Loop(4,[
            new Forward(50),
            new Right(90)
          ]),
          new Right(45)
        ])
      ]))

    });

    it ("Can parse a 'left' as an opposite of 'right'", function() {
      let testProgram = String.raw`
        fd 50
        rt 90
        lt 45
        fd 50
      `

      let p = createParser()
      let result = p(testProgram)

      assert.deepEqual(result,new Program([
        new Forward(50),
        new Right(90)
        , new Right(360-45)
        , new Forward(50)
      ]))

    })
  });
});