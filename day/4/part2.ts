const rangeStart = 359282;
const rangeEnd = 820401;

function isValidPassword(number: string) {
    let lastNumber = -1;
    let foundAdjacentNumbers = false;
    let adjacentCount = 0;
    for (let i = 0; i < number.length; i++) {
        if (Number(number[i]) === lastNumber) {
            adjacentCount++;
        } else {
            if(adjacentCount == 1) {
                foundAdjacentNumbers = true;
            }
            adjacentCount = 0;
        }
        if(Number(number[i]) < lastNumber) {
            return false;
        }
        lastNumber = Number(number[i])
    }
    if(adjacentCount == 1 && Number(number[number.length-1]) === lastNumber) {
        foundAdjacentNumbers = true;
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
