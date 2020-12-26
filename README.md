# Web Extension Template Repository

## Contents

| Name          | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| /html/        | Various HTML files for pages, popups, sidebars, etc. |
| /lib/         | Helpers written to make life easier                  |
| background.js | JavaScript file for background browser tasks         |
| developer.js  | JavaScript file for developer tools tasks            |
| foreground.js | JavaScript file for window/tab tasks                 |
| logo.svg      | SVG to show in various places                        |
| manifest.json | Web extension manifest file                          |
| script.js     | JavaScript file loaded on all HTML files             |
| style.css     | CSS file loaded on all HTML files                    |

## manifest.json

| Property                  | Description                                         | Notes                                                             |
| ------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| background                | Scripts to be loaded during background operations   |                                                                   |
| browser_action            | Settings for browser toolbar button                 | Remove "default_popup" to enable events                           |
| browser_specific_settings | Settings for browser-specific items                 |                                                                   |
| content_scripts           | Scripts to be loaded during foreground operations   | Set "matches" to control which URLs scripts load on               |
| description               | Description of the Web Extension                    |                                                                   |
| devtools_page             | Location of the developer tools load page           |                                                                   |
| icons                     | Icons to use, at various sizes                      | Web apps want this to be an array, web extensions wants an object |
| manifest_version          | Version of the manifest schema to use               | Always 2 for now                                                  |
| name                      | Name of the Web Extension                           |                                                                   |
| omnibox                   | Keyword to look for in the start of the address bar |                                                                   |
| options_ui                | Settings for options interface                      |                                                                   |
| permissions               | Permissions required by the extension               |                                                                   |
| sidebar_action            | Settings for sidebar interface                      |                                                                   |
| version                   | Version of the Web Extension                        |                                                                   |
