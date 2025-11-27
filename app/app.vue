<template>
    <div>
        <NuxtRouteAnnouncer />
        <NuxtPage />
    </div>
</template>
<script setup lang="ts">
useSeoMeta({
    title: '黒井影のホームページ',
    description: 'This is a home page.',
    ogTitle: '黒井影のホームページ',
    ogDescription: '黒井影のホームページ',
    ogImage: 'https://jellyspot.cc/char-large.png',
    ogUrl: 'https://jellyspot.cc',
    twitterCard: 'summary_large_image',
    twitterTitle: '黒井影のホームページ',
    twitterDescription: 'This shows something.',
    twitterImage: 'https://jellyspot.cc/twitter-image.jpg',
})
</script>
