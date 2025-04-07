<template>
    <main>
        <Header />
        <DoctorSingle />
        <Footer />
    </main>
</template>

<script setup>
import DoctorSingle from '@/user/components/blocks/DoctorSingle.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
</script>