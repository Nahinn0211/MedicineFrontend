<template>
    <main>
        <Header />
        <Wishlist />
        <Footer />  
    </main>
</template>

<script setup>
import Wishlist from '@/user/components/blocks/Wishlist.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
</script>