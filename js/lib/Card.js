/*global Player game*/

"use strict";

var word_to_color = {};

/**
 * @param {HTMLDivElement} node target card
 * @returns {object} Card instance
 */
function Card(node) {
    var that = this;

    that.getParent = function () {
        var target = that.node;

        while (target && !target.classList.contains(Card.class.parent)) {
            target = target.parentElement;
        }

        return target;
    };

    that.word = false;
    that.getWord = function () {
        if (!that.word) {
            that.word = that.node.querySelector(
                "." + Card.class.text
            ).innerText;
        }

        return that.word;
    };

    that.getTeam = function () {
        var match = Card.regex.team.exec(that.node.outerHTML);

        return match ? match.groups.team : null;
    };

    that.node = node;
    that.node = that.getParent();
}

Card.getAll = function () {
    var cards = [];
    var nodes = document.querySelectorAll("." + Card.class.parent);
    var node_i = 0;

    for (node_i; node_i < nodes.length; node_i += 1) {
        cards.push(new Card(nodes[node_i]));
    }

    return cards;
};

Card.getFirst = function () {
    var card = document.querySelector("." + Card.class.parent);

    return card ? new Card(card) : false;
};

Card.getByTeam = function () {
    var cards = Card.getAll();
    var team_to_cards = {};

    cards.forEach(function (card) {
        if (
            !Object.prototype.hasOwnProperty.call(team_to_cards, card.getTeam())
        ) {
            team_to_cards[card.getTeam()] = [];
        }

        team_to_cards[card.getTeam()].push(card);
    });

    return team_to_cards;
};

Card.getSorted = function () {
    var cards = Card.getByTeam();
    var order = ["black", game.getTeam()];

    Player.order.forEach(function (team) {
        if (order.indexOf(team) === -1) {
            order.push(team);
        }
    });

    return order.map(function (team) {
        return {
            cards: cards[team],
            name: team
        };
    });
};

Card.class = {};
Card.regex = {};
