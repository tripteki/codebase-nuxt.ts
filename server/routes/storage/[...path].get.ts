export default defineEventHandler ((event) => {
    const config = useRuntimeConfig ();
    const apiUrl = String (config.public.apiUrl ?? "").replace (/\/$/, "");
    const baseURL = String (config.public.baseURL ?? "")
        .replace (/\/api\/?$/, "")
        .replace (/\/$/, "");
    const origin = apiUrl || baseURL;
    const filename = event.path.startsWith ("/storage/export/")
        ? decodeURIComponent (getRequestURL (event).pathname.split ("/").pop () ?? "")
        : "";

    return proxyRequest (event, `${origin}${event.path}`, {
        onResponse: (proxyEvent, response) => {
            if (filename && response.ok) {
                setResponseHeader (
                    proxyEvent,
                    "Content-Disposition",
                    `attachment; filename="${filename.replace (/"/g, "")}"`
                );
            }
        },
    });
});
