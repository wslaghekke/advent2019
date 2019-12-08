import * as fs from "fs";
import * as readline from "readline";
import lineIntersect from "@turf/line-intersect";
import {lineString, point} from "@turf/helpers";
import lineSlice from "@turf/line-slice";

const reader = readline.createInterface({
    input: fs.createReadStream(__dirname + '/input.txt')
});

const instructionRegex = /([RDUL])(\d+)/;

function getClosestIntersection(line1Steps: string[], line2Steps: string[]) {
    const line1 = getLineString(line1Steps);
    const line2 = getLineString(line2Steps);
    const intersects = lineIntersect(line1, line2);
    intersects.features.forEach(({geometry}) => {
        console.log(`Intersection ${geometry.coordinates[0]}, ${geometry.coordinates[1]}`)
    });
    return intersects.features.reduce<number>((minDistance, {geometry}) => {
        const distance = geometry.coordinates.reduce((a, b) => Math.abs(a) + Math.abs(b));

        return distance === 0 ? minDistance : Math.min(minDistance, distance);
    }, 99999);
}

function getLineString(line: string[]) {
    let x = 0;
    let y = 0;
    const coordinates = [[0, 0]];

    for (const instruction of line) {
        const [, direction, number] = instructionRegex.exec(instruction);
        switch (direction) {
            case 'R':
                x += Number(number);
                break;
            case 'L':
                x -= Number(number);
                break;
            case 'U':
                y += Number(number);
                break;
            case 'D':
                y -= Number(number);
                break;
            default:
                throw new Error('Unknown direction: ' + direction);
        }
        coordinates.push([x, y]);
    }

    //console.log('coordinates', coordinates);
    return lineString(coordinates)
}

let isLine1 = true;
let line1: string[];
let line2: string[];

reader.on('line', line => {
    if (isLine1) {
        line1 = line.split(',');
        isLine1 = false;
    } else {
        isLine1 = true;
        line2 = line.split(',');

        const result = getClosestIntersection(line1, line2);
        console.log(`Shortest distance ${result}`);
        console.log('');
    }
});
