<template>
    <a-row type="flex" justify="center" class="login-form-container">
        <a-form
            :model="formState"
            name="LoginForm"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 8 }"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
            class="login-form"
        >
            <a-form-item
                label="用户名"
                name="identity"
                :rules="[{ required: true, message: '请输入用户名/学号/工号...' }]"
            >
                <a-input v-model:value="formState.identity" />
            </a-form-item>

            <a-form-item
                label="密码"
                name="password"
                :rules="[{ required: true, message: '请输入密码...' }]"
            >
                <a-input-password v-model:value="formState.password" />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 0, span: 1 }" justify="center">
                <a-button type="primary" :disabled="disabled" html-type="submit"> 上 工 </a-button>
            </a-form-item>
        </a-form>
    </a-row>
</template>
<script>
import { defineComponent, reactive, computed, getCurrentInstance } from 'vue';
import { message } from 'ant-design-vue'

import qs from 'qs'

export default defineComponent({
    name: "LoginForm",
    setup() {
        const { appContext } = getCurrentInstance();

        const formState = reactive ({
            identity: '',
            password: '',
        })

        const disabled = computed(() => {
            return !(formState.identity && formState.password)
        });

        const onFinish = async values => {
            const { data : res } = await appContext.config.globalProperties.$http.post("/api/exclude/login", 
            qs.stringify(formState))
            if (res.code === 1000) {
                localStorage.removeItem("Token")
                sessionStorage.removeItem("user")
                message.error("用户名不存在 / 密码不正确！")
            }
            else if (res.code === 200) {
                localStorage.setItem("Token", res.result.token)
                appContext.config.globalProperties.$store.commit({
                    type: 'setUser',
                    user: res.result.user
                })
                sessionStorage.setItem("user", JSON.stringify(res.result.user))
                appContext.config.globalProperties.$router.push("/personalhome")
            }
            else {
                message.warning("未知错误！")
            }
        };

        const onFinishFailed = errorInfo => {
            message.warning("输入内容不符合规范！")            
        };

        return {
            formState,
            disabled,
            onFinish,
            onFinishFailed,
        };
  },
});
</script>

<style scoped>
    .login-form-container {
        width: 100%;
    }

    .login-form {
        width: 80%;
    }
</style>