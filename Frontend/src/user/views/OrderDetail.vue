<template>
    <main>
        <Header />
        <OrderDetail />
        <Footer />
    </main>
</template>

<script setup>
import OrderDetail from '@/user/components/blocks/OrderDetail.vue';
import Header from '../views/layout/Header.vue';
import Footer from '../views/layout/Footer.vue';
</script>