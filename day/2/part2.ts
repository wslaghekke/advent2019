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

const requiredAnswer = 19690720;
const max = 999;


reader.on('line', line => {
    let noun = 0;
    let verb = 0;
    let answer = 0;

    const program = line.split(',').map(it => Number(it));

    while (answer !== requiredAnswer) {
        console.log(`Trying noun ${noun}, verb ${verb}`);
        const copy = program.slice();
        copy[0] = 1;
        copy[1] = noun;
        copy[2] = verb;
        const result = executeIntCode(copy);
        answer = result[0];
        if(answer === requiredAnswer) {
            break;
        }
        if(verb === 999 && noun === 999) {
            console.warn('FAILED');
        }
        if(verb < 999) {
            verb++;
        } else {
            verb = 0;
            noun++;
        }
    }

    console.log(`Answer ${answer}, noun ${noun}, verb ${verb} (${100*noun + verb})`);
});
