"use strict";

/**
 * @param {HTMLDivElement} node target player
 * @returns {object} Player instance
 */
function Player(node) {
    var that = this;

    that.getUsername = function () {
        return that.node.innerText;
    };

    that.getParent = function () {
        var target = that.node;

        while (target && !target.classList.contains(Player.class.parent)) {
            target = target.parentElement;
        }

        return target;
    };

    that.getTeam = function () {
        var match = Player.regex.team.exec(that.getParent().outerHTML);

        return match ? match.groups.team : null;
    };

    that.node = node;
}

Player.getAll = function () {
    var players = [];
    var nodes = document.querySelectorAll("." + Player.class.text);
    var node_i = 0;

    for (node_i; node_i < nodes.length; node_i += 1) {
        players.push(new Player(nodes[node_i]));
    }

    return players;
};

Player.order = ["red", "blue"];
Player.class = {};
Player.regex = {};
