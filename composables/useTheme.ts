import { onMounted, watch, type Ref, } from "vue";

function applyTheme (value: string): void {
    if (! import.meta.client) {
        return;
    }

    const root = document.documentElement;

    root.classList.remove ("light", "dark");

    if (value === "dark") {
        root.classList.add ("dark");
    } else {
        root.classList.add ("light");
    }
}

export function useTheme (): {
    theme: Ref<string>;
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
    mounted: Ref<boolean>;
} {
    const theme = useState<string> ("app-theme", () => "dark");
    const mounted = useState<boolean> ("app-theme-mounted", () => false);
    const listenerReady = useState<boolean> ("app-theme-listener-ready", () => false);
    const colorMode = useColorMode ();

    if (import.meta.client && ! listenerReady.value) {
        listenerReady.value = true;

        onMounted ((): void => {
            mounted.value = true;

            const storedTheme = localStorage.getItem ("theme");

            if (storedTheme === "dark" || storedTheme === "light") {
                theme.value = storedTheme;
            }

            applyTheme (theme.value);

            if (colorMode.preference !== theme.value) {
                colorMode.preference = theme.value;
            }
        });

        watch (theme, (value: string): void => {
            if (! mounted.value) {
                return;
            }

            applyTheme (value);
            localStorage.setItem ("theme", value);

            if (colorMode.preference !== value) {
                colorMode.preference = value;
            }
        });
    }

    function setTheme (newTheme: string): void {
        theme.value = newTheme;
    }

    function toggleTheme (): void {
        theme.value = theme.value === "dark" ? "light" : "dark";
    }

    return {
        theme,
        setTheme,
        toggleTheme,
        mounted,
    };
}
