import * as fs from "fs";

const line = fs.readFileSync(__dirname + '/input.txt', {encoding: 'utf8'});

const width = 25;
const height = 6;
const pixelsPerLayer = width * height;

const regex = new RegExp(`.{1,${pixelsPerLayer}}`, 'g');
const layers = line.match(regex);

function charCount(subject: string, char: string) {
    return subject.split(char).length - 1
}

const fewestZeroLayer = layers.reduce((a,b) => {
    return charCount(a,'0') < charCount(b, '0') ? a : b
});

console.log(`Total ${charCount(fewestZeroLayer, '1') * charCount(fewestZeroLayer, '2')}`);

