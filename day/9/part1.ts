import * as fs from 'fs';

export enum ParamMode {
    POSITION,
    IMMEDIATE,
    RELATIVE
}



function executeIntCode(program: number[], input: number[]) {
    let output = [];

    let index = 0;
    let relativeBase = 0;

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
        switch (paramMode) {
            case ParamMode.POSITION:
                const posIndex = program[index] === undefined ? 0 : program[index];
                const posValue = program[posIndex];
                return posValue === undefined ? 0 : posValue;
            case ParamMode.IMMEDIATE:
                return program[index];
            case ParamMode.RELATIVE:
                const relOffset = program[index] === undefined ? 0 : program[index];
                const relValue = program[relativeBase + relOffset];
                return relValue === undefined ? 0 : relValue;
            default:
                throw new Error('Unknown paramMode '+paramMode);
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

        if (process.env.DEBUG) console.debug(`Less than ${a} < ${b}`);
        program[program[index + 3]] = a < b ? 1 : 0;

        return index + 4;
    }

    function executeEquals(program: number[], paramModes: ParamMode[], index: number) {
        const a = getValue(program, paramModes[0], index + 1);
        const b = getValue(program, paramModes[1], index + 2);

        if (process.env.DEBUG) console.debug(`Equals ${a} = ${b}`);
        program[program[index + 3]] = a == b ? 1 : 0;

        return index + 4;
    }

    function executeRelativeBaseOffset(program: number[], paramModes: ParamMode[], index: number) {
        const relativeBaseOffset = getValue(program, paramModes[0], index + 1);
        if (process.env.DEBUG) console.debug(`Relative base offset ${relativeBase} + ${relativeBaseOffset}`);
        relativeBase += relativeBaseOffset;
        return index + 2;
    }

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
            case 9: // Relative base offset
                index = executeRelativeBaseOffset(program, paramModes, index);
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

(async () => {
    console.log('Input:');
    console.log(line);
    const program = line.split(',').map(it => Number(it));
    const output = await executeIntCode(program, [1]);
    console.log('Output:');
    console.log(output.join(','));
})();
