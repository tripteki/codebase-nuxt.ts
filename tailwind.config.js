/** @type {import ("tailwindcss").Config} */

"use strict";

export default {

    content: [

        "./components/**/*.{js,ts,vue}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],

    plugins: [

        require ("tailwindcss-animate"),
    ],

    darkMode: "class",

    theme: {

        fontFamily: {

            "body": [

                "Inter", 
                "ui-sans-serif", 
                "system-ui", 
                "-apple-system", 
                "system-ui", 
                "Segoe UI", 
                "Roboto", 
                "Helvetica Neue", 
                "Arial", 
                "Noto Sans", 
                "sans-serif", 
                "Apple Color Emoji", 
                "Segoe UI Emoji", 
                "Segoe UI Symbol", 
                "Noto Color Emoji",
            ],

            "sans": [

                "Inter", 
                "ui-sans-serif", 
                "system-ui", 
                "-apple-system", 
                "system-ui", 
                "Segoe UI", 
                "Roboto", 
                "Helvetica Neue", 
                "Arial", 
                "Noto Sans", 
                "sans-serif", 
                "Apple Color Emoji", 
                "Segoe UI Emoji", 
                "Segoe UI Symbol", 
                "Noto Color Emoji",
            ],
        },

        extend: {

            colors: {

                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",

                primary: {

                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },

                secondary: {

                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },

                destructive: {

                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },

                muted: {

                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },

                accent: {

                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },

                success: {

                    DEFAULT: "var(--success)",
                    foreground: "var(--success-foreground)",
                    muted: "var(--success-muted)",
                },

                popover: {

                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },

                card: {

                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },

                brand: {

                    primary: "var(--brand-primary)",
                    secondary: "var(--brand-secondary)",
                    tertiary: "var(--brand-tertiary)",
                },

                chart: {

                    1: "var(--chart-1)",
                    2: "var(--chart-2)",
                    3: "var(--chart-3)",
                    4: "var(--chart-4)",
                    5: "var(--chart-5)",
                },

                sidebar: {

                    DEFAULT: "var(--sidebar)",
                    foreground: "var(--sidebar-foreground)",
                    primary: "var(--sidebar-primary)",
                    "primary-foreground": "var(--sidebar-primary-foreground)",
                    accent: "var(--sidebar-accent)",
                    "accent-foreground": "var(--sidebar-accent-foreground)",
                    border: "var(--sidebar-border)",
                    ring: "var(--sidebar-ring)",
                },
            },

            borderRadius: {

                xl: "calc(var(--radius) + 4px)",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },

            keyframes: {

                "accordion-down": {

                    from: { height: 0, },
                    to: { height: "var(--radix-accordion-content-height)", },
                },

                "accordion-up": {

                    from: { height: "var(--radix-accordion-content-height)", },
                    to: { height: 0, },
                },

                "collapsible-down": {

                    from: { height: 0, },
                    to: { height: "var(--radix-collapsible-content-height)", },
                },

                "collapsible-up": {

                    from: { height: "var(--radix-collapsible-content-height)", },
                    to: { height: 0, },
                },
            },

            animation: {

                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "collapsible-down": "collapsible-down 0.2s ease-in-out",
                "collapsible-up": "collapsible-up 0.2s ease-in-out",
            },

            boxShadow: {

                xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            },
        },
    },
};
