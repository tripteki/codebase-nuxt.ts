<script setup lang="ts">
import { onMounted, reactive, ref, } from "vue";
import { useTranslation, } from "#imports";

import AlertError from "@/components/AlertError.vue";
import AlertSuccess from "@/components/AlertSuccess.vue";
import InputError from "@/components/InputError.vue";
import WebPushEnableSettings from "@/components/admin/WebPushEnableSettings.vue";
import { Button, } from "@/components/ui/button";
import { Input, } from "@/components/ui/input";
import { Label, } from "@/components/ui/label";
import { Spinner, } from "@/components/ui/spinner";
import { useUserProfile, } from "@/composables/useUserProfile";
import { actionErrors, } from "@/lib/admin-action";
import type { UserMeDto } from "@/types/admin/settings";

const { t, } = useTranslation ("common");
const {
    isLoading,
    isSaving,
    fetchMe,
    fetchInterestSuggestions,
    updatePersonal,
} = useUserProfile ();

const form = reactive ({
    name: "",
    email: "",
    full_name: "",
    password: "",
    password_confirmation: "",
});

const interests = ref<string[]>([]);
const newInterest = ref ("");
const existingInterests = ref<string[]>([]);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const currentAvatarUrl = ref<string | null>(null);
const errors = ref<Record<string, string>>({});
const successMessage = ref ("");

function applyUser (user: UserMeDto): void {
    form.name = user.name ?? "";
    form.email = user.email ?? "";
    form.full_name = user.profile?.full_name ?? "";
    interests.value = [...(user.profile?.interests ?? [])];
    currentAvatarUrl.value = user.profile?.avatar_url ?? null;
    avatarFile.value = null;
    avatarPreview.value = null;
}

function onAvatarChange (event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    avatarFile.value = file;

    if (avatarPreview.value) {
        URL.revokeObjectURL (avatarPreview.value);
    }

    avatarPreview.value = file ? URL.createObjectURL (file) : null;
}

async function load (): Promise<void> {
    const [meResult, suggestions] = await Promise.all ([
        fetchMe (),
        fetchInterestSuggestions (),
    ]);

    existingInterests.value = suggestions;

    if (meResult.success && meResult.data) {
        applyUser (meResult.data);
    }
}

function addInterest (value?: string): void {
    const tag = (value ?? newInterest.value).trim ();

    if (! tag || interests.value.includes (tag)) {
        newInterest.value = "";

        return;
    }

    interests.value.push (tag);
    newInterest.value = "";
}

function removeInterest (index: number): void {
    interests.value.splice (index, 1);
}

async function handleSubmit (): Promise<void> {
    errors.value = {};
    successMessage.value = "";

    const result = await updatePersonal (
        {
            name: form.name.trim (),
            email: form.email.trim (),
            full_name: form.full_name.trim (),
            interests: interests.value,
            password: form.password.trim () || undefined,
            password_confirmation:
                form.password_confirmation.trim () || undefined,
        },
        avatarFile.value
    );

    if (! result.success) {
        errors.value = actionErrors (result, t ("something_went_wrong"));

        return;
    }

    if (result.data) {
        applyUser (result.data);
    }

    form.password = "";
    form.password_confirmation = "";
    successMessage.value = t ("settings_personal_updated");
}

onMounted (() => {
    load ();
});
</script>

<template>
    <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
        <AlertError :message="errors.general" />

        <AlertSuccess :message="successMessage || undefined" />

        <div
            v-if="isLoading"
            class="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner class="h-4 w-4" />
            {{ t ("loading") }}
        </div>

        <template v-else>
            <WebPushEnableSettings />

            <div class="space-y-2">
                <Label for="avatar">{{ t ("avatar") }}</Label>
                <div class="flex items-center gap-4">
                    <div
                        class="size-20 shrink-0 overflow-hidden rounded-full border bg-muted">
                        <img
                            v-if="avatarPreview || currentAvatarUrl"
                            :src="
                                avatarPreview || currentAvatarUrl || undefined
                            "
                            alt=""
                            class="h-full w-full object-cover" />
                    </div>
                    <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        @change="onAvatarChange" />
                </div>
                <InputError :message="errors.avatar" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                    <Label for="name">{{ t ("name") }}</Label>
                    <Input id="name" v-model="form.name" required />
                    <InputError :message="errors.name" />
                </div>

                <div class="space-y-2">
                    <Label for="email">{{ t ("email") }}</Label>
                    <Input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required />
                    <InputError :message="errors.email" />
                </div>

                <div class="space-y-2 md:col-span-2">
                    <Label for="full_name">{{ t ("full_name") }}</Label>
                    <Input id="full_name" v-model="form.full_name" />
                    <InputError :message="errors.full_name" />
                </div>
            </div>

            <div class="space-y-2">
                <Label>{{ t ("interests") }}</Label>
                <div class="flex flex-wrap gap-2">
                    <span
                        v-for="(interest, index) in interests"
                        :key="interest"
                        class="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                        {{ interest }}
                        <button
                            type="button"
                            class="opacity-60 hover:opacity-100"
                            @click="removeInterest (index)">
                            ×
                        </button>
                    </span>
                </div>
                <div class="flex gap-2">
                    <Input
                        v-model="newInterest"
                        :placeholder="t ('add_interest')"
                        @keydown.enter.prevent="addInterest ()" />
                    <Button
                        type="button"
                        variant="outline"
                        @click="addInterest ()">
                        {{ t ("add") }}
                    </Button>
                </div>
                <datalist id="interest-suggestions">
                    <option
                        v-for="suggestion in existingInterests"
                        :key="suggestion"
                        :value="suggestion" />
                </datalist>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                    <Label for="password">{{ t ("new_password") }}</Label>
                    <Input
                        id="password"
                        v-model="form.password"
                        type="password"
                        autocomplete="new-password" />
                    <InputError :message="errors.password" />
                </div>

                <div class="space-y-2">
                    <Label for="password_confirmation">{{
                        t ("confirm_password")
                    }}</Label>
                    <Input
                        id="password_confirmation"
                        v-model="form.password_confirmation"
                        type="password"
                        autocomplete="new-password" />
                    <InputError :message="errors.password_confirmation" />
                </div>
            </div>

            <Button type="submit" :disabled="isSaving">
                <Spinner v-if="isSaving" />
                {{ t ("save_changes") }}
            </Button>
        </template>
    </form>
</template>
