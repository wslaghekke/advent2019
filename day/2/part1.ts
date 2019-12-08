import * as fs from "fs";
import * as readline from "readline";

const reader = readline.createInterface({
    input: fs.createReadStream(__dirname + '/input.txt')
});

function executeIntCode(program: number[]) {
    let index = 0;
    while (index < program.length) {
        switch (program[index]) {
            case 1: // Addition - A + B -> C
                if (process.env.DEBUG) console.debug(`Addition ${program[index + 1]} + ${program[index + 2]}`);
                program[program[index + 3]] = program[program[index + 1]] + program[program[index + 2]];
                break;
            case 2: // Multiplication - A * B -> C
                if (process.env.DEBUG) console.debug(`Multiplication ${program[index + 1]} + ${program[index + 2]}`);
                program[program[index + 3]] = program[program[index + 1]] * program[program[index + 2]];
                break;
            case 99: // Exit
                return program;
            default:
                throw new Error(`Unsupported opcode ${program[index]}`)
        }
        // Step to next instruction
        index += 4;
    }
    console.warn('WARNING: Program without exit opcode encountered');
    return program;
}

reader.on('line', line => {
    console.log('Input:');
    console.log(line);
    const program = line.split(',').map(it => Number(it));
    const output = executeIntCode(program);
    console.log('Output:');
    console.log(output.join(','));
});
