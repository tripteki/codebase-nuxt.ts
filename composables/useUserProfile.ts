import {
    appendFormMethodOverride,
    buildPersonalSettingsFormData,
} from "@/lib/admin-form-data";
import type { AdminActionResult } from "@/lib/call-message";
import { extractApiData, resultFromCall, } from "@/lib/call-message";
import type {
    PersonalSettingsPayload,
    UserMeDto,
} from "@/types/admin/settings";

export function useUserProfile () {
    const isLoading = useState<boolean>("user-profile-loading", () => false);
    const isSaving = useState<boolean>("user-profile-saving", () => false);

    const { call, } = useCall ();
    const { getSession, } = useAuth ();

    async function fetchMe (): Promise<AdminActionResult<UserMeDto>> {
        isLoading.value = true;

        const result = await call ({
            url: "/api/v1/users/me",
            method: "GET",
        });

        isLoading.value = false;

        return resultFromCall<UserMeDto>(result, "Something went wrong.");
    }

    async function fetchInterestSuggestions (): Promise<string[]> {
        const result = await call ({
            url: "/api/v1/users/me/interests",
            method: "GET",
        });

        if (! result.isSuccess) {
            return [];
        }

        return extractApiData<string[]>(result.data) ?? [];
    }

    async function updatePersonal (
        payload: PersonalSettingsPayload,
        avatar?: File | null
    ): Promise<AdminActionResult<UserMeDto>> {
        isSaving.value = true;

        const result = avatar
            ? await call ({
                  url: "/api/v1/users/me",
                  method: "POST",
                  data: appendFormMethodOverride (
                      buildPersonalSettingsFormData (payload, avatar)
                  ),
              })
            : await call ({
                  url: "/api/v1/users/me",
                  method: "PUT",
                  data: payload,
              });

        isSaving.value = false;

        const actionResult = resultFromCall<UserMeDto>(
            result,
            "Something went wrong."
        );

        if (actionResult.success) {
            await getSession ({ force: true });
        }

        return actionResult;
    }

    return {
        isLoading,
        isSaving,
        fetchMe,
        fetchInterestSuggestions,
        updatePersonal,
    };
}
