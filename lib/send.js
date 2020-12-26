/*global browser*/
/*eslint-disable no-unused-vars*/

/**
 * Helper to communicate with tab(s)
 *
 * @param {object} content to send to browser
 * @returns {Promise} to handle
 */
async function send(content) {
    let tab_responses = {};
    let tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    for (let tab of tabs) {
        tab_responses[tab.id] = await browser.tabs.sendMessage(tab.id, content);
    }

    return tab_responses;
}
