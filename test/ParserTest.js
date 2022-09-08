const assert = require('assert');
const { createParser } = require("../src/Lang.js")


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

      let p = createParser({
          createForward(howMuch) { assert.equal(howMuch,100); return { action : "fd", params : [howMuch]}; },
          createRight(howMuch) { assert.equal(howMuch,90); return { action : "rt", params : [howMuch]}; }
      })

      let result = p(testProgram)
      assert.equal(result.length,7)

    });
  });
});