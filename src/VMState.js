
const { assertInRange,assertIsNum, ifUndefined,
        ifNotUndefinedDo } = require('./util.js')

const BOUNDS = {
    X_LOW : 0,
    X_HIGH : 1000,
    Y_LOW : 0,
    Y_HIGH : 1000,
    ANGLE_LOW : 0,
    ANGLE_HIGH : 360
}

const DEFAULT_PEN_COLOR = "black";


class IdentifierScope
{
    constructor(_vars = {}, _procs = {})
    {
        this._variables = _vars
        this._procedures = _procs
    }

    get variables() { return Object.assign({},this._variables) }
    get procedures() { return Object.assign({},this._procedures) }

    definesVariable(varName)
    {
        return this._variables[varName] !== undefined;
    }

    withVariableSet(varName,value)
    {
        let newVars = this.variables
        newVars[varName] = value
        return new IdentifierScope(newVars,this.procedures)
    }

    withNewProcedure(procDef)
    {
        let newProcs = this.procedures
        newProcs[procDef.name] = procDef
        return new IdentifierScope(this.variables,newProcs)
    }

    definesProcedureWithName(name)
    {
        return this._procedures[name] !== undefined
    }
}

/**
 * Full VM state that can be transferred between calls to VM.
 * Is generally immutable. Mutations create a new instance.
 * Maintains:
 * 1. original x,y
 * 2. last x,y
 * 3. pen color
 * 4. is the pen active (active = pen down)
 * 5. identifier definition scope 
 *      A stack of objects (dictionaries), where top of the stack is the active (current) scope.
 */
class VMState
{
    constructor(x,y,_angle,
                _lastX = undefined, _lastY = undefined,
                _pc = undefined, _pa = undefined,
                _scopes = [])
    {
        assertInRange(x,BOUNDS.X_LOW,BOUNDS.X_HIGH);
        assertInRange(y,BOUNDS.Y_LOW,BOUNDS.Y_HIGH);
        assertInRange(_angle,BOUNDS.ANGLE_LOW,BOUNDS.ANGLE_HIGH);
        this.originalX = x;
        this.originalY = y;
        ifNotUndefinedDo(_lastX,() => assertInRange(_lastX,BOUNDS.X_LOW,BOUNDS.X_HIGH));
        this.lastX = ifUndefined(_lastX,x)
        ifNotUndefinedDo(_lastY,() => assertInRange(_lastY,BOUNDS.Y_LOW,BOUNDS.Y_HIGH));
        this.lastY = ifUndefined(_lastY,y)
        this.angle = _angle;
        this._penColor = ifUndefined(_pc,DEFAULT_PEN_COLOR)
        this._penActive = ifUndefined(_pa,true);
        this._scopes = (_scopes.length == 0) || (_scopes === undefined) ?
                            [new IdentifierScope()]
                            : Array.from(_scopes)
    }

    static newFromExisting (otherVmState,overridden) //to be used internally, when creating new instances
    {
        let originalX = ifUndefined(overridden.originalX,otherVmState.originalX);
        let originalY = ifUndefined(overridden.originalY,otherVmState.originalY);
        let lastX = ifUndefined(overridden.lastX,otherVmState.lastX);
        let lastY = ifUndefined(overridden.lastY,otherVmState.lastY);
        let angle = ifUndefined(overridden.angle,otherVmState.angle);
        let _penColor = ifUndefined(overridden.penColor,otherVmState.penColor)
        let penActive = ifUndefined(overridden.penActive,otherVmState.penActive)
        let scopes = ifUndefined(overridden.scopes,otherVmState.scopes)
        return new VMState(originalX,originalY,angle,lastX,lastY,_penColor,penActive,scopes)
    }

    /**
     * Return the angle of this state, but in radians
     */
    radianAngle()
    {
        return this.angle * Math.PI / 180;
    }

    /**
     * Return a new state with the position set to the given arguments
     * @param {number} x The x of the position to set
     * @param {number} y The y of the position to set
     */
    withLastPoint(x,y)
    {
        return VMState.newFromExisting(this,{lastX : x, lastY : y});

    }

    withAngle(a)
    {
        assertIsNum(a);
        a = a % BOUNDS.ANGLE_HIGH;
        return VMState.newFromExisting(this,{angle : a})
    }

    get penColor() { return this._penColor; }
    withPenColor(c) { return VMState.newFromExisting(this,{penColor : c})}

    get penActive() { return this._penActive }
    withPenActive(b) { return VMState.newFromExisting(this,{penActive : b})}

