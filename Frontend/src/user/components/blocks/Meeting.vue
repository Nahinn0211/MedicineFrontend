<template>
    <section class="section telemedicine">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-4 col-sm-6">
                    <div class="telemedicine-img">
                        <img src="" alt="Bác sĩ tư vấn qua video"
                            class="img-fluid">
                        <img src="" alt="Bệnh nhân sử dụng thiết bị di động"
                            class="img-fluid mt-4">
                    </div>
                </div>
                <div class="col-lg-4 col-sm-6">
                    <div class="telemedicine-img mt-4 mt-lg-0">
                        <img src="" alt="Giao diện trò chuyện y tế"
                            class="img-fluid">
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="telemedicine-content pl-4 mt-4 mt-lg-0">
                        <h2 class="title-color">Chăm sóc từ xa <br>Mọi lúc, mọi nơi</h2>
                        <p class="mt-4 mb-5">Kết nối với các chuyên gia y tế qua video bảo mật và tin nhắn tức thì. Nhận tư vấn y khoa, đơn thuốc và theo dõi sức khỏe ngay tại nhà.</p>

                        <a href="" class="btn btn-main-2 btn-round-full btn-icon">Kết nối ngay<i
                                class="icofont-video-cam ml-3"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script setup>
// Component logic if needed
</script>

<style scoped>
.telemedicine-img img {
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.telemedicine-img img:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.telemedicine-content {
    padding-left: 1.5rem;
}

.telemedicine-content h2 {
    font-weight: 700;
    line-height: 1.4;
}

.telemedicine-content p {
    font-size: 16px;
    line-height: 1.6;
}

.btn-main-2 {
    background-color: #223a66;
    color: #fff;
    border-radius: 50px;
    padding: 12px 25px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-main-2:hover {
    background-color: #e12454;
    color: #fff;
}

.btn-icon i {
    vertical-align: middle;
}
</style>