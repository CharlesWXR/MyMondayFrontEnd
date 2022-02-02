<template>
    <a-form
        :model="regFormState"
        name="RegForm"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 8 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >
    <a-form-item
        label="工号/学号"
        name="staff_id"
        :rules="[{ required: true, message: '请输入学号/工号!' }]"
    >
        <a-input v-model:value="regFormState.staff_id" />
    </a-form-item>

    <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入密码!' }]"
    >
        <a-input-password v-model:value="regFormState.password" />
    </a-form-item>
    
    <a-form-item
        label="姓名"
        name="name"
        :rules="[{ required: true, message: '请输入用户名!' }]"
    >
        <a-input v-model:value="regFormState.name" />
    </a-form-item>

    <a-form-item
        label="邮箱"
        name="email"
        :rules="[{ type: 'email' }]"
    >
        <a-input v-model:value="regFormState.email" />
    </a-form-item>

    <a-form-item
        label="QQ"
        name="qq"
        :rules="[{ pattern: /^[\d]{5,15}$/ }]"
    >
        <a-input v-model:value="regFormState.qq" />
    </a-form-item>

    <a-form-item
        label="手机号"
        name="phone"
        :rules="[{ pattern: /^[\d]{8,12}$/}]"
    >
        <a-input v-model:value="regFormState.phone" />
    </a-form-item>

    <a-form-item
        label="职位"
        name="title"
    >
        <a-input v-model:value="regFormState.title" />
    </a-form-item>

    <a-form-item :wrapper-col="{ offset: 0, span: 1 }" justify="center">
        <a-button type="primary" html-type="submit">提交</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { defineComponent, reactive, getCurrentInstance } from "vue"
import { message } from 'ant-design-vue'

export default defineComponent({
    name: 'RegForm',
    setup() {
        const { appContext } = getCurrentInstance();

        const regFormState = reactive({
            name: '',
            staff_id: '',
            password: '',
            email: '',
            qq: '',
            phone: '',
            title: '',
        })

        const onFinish = async values => {
            const { data : res } = await appContext.config.globalProperties.$http.post("/api/exclude/reg",
            { 
                name: regFormState.name,
                staff_id: regFormState.staff_id,
                password: regFormState.password,
                email: regFormState.email,
                qq: regFormState.qq,
                phone: regFormState.phone,
                title: regFormState.title        
            })
            if (res.code === 400 || res.code === 1001) {
                message.warn("用户名或工号已被占用");
            }
            else if (res.code === 200) {
                message.info("注册成功！");
                setTimeout(() => {
                    appContext.config.globalProperties.$router.push("/")
                }, 500)
            }
            else {
                message.warn("未知异常！")
            }
        };

        const onFinishFailed = errorInfo => {
            console.log('Failed:', errorInfo);
        };

        return {
            regFormState,
            onFinish,
            onFinishFailed,
        }
    }
})
</script>