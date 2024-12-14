<script setup>

const isLoading = ref (false);
const isLoaded = ref (false);

const form = reactive (
{
    name:
    {
        isError: false,
        isSuccess: false,
        value: "",
        validationMessage: "",
    },

    email:
    {
        isError: false,
        isSuccess: false,
        value: "",
        validationMessage: "",
    },

    password:
    {
        isError: false,
        isSuccess: false,
        value: "",
        validationMessage: "",
    },

    password_confirmation:
    {
        isError: false,
        isSuccess: false,
        value: "",
        validationMessage: "",
    },

    agreement:
    {
        isError: false,
        isSuccess: false,
        value: false,
        validationMessage: "",
    },
});

const { t, } = useI18n ();

definePageMeta (
{
    title: "Registration",

    auth: {

        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/admin/dashboard",
    },
});

const load = () =>
{
    isLoading.value = true;
    isLoaded.value = false;
};

const reset = () =>
{
    isLoading.value = false;
    isLoaded.value = true;
};

const registration = async (e) =>
{
    e.preventDefault ();

    load ();

    const {

        isLoading: dataIsLoading,
        isLoaded: dataIsLoaded,
        isError: dataIsError,
        isSuccess: dataIsSuccess,
        data,
        error,

    } = await useCall (
    {
        url: "/auth/register",
        method: "post",
        headers: { "Content-Type": "application/x-www-form-urlencoded", },
        data: {

            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            password_confirmation: form.password_confirmation.value,
            agreement: form.agreement.value,
        },
    });

    if (dataIsSuccess) {

        let dataSuccess = data;

        await navigateTo ("/auth/login");

    } else if (dataIsError) {

        let dataError = error?.response?.data?.errors;

        form.name.isError = dataError?.name?.[0] ? true : false;
        form.name.validationMessage = dataError?.name?.[0];

        form.email.isError = dataError?.email?.[0] ? true : false;
        form.email.validationMessage = dataError?.email?.[0];

        form.password.isError = dataError?.password?.[0] ? true : false;
        form.password.validationMessage = dataError?.password?.[0];
    }

    reset ();
};

</script>

<template>
<div class="container mx-auto mt-3 text-center">
    <form class="grid grid-rows-none gap-8 p-3 border">
        <div><InputComponent v-model="form.name.value" type="text" name="name" label="Username" placeholder="user" :isLoaded="true" :isError="form.name.isError" :validationMessage="form.name.validationMessage" /></div>
        <div><InputComponent v-model="form.email.value" type="email" name="email" label="E-Mail" placeholder="user@email.com" :isLoaded="true" :isError="form.email.isError" :validationMessage="form.email.validationMessage" /></div>
        <div><InputComponent v-model="form.password.value" type="password" name="password" label="Password" placeholder="********" :isLoaded="true" :isError="form.password.isError" :validationMessage="form.password.validationMessage" /></div>
        <div><InputComponent v-model="form.password_confirmation.value" type="password" name="password_confirmation" label="Password Confirmation" placeholder="********" :isLoaded="true" /></div>
        <div>
            <label for="agreement">{{ $t ("auth.agreement") }}</label>
            <input v-model="form.agreement.value" type="checkbox" name="agreement" id="agreement" />
        </div>
        <button @click="registration" type="submit" class="border">{{ $t ("auth.sign_up") }}</button>
    </form>
</div>
</template>
