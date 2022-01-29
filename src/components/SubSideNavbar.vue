<template>
    <div class="avatar" ref="avatar">
        <a-avatar :src="avatarPath" v-if="hasAvatar.state == true" :size="avatarSize"/>
        <a-avatar style="background-color: #1890ff" v-if="hasAvatar.state == false" :size="avatarSize">
            <template #icon><UserOutlined /></template>
        </a-avatar>
    </div>
    <a-menu v-model:selectedKeys="selected.key" mode="inline" theme="dark">
        <a-menu-item v-for="workspace in workspaces" :key="workspace.id">
            <a-tooltip placement="right">
                <template #title>
                    <span>简介：{{ loadDescription(workspace.description) }}</span>
                </template>
                <menu-unfold-outlined />
                <span>{{ workspace.name }}</span>
            </a-tooltip>
        </a-menu-item>
    </a-menu>
</template>

<script>
    import { MenuUnfoldOutlined } from '@ant-design/icons-vue'
    import { defineComponent, reactive, computed, getCurrentInstance, ref } from 'vue'
    import { UserOutlined } from '@ant-design/icons-vue'

    export default defineComponent({
        name: 'SubSideNavbar',
        components: {
            MenuUnfoldOutlined,
            UserOutlined,
        },
        props: ['collapsed'],
        data() {
            return {
            }
        },
        computed: {
            avatarSize() {
                return this.collapsed ? 32 : 80
            },
            workspaces() {
                let targetID = this.$store.state.selectedDepartmentID
                this.$store.state.departments.forEach(element => {
                    if (element.id == targetID)
                        return element.workspaces
                });
            }
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
                key: ref([1])
            })

            let params = { workspace_id: appContext.config.globalProperties.$store.state.selectedDepartmentID }

            appContext.config.globalProperties.$store.dispatch({
                type: 'refreshTaskgroups',
                params: params,
            })
            .then(() => {
                selected.key[0] = appContext.config.globalProperties.$store.state.selectedWorkspaceID
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
        vertical-align: middle;
    }
</style>