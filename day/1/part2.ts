import * as fs from "fs";
import * as readline from "readline";

const reader = readline.createInterface({
    input: fs.createReadStream(__dirname + '/input.txt')
});

let totalFuel = 0;

function calculateRequiredFuel(mass: number) {
    let requiredFuel = Math.floor(mass / 3) - 2;
    if (requiredFuel < 0) {
        requiredFuel = 0
    }

    if(requiredFuel > 0) {
        return requiredFuel + calculateRequiredFuel(requiredFuel)
    } else {
        return requiredFuel;
    }
}

reader.on('line', line => {
    const mass = Number(line);
    const requiredFuel = calculateRequiredFuel(mass);
    totalFuel += requiredFuel;

    if (process.env.DEBUG) {
        console.log(`${mass} requires ${requiredFuel} fuel`);
    }
});
reader.on('close', () => {
    console.log(`Total fuel required: ${totalFuel}`);
});

