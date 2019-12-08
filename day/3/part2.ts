import * as fs from "fs";
import * as readline from "readline";
import lineIntersect from "@turf/line-intersect";
import {Feature, LineString, lineString, point} from "@turf/helpers";
import lineSlice from "@turf/line-slice";
import lineSplit from "@turf/line-split";
import length from "@turf/length";

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
    return intersects.features.reduce<number>((minSteps, intersection) => {
        const geometry = intersection.geometry;
        const line1Slice = lineSlice([0,0], geometry.coordinates, line1);
        const line2Slice = lineSlice([0,0], geometry.coordinates, line2);

        const line1Split = lineSplit(line1, intersection).features[0];
        const line2Split = lineSplit(line2, intersection).features[0];

        const line1Length = getLength(line1Split);
        const line1Length2 = length(line1Split, {units: 'degrees'});

        const line2Length = getLength(line2Split);
        const line2Length2 = length(line2Split, {units: 'degrees'});

        const steps = Math.ceil(line1Length) + Math.ceil(line2Length);
        console.log(`Tried steps ${steps}  (${line1Length} / ${line2Length})`);
        return steps === 0 ? minSteps : Math.min(minSteps, steps);
    }, 99999);
}

function getLength(line: Feature<LineString>) {
    let previousPoint: number[] = null;
    return line.geometry.coordinates.reduce((length, point) => {
        const addedLength = previousPoint ? getDistance(previousPoint, point) : 0;
        previousPoint = point;
        return length + addedLength
    }, 0);
}

function getDistance(a: number[], b: number[]) {
    return Math.round(Math.abs(a[0] - b[0])) + Math.round(Math.abs(a[1] - b[1]));
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
        console.log(`${result} Steps`);
        console.log('');
    }
});
