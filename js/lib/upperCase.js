"use strict";

/**
 * @param {string} input string to transform
 * @returns {string} string in uppercase
 */
function upperCase(input) {
    input = input.toLowerCase();

    return input
        .split(" ")
        .map(function (part) {
            return part.substr(0, 1).toUpperCase() + part.substr(1);
        })
        .join(" ");
}
