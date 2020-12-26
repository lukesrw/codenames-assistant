/*global browser*/

browser.devtools.panels.create("Web Extension Template", "/logo.svg", "/html/developer_panel.html").then(newPanel => {
    newPanel.onShown.addListener(() => {
        console.log("[devtools: onShown] User opened developer tools panel");
    });
    newPanel.onHidden.addListener(() => {
        console.log("[devtools: onHidden] User closed developer tools panel");
    });
});
