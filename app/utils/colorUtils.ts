import ColorThief from 'colorthief'

type RGB = [number, number, number]

// RGB 转 HSL 辅助函数 (用于判断饱和度和亮度)
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b)
    let h = 0,
        s = 0

    if (max !== min) {
        const d = max - min
        s = max + min > 1 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }
    return [h, s, (max + min) / 2] // h, s, l 都在 0-1 之间
}

// 颜色转 Hex 字符串
function rgbToHex(rgb: RGB): string {
    return (
        '#' +
        rgb
            .map(x => {
                const hex = Math.round(x).toString(16)
                return hex.length === 1 ? '0' + hex : hex
            })
            .join('')
    )
}

// 核心提取函数
export async function extractDominantColors(imgUrl: string): Promise<string[]> {
    const colorThief = new ColorThief()
    const img = new Image()

    // 关键：解决 Canvas 跨域问题
    img.crossOrigin = 'Anonymous'
    img.src = imgUrl

    return new Promise(resolve => {
        img.onload = () => {
            // 1. 提取：拿到前 10 种主导色 (多拿一点用于筛选)
            // ColorThief 内部就是类似 K-Means/量化的逻辑
            const rawPalette: RGB[] = colorThief.getPalette(img, 10)

            if (!rawPalette) {
                resolve(['#555', '#666', '#777', '#888']) // 失败兜底
                return
            }

            // 2. 过滤：模仿 Apple Music 的筛选逻辑
            const validColors = rawPalette.filter(rgb => {
                const [_h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2])

                // 规则 A: 去除太黑的颜色 (L < 0.15)
                const isTooDark = l < 0.15
                // 规则 B: 去除太白的颜色 (L > 0.85)
                const isTooLight = l > 0.85
                // 规则 C: 去除太灰的颜色 (S < 0.25)，除非它是唯一的选择
                const isTooGray = s < 0.25

                return !isTooDark && !isTooLight && !isTooGray
            })

            // 3. 排序：优先取饱和度高的颜色
            validColors.sort((a, b) => {
                const s1 = rgbToHsl(a[0], a[1], a[2])[1]
                const s2 = rgbToHsl(b[0], b[1], b[2])[1]
                return s2 - s1 // 降序
            })

            // 4. 补齐：如果筛选后颜色不足 4 个，需要基于现有颜色生成变体
            const finalColors = [...validColors]

            // 兜底策略：如果一张图片全是黑白灰 (validColors 为空)
            if (finalColors.length === 0) {
                // 取原始调色板里最亮的那个灰色
                const bestGray = rawPalette.sort((a, b) => {
                    return rgbToHsl(b[0], b[1], b[2])[2] - rgbToHsl(a[0], a[1], a[2])[2]
                })[0] || [100, 100, 100]
                finalColors.push(bestGray)
            }

            // 循环补齐到 4 个
            while (finalColors.length < 4) {
                const base = finalColors[0]! // 拿最好的那个颜色来裂变
                // 生成一个稍微亮一点或暗一点的变体
                // 简单的偏移逻辑：每个通道 +/- 20~40
                const offset = Math.random() > 0.5 ? 30 : -30
                const newColor: RGB = [
                    Math.min(255, Math.max(0, base[0] + offset)),
                    Math.min(255, Math.max(0, base[1] + offset)),
                    Math.min(255, Math.max(0, base[2] + offset)),
                ]
                finalColors.push(newColor)
            }

            // 截取前4个并转 Hex
            resolve(finalColors.slice(0, 4).map(rgbToHex))
        }

        img.onerror = () => {
            // 图片加载失败兜底
            resolve(['#4a6fa5', '#166088', '#4a6fa5', '#166088'])
        }
    })
}
