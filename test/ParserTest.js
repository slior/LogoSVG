const assert = require('assert');
const { createParser } = require("../src/Lang.js")
const {Forward,Right, Program, Loop} = require("../src/IR")


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
    })
  });
});