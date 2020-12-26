/*global browser*/

console.log("content.js");

browser.runtime.onMessage.addListener(async () => "Polo");
