<template>
    <div class="relative w-full font-sans text-white selection:bg-pink-500 selection:text-white">
        <div :style="{ height: totalHeight + 'px' }"></div>

        <Player.MeshGradientBackground :cover="'/cover.webp'" :speed="0.7" />

        <Player.PlayerLayout :style="layoutTransformStyle">
            <Player.PlayerLeft>
                <Player.PlayerCover src="/cover.webp" />
            </Player.PlayerLeft>
            <Player.PlayerLyrics
                v-model:active-index="activeIndex"
                :scroll-y="scrollY"
                @update:scrollable-distance="val => (lyricsScrollableDistance = val)"
            >
                <Player.PlayerLyric
                    v-for="(html, index) in LYRICS_DATA"
                    :key="index"
                    :active="index === activeIndex"
                >
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span v-html="html"></span>
                </Player.PlayerLyric>
            </Player.PlayerLyrics>
        </Player.PlayerLayout>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Player from '~/components/player'

// --- Constants ---
const LYRICS_DATA = [
    `おはよう！黒井影です`,
    `Call me 黒井 or 黒い影<br />both FINE`,
    `From HKSAR🇭🇰, ❤️🇹🇼`,
    `會一點 Programming`,
    `喜歡 JPOP、ボカロ<br />和可愛的東西`,
    `街機音 Game マニア`,
    `AND`,
    `獣になりたいあぁぁぁ`,
    `
<a href="/" class=""><u>Home</u></a>
<br/><br/>
<a href="/blog" class=""><u>Blog</u></a>
<br/><br/>
<a href="/about" class=""><u>About me</u></a>
`,
]

const { scrollY, screenHeight } = useWindowTracker()
const lyricsScrollableDistance = ref(0)
const activeIndex = ref(0)

const totalHeight = computed(() => {
    return screenHeight.value + lyricsScrollableDistance.value
})

const layoutTransformStyle = computed(() => {
    const start = lyricsScrollableDistance.value
    const height = screenHeight.value || 1 // Prevent division by zero

    // Calculate progress: 0 when at top, 1 when scrolled past 'start'
    const progress = Math.max(0, Math.min(1, (scrollY.value - start) / height))
    const translate = progress * -100

    return {
        transform: `translateY(${translate}%)`,
    }
})
</script>

<style scoped>
/* 隐藏 Chrome, Safari 和 Opera 的滚动条 */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
/* 隐藏 IE, Edge 和 Firefox 的滚动条 */
.no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}
</style>
