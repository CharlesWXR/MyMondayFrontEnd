<template>
    <div class="avatar" ref="avatar">
        <a-avatar :src="avatarPath" v-if="hasAvatar.state == true" :size="avatarSize"/>
        <a-avatar style="background-color: #1890ff" v-if="hasAvatar.state == false" :size="avatarSize">
            <template #icon><user-outlined /></template>
        </a-avatar>
    </div>
    <a-menu v-model:selectedKeys="selected.key" mode="inline" theme="dark">
        <a-menu-item v-for="workspace in workspaces" :key="workspace.id">
            <a-tooltip placement="right">
                <template #title>
                    <span>简介：{{ loadDescription(workspace.description) }}</span>
                </template>
                <right-circle-outlined />
                <span>{{ workspace.name }}</span>
            </a-tooltip>
        </a-menu-item>
        <a-menu-item :key="-1">
            <plus-circle-outlined />
            <span>添加工作区</span>
        </a-menu-item>
    </a-menu>
</template>

<script>
    import { RightCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
    import { defineComponent, reactive, computed, getCurrentInstance, ref } from 'vue'
    import { UserOutlined } from '@ant-design/icons-vue'
    import qs from 'qs'

    export default defineComponent({
        name: 'SubSideNavbar',
        components: {
            RightCircleOutlined,
            UserOutlined,
            PlusCircleOutlined,
        },
        props: ['collapsed'],
        data() {
            return {
            }
        },
        methods: {
            loadDescription(des) {
                if(typeof(des) == undefined || des === null || typeof des !== 'String' || des.length == 0)
                    return "无"
                else
                    return des
            },
        },
        computed: {
            avatarSize() {
                return this.collapsed ? 32 : 80
            },
            workspaces() {
                let departments = this.$store.state.departments
                let index = this.$store.state.presentDepartmentIndex
                if (typeof(index) == undefined 
                    || typeof(departments) === undefined 
                    || departments === null
                    || departments.length == 0)
                    return []
                else  
                    return departments[index].workspaces
            },
        },
        created() {
            this.selected.key = this.$store.state.selectedWorkspaceID
            this.$watch(
                () => this.selected.key,
                (newVal, oldVal) => {
                    if (newVal < 0) {
                        this.$http.put('/api/workspace',
                        qs.stringify({department_id: this.$store.state.selectedDepartmentID[0], name: "新建工作区"}))
                        .then(response => {
                            let res = response.data
                            if (res.code === 200) {
                                this.$store.dispatch('refreshDepartments')
                            }
                        })
                    }
                    else if(newVal != this.$store.state.selectedWorkspaceID) {
                        if (typeof(newVal) != undefined && newVal !== null && newVal.length > 0) {
                            this.$store.dispatch({
                                type: 'setPresentWorkspace',
                                selectedWorkspaceID: newVal
                            })
                        }
                    }
                }
            )
        },
        setup() {
            const { appContext } = getCurrentInstance();

            const hasAvatar = reactive({
                state: true
            });

            const avatarPath = computed(() => {
                try {
                    if (null !== appContext.config.globalProperties.$store.state.user.avatar_path) {
                        let resource = require(appContext.config.globalProperties.$store.state.user.avatar_path)
                        hasAvatar.state = true
                        return resource
                    }
                    else {
                        hasAvatar.state = false
                        return ""
                    }
                } catch(e) {
                    hasAvatar.state = false
                    return ""
                }
            });

            const selected = reactive ({
                key: ref([2])
            })

            return {
                hasAvatar,
                avatarPath,
                selected,
            }
        },
    })
</script>

<style scoped>
    .avatar {
        height: 160px;
        display: flex;
        padding: 15%;
        justify-content: center;
        align-items: center;
    }
</style>