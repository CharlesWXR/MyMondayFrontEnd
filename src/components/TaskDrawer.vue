<template>
    <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key='1' tab='更新记录'>
            <task-drawer-updates :taskID="task.id"></task-drawer-updates>
        </a-tab-pane>
        <a-tab-pane :key='2' tab='输出文件'>{{ task }}</a-tab-pane>
        <a-tab-pane :key='3' tab='任务设置'>{{ activeKey }}</a-tab-pane>
    </a-tabs>
</template>

<script>
import TaskDrawerUpdates from "./TaskDrawerUpdates.vue"

export default {
    name: 'TaskDrawer',
    components: {
        TaskDrawerUpdates,
    },
    props: ['task'],
    data() {
        return {
            activeKey: 1,
        }
    }
}
</script>

<style scoped>

</style>