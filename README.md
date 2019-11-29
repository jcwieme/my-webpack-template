# Webpack template using Standard ESLint and SASS Loader

## Installation

- npm install

## Commands 

- dev : npm run dev
- build : npm run build

## Tips

### Remove [ESLint Standard](https://standardjs.com/rules.html)

- Go to .eslintrc
- Remove de "extends" option

If you want to know a little bit more about ESLint Standard, you can go here : [ESLint Standard Rules](https://standardjs.com/rules.html)

### Using SASS or CSS

With this template you can use SASS and CSS if wanted. To use one of two, please follow this rules (SASS is configured basic) :

- Go to the app.js
- Import your app.css or app.scss as it's already done : (import css from '../css/app.css') or (import scss from '../scss/app.scss')
- If you use Standard ESLint : make a console.log(css) or console.log(scss)
- That's it !  Use your app.scss or app.css to import all your css files

### Adding HTML files

If you add HTML files, you will need to restart your server (**npm run dev**) for them to take effect.

### Build your project

After the development phase of your project, I recommend you make a build (**npm run build**).
The build will clean your dist folder, compile and minify your scss and js files, hash your files as well as update all your links.