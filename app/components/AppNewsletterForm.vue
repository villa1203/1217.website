<template>
    <section class="app-newsletter-form">
        <p class="app-newsletter-form__title" v-if="props.title">
            {{ props.title }}
        </p>

        <form class="app-newsletter-form__form"
              @submit.prevent="handleSubmit"
        >
            <div class="app-newsletter-form__field">
                <input
                    v-model="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    required
                    :placeholder="props.placeholder"
                    :disabled="isSubmitting || isSuccess"
                >
                <button type="submit" :disabled="isSubmitting || isSuccess" class="app-newsletter-form__arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        </form>

        <p class="app-newsletter-form__msg"
           v-if="message" role="status" aria-live="polite"
        >
            {{ message }}
        </p>

    </section>
</template>

<style lang="scss" scoped>
.app-newsletter-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
}

.app-newsletter-form__title {
    margin: 0;
    line-height: 1.4;
    font-size: inherit;
}

.app-newsletter-form__form {
    width: 100%;
}

.app-newsletter-form__field {
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    padding-bottom: 0.5rem;

    input {
        flex: 1;
        background: transparent;
        border: none;
        color: white;
        font-size: inherit;
        font-family: inherit;
        padding: 0;
        outline: none;
        min-width: 0;

        &::placeholder {
            color: white;
            opacity: 0.5;
        }

        &:disabled {
            opacity: 0.5;
        }
    }
}

.app-newsletter-form__arrow {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0 0 0 0.5rem;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.6;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}

.app-newsletter-form__msg {
    margin: 0;
    font-size: inherit;
    line-height: 1.4;
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
    groups?: string[]
    title?: string
    label?: string
    placeholder?: string
    submitLabel?: string
    submittingLabel?: string
    successMessage?: string
    alreadySubscribedMessage?: string
    errorMessage?: string
    serverResponseErrorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
    groups: () => ['Venu du site'],
    title: 'Stay informed',
    label: 'Email address',
    placeholder: 'E-mail',
    submitLabel: 'Sign up',
    submittingLabel: 'Sending...',
    successMessage: "You're on the list.",
    alreadySubscribedMessage: "You're already on our list.",
    errorMessage: 'An error occurred. Please try again.',
    serverResponseErrorMessage: 'Error validating the email address'
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
        const isAlreadySubscribed = responseData.message?.toLowerCase().includes('already') || responseData.message?.toLowerCase().includes('exist')
        message.value = isAlreadySubscribed ? props.alreadySubscribedMessage : props.errorMessage
    } catch (error) {
        message.value = error instanceof Error ? error.message : props.errorMessage
        isSuccess.value = false
        emit('error')
    } finally {
        isSubmitting.value = false
    }
}
</script>
