/*global browser chrome*/

"use strict";

var ONE_SECOND_IN_MS = 1000;
var main;
var clue_last = false;
var card_first_last = false;
var do_once;
var is_asterix = window.location.hostname === "spy.asterix.gg";
var color_regex = new RegExp(
    "(?:card-|text-|bg-|default/)(?<color>[a-z]+)",
    "ui"
);
var team_regex = new RegExp("(?:alpha|bg)-(?<color>[a-z]+)", "ui");
var class_to_color = {
    danger: "red",
    primary: "blue",
    success: "green"
};

if (typeof browser !== "undefined") {
    main = browser;
} else if (typeof chrome !== "undefined") {
    main = chrome;
}

/**
 * @returns {object} card name to colour map
 */
function cardToColour() {
    var card_to_colour = {};
    var cards = document.querySelectorAll(
        '#logBoard .logEntry, #overview_gamelog_id [class^="text-"]'
    );
    var card_i = 0;
    var word;
    var color;

    for (card_i; card_i < cards.length; card_i += 1) {
        word = cards[card_i].querySelector("em:last-child, strong");
        if (word) {
            word = word.innerText;
            color = color_regex.exec(cards[card_i].className);

            if (color) {
                color = color.groups.color;
                color = class_to_color[color] || color;
                card_to_colour[word] = color;
            }
        }
    }

    return card_to_colour;
}

/**
 * @returns {string} name of current team
 */
function getTeam() {
    var teams;
    var team_i;
    var clone;

    // for codenames.game
    var team = document.querySelector(".button[color]");
    if (team) return team.getAttribute("color");

    // for spy.asterix.gg
    team = document.getElementById("my_username_id").innerText;
    teams = document.querySelectorAll('[id^="tab-overview-"');

    for (team_i = 0; team_i < teams.length; team_i += 1) {
        clone = teams[team_i].cloneNode(true);
        if (clone.children[0].classList.contains("alert")) {
            clone.removeChild(clone.children[0]);
        }
        clone = clone.innerText.replace(" [CAPTAIN]", "").split(", ");

        if (clone.indexOf(team) > -1) {
            clone = team_regex.exec(
                teams[team_i].parentElement.previousElementSibling.className
            );

            team = clone.groups.color;
            break;
        }
    }

    return class_to_color[team] || team;
}

/**
 * @returns {string[]} array of preferred sorting orders
 */
function getOrder() {
    var team = getTeam();
    var order = ["black", team];

    Object.values(class_to_color).forEach(function (color) {
        if (order.indexOf(color) === -1) {
            order.push(color);
        }
    });

    return order.concat(["neutral", "unknown"]);
}

/**
 * @returns {object[]} cards by category
 */
