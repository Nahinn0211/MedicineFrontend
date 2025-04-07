<template>
    <main>
        <Header />
        <ListService />
        <Footer />
    </main>
</template>

<script setup>
import ListService from '@/user/components/blocks/ListService.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
</script>