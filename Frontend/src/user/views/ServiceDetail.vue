<template>
    <main>
        <Header />
        <FormBookService />
        <Footer />
    </main>
</template>

<script setup>
import ServiceSingle from '@/user/components/blocks/ServiceSingle.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
import FormBookService from '../components/blocks/FormBookService.vue';
</script>