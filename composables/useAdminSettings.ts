import { useAdminCall, } from "@/composables/useAdminCall";
import {
    buildSettingsFormData,
    buildSettingsPayload,
    settingsUseMultipart,
} from "@/lib/admin-settings-form";
import type { CallResult, } from "@/lib/call";
import type { AdminSettingDraft, } from "@/types/admin/setting";

export function useAdminSettings () {
    const { adminCall, } = useAdminCall ();

    function fetchSettings (): Promise<CallResult> {
        return adminCall ({
            path: "/settings/",
            method: "GET",
        });
    }

    function saveSettings (rows: AdminSettingDraft[]): Promise<CallResult> {
        const multipart = settingsUseMultipart (rows);

        return adminCall ({
            path: "/settings/",
            method: multipart ? "POST" : "PUT",
            data: multipart ? buildSettingsFormData (rows) : buildSettingsPayload (rows),
        });
    }

    return {
        fetchSettings,
        saveSettings,
    };
}
