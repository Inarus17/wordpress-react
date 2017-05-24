# wordpress-react
A single-page [Wordpress](https://wordpress.com/) bootstrap theme built with [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/).

## Features
- No need to install any Wordpress plugins
- Separate `dev` and `production` builds <i>(accessed with the `?dev` query string)</i>
- Ability to create regular Wordpress custom templates, and include shortcodes, JS, and PHP
- Requested pages are cached
- Uses [react-router](https://github.com/ReactTraining/react-router/tree/master/packages/react-router) and [react-router-dom](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-dom)

----

This is <b>work-in-progress.</b> Not recommended for use on a live site. Several Wordpress features are yet to be implemented.

----

## Installation
1. Download or clone this repository into your Wordpress 'themes' folder
2. Activate the theme in wp-admin
3. cd into this theme folder
4. Run `npm install`
5. Run `npm run dev` to build the <b>dev</b> version
6. Run `npm run prod` to build the <b>production</b> version
7. Edit this line in the `.htaccess` file:

    `RewriteRule . /index.php [L]`

    to

    `RewriteRule . /$1 [P]`


That's all!

----

## Example

production: [https://zenitht.com/wp/](https://zenitht.com/wp/)

dev: [https://zenitht.com/wp/?dev](https://zenitht.com/wp/?dev)

u: wp / p: wp

----