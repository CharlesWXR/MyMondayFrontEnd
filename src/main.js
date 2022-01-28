import { createApp } from 'vue'

import ElementPlus, { ElLoading, ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

import AntDesign from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import App from './App.vue'
import router from './router'

import axios from 'axios'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(AntDesign)

axios.defaults.baseURL = 'http://localhost:8080'

let loadingInstance = null
axios.interceptors.request.use(config => {
    // show loading in full screen mode
    loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中',
        background: 'rgba(0, 0, 0, 0.7)'
    })

    setTimeout(() => {
        if (loadingInstance) {
            loadingInstance.close()
            ElMessage({
                message: "Error: link timeout!",
                type: 'error'
            })
        }
    }, 5000)

    try {
        if (localStorage.Token) {
            config.headers.Token = localStorage.Token
        }
        return config
    } catch (e) {
        console.error(e)
        return config
    }
})

axios.interceptors.response.use(response => {
    // hide loading
    loadingInstance.close()
    loadingInstance = null
    return response
})

app.config.globalProperties.$http = axios

app.mount('#app')