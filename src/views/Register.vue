<template>
	<login-header class="login-header"></login-header>
    <reg-form class="reg-form"></reg-form>
    <reg-footer class="reg-footer"></reg-footer>
</template>

<script>
import LoginHeader from "@/components/LoginHeader.vue"
import RegForm from "@/components/RegForm.vue"
import RegFooter from '@/components/RegFooter.vue'

export default {
    name: "Register",
    components: {
        LoginHeader,
        RegForm,
        RegFooter,
    }
}
</script>

<style scoped>
    .reg-form {
        margin-left: 10%;
        width: 80%;
    }
</style>