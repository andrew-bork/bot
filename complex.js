const error = 0.00001;

const real = (n) => {
    return { r: n, i: 0 };
}
const imag = (n) => {
    return { r: 0, i: n };
}
const comp = (r = 0, i = 0) => {
    return { r: r, i: i };
}

const add = (a, b) => {
    return { r: a.r + b.r, i: a.i + b.i };
}
const sub = (a, b) => {
    return { r: a.r - b.r, i: a.i - b.i };
}
const mul = (a, b) => {
    return { r: a.r * b.r - a.i * b.i, i: a.i * b.r + a.r * b.i };
}
const muls = (a, n = 1) => {
    return { r: a.r * n, i: a.i * n };
}
const div = (a, b) => {
    if (isReal(a) && isReal(b)) return real(a.r / b.r);
    return muls(mul(a, conj(b)), b.r * b.r + b.i * b.i);
}
const cis = (n) => {
    return { r: Math.cos(n), i: Math.sin(n) };
};

const isReal = (a) => {
    return a.i > -error && a.i < error;
}

const isImag = (a) => {
    return a.r > -error && a.r < error;
}

const exp = (a) => {
    if (isReal(a)) return real(Math.exp(a.r));
    return muls(cis(a.i), Math.exp(a.r));
}

const pow = (a, b) => {
    const areal = isReal(a);
    const breal = isReal(b);

    if (areal) {
        if (breal) {
            return real(Math.pow(a.r, b.r));
        }
        return muls(cis(Math.log(a.r) * b.i), Math.pow(a.r, b.r));
    }
    return exp(mul(ln(a), b));
}

const ln = (a) => {
    return { r: Math.log(mag(a)), i: Math.atan(a.i / a.r) };
}
const log = (a, base) => {
    return div(ln(a), ln(base));
}
const mag = (a) => {
    return Math.sqrt(a.r * a.r + a.i * a.i);
}
const conj = (a) => {
    return { r: a.r, i: -a.i };
}

const string = (a) => {
    if (isReal(a)) {
        return `${a.r}`;
    }
    if (isImag(a)) {
        return `${(a.i === 1 ? "" : (a.i === -1 ? "-1" : a.i))}i`;
    }
    return `${a.r} ${(a.i < 0 ? "-" : "+")} ${(Math.abs(a.i) == 1 ? "" : Math.abs(a.i))}i`;
}


module.exports = {
    complex: {
        add: add,
        sub: sub,
        mul: mul,
        muls: muls,
        div: div,
        exp: exp,
        pow: pow,
        ln: ln,
        conj: conj,
        log: log,
        real: real,
        isReal: isReal,
        comp: comp,
        imag: imag,
        string: string,
        
    }
};