    withNewVar(varName,initialValue) 
    {
        if (!this._isVarDefinedInActiveScope(varName))
        {
            return this._newStateWithNewVar(varName,initialValue)
        }
        else throw new Error(`Variable ${varName} already declared`)
    }

    /**
     * Tests whether the given variable name is defined in the active scope
     * @param {String} varName The variable name
     * @returns TRUE iff the variable is already defined in the current active scope
     */
    _isVarDefinedInActiveScope(varName)
    {
        return this.activeScope.definesVariable(varName)
    }

    /**
     * Creates a new state with the given value for the given variable
     * @param {String} varName The variable name
     * @param {Number} value The variable value
     * @returns The new state
     */
    withVarValue(varName,value)
    {
        if (this._isVarDefined(varName)) //we allow also changing a value in outer scopes
            return this._newStateWithModifiedVar(varName,value)
        else throw new Error(`Can't assign value to undeclared variable '${varName}'`)
    }

    get scopes() { return this._scopes} //TODO: change this to return a copy - will simplify other methods in this class
    get activeScope() { 
        if (this._scopes.length < 1) 
            throw new Error("Illegal state - no scopes")
        else
            return this._scopes[this._scopes.length - 1]
    }

    valueOf(varName)
    {
        if (this._isVarDefined(varName))
            return this._allReachableVariables()[varName]
        else throw new Error(`Undefined variable ${varName}`)
    }

    /**
     * Gathers all the variables reachable from the current scope.
     * @returns All accessible variables, with their values, as a single map.
     */
    _allReachableVariables()
    {
        return this._scopes.reduce((acc,currScope) => Object.assign(acc,currScope.variables),{})
    }
    /**
     * 
     * @param {String} varName The variable name to look for
     */
    _isVarDefined(varName) 
    { 
        return this.scopes.some(scope => scope.definesVariable(varName))
    }

    _newStateWithModifiedVar(varName,value) {
        let scopeSearchResult = this._findScopeForVariable(varName)
        let newScopes = Array.from(this._scopes)
        newScopes[scopeSearchResult.ind] = scopeSearchResult.scope.withVariableSet(varName,value)
        return VMState.newFromExisting(this,{scopes : newScopes})
    }

    /**
     * Set the given variable in the active scope
     * @param {String} varName The variable name
     * @param {Any} value The variable value
     * @returns The new state, with the new variable set in the active scope
     */
    _newStateWithNewVar(varName,value) {
        if (this._isVarDefinedInActiveScope(varName))
            throw new Error(`Variable ${varName} already defined in current scope`)
        else
        {
            let newScopes = this._scopes.slice(0,this._scopes.length-1)
            newScopes.push(this.activeScope.withVariableSet(varName,value)) //slice returns a copy, so activeScope is still ok
            return VMState.newFromExisting(this,{scopes : newScopes})
        }
    }

    _findScopeForVariable(varName)
    {
        let scopeIndex = this._scopes.findIndex(scope => scope.definesVariable(varName))
        if (scopeIndex > -1)
        {
            return { scope : this._scopes[scopeIndex], ind : scopeIndex }
        }
        else
            throw new Error(`Couldn't find variable ${varName} in current VM state`)
    }

    withPushedScope()
    {
        let newScopes = Array.from(this.scopes)
        newScopes.push(new IdentifierScope())
        return VMState.newFromExisting(this,{scopes : newScopes})
    }

    withPoppedScope()
    {
        let newScopes = this.scopes.slice(0,this.scopes.length-1)
        return VMState.newFromExisting(this,{scopes : newScopes})
    }

    _isProcDefined(procDef)
    {
        return this._scopes.some(scope => scope.definesProcedureWithName(procDef.name))
    }

    withNewProcedure(procDef)
    {
        if (!this._isProcDefined(procDef))
        {
            let newScopes = this._scopes.slice(0,this._scopes.length-1)
            newScopes.push(this.activeScope.withNewProcedure(procDef))
            return VMState.newFromExisting(this,{ scopes : newScopes})
        }
        else
            throw new Error(`Procedure ${JSON.stringify(procDef)} already defined` )
    }

    /**
     * Attempts to find a procedure with the given name, reachable from the current active scope
     * @param {String} name The name of the procedure to find
     * @returns The procedure definition, or null if it doesn't find it
     */
    getProcedure(name)
    {
        let result = Array.from(this.scopes).reverse()
                                .filter(scope => scope.definesProcedureWithName(name))
                                .map(scope => scope.procedures[name])
        return result.length < 1 ?
                null
                : result[0]
    }
}

module.exports = {
    VMState,
    DEFAULT_PEN_COLOR //for testing, otherwise don't see a reason to expose this (maybe move it?)
    , BOUNDS //also here
    , IdentifierScope // and here
}