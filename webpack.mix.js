const mix = require("laravel-mix");

mix.js('resources/js/app.js','public/js/app.js');

mix.browserSync('127.0.0.1: 8000');