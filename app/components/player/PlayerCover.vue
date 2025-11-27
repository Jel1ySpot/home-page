<script setup lang="ts">
import PlayerCard from './PlayerCard.vue'

defineProps({
    src: {
        type: String,
        required: true,
    },
})
</script>

<template>
    <PlayerCard
        class="group relative aspect-square w-full overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
    >
        <PlayerCard
            class="group relative aspect-square w-full overflow-hidden transition-transform duration-500 hover:scale-[1.05]"
        >
            <img :src="src" alt="Cover Image" class="h-full w-full object-cover" />
        </PlayerCard>
    </PlayerCard>
</template>
