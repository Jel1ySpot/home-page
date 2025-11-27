<template>
    <div class="absolute fixed inset-0 -z-10 h-screen w-full overflow-hidden">
        <TresCanvas clear-color="#4a6fa5" alpha window-size>
            <TresOrthographicCamera
                :position="[0, 0, 10]"
                :look-at="[0, 0, 0]"
                :args="[-1, 1, 1, -1, 0.1, 10]"
            />
            <TresMesh>
                <TresPlaneGeometry :args="[4, 4]" />
                <TresShaderMaterial
                    :uniforms="uniforms"
                    :vertex-shader="vertexShader"
                    :fragment-shader="fragmentShader"
                    :depth-test="false"
                    :depth-write="false"
                />
            </TresMesh>
        </TresCanvas>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, type PropType } from 'vue'
import * as THREE from 'three'
import { extractDominantColors } from '@/utils/colorUtils'

const props = defineProps({
    colors: {
        type: Array as PropType<string[]>,
        default: () => ['#b95ddd', '#e0e92b', '#2ce341', '#2196f3'],
    },
    speed: {
        type: Number,
        default: 0.5,
    },
    cover: {
        type: String,
        default: '/cover.jpg',
    },
    transitionSpeed: {
        type: Number,
        default: 2.0,
    },
})

const meshColors = ref(props.colors)

// 辅助：Hex 转 Vector3
const hexToRgb = (hex: string) => {
    const color = new THREE.Color(hex)
    return new THREE.Vector3(color.r, color.g, color.b)
}

// Helper to safely get color
const getSafeColor = (index: number) => meshColors.value[index] ?? '#000000'

// 1. 初始化 Uniforms
const uniforms = reactive({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uColor1: { value: hexToRgb(getSafeColor(0)) },
    uColor2: { value: hexToRgb(getSafeColor(1)) },
    uColor3: { value: hexToRgb(getSafeColor(2)) },
    uColor4: { value: hexToRgb(getSafeColor(3)) },
})

// 2. 初始化目标颜色数组
const targetColors = meshColors.value.map(c => hexToRgb(c))

// 3. 监听 meshColors 变化 (来自 props.colors 或 extractDominantColors)
watch(
    meshColors,
    newColors => {
        newColors.forEach((color, index) => {
            if (index < 4 && targetColors[index]) {
                targetColors[index].copy(hexToRgb(color))
            }
        })
    },
    { deep: true },
)

// 监听 props.colors 更新 meshColors
watch(
    () => props.colors,
    newColors => {
        meshColors.value = newColors
    },
)

const updateColors = async (coverUrl: string) => {
    try {
        const colors = await extractDominantColors(coverUrl)
        meshColors.value = colors
        console.log('提取背景色:', colors)
    } catch (e) {
        console.error('颜色提取失败', e)
    }
}

watch(
    () => props.cover,
    newCover => {
        if (newCover) {
            updateColors(newCover)
        }
    },
)

// 4. 渲染循环
let animationFrameId: number
let lastTime = performance.now()

const animate = () => {
    const currentTime = performance.now()
    const delta = (currentTime - lastTime) / 1000
    lastTime = currentTime

    uniforms.uTime.value += props.speed * 0.005
    const lerpFactor = Math.min(1.0, delta * props.transitionSpeed)

    if (targetColors[0]) uniforms.uColor1.value.lerp(targetColors[0], lerpFactor)
    if (targetColors[1]) uniforms.uColor2.value.lerp(targetColors[1], lerpFactor)
    if (targetColors[2]) uniforms.uColor3.value.lerp(targetColors[2], lerpFactor)
    if (targetColors[3]) uniforms.uColor4.value.lerp(targetColors[3], lerpFactor)

    animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
    updateColors(props.cover)
    animate()
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
})

// Shader 代码
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    varying vec2 vUv;

    // Simplex Noise 
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = vUv;
        float time = uTime * 0.5;
        vec2 movement = vec2(
            sin(uv.x * 6.0 + time) * 0.2 + sin(uv.y * 8.0 + time * 0.5) * 0.1,
            cos(uv.y * 6.0 + time) * 0.2 + cos(uv.x * 10.0 + time * 0.5) * 0.1
        );
        float noiseVal = snoise(uv * 1.5 + movement + time * 0.2);
        vec2 distUV = uv + movement + vec2(noiseVal * 0.3);

        float xMix = smoothstep(0.0, 1.0, distUV.x);
        float yMix = smoothstep(0.0, 1.0, distUV.y);
        
        vec3 topColor = mix(uColor1, uColor2, xMix);
        vec3 botColor = mix(uColor3, uColor4, xMix);
        vec3 finalColor = mix(topColor, botColor, yMix);
        
        finalColor = finalColor * 1.1;
        float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += (grain - 0.5) * 0.01;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`
</script>
