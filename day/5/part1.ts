import * as readlineSync from 'readline-sync';

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

async function executeIntCode(program: number[]) {
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
                const input = readlineSync.questionInt('Please input a number: ');
                program[program[index + 1]] = input;
                index += 2;
                break;
            case 4: // Output integer
                console.log(`Output: ${getValue(program, paramModes[0], index + 1)}`);
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
                return program;
            default:
                throw new Error(`Unsupported opcode ${program[index]}`)
        }
    }
    console.warn('WARNING: Program without exit opcode encountered');
    return program;
}

const line = "3,225,1,225,6,6,1100,1,238,225,104,0,1101,32,43,225,101,68,192,224,1001,224,-160,224,4,224,102,8,223,223,1001,224,2,224,1,223,224,223,1001,118,77,224,1001,224,-87,224,4,224,102,8,223,223,1001,224,6,224,1,223,224,223,1102,5,19,225,1102,74,50,224,101,-3700,224,224,4,224,1002,223,8,223,1001,224,1,224,1,223,224,223,1102,89,18,225,1002,14,72,224,1001,224,-3096,224,4,224,102,8,223,223,101,5,224,224,1,223,224,223,1101,34,53,225,1102,54,10,225,1,113,61,224,101,-39,224,224,4,224,102,8,223,223,101,2,224,224,1,223,224,223,1101,31,61,224,101,-92,224,224,4,224,102,8,223,223,1001,224,4,224,1,223,224,223,1102,75,18,225,102,48,87,224,101,-4272,224,224,4,224,102,8,223,223,1001,224,7,224,1,224,223,223,1101,23,92,225,2,165,218,224,101,-3675,224,224,4,224,1002,223,8,223,101,1,224,224,1,223,224,223,1102,8,49,225,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1107,226,226,224,1002,223,2,223,1005,224,329,1001,223,1,223,1007,677,226,224,1002,223,2,223,1006,224,344,1001,223,1,223,108,677,226,224,102,2,223,223,1006,224,359,1001,223,1,223,7,226,226,224,1002,223,2,223,1005,224,374,101,1,223,223,107,677,677,224,1002,223,2,223,1006,224,389,1001,223,1,223,1007,677,677,224,1002,223,2,223,1006,224,404,1001,223,1,223,1107,677,226,224,1002,223,2,223,1005,224,419,1001,223,1,223,108,226,226,224,102,2,223,223,1006,224,434,1001,223,1,223,1108,226,677,224,1002,223,2,223,1006,224,449,1001,223,1,223,1108,677,226,224,102,2,223,223,1005,224,464,1001,223,1,223,107,226,226,224,102,2,223,223,1006,224,479,1001,223,1,223,1008,226,226,224,102,2,223,223,1005,224,494,101,1,223,223,7,677,226,224,1002,223,2,223,1005,224,509,101,1,223,223,8,226,677,224,1002,223,2,223,1006,224,524,1001,223,1,223,1007,226,226,224,1002,223,2,223,1006,224,539,101,1,223,223,1008,677,677,224,1002,223,2,223,1006,224,554,101,1,223,223,1108,677,677,224,102,2,223,223,1006,224,569,101,1,223,223,1107,226,677,224,102,2,223,223,1005,224,584,1001,223,1,223,8,677,226,224,1002,223,2,223,1006,224,599,101,1,223,223,1008,677,226,224,102,2,223,223,1006,224,614,1001,223,1,223,7,226,677,224,1002,223,2,223,1005,224,629,101,1,223,223,107,226,677,224,102,2,223,223,1005,224,644,101,1,223,223,8,677,677,224,102,2,223,223,1005,224,659,1001,223,1,223,108,677,677,224,1002,223,2,223,1005,224,674,101,1,223,223,4,223,99,226";
// const line = "1002,4,3,4,33";
(async () => {
    console.log('Input:');
    console.log(line);
    const program = line.split(',').map(it => Number(it));
    const output = await executeIntCode(program);
    console.log('Output:');
    console.log(output.join(','));
})();
