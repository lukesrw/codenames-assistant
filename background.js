/*global browser chrome*/

console.log("background.js");

let main = chrome || browser;

/**
 * Context menus
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Context_menu_items
 */
main.contextMenus.create(
    {
        contexts: ["all"],
        id: "web-extension-template",
        title: "Web Extension Template"
    },
    () => console.log("[contextMenus: onCreated] Context menu created")
);
main.contextMenus.onClicked.addListener(info => {
    console.log(`[contextMenus: onClicked] User clicked on: "${info.menuItemId}"`);
});

/**
 * Omnibox
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Omnibox
 */
main.omnibox.setDefaultSuggestion({
    description: "Phone Home"
});
main.omnibox.onInputChanged.addListener((text, addSuggestions) => {
    console.log(`[omnibox: onInputChanged] User typed "${text}" so far`);

    addSuggestions([
        {
            content: "Content",
            description: "Description"
        }
    ]);
});
main.omnibox.onInputEntered.addListener((text, disposition) => {
    console.log(`[omnibox: onInputEntered] User selected "${text}" (disposition: ${disposition})`);
});

/**
 * Window/tab changed
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
 */
main.tabs.onActivated.addListener(() => {
    console.log("[tabs: onActivated] User changed browser window/tab");
});

/**
 * Toolbar button
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Browser_action
 */
main.browserAction.onClicked.addListener(() => {
    console.log("[browserAction: onClicked] User clicked on toolbar");
});

/**
 * Address bar button
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Page_actions
 */
if (Object.prototype.hasOwnProperty.call(main, "pageAction")) {
    main.pageAction.onClicked.addListener(() => {
        console.log("[pageAction: onClicked] User clicked on address bar");
    });
}
