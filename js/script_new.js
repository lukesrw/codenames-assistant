/*global Card Player Board*/

"use strict";

var game;

switch (window.location.hostname) {
    case "spy.asterix.gg":
        Card.class.parent = "grid_square";
        Card.class.text = "grid_word";

        Player.class.parent = "card";
        Player.class.text = "tab-pane";
        Player.regex.team = new RegExp("(?:bg|alpha)-(?<team>\\w+)", "ui");
        break;

    default:
        Card.class.parent = "wordToken";
        Card.class.text = "transition-opacity";
        Card.regex.team = new RegExp("card (?<team>\\w+)", "ui");

        Player.class.parent = "teamSelectWrapper";
        Player.class.text = "truncate";
        Player.regex.team = new RegExp('id="teamBoard-(?<team>\\w+)"', "ui");
}

game = new Board();
