/* eslint-disable no-console */

"use strict";

var ONE_SECOND_IN_MS = 1000;

var cards;
var notes;

/**
 * @returns {object} card name to colour map
 */
function cardToColour() {
    var card_to_colour = {};
    var cards = document.querySelectorAll(".logEntry.card-red, .logEntry.card-blue, .logEntry.card-gray");
    var card_i = 0;
    var word;

    for (card_i; card_i < cards.length; card_i += 1) {
        word = cards[card_i].querySelector("em:last-child").innerText;
        if (cards[card_i].classList.contains("card-red")) {
            card_to_colour[word] = "red";
        } else if (cards[card_i].classList.contains("card-blue")) {
            card_to_colour[word] = "blue";
        } else {
            card_to_colour[word] = "gray";
        }
    }

    return card_to_colour;
}

/**
 * @returns {string} name of current team
 */
function getTeam() {
    var button = document.querySelector(".button[color]");

    return button ? button.getAttribute("color") : false;
}

/**
 * @returns {string[]} array of preferred sorting orders
 */
function getOrder() {
    var team = getTeam();

    return ["black", team, team === "red" ? "blue" : "red", "gray"];
}

/**
 * @returns {object[]} cards by category
 */
function getCards() {
    var order = [];
    var groups = {};
    var group;
    var cards = document.querySelectorAll(".card");
    var card_i = 0;
    var text_to_colour = cardToColour();
    var text;

    for (card_i; card_i < cards.length; card_i += 1) {
        group = cards[card_i].classList[2] || "gray";
        text = cards[card_i].querySelector(".word").innerText;
        if (Object.prototype.hasOwnProperty.call(text_to_colour, text)) {
            group = text_to_colour[text];
        }

        if (!Object.prototype.hasOwnProperty.call(groups, group)) {
            groups[group] = [];
        }

        groups[group].push(cards[card_i]);
    }

    getOrder().forEach(function (group) {
        if (Object.prototype.hasOwnProperty.call(groups, group)) {
            order.push({
                cards: groups[group],
                name: group
            });
        }
    });

    return order;
}

/**
 * @returns {HTMLDivElement} new/existing notes container
 */
function getNotes() {
    var sidebar_red = document.getElementById("teamBoard-red");
    var notes = sidebar_red.nextElementSibling;
    var notes_heading;
    var notes_heading_title;
    var notes_heading_text;
    var notes_heading_refresh;
    var notes_container;

    if (!notes) {
        notes = document.createElement("div");
        notes.classList.add("logBoardWrapper");

        // change which corners are rounded
        notes.style.borderTopLeftRadius = "0";
        notes.style.borderBottomLeftRadius = "0";
        notes.style.borderTopRightRadius = "1rem";
        notes.style.borderBottomRightRadius = "1rem";
        sidebar_red.parentElement.appendChild(notes);

        notes_heading = document.createElement("section");
        notes_heading.classList.add("flex-none");
        notes.appendChild(notes_heading);

        notes_heading_title = document.createElement("p");
        notes_heading_title.classList.add("title");
        notes_heading.appendChild(notes_heading_title);

        notes_heading_text = document.createElement("span");
        notes_heading_text.innerHTML = "Notes -&nbsp;";
        notes_heading_title.appendChild(notes_heading_text);

        notes_heading_refresh = document.createElement("a");
        notes_heading_refresh.classList.add("title");
        notes_heading_refresh.innerText = "(refresh)";
        notes_heading_refresh.href = "javascript:void 0";
        notes_heading_refresh.onclick = function () {
            // eslint-disable-next-line no-use-before-define
            init();
        };
        notes_heading_title.appendChild(notes_heading_refresh);

        notes_container = document.createElement("textarea");
        notes_container.classList.add("flex-auto", "scroll");
        notes_container.style.margin = "0.5rem";
        notes_container.style.border = "0";
        notes_container.style.font = "inherit";
        notes_container.style.fontSize = "0.75rem";
        notes_container.style.resize = "none";
        notes.appendChild(notes_container);
    }

    return notes.querySelector("textarea");
}
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

/**
 * @returns {string} given clue
 */
function getClue() {
    var clue = document.querySelector(".clue:not(.logEntry)");

    return clue ? clue.innerText : "";
}

/**
 * @returns {HTMLAnchorElement} new/existing button
 */
function getButton() {
    var container = document.querySelector(".clueWrapper");
    var define_button;
    var define_button_container;
    var clue = getClue().toLowerCase();

    if (!container) return false;

    if (!clue) return false;

    define_button = container.querySelector("a");

    if (!define_button) {
        define_button_container = document.createElement("div");
        define_button_container.style.marginRight = "0.5rem";
        container.insertBefore(define_button_container, container.firstChild);

        define_button = document.createElement("a");
        define_button.classList.add("jsx-198695588", "button");
        define_button.href = "https://www.merriam-webster.com/dictionary/" + clue;
        define_button.target = "_blank";
        define_button.innerText = "Define";
        define_button_container.appendChild(define_button);
        define_button.style.textDecoration = "none";
    }

    return define_button;
}

/**
 * @returns {void}
 */
function init() {
    getButton();

    cards = getCards();
    notes = getNotes();

    // reset notes
    notes.value = "";

    cards.forEach(function (group) {
        if (notes.value.length) notes.value += "\n\n";

        notes.value += upperCase(group.name) + ":";

        group.cards.forEach(function (card) {
            notes.value += "\n- " + upperCase(card.querySelector(".word").innerText);
        });
    });
}

document.querySelector(".creditsWrapper").style.bottom = "-4px";

setInterval(function () {
    getButton();
}, ONE_SECOND_IN_MS);

init();
