import * as fs from "fs";

const line = fs.readFileSync(__dirname + '/input.txt', {encoding: 'utf8'});

const width = 25;
const height = 6;
const pixelsPerLayer = width * height;

const regex = new RegExp(`.{1,${pixelsPerLayer}}`, 'g');
const layers = line.match(regex);

const output = layers
    .map(it => it.split(''))
    .reduce((output, layer) => {
        for (let i = 0; i < layer.length; i++) {
            if (output[i] === '2') {
                output[i] = layer[i]
            }
        }
        return output;
    });

for(let i = 0; i < height; i++) {
    console.log(output.slice(i * 25, 25 + (i * 25)).map(it => {
        return it === '0' ? ' ' : '█'
    }).join(' '))
}
