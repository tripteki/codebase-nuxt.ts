import { useState, } from "#imports";

export function useAdminSidebar () {
    const open = useState ("admin-sidebar-open", () => false);

    function toggleOpen (): void {
        open.value = ! open.value;
    }

    function close (): void {
        open.value = false;
    }

    return {
        open,
        toggleOpen,
        close,
    };
}
