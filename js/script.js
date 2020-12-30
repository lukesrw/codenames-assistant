/*global browser chrome*/
/* eslint-disable no-console */

"use strict";

var ONE_SECOND_IN_MS = 1000;
var main = browser || chrome;
var clue_last = false;
var listener;

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
    var notes_heading_groups;
    var notes_heading_combinations;
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
        notes_heading_text.innerHTML = "Notes";
        notes_heading_title.appendChild(notes_heading_text);

        notes_heading_groups = document.createElement("a");
        notes_heading_groups.style.marginLeft = "0.5ch";
        notes_heading_groups.classList.add("title");
        notes_heading_groups.innerText = "(group)";
        notes_heading_groups.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        notes_heading_groups.onclick = doGroups;
        notes_heading_title.appendChild(notes_heading_groups);

        notes_heading_combinations = document.createElement("a");
        notes_heading_combinations.style.marginLeft = "0.5ch";
        notes_heading_combinations.classList.add("title");
        notes_heading_combinations.innerText = "(combinations)";
        notes_heading_combinations.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        notes_heading_combinations.onclick = doCombinations;
        notes_heading_title.appendChild(notes_heading_combinations);

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
    var clue_number = document.querySelector(".clueNumber");
    var clue_next;

    if (clue) {
        clue_next = '"' + clue.innerText + '"' + (clue_number ? " " + clue_number.innerText : "");

        if (typeof clue_last === "string" && clue_last !== clue_next) {
            main.runtime.sendMessage({
                action: "notify",
                clue: clue_next
            });
        }

        clue_last = clue_next;

        return clue.innerText;
    }

    return "";
}

/**
 * @returns {void}
 */
function doCombinations() {
    var notes = getNotes();
    var clue = upperCase(getClue());
    var cards = getCards();

    if (clue.length > 0) {
        notes.value = "";

        cards.some(function (group) {
            if (group.name === "gray") {
                group.cards.forEach(function (card) {
                    var word = upperCase(card.querySelector(".word").innerText);

                    notes.value += word + "\n";
                    notes.value += "    - " + word + " " + clue + "\n";
                    notes.value += "    - " + clue + " " + word + "\n";
                    notes.value += "\n";
                });

                return true;
            }

            return false;
        });
    }
}

/**
 *
 * @param {string} text for button
 * @param {string} href for link
 * @returns {void}
 */
function makeButton(text, href) {
    var define_button;
    var define_button_container = document.createElement("div");

    define_button = document.createElement("a");
    define_button.classList.add("jsx-198695588", "button");
    define_button.href = href;
    define_button.target = "_blank";
    define_button.innerText = text.substr(0, 1);
    define_button.title = text;
    define_button.style.textDecoration = "none";
    define_button_container.appendChild(define_button);

    return define_button_container;
}

/**
 * @param {string} input for reference
 * @returns {HTMLDivElement} new button
 */
function makeMerriamWebsterButton(input) {
    return makeButton("Merriam Webster", "https://www.merriam-webster.com/dictionary/" + input.toLowerCase());
}

/**
 *
 * @param {string} input for reference
 * @returns {HTMLDivElement} new button
 */
function makeWikipediaButton(input) {
    return makeButton("Wikipedia", "https://en.wikipedia.org/wiki/" + input.toLowerCase());
}

/**
 * @returns {void}
 */
function getButton() {
    var container = document.querySelector(".clueWrapper");
    var define_button;
    var clue = getClue().toLowerCase();

    if (!container) return false;

    if (!clue) return false;

    define_button = container.querySelector("a");

    if (!define_button) {
        define_button = makeMerriamWebsterButton(clue);
        define_button.style.marginRight = "0.5rem";
        container.insertBefore(define_button, container.firstChild);

        define_button = makeWikipediaButton(clue);
        define_button.style.marginRight = "0.5rem";
        container.insertBefore(define_button, container.firstChild);
    }
}

/**
 * @returns {void}
 */
function doGroups() {
    var cards = getCards();
    var notes = getNotes();

    // reset notes
    notes.value = "";

    cards.forEach(function (group) {
        if (notes.value.length) notes.value += "\n\n";

        notes.value += upperCase(group.name) + ":";

        group.cards.forEach(function (card) {
            notes.value += "\n    - " + upperCase(card.querySelector(".word").innerText);
        });
    });
}

/**
 * @param {Event} event from browser
 * @returns {void}
 */
function mouseAction(event) {
    var target = event.target;
    var buttons;
    var button_i = 0;
    while (!target.classList.contains("card")) {
        target = target.parentElement;
    }
    buttons = target.querySelectorAll("a");

    switch (event.type) {
        case "mouseover":
            if (buttons.length === 0) {
                buttons = makeMerriamWebsterButton(target.querySelector(".word").innerText);
                buttons.style.float = "left";
                target.insertBefore(buttons, target.firstChild);

                buttons = makeWikipediaButton(target.querySelector(".word").innerText);
                buttons.style.float = "left";
                target.insertBefore(buttons, target.firstChild);
            }
            break;

        case "mouseleave":
            for (button_i; button_i < buttons.length; button_i += 1) {
                buttons[button_i].parentElement.parentElement.removeChild(buttons[button_i].parentElement);
            }
            break;
    }
}

document.body.addEventListener("mouseover", function () {
    var cards = document.querySelectorAll(".card");
    var card_i = 0;

    if (cards.length > 0) {
        for (card_i; card_i < cards.length; card_i += 1) {
            cards[card_i].addEventListener("mouseover", mouseAction);
            cards[card_i].addEventListener("mouseleave", mouseAction);
        }

        document.querySelector(".creditsWrapper").style.bottom = "-4px";

        setInterval(function () {
            getButton();
        }, ONE_SECOND_IN_MS);

        getButton();
        doGroups();

        document.body.removeEventListener("mouseover", this);
    }
});
