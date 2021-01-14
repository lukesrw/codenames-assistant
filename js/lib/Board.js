/*global upperCase Notes Player Card*/

"use strict";

var do_once = true;

/**
 * @returns {object} Board instance
 */
function Board() {
    var that = this;

    that.cards = [];
    that.username = false;
    that.notes = false;

    that.getUsername = function () {
        if (!that.username) {
            switch (window.location.hostname) {
                default:
                    that.username = document.querySelector(
                        "button[color]"
                    ).innerText;
            }
        }

        return that.username;
    };

    that.getTeam = function () {
        var team;
        var username = that.getUsername();

        if (
            Player.getAll().some(function (player) {
                if (player.getUsername() === username) {
                    team = player.getTeam();

                    return true;
                }

                return false;
            })
        ) {
            return team;
        }

        return false;
    };

    that.init = function (reload) {
        var button;
        var card = Card.getFirst();

        if (reload) that.cards = [];

        if (!card) return false;

        if (that.cards.length && that.cards[0].node === card.node) return false;

        // eslint-disable-next-line no-console
        console.log(">> Codenames Assitant Initialized");

        that.cards = Card.getAll();
        // that.notes = that.getNotes();
        that.notes = new Notes();

        if (do_once) {
            do_once = false;

            if (
                that.getUsername() === "Luke" &&
                document.getElementById("codenames-assistant") === null
            ) {
                button = document.querySelector(
                    ".custom-button-image, .nav-item:first-child > a"
                );
                button.id = "codenames-assistant";
                button.addEventListener("click", function () {
                    that.init(true);
                });
            }
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        that.init();
    });

    document.addEventListener("mousemove", function () {
        that.init();
    });

    if (document.readyState === "loading") that.init();
}
