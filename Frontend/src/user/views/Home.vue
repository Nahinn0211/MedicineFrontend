<template>
  <main>
    <Header />
    <Banner />
    <Feature2 />
    <MedicineSlider type="news" title="Danh sách thuốc mới" />
    <MedicineSlider type="bestselling" title="Sản phẩm bán chạy" />
    <About />
    <!-- <Cta /> -->
    <ServiceHome />
    <About2 />
    <Clients />
    <Footer />
  </main>
</template>


<script setup>
import Header from '../views/layout/Header.vue'
import Footer from '../views/layout/Footer.vue'
import Banner from '../components/blocks/Banner.vue'
import Feature2 from '../components/blocks/Feature2.vue'
import About from '../components/blocks/About.vue'
import Cta from '../components/blocks/Cta.vue'
import ServiceHome from '../components/blocks/ServiceHome.vue'
import About2 from '../components/blocks/FormService.vue'
import Clients from '../components/blocks/Brands.vue'
import MedicineSlider from '@user/components/blocks/MedicineSlider.vue'
</script>