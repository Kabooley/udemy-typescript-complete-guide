import fs from 'fs';
import { isGeneratorFunction } from 'util/types';

const CSV_FILENAME = 'football.csv';

const matches = fs
    .readFileSync(CSV_FILENAME, {
        encoding: 'utf-8',
    })
    .split('\n')
    .map((row: string): string[] => {
        return row.split(',');
    });

let manUnitedWins = 0;

for (let match of matches) {
    if (match[1] === 'Man United' && match[5] === 'H') {
        manUnitedWins++;
    } else if (match[2] === 'Man United' && match[5] === 'H') {
        manUnitedWins++;
    }
}
