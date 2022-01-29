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
                <a-breadcrumb-item>User</a-breadcrumb-item>
                <a-breadcrumb-item>Bill</a-breadcrumb-item>
                </a-breadcrumb>
                <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
                Bill is a cat.
                </div>
            </a-layout-content>
            <a-layout-footer style="text-align: center">
                MyMonday ©2021
            </a-layout-footer>
        </a-layout>
    </a-layout>
</template>
<script>
    import { PieChartOutlined, DesktopOutlined, UserOutlined, TeamOutlined, FileOutlined } from '@ant-design/icons-vue';
    import SideNavbar from "@/components/SideNavbar.vue"
    import SubSideNavbar from "@/components/SubSideNavbar.vue"
    import { defineComponent, ref } from 'vue';

    export default defineComponent({
        components: {
            SideNavbar,
            SubSideNavbar,
            PieChartOutlined,
            DesktopOutlined,
            UserOutlined,
            TeamOutlined,
            FileOutlined
        },
        data() {
            return {
                collapsed: ref(false),
                subCollapsed: ref(false),
                selectedKeys: ref(['1']),
            };
        },
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