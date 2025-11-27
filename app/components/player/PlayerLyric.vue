<script setup lang="ts">
defineProps<{
    active?: boolean
    html?: string
}>()
</script>

<template>
    <div
        class="origin-left text-3xl font-bold leading-snug transition-all duration-300 md:text-4xl md:mb-7 mb-3"
        :class="[
            active ? 'text-white scale-[110%]' : 'text-white/30 hover:text-white/60 scale-100',
        ]"
    >
        <slot />
    </div>
</template>
