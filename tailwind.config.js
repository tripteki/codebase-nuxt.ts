/** @type {import ("tailwindcss").Config} */

"use strict";

import withMT from "@material-tailwind/html/utils/withMT";

export default withMT ({

    content: [

      "./components/**/*.{js,ts,vue}",
      "./layouts/**/*.vue",
      "./pages/**/*.vue",
      "./plugins/**/*.{js,ts}",
      "./app.vue",
      "./error.vue",
    ],

    plugins: [],

    theme: {

        extend: {},
    },
});
