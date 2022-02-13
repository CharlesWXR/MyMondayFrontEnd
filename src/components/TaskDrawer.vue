<template>
    <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key='1' tab='更新记录'>
            <task-drawer-updates :taskID="task.id"></task-drawer-updates>
        </a-tab-pane>
        <a-tab-pane :key='2' tab='输出文件'>
            <taskDrawerOutput :taskID="task.id"></taskDrawerOutput>
        </a-tab-pane>
        <a-tab-pane :key='3' tab='任务设置'>{{ activeKey }}</a-tab-pane>
    </a-tabs>
</template>

<script>
import TaskDrawerUpdates from "./TaskDrawerUpdates.vue"
import TaskDrawerOutput from "./TaskDrawerOutput.vue"

export default {
    name: 'TaskDrawer',
    components: {
        TaskDrawerUpdates,
        TaskDrawerOutput,
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