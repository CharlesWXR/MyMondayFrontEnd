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

axios.defaults.baseURL = 'http://117.89.60.239:8088'

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
            selectedDepartmentID: [0],
            selectedWorkspaceID: [0],
            presentDepartmentIndex: 0,
            presentWorkspaceIndex: 0,
            taskgroups: [],
            autoReload: true,
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
            state.selectedDepartmentID[0] = playload.selectedDepartmentID
        },
        setTaskgroups(state, playload) {
            state.taskgroups = playload.taskgroups
        },
        setSelectedWorkspace(state, playload) {
            state.selectedWorkspaceID[0] = playload.selectedWorkspaceID
        },
        setAutoReload(state, playload) {
            state.autoReload = playload.autoReload
        },
        setPresentDepartment(state, playload) {
            state.presentDepartmentIndex = playload.presentDepartmentIndex
        },
        setPresentWorkspace(state, playload) {
            state.presentWorkspaceIndex = playload.presentWorkspaceIndex
        },
        setTask(state, playload) {
            Object.assign(
                (state.taskgroups[playload.taskgroupIndex].tasks)
                .filter(item => playload.taskID === item.id)[0],
                playload.newVal)
        }
    },
    actions: {
        refreshDepartments({ commit, state, dispatch }, playload) {
            if (state.autoReload == false) {
                message.info("刷新太快啦，10秒钟试试")
                return
            }
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
                        dispatch({
                            type: 'setPresentDepartment',
                            selectedDepartmentID: r.result[0].id
                        })
                        if ((r.result[0].workspaces).length > 0) {
                            let params = { workspace_id: r.result[0].workspaces[0].id }
                            dispatch({ 
                                type:'refreshTaskgroups', 
                                params: params
                            })
                            .then(() => {
                                dispatch({
                                    type: 'setPresentWorkspace',
                                    selectedWorkspaceID: r.result[0].workspaces[0].id
                                })
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
            
            commit({ 
                type: 'setAutoReload',
                autoReload: false,
            })
            setTimeout(() => {
                commit({
                    type: 'setAutoReload',
                    autoReload: true
                })
            }, 1000 * 10)
        },
        refreshTaskgroups({ commit }, playload) {
            app.config.globalProperties.$http.post("/api/taskgroup",
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
                    commit({
                        type : 'setTaskgroups',
                        taskgroups: []
                    })
                    message.warning("未知错误！")
                }
            },
            () => {
                message.warning("未知错误！")
            })
        },
        setPresentDepartment({ commit, state }, playload) {
            commit({
                type: 'setSelectedDepartment',
                selectedDepartmentID: playload.selectedDepartmentID
            })
            let i = 0
            for (; i < state.departments.length; i++) {
                if (state.departments[i].id == state.selectedDepartmentID)
                    break
            }
            commit({
                type: 'setPresentDepartment',
                presentDepartmentIndex: i,
            })
        }, 
        setPresentWorkspace({ commit, state }, playload) {
            commit({
                type: 'setSelectedWorkspace',
                selectedWorkspaceID: playload.selectedWorkspaceID
            })
            let i = 0
            let dIndex = state.presentWorkspaceIndex
            for (; i < state.departments[dIndex].workspaces.length; i++) {
                if (state.departments[dIndex].workspaces[i].id == state.selectedWorkspaceID)
                    break
            }
            commit({
                type: 'setPresentWorkspace',
                presentWorkspaceIndex: i,
            })
        },
        updateTask({ commit, state }, playload) {
            let params = {
                task_id: playload.taskID,
                attr: playload.colName,
                new_val: playload.data
            }
            app.config.globalProperties.$http.put("/api/task", params)
            .then((response) => {
                let p = {workspace_id: state.selectedWorkspaceID[0]}
                app.config.globalProperties.$store.dispatch({
                    type: 'refreshTaskgroups',
                    params: p
                })
            },
            () => {
                message.warn("更新失败！")
            })
        }
    },
    getters: {

    }
})
app.use(store)

app.mount('#app')