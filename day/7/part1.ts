import * as readlineSync from 'readline-sync';
import * as fs from "fs";

export enum ParamMode {POSITION, IMMEDIATE}

function parseInstruction(instruction: number): { type: number, paramModes: ParamMode[] } {
    return {
        type: instruction % 100,
        paramModes: [
            Math.floor(instruction % 1000 / 100),
            Math.floor(instruction % 10000 / 1000),
            Math.floor(instruction % 100000 / 10000)
        ]
    };
}

function getValue(program: number[], paramMode: ParamMode, index: number) {
    if (paramMode === ParamMode.POSITION) {
        return program[program[index]];
    } else {
        return program[index];
    }
}

function executeAddition(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Addition ${a} + ${b}`);
    program[program[index + 3]] = a + b;

    return index + 4;
}

function executeMultiplication(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Multiplication ${a} * ${b}`);
    program[program[index + 3]] = a * b;

    return index + 4;
}

function executeJumpIfTrue(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Jump if true ${a} ${b}`);

    return a !== 0 ? b : index + 3;
}

function executeJumpIfFalse(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Jump if false ${a} ${b}`);

    return a === 0 ? b : index + 3;
}

function executeLessThan(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Less than ${a} * ${b}`);
    program[program[index + 3]] = a < b ? 1 : 0;

    return index + 4;
}

function executeEquals(program: number[], paramModes: ParamMode[], index: number) {
    const a = getValue(program, paramModes[0], index + 1);
    const b = getValue(program, paramModes[1], index + 2);

    if (process.env.DEBUG) console.debug(`Equals ${a} * ${b}`);
    program[program[index + 3]] = a == b ? 1 : 0;

    return index + 4;
}

function executeIntCode(program: number[], input: number[]) {
    let output = [];
    let index = 0;
    while (index < program.length) {
        const {type, paramModes} = parseInstruction(program[index]);
        if (process.env.DEBUG) console.debug('Instruction: ', type, paramModes);
        switch (type) {
            case 1: // Addition - A + B -> C
                index = executeAddition(program, paramModes, index);
                break;
            case 2: // Multiplication - A * B -> C
                index = executeMultiplication(program, paramModes, index);
                break;
            case 3: // Read integer
                const inputValue = input.shift();
                if(inputValue === undefined) {
                    throw new Error('Missing input');
                }
                program[program[index + 1]] = inputValue;
                index += 2;
                break;
            case 4: // Output integer
                console.log(`Output: ${getValue(program, paramModes[0], index + 1)}`);
                output.push(getValue(program, paramModes[0], index + 1));
                index += 2;
                break;
            case 5: // Jump if true
                index = executeJumpIfTrue(program, paramModes, index);
                break;
            case 6: // Jump if false
                index = executeJumpIfFalse(program, paramModes, index);
                break;
            case 7: // Less than
                index = executeLessThan(program, paramModes, index);
                break;
            case 8: // Equals
                index = executeEquals(program, paramModes, index);
                break;
            case 99: // Exit
                return output;
            default:
                throw new Error(`Unsupported opcode ${program[index]}`)
        }
    }
    console.warn('WARNING: Program without exit opcode encountered');
    return output;
}

const line = fs.readFileSync(__dirname + '/input.txt', {encoding: 'utf8'});

function getPhasePairResults(program: number[], parentPhase: number[], input: number): { result: number; phase: number[] }[] {
    let results = [0,1,2,3,4].filter(it => !parentPhase.includes(it)).map(phase => ({
        result: executeIntCode(program.slice(), [phase, input])[0], phase: [...parentPhase, phase]
    }));
    if(parentPhase.length < 4) {
        results = results.flatMap(item => getPhasePairResults(program, item.phase, item.result))
    }

    return results;
}

(async () => {
    console.log('Input:');
    console.log(line);

    const phasePairs = [];

    const program = line.split(',').map(it => Number(it));
    const output = getPhasePairResults(program, [], 0);
    console.log('Output:');
    console.log(output.reduce((max, item) => {
        return item.result > max.result ? item : max
    }));
})();
