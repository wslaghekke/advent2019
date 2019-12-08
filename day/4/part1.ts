const rangeStart = 359282;
const rangeEnd = 820401;

function isValidPassword(number: string) {
    let foundAdjacentNumbers = false;
    for (let i = 0; i < (number.length - 1); i++) {
        if (number[i] == number[i + 1]) foundAdjacentNumbers = true;
        if (Number(number[i]) > Number(number[i + 1])) {
            return false;
        }
    }
    return foundAdjacentNumbers;
}

let validCount = 0;
for (let i = rangeStart; i <= rangeEnd; i++) {
    if(isValidPassword(i.toString())) {
        validCount++;
    }
}

console.log('Valid count: '+validCount);
