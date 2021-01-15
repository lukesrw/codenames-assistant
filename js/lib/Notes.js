/*global upperCase Card*/

"use strict";

/**
 * @returns {object} Notes instance
 */
function Notes() {
    var that = this;
    var is_first_team = true;

    that.doGrouping = function () {
        that.textarea.node.value = "";
        Card.getSorted().forEach(function (team) {
            if (!is_first_team) that.textarea.node.value += "\n";

            is_first_team = false;

            that.textarea.node.value += upperCase(team.name) + "\n";

            team.cards.forEach(function (card) {
                that.textarea.node.value +=
                    "    - " + upperCase(card.getWord()) + "\n";
            });
        });
    };

    that.doCombinations = function () {
        that.textarea.node.value = "";
        Card.getAll().forEach(function (card) {
            that.textarea.node.value += card.getWord() + "\n";
        });
    };

    // create textarea
    that.textarea = {};
    that.textarea.node = document.createElement("textarea");
    that.textarea.node.style.outline = "none";
    that.textarea.node.style.width = "100%";
    that.textarea.node.style.height = "99%";
    that.textarea.node.style.font = "inherit";

    switch (window.location.hostname) {
        default:
            that.container = document
                .getElementById("teamBoard-red")
                .parentElement.appendChild(
                    document
                        .getElementById("teamBoard-blue")
                        .nextElementSibling.cloneNode(true)
                );
            that.container.classList.remove("opacity-50");

            // style textarea
            that.textarea.node.style.padding = "0.5rem";
            that.textarea.node.style.resize = "none";

            that.title = that.textarea.container.querySelector("p");

            that.actions = that.title.parentElement.insertAdjacentElement(
                "afterend",
                that.title.parentElement.cloneNode(true)
            );

            that.textarea.container = that.container.children[2];
    }

    if (that.title) that.title.innerText = "Notes";

    // empty actions, insert actions
    if (that.actions) {
        while (that.actions.firstChild) {
            that.actions.removeChild(that.actions.firstChild);
        }
    }
    /**
     * @todo add actions
     */

    // empty textarea container, insert textarea
    if (that.textarea.container) {
        while (that.textarea.container.firstChild) {
            that.textarea.container.removeChild(
                that.textarea.container.firstChild
            );
        }
        that.textarea.container.appendChild(that.textarea.node);
    }

    that.doGrouping();
}
