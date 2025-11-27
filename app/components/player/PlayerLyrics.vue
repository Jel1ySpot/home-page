<template>
    <div class="relative h-[60vh] w-full max-w-4xl overflow-hidden">
        <div ref="lyricsContentRef" :style="lyricsStyle" class="will-change-transform">
            <div
                ref="listRef"
                class=""
                :style="{
                    paddingTop: `${viewportHeight / 2}px`,
                    paddingBottom: `${viewportHeight / 2}px`,
                }"
            >
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
    scrollY: number
    activeIndex: number
}>()

const emit = defineEmits<{
    (e: 'update:scrollableDistance' | 'update:activeIndex', value: number): void
}>()

const lyricsContentRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const viewportHeight = ref(600)
let resizeObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null

const lyricsScrollableDistance = ref(0)

const getLyricElements = () => {
    if (!listRef.value) return []
    return Array.from(listRef.value.children) as HTMLElement[]
}

const updateScrollableDistance = () => {
    const elements = getLyricElements()
    if (!elements.length) return

    // 找到最后一个元素（位置最靠下的）
    const lastEl = elements.reduce((max, el) => {
        return el.offsetTop > max.offsetTop ? el : max
    }, elements[0]!)

    lyricsScrollableDistance.value = lastEl.offsetTop
}

watch(
    lyricsScrollableDistance,
    val => {
        emit('update:scrollableDistance', val)
    },
    { immediate: true },
)

const handleResize = () => {
    if (lyricsContentRef.value) {
        viewportHeight.value = window.innerHeight * 0.6 // 60vh
        nextTick(updateScrollableDistance)
    }
}

// Style
const currentScroll = computed(() => {
    return Math.min(props.scrollY, lyricsScrollableDistance.value)
})

const lyricsStyle = computed(() => {
    return {
        transform: `translateY(-${currentScroll.value}px)`,
    }
})

const updateActiveIndex = () => {
    const elements = getLyricElements()
    if (!elements.length) return

    const centerLine = currentScroll.value + viewportHeight.value / 2
    let minDistance = Infinity
    let currentActive = 0

    elements.forEach((el, index) => {
        const elCenter = el.offsetTop + el.offsetHeight / 2
        const distance = Math.abs(centerLine - elCenter)

        if (distance < minDistance) {
            minDistance = distance
            currentActive = index
        }
    })

    if (currentActive !== props.activeIndex) {
        emit('update:activeIndex', currentActive)
    }
}

watch(() => props.scrollY, updateActiveIndex, { immediate: true })

onMounted(() => {
    window.addEventListener('resize', handleResize)

    if (lyricsContentRef.value) {
        resizeObserver = new ResizeObserver(() => {
            handleResize()
        })
        resizeObserver.observe(lyricsContentRef.value)
    }

    if (listRef.value) {
        mutationObserver = new MutationObserver(() => {
            nextTick(() => {
                updateScrollableDistance()
                updateActiveIndex()
            })
        })
        mutationObserver.observe(listRef.value, { childList: true, subtree: true })
    }

    nextTick(() => {
        handleResize()
        updateActiveIndex()
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
    if (mutationObserver) {
        mutationObserver.disconnect()
    }
})
</script>
