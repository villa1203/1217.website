<template>
    <section>
        <h2 v-if="!isSuccess">
            {{ props.title }}
        </h2>

        <form v-if="!isSuccess" @submit.prevent="handleSubmit">
            <label>
                <span>{{ props.label }}</span>

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

            <button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? props.submittingLabel : props.submitLabel }}
            </button>
        </form>

        <p v-if="message" role="status" aria-live="polite">
            {{ message }}
        </p>
    </section>
</template>

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

        message.value = `${props.errorMessage} (${responseData.message})`

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
