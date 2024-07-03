<script setup>

const props = defineProps (
{
    modelValue: String,
    name: String,
    type: String,
    label: String,
    placeholder: String,
    isLoading: Boolean,
    isLoaded: Boolean,
    isError: Boolean,
    isSuccess: Boolean,
    validationMessage: String,
});

const slots = useSlots ();

const field = ref ("");

const emit = defineEmits (
    [ "update:modelValue", ]
);

const target =
{
    "target": '#' + props.name,
};

</script>

<template>
    <label :for="props.name" class="block text-sm font-medium mb-2" v-text="props.label"></label>
    <div class="relative">

        <input @input="emit ('update:modelValue', $event.target.value)" :value="modelValue" :type="props.type" :name="props.name" :id="props.name" class="peer py-3 px-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none light:bg-neutral-700 light:border-transparent light:text-neutral-400 light:placeholder-neutral-500 light:focus:ring-neutral-600" :class="{ 'ps-11': slots.icon, }" :aria-describedby="props.name + '-helper'" :placeholder="props.placeholder" autocomplete="off" required>

        <button v-if="props.type == 'password'" type="button" :data-hs-toggle-password="JSON.stringify (target)" class="absolute top-0 end-0 p-3.5 rounded-e-md">
            <svg class="flex-shrink-0 size-3.5 text-gray-400 light:text-neutral-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path class="hs-password-active:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path class="hs-password-active:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                <path class="hs-password-active:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                <line class="hs-password-active:hidden" x1="2" x2="22" y1="2" y2="22"></line>
                <path class="hidden hs-password-active:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle class="hidden hs-password-active:block" cx="12" cy="12" r="3"></circle>
            </svg>
        </button>

        <div class="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
            <slot name="icon"></slot>
        </div>

        <div v-if="isLoading || ! isLoaded">
            <div class="absolute top-0 start-0 size-full bg-white/50 rounded-lg light:bg-neutral-800/40"></div>
            <div class="absolute top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full light:text-blue-500" role="status" aria-label="loading">
                    <span class="sr-only">{{ $t ("auth.component.loading") }}</span>
                </div>
            </div>
        </div>

    </div>

    <p v-if="isError || ! isSuccess" :id="props.name + '-helper'" class="text-sm text-red-600 mt-2" v-text="validationMessage"></p>
</template>