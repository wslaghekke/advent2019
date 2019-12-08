import * as fs from "fs";
import * as readline from "readline";

const reader = readline.createInterface({
    input: fs.createReadStream(__dirname + '/input.txt')
});

let totalFuel = 0;

reader.on('line', line => {
    const mass = Number(line);
    const requiredFuel = Math.floor(mass / 3) - 2;
    totalFuel += requiredFuel;

    if (process.env.DEBUG) {
        console.log(`${mass} requires ${requiredFuel} fuel`);
    }
});
reader.on('close', () => {
    console.log(`Total fuel required: ${totalFuel}`);
});

