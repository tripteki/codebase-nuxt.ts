import { defineNuxtPlugin, } from "#imports";

export default defineNuxtPlugin (() =>
{
    if (! import.meta.dev || ! ("serviceWorker" in navigator))
    {
        return;
    }

    navigator.serviceWorker.getRegistrations ().then ((registrations) =>
    {
        for (const registration of registrations)
        {
            registration.unregister ();
        }
    });
});
