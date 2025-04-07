<template>
    <main>
        <Header />
        <ListDoctor />
        <Footer />
    </main>
</template>

<script setup>
import ListDoctor from '@/user/components/blocks/ListDoctor.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
</script>