/**
 * 
 * @typedef {BinaryExpression|ConstantExpression|FunctionExpression|VariableExpression} Expression
 * @typedef {{type: 0|1|2|3|4, l: Expression, r: Expression}} BinaryExpression
 * @typedef {{type: 5, funct: ExpressionFunction, param: Expression}} FunctionExpression
 * @typedef {{type: 6, valType:0|1|2, val: number}} ConstantExpression
 * @typedef {{type: 7}} VariableExpression
 * @typedef {{type:0, evaluate: (val:ConstantExpression) => ConstantExpression}} ExpressionFunction
 * 
 * 
 * 
 * 
 */

const math = require("./complex");


const types = {
    add: 0,
    sub: 1,
    mul: 2,
    div: 3,
    exp: 4,
    func: 5,
    const: 6,
    var: 7,
}
const valTypes = {
    num: 0,
    vec: 1,
    mat: 2,
}


const isNumber = (stirng) => {
    return /-{0,1}((\d+)|(\d*\.\d+))/g.test(stirng);
}
const isWord = (string) => {
    return /\w+/.test(string);
}

const tokenize = (source) => {
    regex = (/\"[^\"]*\"|\+(\+|=){0,1}|-|\||\/|\*|\)|\^|\(|-|{|}|;|<|>|(\d*\.\d+)|\d+|[A-Za-z]+|,/g);
    return source.match(regex);
}

const num = (r = 0, i = 0) => {
    return { type: types.const, valType: valTypes.num, val: { r: r, i: i } };
}
const numc = (c) => {
    return { type: types.const, valType: valTypes.num, val: c };
}

const vec = (val) => {
    return { type: types.const, valType: valTypes.vec, val: val };
}

/** @type {Map<string, ExpressionFunction>} */
var functions = {
    sin: {
        name: "sin",
        type: 0,
        evaluate: (value) => {
            return num(Math.sin(value.val.r));
        }
    },
    cos: {
        name: "cos",
        type: 0,
        evaluate: (value) => {
            return num(Math.cos(value.val.r));
        }
    },
    tan: {
        name: "tan",
        type: 0,
        evaluate: (value) => {
            return num(Math.tan(value.val.r));
        }
    },
    abs: {
        name: "abs",
        type: 0,
        evaluate: (value) => {
            return num(Math.abs(value.val.r));
        }
    },
};


/**
 * 
 * @param {Array<String>} tokens 
 * @returns {Expression}
 */

const parse = (tokens) => {


    /**
     * 
     * @param {Array<String>} tokens 
     * @returns {Expression}
     */
    const parseVector = (tokens) => {
        tokens = tokens.slice(1, -1);
        var paren = 0;
        var curly = 0;
        const val = [];
        var last = 0;
        for (var i = 0; i < tokens.length; i++) {
            const curr = tokens[i];
            if (curr === "(") {
                paren++;
            } else if (curr === ")") {
                paren--;
            } else if (curr === "{") {
                curly++;
            } else if (curr === "}") {
                curly--;
            } else if (curly === 0 && paren === 0) {
                if (curr === ",") {
                    const a = parse(tokens.slice(last, i));
                    console.log(a);
                    val.push(parse(tokens.slice(last, i)));
                    last = i + 1;
                }
            }
        }
        if (last != tokens.length) {
            const a = parse(tokens.slice(last));
            console.log(a);
            val.push(parse(tokens.slice(last)));
        }

        return vec(val);
    }

    // Surrounding Parenthesis
    removeSurroundingParenthesis = (tokens) => {
        if (tokens.length == 0) { return tokens; }
        var paren = 0;
        for (var i = 0; i < tokens.length; i++) {
            if (paren == 0 && i != 0) {
                return tokens;
            } else if (i == 0 && tokens[i] != "(") {
                return tokens;
            } else if (tokens[i] == "(") {
                paren++;
            } else if (tokens[i] == ")") {
                paren--;
            }
        }
        return removeSurroundingParenthesis(tokens.slice(1, -1));
    }

    tokens = removeSurroundingParenthesis(tokens);
    // Addition/Subtraction
    var paren = (tokens[-1] === ")" ? -1 : 0);
    var curly = (tokens[-1] === "}" ? -1 : 0);
    var abs = (tokens[-1] === "|" ? true : false);
    for (var i = tokens.length - 1; i >= 1; i--) {
        const curr = tokens[i];
        if (curr === "(") {
            paren++;
        } else if (curr === ")") {
            paren--;
        } else if (curr === "{") {
            curly++;
        } else if (curr === "}") {
            curly--;
        } else if (curr === "|") {
            abs = !abs;
        } else if (curly === 0 && paren === 0 && !abs) {
            if (curr === "+") {
                return {
                    type: types.add,
                    l: parse(tokens.slice(0, i)),
                    r: parse(tokens.slice(i + 1))
                };
            } else if (curr === "-") {
                return {
                    type: types.sub,
                    l: parse(tokens.slice(0, i)),
                    r: parse(tokens.slice(i + 1))
                };
            }
        }
    }
    // Multiplication/Division
    paren = (tokens[-1] === ")" ? -1 : 0);
    curly = (tokens[-1] === "}" ? -1 : 0);
    abs = (tokens[-1] === "|" ? true : false);
    for (var i = tokens.length - 1; i >= 1; i--) {
        const curr = tokens[i];
        if (curr === "(") {
            paren++;
        } else if (curr === ")") {
            paren--;
        } else if (curr === "{") {
            curly++;
        } else if (curr === "}") {
            curly--;
        } else if (curr === "|") {
            abs = !abs;
        } else if (curly === 0 && paren === 0 && !abs) {
            if (curr === "*") {
                return {
                    type: types.mul,
                    l: parse(tokens.slice(0, i)),
                    r: parse(tokens.slice(i + 1))
                };
            } else if (curr === "/") {
                return {
                    type: types.div,
                    l: parse(tokens.slice(0, i)),
                    r: parse(tokens.slice(i + 1))
                };
            }
        }
    }

    // Exponents
    paren = (tokens[-1] === ")" ? -1 : 0);
    curly = (tokens[-1] === "}" ? -1 : 0);
    abs = (tokens[-1] === "|" ? true : false);
    for (var i = tokens.length - 1; i >= 1; i--) {
        const curr = tokens[i];
        if (curr === "(") {
            paren++;
        } else if (curr === ")") {
            paren--;
        } else if (curr === "{") {
            curly++;
        } else if (curr === "}") {
            curly--;
        } else if (curr === "|") {
            abs = !abs;
        } else if (curly === 0 && paren === 0 && !abs) {
            if (curr === "^") {
                return {
                    type: types.exp,
                    l: parse(tokens.slice(0, i)),
                    r: parse(tokens.slice(i + 1))
                };
            }
        }
    }

    // Terms

    const first = tokens[0];

    if (tokens.length === 1) {
        // Digit/Variable
        if (isNumber(first)) {
            return num(parseFloat(first));
        }
        if (first === "i") {
            return num(0, 1);
        }
    }
    const second = tokens[1];
    if (isNumber(first)) {
        return {
            type: types.mul,
            l: num(parseFloat(first)),
            r: parse(tokens.slice(1))
        }
        //parseFloat(first) * parse(tokens.slice(1));
    } else if (first === "-") {
        return {
            type: types.mul,
            l: num(-1),
            r: parse(tokens.slice(1)),
        };
    }

    // Functions
    if (functions[first]) {
        if (second === "(") {
            paren = 0;
            curly = 0;
            for (var i = 0; i < tokens.length; i++) {
                const curr = tokens[i];
                if (curr === "(") {
                    paren++;
                } else if (curr === ")") {
                    paren--;
                    if (paren === 0) {
                        return {
                            type: types.mul,
                            l: {
                                type: types.func,
                                funct: functions[first],
                                param: parse(tokens.slice(1, i + 1)),
                            },
                            r: (i !== tokens.length - 1 ? parse(tokens.slice(i)) : num(1))
                        };
                        //functions[first].evaluate(parse(tokens.slice(1, i + 1))) * (i !== tokens.length - 1 ? parse(tokens.slice(i)) : 1);
                    }
                } else if (curr === "{") {
                    curly++;
                } else if (curr === "}") {
                    curly--;
                }
            }
        } else {
            return {
                type: types.mul,
                l: {
                    type: types.func,
                    funct: functions[first],
                    param: parse([second]),
                },
                r: (1 !== tokens.length - 1 ? parse(tokens.slice(i)) : num(1))
            };
            //functions[first].evaluate(parse([second])) * (1 !== tokens.length - 1 ? parse(tokens.slice(i)) : 1);
        }
    } else if (first === "(") {
        paren = 0;
        curly = 0;
        for (var i = 0; i < tokens.length; i++) {
            const curr = tokens[i];
            if (curr === "(") {
                paren++;
            } else if (curr === ")") {
                paren--;
                if (paren === 0) {
                    return {
                        type: types.mul,
                        l: parse(tokens.slice(0, i + 1)),
                        r: (i !== tokens.length - 1 ? parse(tokens.slice(i + 1)) : num(1))
                    };
                    //functions[first].evaluate(parse(tokens.slice(1, i + 1))) * (i !== tokens.length - 1 ? parse(tokens.slice(i)) : 1);
                }
            } else if (curr === "{") {
                curly++;
            } else if (curr === "}") {
                curly--;
            }
        }
    }
    if (first === "{") {

        curly = 0;
        paren = 0;
        for (var i = 0; i < tokens.length; i++) {
            const curr = tokens[i];
            if (curr === "(") {
                paren++;
            } else if (curr === ")") {
                paren--;
            } else if (curr === "{") {
                curly++;
            } else if (curr === "}") {
                curly--;
                if (curly === 0) {
                    return {
                        type: types.mul,
                        l: parseVector(tokens.slice(0, i + 1)),
                        r: (i !== tokens.length - 1 ? parse(tokens.slice(i + 1)) : num(1))
                    };
                    //functions[first].evaluate(parse(tokens.slice(1, i + 1))) * (i !== tokens.length - 1 ? parse(tokens.slice(i)) : 1);
                }
            }
        }
    } else if (first === "|") {
        curly = 0;
        paren = 0;
        for (var i = 1; i < tokens.length; i++) {
            const curr = tokens[i];
            if (curr === "|") {
                return {
                    type: types.mul,
                    l: {
                        type: types.func,
                        funct: functions.abs,
                        param: parse(tokens.slice(1, i)),
                    },
                    r: (i !== tokens.length - 1 ? parse(tokens.slice(i + 1)) : num(1))
                };
            }
        }
    }

    if (first === "i") {
        return {
            type: types.mul,
            l: num(0, 1),
            r: parse(tokens.slice(1))
        };
    }
}

/**
 * 
 * @param {Expression} exp 
 * @returns {ConstantExpression}
 */
const evaluate = (exp) => {
    var l, r;
    switch (exp.type) {
        case types.add:
            l = evaluate(exp.l);
            r = evaluate(exp.r);
            if (l.valType === r.valType) {
                switch (l.valType) {
                    case valTypes.num:
                        return numc(math.complex.add(l.val, r.val));
                    case valTypes.vec:
                        return vec(l.val.map((value, i) => num(evaluate(value).val + evaluate(r.val[i]).val)));
                }
            }
            break;
        case types.sub:
            l = evaluate(exp.l);
            r = evaluate(exp.r);
            if (l.valType === r.valType) {
                switch (l.valType) {
                    case valTypes.num:
                        return numc(math.complex.sub(l.val, r.val));
                    case valTypes.vec:
                        return vec(l.val.map((value, i) => num(evaluate(value).val - evaluate(r.val[i]).val)));
                }
            }
            break;
        case types.mul:
            l = evaluate(exp.l);
            r = evaluate(exp.r);
            if (l.valType == valTypes.num) {
                if (r.valType == valTypes.num) {
                    return numc(math.complex.mul(l.val, r.val));
                } else if (r.valType == valTypes.vec) {
                    return vec(r.val.map(value => num(evaluate(value).val * l.val)));
                }
            } else if (l.valType == valTypes.vec) {
                if (r.valType == valTypes.num) {
                    return vec(l.val.map(value => num(evaluate(value).val * r.val)));
                } else if (r.valType == valTypes.vec) {
                    return vec(r.val.map((value, i) => num(evaluate(value).val * evaluate(l[i]).val)));
                }
            }
            break;
        case types.div:
            l = evaluate(exp.l);
            r = evaluate(exp.r);
            if (l.valType === r.valType) {
                switch (l.valType) {
                    case valTypes.num:
                        return numc(math.complex.div(l.val, r.val));
                    case valTypes.vec:
                        break;
                }
            }
            break;
        case types.exp:
            l = evaluate(exp.l);
            r = evaluate(exp.r);
            if (l.valType === r.valType) {
                switch (l.valType) {
                    case valTypes.num:
                        return numc(math.complex.pow(l.val, r.val));
                    case valTypes.vec:
                        break;
                }
            }
            break;
        case types.var:

            break;
        case types.const:
            switch (exp.valType) {
                case valTypes.num:
                    return exp;
                case valTypes.vec:
                    return { type: types.const, valType: valTypes.vec, val: exp.val.map((exp) => { return evaluate(exp); }) };
                case valTypes.mat:

            }
            return exp;
        case types.func:
            const param = evaluate(exp.param);
            return exp.funct.evaluate(param);

    }
};


/**
 * 
 * @param {Expression} expression
 * @returns {String} 
 */
const string = (expression, precesdence = 0) => {
    if (!expression) return "NULL";
    var out = "";
    switch (expression.type) {
        case types.add:
            if (precesdence > 0) {
                return `(${string(expression.l)} + ${string(expression.r)})`;
            }
            return `${string(expression.l)} + ${string(expression.r)}`;
        case types.sub:
            if (precesdence > 0) {
                return `(${string(expression.l)} - ${string(expression.r)})`;
            }
            return `${string(expression.l)} - ${string(expression.r)}`;
        case types.mul:
            if (precesdence > 1) {
                return `(${string(expression.l),1} * ${string(expression.r,1)})`;
            }
            return `${string(expression.l,1)} * ${string(expression.r,1)}`;
        case types.div:
            if (precesdence > 1) {
                return `(${string(expression.l,1)} / ${string(expression.r,1)})`;
            }
            return `${string(expression.l,1)} / ${string(expression.r,1)}`;
        case types.exp:
            if (precesdence > 2) {
                return `(${string(expression.l,2)} ^ ${string(expression.r,2)})`;
            }
            return `${string(expression.l,2)} ^ ${string(expression.r,2)}`;
        case types.func:
            return `${expression.funct.name}(${string(expression.param)})`;
        case types.var:
            return ``;
        case types.const:
            switch (expression.valType) {
                case valTypes.num:
                    return math.complex.string(expression.val);
                case valTypes.vec:
                    if (expression.val.length >= 1) {
                        out += `{${string(expression.val[0])}`;
                        for (var i = 1; i < expression.val.length; i++) {
                            out += `, ${string(expression.val[i])}`;
                        }
                        out += `}`;
                    }
                    break;
                case valTypes.mat:
                    break;
            }
            break;
    }
    return out;
}


module.exports = {
    types: types,
    valTypes: valTypes,
    parse: (source) => {
        return parse(tokenize(source));
    },
    tokenize: (source) => {
        return tokenize(source);
    },
    evaluate: (source) => {
        return evaluate(parse(tokenize(source)));
    },
    string: string,
};