import { URL } from "url";

function isValidHttpUrl(input:string):boolean {
    try {
        const newUrl = new URL(input);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

console.log(isValidHttpUrl('https://www.freecodecamp.org/')); // true
console.log(isValidHttpUrl('mailto://mail@freecodecamp.org')); // false
console.log(isValidHttpUrl('freecodecamp')); // false



