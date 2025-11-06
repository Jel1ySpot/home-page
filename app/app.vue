<template>
    <div>
        <NuxtRouteAnnouncer />
        <NuxtPage />
    </div>
</template>
<script lang="ts">
useSeoMeta({
    title: 'Jel1ySpot 的主页',
    description: '这是一个个人主页',
    ogTitle: '啫喱的主页',
    ogDescription: '这是一个个人主页',
    ogImage: 'https://jellyspot.cc/char-large.png',
    ogUrl: 'https://jellyspot.cc',
    twitterCard: 'summary_large_image',
    twitterTitle: '我的主页',
    twitterDescription: '这是我的个人主页，展示我的作品和项目',
    twitterImage: 'https://jellyspot.cc/twitter-image.jpg',
})
</script>
