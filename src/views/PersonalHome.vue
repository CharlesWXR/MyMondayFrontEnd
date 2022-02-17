<template>
    <a-layout style="min-height: 100vh">
        <a-layout-sider v-model:collapsed="collapsed" collapsible class="side-navbar">
            <side-navbar></side-navbar>
        </a-layout-sider>
        <a-layout-sider v-model:collapsed="subCollapsed" collapsible class="sub-side-navbar">
            <sub-side-navbar :collapsed="subCollapsed"></sub-side-navbar>
        </a-layout-sider>
        <a-layout>
            <a-layout-content style="margin: 0 16px">
                <a-breadcrumb style="margin: 16px 0">
                    <a-breadcrumb-item>{{ presentDepartment.name }}</a-breadcrumb-item>
                    <a-breadcrumb-item>{{ presentWorkspace.name }}</a-breadcrumb-item>
                </a-breadcrumb>
                <div :style="{ padding: '24px', background: '#fff', minHeight: '85vh' }">
                    <taskgroups :taskgroups="taskgroups"></taskgroups>
                    <create-taskgroup-button style="width: 60%; margin-left: 20%; margin-top: 20px;"/>
                </div>
            </a-layout-content>
            <a-layout-footer style="text-align: center">
                MyMonday ©2022
            </a-layout-footer>
        </a-layout>
    </a-layout>
    <a-back-top />
</template>
<script>
    //import { PieChartOutlined, DesktopOutlined, UserOutlined, TeamOutlined, FileOutlined } from '@ant-design/icons-vue';
    import SideNavbar from "@/components/SideNavbar.vue"
    import SubSideNavbar from "@/components/SubSideNavbar.vue"
    import Taskgroups from "@/components/Taskgroups.vue"
    import CreateTaskgroupButton from "@/components/CreateTaskgroupButton.vue"
    import { defineComponent, ref, getCurrentInstance } from 'vue';

    export default defineComponent({
        components: {
            SideNavbar,
            SubSideNavbar,
            Taskgroups,
            CreateTaskgroupButton,
        },
        data() {
            return {
                collapsed: ref(false),
                subCollapsed: ref(false),
            };
        },
        computed: {
            presentDepartment() {
                let index = this.$store.state.presentDepartmentIndex
                let departments = this.$store.state.departments
                if (typeof(departments) == undefined || null == departments || departments.length <= index)
                    return {name: "", workspaces: []}
                else
                    return departments[index]
            },
            presentWorkspace() {
                let index = this.$store.state.presentWorkspaceIndex
                let workspaces = this.presentDepartment.workspaces
                if (typeof(workspaces) == undefined || null == workspaces)
                    return {name: ""}
                else {
                    if (workspaces.length == index)
                        return {name: "新建工作区"}
                    else
                        return workspaces[index]
                }
            },
            taskgroups() {
                let taskgroups = this.$store.state.taskgroups
                if (typeof taskgroups == undefined || taskgroups.length == 0) {
                    return []
                }
                else {
                    return taskgroups
                }
            },
        },
        setup() {
            const { appContext } = getCurrentInstance()

            appContext.config.globalProperties.$store.dispatch('refreshDepartments')
        }
    });
</script>
<style>
    .sub-side-navbar .ant-layout-sider-trigger {
        background-color: #000c18;
    }

    .site-layout .site-layout-background {
        background: #fff;
    }

    [data-theme='dark'] .site-layout .site-layout-background {
        background: #141414;
    }
</style>