function getCards() {
    var order = [];
    var groups = {};
    var group;
    var cards = document.querySelectorAll(".field .card, .grid_square");
    var card_i = 0;
    var text_to_colour = cardToColour();
    var text;
    var index = 0;

    for (card_i; card_i < cards.length; card_i += 1) {
        if (is_asterix) {
            if (cards[card_i].children[index].tagName === "A") {
                index = 1;
            }
            group = color_regex.exec(
                cards[card_i].children[index].children[0].style.backgroundImage
            );
        } else {
            group = color_regex.exec(cards[card_i].className);
        }

        group = group ? group.groups.color : "neutral"; // not sure about this
        text = cards[card_i].querySelectorAll(".word, center")[0].innerText;
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
    var sidebar_red = document.querySelectorAll(
        "#teamBoard-red, #match_overview_area"
    );
    var notes = sidebar_red[0].nextElementSibling;
    var notes_heading;
    var notes_heading_text;
    var notes_header_elements;
    var notes_heading_groups;
    var notes_heading_combinations;
    var notes_container;
    var action_icon;

    if (!notes) {
        notes = document.createElement("div");
        notes.classList.add("logBoardWrapper", "card");

        if (!is_asterix) {
            // change which corners are rounded
            notes.style.borderTopLeftRadius = "0";
            notes.style.borderBottomLeftRadius = "0";
            notes.style.borderTopRightRadius = "1rem";
            notes.style.borderBottomRightRadius = "1rem";
        }
        sidebar_red[0].parentElement.appendChild(notes);

        notes_heading = document.createElement("section");
        notes_heading.classList.add(
            "flex-none",
            "card-header",
            "bg-light",
            "header-elements-inline"
        );

        if (!is_asterix) {
            notes_heading.style.padding = "0.5rem 0";
            notes_heading.style.textAlign = "center";
        }

        notes.appendChild(notes_heading);

        if (is_asterix) {
            notes_heading_text = document.createElement("h6");
        } else {
            notes_heading_text = document.createElement("span");
        }
        notes_heading_text.classList.add("card-title");
        notes_heading_text.innerHTML = "Notes";
        notes_heading.appendChild(notes_heading_text);

        notes_header_elements = document.createElement("span");
        notes_header_elements.classList.add("header-elements");
        notes_heading.appendChild(notes_header_elements);

        notes_heading_groups = document.createElement("a");
        notes_heading_groups.style.marginLeft = "0.5ch";
        notes_heading_groups.style.padding = "0";
        notes_heading_groups.classList.add("title", "list-icons-item", "mr-3");
        notes_heading_groups.innerText = "Group";
        if (is_asterix) {
            action_icon = document.createElement("i");
            action_icon.classList.add("icon-users", "mr-2");
            notes_heading_groups.insertBefore(
                action_icon,
                notes_heading_groups.firstChild
            );
        } else {
            notes_heading_groups.innerText =
                "(" + notes_heading_groups.innerText.toLowerCase() + ")";
        }
        notes_heading_groups.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        if (typeof doGroups === "function") {
            // eslint-disable-next-line no-use-before-define
            notes_heading_groups.onclick = doGroups;
        }
        notes_header_elements.appendChild(notes_heading_groups);

        notes_heading_combinations = document.createElement("a");
        notes_heading_combinations.style.marginLeft = "0.5ch";
        notes_heading_combinations.style.padding = "0";
        notes_heading_combinations.classList.add("title", "list-icons-item");
        notes_heading_combinations.innerText = "Combinations";
        if (is_asterix) {
            action_icon = document.createElement("i");
            action_icon.classList.add("icon-text-width", "mr-2");
            notes_heading_combinations.insertBefore(
                action_icon,
                notes_heading_combinations.firstChild
            );
        } else {
            notes_heading_combinations.innerText =
                "(" + notes_heading_combinations.innerText.toLowerCase() + ")";
        }
        notes_heading_combinations.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        if (typeof doCombinations === "function") {
            // eslint-disable-next-line no-use-before-define
            notes_heading_combinations.onclick = doCombinations;
        }
        notes_header_elements.appendChild(notes_heading_combinations);

        notes_container = document.createElement("textarea");
        notes_container.spellcheck = false;
        notes_container.classList.add("flex-auto", "scroll");
        if (is_asterix) {
            notes_container.style.padding = ".5rem 1.25rem";
            notes_container.style.minHeight = "185px";
        } else {
            notes_container.style.padding = "0.5rem";
        }
        notes_container.style.border = "0";
        notes_container.style.font = "inherit";
        notes_container.style.fontSize = "0.75rem";
        notes_container.style.outline = "none";
        if (sidebar_red[0].id === "teamBoard-red") {
            notes_container.style.resize = "none";
        }
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
        clue_next =
            clue.innerText + (clue_number ? " " + clue_number.innerText : "");

        if (clue_last !== clue_next) {
            main.runtime.sendMessage({
                action: "notify",
                clue: clue_next
            });
        }

        clue_last = clue_next;

        clue = clue.innerText.trim().split(" ");
        if (clue.length > 1) {
            clue = clue.filter(function (part) {
                return isNaN(parseFloat(part));
            });
        }

        return clue.join(" ");
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
            if (group.name === "unknown") {
                group.cards.forEach(function (card) {
                    var word = upperCase(
                        card.querySelectorAll(".word, center")[0].innerText
                    );

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
    define_button.classList.add(
        "jsx-198695588",
        "button",
        "btn",
        "btn-secondary"
    );
    define_button.href = href;
    define_button.target = "_blank";
    define_button.innerText = text
        .split(" ")
        .map(function (word) {
            return word.substr(0, 1);
        })
        .join("");
    define_button.title = text;
    define_button.style.textDecoration = "none";
    define_button.style.zIndex = 1000;
    define_button.style.padding = "0.4rem 0.4rem 0.3rem";
    define_button.style.minWidth = "22.5px";
    define_button_container.appendChild(define_button);

    return define_button_container;
}

/**
 * @param {string} input for reference
 * @returns {HTMLDivElement} new button
 */
function makeMerriamWebsterButton(input) {
    var button = makeButton(
        "Merriam Webster",
        "https://www.merriam-webster.com/dictionary/" + input.toLowerCase()
    );

    button.style.marginRight = "0.5rem";
    button.children[0].style.borderTopLeftRadius = "0";
    button.children[0].style.borderBottomLeftRadius = "0";

    return button;
}

/**
 *
 * @param {string} input for reference
 * @returns {HTMLDivElement} new button
 */
function makeWikipediaButton(input) {
    var button = makeButton(
        "Wikipedia",
        "https://en.wikipedia.org/wiki/" + input.toLowerCase()
    );

    button.children[0].style.borderTopRightRadius = "0";
    button.children[0].style.borderBottomRightRadius = "0";

    return button;
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
        container.insertBefore(
            makeMerriamWebsterButton(clue),
            container.firstChild
        );
        container.insertBefore(makeWikipediaButton(clue), container.firstChild);
    }
}

/**
 * @returns {void}
 */
function doGroups() {
    var cards = getCards();
    var card_to_colour = cardToColour();
    var notes = getNotes();

    // reset notes
    notes.value = "";

    cards.forEach(function (group) {
        if (notes.value.length) notes.value += "\n\n";

        notes.value += upperCase(group.name) + ":";

        group.cards.forEach(function (card) {
            var word = card.querySelectorAll(".word, center")[0].innerText;

            notes.value += "\n    - " + upperCase(word);
            if (
                cards[cards.length - 1].name !== "unknown" &&
                Object.prototype.hasOwnProperty.call(card_to_colour, word)
            ) {
                notes.value += " ✔️";
            }
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
    while (
        !target.classList.contains("card") &&
        !target.classList.contains("grid_square")
    ) {
        target = target.parentElement;
    }
    buttons = target.querySelectorAll("a");

    switch (event.type) {
        case "mouseover":
            if (buttons.length === 0) {
                buttons = makeMerriamWebsterButton(
                    target.querySelectorAll(".word, center")[0].innerText
                );
                buttons.style.float = "left";
                target.insertBefore(buttons, target.firstChild);

                buttons = makeWikipediaButton(
                    target.querySelectorAll(".word, center")[0].innerText
                );
                buttons.style.float = "left";
                target.insertBefore(buttons, target.firstChild);
            }
            break;

        case "mouseleave":
            for (button_i; button_i < buttons.length; button_i += 1) {
                buttons[button_i].parentElement.parentElement.removeChild(
                    buttons[button_i].parentElement
                );
            }
            break;
    }
}

/**
 * @param {NodeList} wrappers list of card covers
 * @param {HTMLDivElement} target of current item
 * @returns {void}
 */
function addPeakListener(wrappers, target) {
    target.addEventListener("click", function () {
        var wrapper_j = 0;

        for (wrapper_j; wrapper_j < wrappers.length; wrapper_j += 1) {
            if (
                wrappers[wrapper_j] !== target &&
                wrappers[wrapper_j].style.top !== "16px"
            ) {
                wrappers[wrapper_j].classList.toggle(
                    "peak",
                    !target.classList.contains("peak")
                );
            }
        }
    });
}

document.body.addEventListener("mouseover", function () {
    var cards = getCards();
    var credits;
    var wrappers = document.querySelectorAll(".tokenWrapper");
    var wrapper_i = 0;

    if (cards) {
        card_first_last = cards[0].cards[0];

        Object.keys(cards).forEach(function (group) {
            cards[group].cards.forEach(function (card) {
                card.addEventListener("mouseover", mouseAction);
                card.addEventListener("mouseleave", mouseAction);
            });
        });

        for (wrapper_i; wrapper_i < wrappers.length; wrapper_i += 1) {
            addPeakListener(wrappers, wrappers[wrapper_i]);
        }

        if (!do_once) {
            credits = document.querySelector(".creditsWrapper");

            if (credits) credits.style.bottom = "-4px";

            setInterval(function () {
                getButton();
            }, ONE_SECOND_IN_MS);

            getButton();
            doGroups();

            do_once = true;
        }
    }
});
