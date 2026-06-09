export default defineNuxtRouteMiddleware ((to) =>
{
    const email = String (to.params.email ?? "");

    if (! email)
    {
        return navigateTo ("/admin/auth/login");
    }
});
