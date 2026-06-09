export default defineNuxtRouteMiddleware ((to) =>
{
    const email = String (to.params.email ?? "");
    const signed = String (to.query.signed ?? "");

    if (! email || ! signed)
    {
        return navigateTo ("/admin/auth/login");
    }
});
