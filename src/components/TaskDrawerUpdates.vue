<template>

</template>

<script>
import { reactive } from 'vue'

export default {
    name: 'TaskDrawerUpdates',
    props: ['taskID'],
    beforeMount() {
        const updates = reactive({
            data: {}
        })

        
    }
}
</script>

<style>

</style>