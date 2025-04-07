<template>
    <main>
        <Header />
        <Profile />
        <Footer />
    </main>
</template>

<script setup>
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
import Profile from '@user/components/blocks/Profile.vue';
</script>