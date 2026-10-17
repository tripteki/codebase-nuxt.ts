<script setup lang="ts">
import { onMounted, ref, } from "vue";
import { useRoute, useTranslation, } from "#imports";

import AdminDetailSkeleton from "@/components/admin/AdminDetailSkeleton.vue";
import AdminFrame from "@/components/admin/AdminFrame.vue";
import AlertError from "@/components/AlertError.vue";
import FbButton from "@/components/flowbite/FbButton.vue";
import { useAdminAccesses, } from "@/composables/useAdminAccesses";
import { useAdminActivities, } from "@/composables/useAdminActivities";
import { useRequireAuth, } from "@/composables/useAuthGuard";
import { resolveActivityCauserAdminPath, resolveActivitySubjectAdminPath, } from "@/lib/admin-activity-subject";
import { resolveCallErrorMessage, } from "@/lib/call-message";
import { definePageAuthed, } from "@/lib/define-page-auth";
import { formatStamp, } from "@/lib/format-display";
import { fbAdminShowBack, fbCard, fbLink, fbShowLabel, fbShowValue, } from "@/lib/flowbite-classes";
import type { AdminActivity, } from "@/types/admin/activity";

definePageAuthed ();

const route = useRoute ();
const { canRender, } = useRequireAuth ();
const { can, } = useAdminAccesses ();
const { t, } = useTranslation ("common");
const { get, } = useAdminActivities ();
const activity = ref<AdminActivity | null> (null);
const error = ref ("");

onMounted (async () => {
    const result = await get (String (route.params.id));

    if (! result.isSuccess) {
        error.value = resolveCallErrorMessage (result.error, t ("something_went_wrong"));

        return;
    }

    activity.value = result.data as AdminActivity;
});
</script>

<template>
    <AdminFrame v-if="canRender" :title="t ('activities_show_title')" :description="t ('activities_show_description')">
        <AlertError :message="error" />
        <AdminDetailSkeleton v-if="! activity && ! error" />
        <div v-if="activity" :class="[fbCard, 'grid min-w-0 gap-4 md:grid-cols-2',]">
            <div class="md:col-span-2">
                <p :class="fbShowLabel">{{ t ("log_description") }}</p>
                <p :class="fbShowValue">{{ activity.description }}</p>
            </div>
            <div>
                <p :class="fbShowLabel">{{ t ("event") }}</p>
                <p :class="fbShowValue">{{ activity.event || "-" }}</p>
            </div>
            <div>
                <p :class="fbShowLabel">{{ t ("log_name") }}</p>
                <p :class="fbShowValue">{{ activity.log_name || "-" }}</p>
            </div>
            <div>
                <p :class="fbShowLabel">{{ t ("causer") }}</p>
                <div :class="fbShowValue">
                    <NuxtLink v-if="resolveActivityCauserAdminPath (activity.causer?.id, can)" :class="fbLink" :to="resolveActivityCauserAdminPath (activity.causer?.id, can) || undefined">
                        {{ activity.causer?.full_name || activity.causer?.email }}
                    </NuxtLink>
                    <span v-else>{{ activity.causer?.email || "-" }}</span>
                </div>
            </div>
            <div>
                <p :class="fbShowLabel">{{ t ("subject") }}</p>
                <div :class="fbShowValue">
                    <NuxtLink v-if="resolveActivitySubjectAdminPath (activity.subject_type_label || activity.subject_type, activity.subject_id, can)" :class="fbLink" :to="resolveActivitySubjectAdminPath (activity.subject_type_label || activity.subject_type, activity.subject_id, can) || undefined">
                        {{ activity.subject_type_label || activity.subject_type }}<span v-if="activity.subject_id"> · {{ activity.subject_id }}</span>
                    </NuxtLink>
                    <span v-else>{{ activity.subject_type_label || activity.subject_type || "-" }}<span v-if="activity.subject_id"> · {{ activity.subject_id }}</span></span>
                </div>
            </div>
            <div class="md:col-span-2">
                <p :class="fbShowLabel">{{ t ("created_at") }}</p>
                <p :class="fbShowValue">{{ formatStamp (activity.created_at) }}</p>
            </div>
            <div class="min-w-0 md:col-span-2">
                <p :class="fbShowLabel">{{ t ("properties") }}</p>
                <pre class="mt-2 max-w-full overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-100">{{ activity.properties ? JSON.stringify (activity.properties, null, 2) : "-" }}</pre>
            </div>
            <div :class="[fbAdminShowBack, 'md:col-span-2',]">
                <FbButton variant="outline" to="/admin/activities">{{ t ("back_to_activities") }}</FbButton>
            </div>
        </div>
    </AdminFrame>
</template>
