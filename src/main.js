import { createApp } from 'vue'

import ElementPlus, { ElLoading } from 'element-plus'
import 'element-plus/dist/index.css'

import AntDesign, { message } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import App from './App.vue'
import router from './router'

import axios from 'axios'
import qs from 'qs'

import { createStore } from 'vuex'

const app = createApp(App).use(store)

app.use(ElementPlus)
app.use(router)
app.use(AntDesign)

axios.defaults.baseURL = 'http://localhost:8080'

let loadingInstance = null
axios.interceptors.request.use(config => {
    // show loading in full screen mode
    if (!loadingInstance) {
        loadingInstance = ElLoading.service({
            lock: true,
            text: '加载中',
            background: 'rgba(0, 0, 0, 0.7)'
        })
    }

    setTimeout(() => {
        if (loadingInstance) {
            loadingInstance.close()
            message.error("Link Timeout!")
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
    if (loadingInstance) {
        loadingInstance.close()
        loadingInstance = null
    }
    return response
})

app.config.globalProperties.$http = axios


const store = createStore({
    state() {
        return {
            user: null,
            departments: [],
            selectedDepartmentID: 0,
            selectedWorkspaceID: 0,
            taskgroups: [],
        }
    },
    mutations: {
        setUser(state, playload) {
            state.user = playload.user
        },
        setDepartments(state, playload) {
            state.departments = playload.departments
        },
        setSelectedDepartment(state, playload) {
            state.selectedDepartmentID = playload.selectedDepartmentID
        },
        setTaskgroups(state, playload) {
            state.taskgroups = playload.taskgroups
        },
        setSelectedWorkspace(state, playload) {
            state.selectedWorkspaceID = playload.selectedWorkspaceID
        },
    },
    actions: {
        refreshDepartments({ commit }, playload) {
            app.config.globalProperties.$http.post("/api/department")
            .then((res) => {
                const r = res.data
                if (r.code === 3000) {
                    message.warn("No department was loaded!")
                }
                else if (r.code === 200) {
                    commit({
                        type: 'setDepartments',
                        departments: r.result
                    })
                    if (r.result.length > 0) {
                        commit({
                            type: 'setSelectedDepartment',
                            selectedDepartmentID: r.result[0].id
                        })
                        if ((r.result[0].workspaces).length > 0) {
                            commit({
                                type: 'setSelectedWorkspace',
                                selectedWorkspaceID: r.result[0].workspaces[0].id
                            })
                        }
                    }
                }
                else {
                    message.warning("未知错误！")
                }
            },
            () => {
                message.warning("未知错误！")
            })
        },
        refreshTaskgroups({ commit }, playload) {
            app.config.globalProperties.$http.post("/api/task",
            qs.stringify(playload.params))
            .then ((res) => {
                const r = res.data
                if (r.code === 3000) {
                    commit({
                        type : 'setTaskgroups',
                        taskgroups: []
                    })
                }
                else if (r.code === 200) {
                    commit({
                        type : 'setTaskgroups',
                        taskgroups: r.result
                    })
                }
                else {
                    taskgroups.empty = true
                    message.warning("未知错误！")
                }
            },
            () => {
                message.warning("未知错误！")
            })
        }
    }
})
app.use(store)

app.mount('#app')