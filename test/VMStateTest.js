const assert = require('assert');
const {VMState,DEFAULT_PEN_COLOR, BOUNDS} = require('../src/VMState')

describe("VMState",function() {
    it("Sets initialization values correctly",function() {
        let vms = new VMState(10,10,0)

        assert.strictEqual(vms.originalX,10)
        assert.strictEqual(vms.originalY,10);
        assert.strictEqual(vms.lastX,vms.originalX);
        assert.strictEqual(vms.lastY,vms.originalY);
        assert.strictEqual(vms.angle,0);
        assert.strictEqual(vms.penActive,true)
        assert.strictEqual(vms.penColor,DEFAULT_PEN_COLOR)

        let vms2 = new VMState(5,6,0,20,30,"red",false);

        assert.strictEqual(vms2.originalX,5)
        assert.strictEqual(vms2.originalY,6);
        assert.strictEqual(vms2.lastX,20);
        assert.strictEqual(vms2.lastY,30);
        assert.strictEqual(vms2.angle,0);
        assert.strictEqual(vms2.penActive,false)
        assert.strictEqual(vms2.penColor,"red")


    })

    it("Modifies values correctly, w/o changing original",function() {
        let vms = new VMState(10,20,90)

        var newState = vms.withAngle(100);
        assert.strictEqual(newState.angle,100)
        assert.strictEqual(vms.angle,90)
        
        newState = vms.withLastPoint(10,25)
        assert.strictEqual(newState.lastX,10)
        assert.strictEqual(newState.lastY,25)
        assert.strictEqual(vms.lastY,20)

        newState = vms.withPenActive(false);
        assert.strictEqual(newState.penActive,false)
        assert.strictEqual(vms.penActive,true)


        newState = vms.withPenColor("red")
        assert.strictEqual(newState.penColor,"red")
        assert.strictEqual(vms.penColor,DEFAULT_PEN_COLOR)
    })

    it("Rejects illegal arguments", function() {

        assert.throws(() => {
            new VMState(BOUNDS.X_LOW-1 ,20,90)
        }, /is out of bound/, "testing X")

        assert.throws(() => {
            new VMState(BOUNDS.X_HIGH+2 ,20,90)
        }, /is out of bound/,"testing x high")

        assert.throws(() => {
            new VMState("xx" ,20,90)
        }, /is not a number/,"testing x type")

        assert.throws(() => {
            new VMState(null ,20,90)
        }, /is null/,"testing x null")

        assert.throws(() => {
            new VMState(10 ,BOUNDS.Y_LOW-3,90)
        }, /is out of bound/, "testing Y low")

        assert.throws(() => {
            new VMState(10 ,BOUNDS.Y_HIGH+4,90)
        }, /is out of bound/,"testing Y high")

        assert.throws(() => {
            new VMState(10 ,"yy",90)
        }, /is not a number/,"testing y type")

        assert.throws(() => {
            new VMState(10 ,null,90)
        }, /is null/,"testing y null")

        assert.throws(() => {
            new VMState(10 ,20,BOUNDS.ANGLE_LOW-2)
        }, /is out of bound/, "testing angle low")

        assert.throws(() => {
            new VMState(10 ,20,BOUNDS.ANGLE_HIGH+40)
        }, /is out of bound/,"testing angle high")
        
        assert.throws(() => {
            new VMState(10 ,20,undefined)
        }, /is not a number/,"testing angle type")

        assert.throws(() => {
            new VMState(10 ,20,null)
        }, /is null/,"testing angle null")

        assert.throws(() => {
            new VMState(10 ,20,32,BOUNDS.X_LOW-2)
        }, /is out of bound/,"last x low")

        assert.throws(() => {
            new VMState(10 ,20,32,BOUNDS.X_HIGH+2)
        }, /is out of bound/,"last x high")


        assert.throws(() => {
            new VMState(10 ,20,32,50,BOUNDS.Y_LOW-1)
        }, /is out of bound/,"last y low")

        assert.throws(() => {
            new VMState(10 ,20,32,50,BOUNDS.Y_HIGH+2)
        }, /is out of bound/,"last y high")


    })

    it("Defines variable",function() {
        let vms = new VMState(10,20,90,10,20,"blue",true,{reps : 10})
        assert.strictEqual(vms._isDefined("reps"),true)
        assert.strictEqual(vms._isDefined("notdefined"),false)

        let vms2 = vms.withNewVar("newvar",5)
        assert.strictEqual(vms2._isDefined("reps"),true)
        assert.strictEqual(vms._isDefined("newvar"),false)
        assert.strictEqual(vms2._isDefined("newvar"),true)
        assert.notStrictEqual(vms,vms2)
    })

    it("Retrieves declared variables correctly",function() {
        let vms = new VMState(10,20,90)
        let vms2 = vms.withNewVar("reps",10)
        assert.strictEqual(vms2.valueOf("reps"),10)
    })

    it("Fails when trying to retrieve vlaue of undeclared variable",function() {
        let vms = new VMState(10,20,90)
        assert.throws(() => {
            vms.valueOf("undeclared_var")
        }, /Undefined variable undeclared_var/,"retrieving undeclared var - should fail")
    })
})