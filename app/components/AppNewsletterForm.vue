<template>
    <section class="app-newsletter-form">
        <h3 class="app-newsletter-form__title" v-if="!isSuccess">
            {{ props.title }}
        </h3>

        <form class="app-newsletter-form__form"
              v-if="!isSuccess" @submit.prevent="handleSubmit"
        >
            <label class="app-newsletter-form__form__label">

                <transition name="app-newsletter-transition">
                    <span class="app-newsletter-form__form__label__mail-info"
                          v-if="email.length > 0"
                    >{{ props.label }}</span>
                </transition>

                <input
                    v-model="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    required
                    :placeholder="props.placeholder"
                    :disabled="isSubmitting"
                >
            </label>

            <button type="submit" :disabled="isSubmitting" class="app-button--variant-primary">
                {{ isSubmitting ? props.submittingLabel : props.submitLabel }}
            </button>
        </form>

        <p class="app-newsletter-form__msg"
           v-if="message" role="status" aria-live="polite"
        >
            {{ message }}
        </p>

    </section>
</template>

<style lang="scss" scoped >
.app-newsletter-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
    gap: 1rem;
}

.app-newsletter-form__form {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 30rem;
    position: relative;
    flex-wrap: wrap;

}

.app-newsletter-form__form__label {
    width: 100%;
    max-width: 20rem;
    position: relative;
    padding-top: .75rem;

    input {
        box-sizing: border-box;
        width: 100%;
        padding: .75rem;
        border-radius: .5rem;
        line-height: 1.15;
        font-size: 100%;
        border: 1px solid white;
        background: rgba(255, 255, 255, 1);
    }
}

.app-newsletter-form__form__label__mail-info {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: .25rem;
    top: .5rem;
    left: 0;
    padding-left: 1rem;
    transform: translate(0, -100%);
}


.app-newsletter-form__title {
    text-align: center;
    margin: 0;
}

.app-newsletter-form__btn {
    display: flex;
    justify-content: center;
    align-content: center;
}

.app-newsletter-form__msg {
    text-align: center;
}

.app-newsletter-transition-enter-active,
.app-newsletter-transition-leave-active {
    transition: opacity .25s cubic-bezier(0, .25, 0, 1),
                transform 1s cubic-bezier(0, .25, 0, 1);
}

.app-newsletter-transition-enter-from,
.app-newsletter-transition-leave-to {
    opacity: 0;
    transform: translate(0, -50%);
}

.app-newsletter-transition-enter-to,
.app-newsletter-transition-leave-from {
    opacity: 1;
    transform: translate(0, -100%);
}

</style>

<script setup lang="ts">
type SubscriptionStatus = 'ok' | 'error'

type NewsLetterValues =
    "Venu du site"

type SubscriberDataToSend = {
    email: string,
    groups: NewsLetterValues[],
}

type SubscriptionResponse = {
    error?: unknown
    message?: string
    status: SubscriptionStatus
}

type Props = {
    baseURL: string
    groups?: string[]  // groupe pour le tri dans la newsletter Infomaniak
    title?: string
    label?: string
    placeholder?: string
    submitLabel?: string
    submittingLabel?: string
    successMessage?: string
    errorMessage?: string
    serverResponseErrorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
    groups: () => ['Venu du site'],
    title: 'Restez informé',
    label: 'Adresse email',
    placeholder: 'votre adresse mail',
    submitLabel: "S'inscrire",
    submittingLabel: 'Envoi...',
    successMessage: 'Merci pour votre inscription !',
    errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
    serverResponseErrorMessage: "Erreur lors de la validation de l'adresse mail"
})

const emit = defineEmits<{
    success: []
    error: []
}>()

const email = ref('')
const isSubmitting = ref(false)
const message = ref('')
const isSuccess = ref(false)

const handleSubmit = async () => {
    isSubmitting.value = true
    message.value = ''

    if (!props.baseURL) {
        const errorMsg = 'Missing endpoint'
        message.value = `${props.errorMessage} (${errorMsg})`
        throw Error(errorMsg)
    }

    if (props.baseURL.endsWith('/')) {
        const errorMsg = 'baseURL should not end with a trailing slash'
        message.value = `${props.errorMessage} (${errorMsg})`
        throw Error(errorMsg)
    }

    try {
        const response = await fetch(props.baseURL + '/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value,
                groups: ["Venu du site"],
            } satisfies SubscriberDataToSend)
        })

        const responseData: SubscriptionResponse = await response.json()


        if (responseData.status === 'ok') {
            message.value = props.successMessage
            isSuccess.value = true
            email.value = ''
            emit("success")
            return
        }

        emit("error")

        message.value = `${props.errorMessage} (${props.serverResponseErrorMessage})`

        Error( responseData.message || props.errorMessage)
    } catch (error) {
        message.value = error instanceof Error ? error.message : props.errorMessage
        isSuccess.value = false
        emit('error')
    } finally {
        isSubmitting.value = false
    }
}
</script>
