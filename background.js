/*global browser chrome*/

let main = browser || chrome;

main.runtime.onMessage.addListener(request => {
    switch (request.action) {
        case "notify":
            main.notifications.create("ca-clue", {
                iconUrl: main.runtime.getURL("img/logo-96.png"),
                message: request.clue,
                title: "New Clue Received",
                type: "basic"
            });
            break;
    }
});
