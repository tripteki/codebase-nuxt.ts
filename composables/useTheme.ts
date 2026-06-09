import { ref, watch, onMounted, type Ref, } from "vue";

export function useTheme (): {
    theme: Ref<string>;
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
    mounted: Ref<boolean>;
}
{
    const theme = ref<string> ("light");
    const mounted = ref<boolean> (false);

    onMounted ((): void =>
    {
        mounted.value = true;

        const storedTheme = localStorage.getItem ("theme");

        if (storedTheme)
        {
            theme.value = storedTheme;
        }
        else
        {
            theme.value = window.matchMedia ("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }

        applyTheme (theme.value);
    });

    watch (theme, (value: string): void =>
    {
        if (! mounted.value)
        {
            return;
        }

        applyTheme (value);
        localStorage.setItem ("theme", value);
    });

    function applyTheme (value: string): void
    {
        const root = document.documentElement;

        root.classList.remove ("light", "dark");

        if (value === "dark")
        {
            root.classList.add ("dark");
        }
        else
        {
            root.classList.add ("light");
        }
    }

    function setTheme (newTheme: string): void
    {
        theme.value = newTheme;
    }

    function toggleTheme (): void
    {
        theme.value = theme.value === "dark" ? "light" : "dark";
    }

    return {
        theme,
        setTheme,
        toggleTheme,
        mounted,
    };
}
