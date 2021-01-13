/*global browser chrome*/

"use strict";

var ONE_SECOND_IN_MS = 1000;
var NOT_CLUES = ["Game completed"];
var IS_ASTERIX = window.location.hostname === "spy.asterix.gg";
var REGEX_COLOR = new RegExp(
    "(?:card-|text-|bg-|default/)(?<color>[a-z]+)",
    "ui"
);
var REGEX_TEAM = new RegExp("(?:alpha|bg)-(?<color>[a-z]+)", "ui");
var CLASS_TO_COLOR = {
    danger: "red",
    gray: "unknown",
    primary: "blue",
    success: "green"
};

var main;
var clue_last = false;
var card_first_last = false;
var do_once = true;

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
            color = REGEX_COLOR.exec(cards[card_i].className);

            if (color) {
                color = color.groups.color;
                color = CLASS_TO_COLOR[color] || color;
                card_to_colour[word] = color;
            }
        }
    }

    return card_to_colour;
}

/**
 * @returns {string} username
 */
function getUsername() {
    if (IS_ASTERIX) {
        return document.getElementById("my_username_id").innerText;
    }

    return window.localStorage.getItem("nickname");
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
    team = getUsername();
    teams = document.querySelectorAll('[id^="tab-overview-"');

    for (team_i = 0; team_i < teams.length; team_i += 1) {
        clone = teams[team_i].cloneNode(true);

        if (clone.children.length > 0) {
            if (clone.children[0].classList.contains("alert")) {
                clone.removeChild(clone.children[0]);
            }
        }

        clone = clone.innerText.replace(" [CAPTAIN]", "").split(", ");

        if (clone.indexOf(team) > -1) {
            clone = REGEX_TEAM.exec(
                teams[team_i].parentElement.previousElementSibling.className
            );

            team = clone.groups.color;
            break;
        }
    }

    return CLASS_TO_COLOR[team] || team;
}

/**
 * @returns {string[]} array of preferred sorting orders
 */
