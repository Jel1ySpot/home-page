import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 追踪窗口滚动位置和屏幕高度。
 */
export function useWindowTracker() {
    const scrollY = ref(0)
    const screenHeight = ref(800)

    const handleScroll = () => {
        scrollY.value = window.scrollY
    }

    const handleResize = () => {
        screenHeight.value = window.innerHeight
    }

    onMounted(() => {
        handleScroll()
        handleResize()

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleResize, { passive: true })
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
    })

    return { scrollY, screenHeight }
}
