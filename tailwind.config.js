/** @type {import ("tailwindcss").Config} */

"use strict";

export default {

    content: [

      "./node_modules/preline/preline.js",

      "./components/**/*.{js,ts,vue}",
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./app.vue",
      "./error.vue",
    ],

    plugins: [

      require ("preline/plugin"),
    ],

    theme: {

        extend: {},
    },
};
