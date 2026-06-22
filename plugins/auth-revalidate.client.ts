export default defineNuxtPlugin (() => {
    window.addEventListener ("pageshow", (event: PageTransitionEvent) => {
        if (! event.persisted) {
            return;
        }

        const route = useRoute ();
        const authMeta = route.meta.auth;

        if (authMeta === false || authMeta === undefined) {
            return;
        }

        const { getSession, } = useAuth ();

        void getSession ({ force: true });
    });
});