function getOrder() {
    var team = getTeam();
    var order = ["black", team];

    Object.values(CLASS_TO_COLOR).forEach(function (color) {
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
    var cards = document.querySelectorAll(".wordToken .card, .grid_square");
    var card_i = 0;
    var text_to_colour = cardToColour();
    var text;
    var index = 0;

    // console.log(cards);

    for (card_i; card_i < cards.length; card_i += 1) {
        if (Object.prototype.hasOwnProperty.call(text_to_colour, text)) {
            group = text_to_colour[text];
        } else if (IS_ASTERIX) {
            if (cards[card_i].children[index].tagName === "A") {
                index = 1;
            }

            if (
                cards[card_i].children[index].children[0].style.backgroundImage
                    .length > 0
            ) {
                group =
                    cards[card_i].children[index].children[0].style
                        .backgroundImage;
            } else {
                group = cards[card_i].children[index].style.backgroundImage;
            }

            group = REGEX_COLOR.exec(group);
            if (!group || (group && group.groups.color === "neutral")) {
                group = "unknown";
            } else {
                group = group.groups.color;
            }
            text = cards[card_i].querySelector(".word, center").innerText;
        } else {
            group = cards[card_i].children[0].classList[2] || "unknown";
        }

        group = CLASS_TO_COLOR[group] || group;

        if (!Object.prototype.hasOwnProperty.call(groups, group)) {
            groups[group] = [];
        }

        groups[group].push(cards[card_i]);
    }

    /**
     * some may call this a hack, but what do they know?
     *
     * @todo improve hack
     */
    if (
        Object.keys(groups).length > 1 &&
        Object.keys(text_to_colour).length === 0
    ) {
        groups.neutral = groups.unknown;
        delete groups.unknown;
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
    var textarea_container;
    var textarea;
    var title;
    var action_icon;
    var do_groups;
    var do_combin;
    var actions;

    if (!notes) {
        // textarea
        textarea = document.createElement("textarea");
        textarea.spellcheck = false;
        textarea.classList.add("flex-auto", "scroll");
        textarea.style.width = "100%";
        textarea.style.height = "99%";
        textarea.style.border = "0";
        textarea.style.font = "inherit";
        textarea.style.fontSize = "10pt";
        textarea.style.outline = "none";

        // groups
        do_groups = document.createElement("a");
        do_groups.style.padding = "0";
        do_groups.classList.add("list-icons-item", "mr-3");
        do_groups.innerText = "Group";
        do_groups.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        if (typeof doGroups === "function") do_groups.onclick = doGroups;

        // combinations
        do_combin = document.createElement("a");
        do_combin.style.padding = "0";
        do_combin.classList.add("list-icons-item");
        do_combin.innerText = "Combinations";
        do_combin.href = "javascript:void 0";
        // eslint-disable-next-line no-use-before-define
        if (typeof doCombinations === "function") {
            // eslint-disable-next-line no-use-before-define
            do_combin.onclick = doCombinations;
        }

        if (IS_ASTERIX) {
            // textarea
            textarea.style.padding = ".5rem 1.25rem";
            textarea.style.minHeight = "185px";

            // actions
            action_icon = document.createElement("i");
            action_icon.classList.add("icon-users", "mr-2");
            do_groups.insertBefore(action_icon, do_groups.firstChild);
            action_icon = document.createElement("i");
            action_icon.classList.add("icon-text-width", "mr-2");
            do_combin.insertBefore(action_icon, do_combin.firstChild);
        } else {
            // textarea
            textarea.style.padding = "0.5rem";
            textarea.style.resize = "none";

            // actions
            do_groups.style.borderBottom = "1px dashed";
            do_combin.style.borderBottom = "1px dashed";

            notes = document
                .getElementById("teamBoard-red")
                .parentElement.appendChild(
                    document
                        .getElementById("teamBoard-blue")
                        .nextElementSibling.cloneNode(true)
                );

            notes.classList.add("bg-white");
            notes.classList.remove("opacity-50");
            textarea_container = notes.children[1];

            title = notes.querySelector("p");

            // actions
            actions = title.parentElement.insertAdjacentElement(
                "afterend",
                title.parentElement.cloneNode(true)
            );
            actions.classList.remove("flex-none");
            actions.classList.add("flex");
            actions.style.justifyContent = "space-evenly";
            actions.style.fontSize = "10pt";
            actions.style.color = "#00AAFF";
        }

        while (textarea_container.firstChild) {
            textarea_container.removeChild(textarea_container.firstChild);
        }
        textarea_container.appendChild(textarea);

        while (actions.firstChild) {
            actions.removeChild(actions.firstChild);
        }
        actions.appendChild(do_groups);
        actions.appendChild(do_combin);

        title.innerText = "Notes";

        /*
        notes = document.createElement("div");
        notes.classList.add("logBoardWrapper", "card");

        if (!IS_ASTERIX) {
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

        if (!IS_ASTERIX) {
            notes_heading.style.padding = "0.5rem 0";
            notes_heading.style.textAlign = "center";
        }

        notes.appendChild(notes_heading);

        if (IS_ASTERIX) {
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
        */
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
    var clue = document.querySelector(
        ".clue:not(.logEntry), #word_summary_area_id strong"
    );
    var clue_number = document.querySelector(".clueNumber");
    var clue_next;

    if (clue) {
        clue_next =
            clue.innerText + (clue_number ? " " + clue_number.innerText : "");
        clue_next = clue_next.replace(/\s{1,}/gu, " ");

        if (clue_last !== clue_next && typeof main !== "undefined") {
            main.runtime.sendMessage({
                action: "notify",
                clue: clue_next
            });
        }

        clue_last = clue_next;

        clue = clue.innerText.trim().split(/\s/);
        if (clue.length > 1) {
            clue = clue.filter(function (part) {
                return part.length && isNaN(parseFloat(part));
            });
        }

        clue = clue.join(" ");

        if (NOT_CLUES.indexOf(clue) > -1) {
            return clue;
        }
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
    var is_first = true;

    if (clue.length > 0) {
        notes.value = "";

        cards.some(function (group) {
            if (group.name === "unknown") {
                group.cards.forEach(function (card) {
                    var word = upperCase(
                        card.querySelector(".word, center").innerText
                    );

                    if (!is_first) {
                        notes.value += "\n";
                    }
                    notes.value += word + "\n";
                    notes.value += "    - " + word + " " + clue + "\n";
                    notes.value += "    - " + clue + " " + word + "\n";
                });

                is_first = false;

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

    button.classList.add("float-left");
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

    button.classList.add("float-left");
    button.children[0].style.borderTopRightRadius = "0";
    button.children[0].style.borderBottomRightRadius = "0";

    return button;
}

/**
 * @returns {void}
 */
function getButton() {
    var container = document.querySelector(
        ".clueWrapper, #word_summary_area_id .alert"
    );
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
            var word = card.querySelector(".transition-opacity, center")
                .innerText;

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
                    target.querySelector(".word, center").innerText
                );
                buttons.style.float = "left";
                target.insertBefore(buttons, target.firstChild);

                buttons = makeWikipediaButton(
                    target.querySelector(".word, center").innerText
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
    var wrapper_i = 0;

    wrappers = wrappers || document.querySelectorAll(".coverToken");

    if (wrappers && target) {
        target.addEventListener("click", function () {
            var wrapper_j = 0;
            var is_peak = !target.children[0].classList.contains("peak");

            for (wrapper_j; wrapper_j < wrappers.length; wrapper_j += 1) {
                if (
                    wrappers[wrapper_j] !== target &&
                    wrappers[wrapper_j].style.zIndex.length > 0
                ) {
                    wrappers[wrapper_j].children[0].classList.replace(
                        is_peak ? "cover" : "peak",
                        is_peak ? "peak" : "cover"
                    );
                }
            }
        });

        return true;
    }

    if (IS_ASTERIX) {
        return false;
    }

    for (wrapper_i; wrapper_i < wrappers.length; wrapper_i += 1) {
        addPeakListener(wrappers, wrappers[wrapper_i]);
    }

    return true;
}

/**
 * @returns {void}
 */
function init() {
    document.addEventListener("mousemove", function () {
        var cards = getCards();
        var credits;

        if (
            cards.length &&
            cards[0].cards.length &&
            card_first_last !== cards[0].cards[0]
        ) {
            card_first_last = cards[0].cards[0];

            Object.keys(cards).forEach(function (group) {
                cards[group].cards.forEach(function (card) {
                    card.addEventListener("mouseover", mouseAction);
                    card.addEventListener("mouseleave", mouseAction);
                });
            });

            if (do_once) {
                do_once = false;

                credits = document.querySelector(".creditsWrapper");

                if (credits) credits.style.bottom = "-4px";

                setInterval(getButton, ONE_SECOND_IN_MS);

                addPeakListener();
                getButton();
                doGroups();
            }
        }
    });

    /*
    var cards = getCards();
    var credits;

    if (cards) {

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
    */
}

document.addEventListener("DOMContentLoaded", init);

if (document.readyState !== "loading") init();
