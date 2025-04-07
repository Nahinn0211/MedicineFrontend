<template>
    <section class="section appoinment">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <div class="appoinment-content">
                        <img src="@/assets/user/images/about/img-3.jpg" alt="Hình ảnh đặt lịch hẹn" class="img-fluid">
                        <div class="emergency">
                            <h2 class="text-lg"><i class="icofont-phone-circle text-lg"></i> +23 345 67980</h2>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 col-md-10">
                    <div class="appoinment-wrap mt-5 mt-lg-0">
                        <h2 class="mb-2 title-color">Đặt Lịch Hẹn</h2>
                        <p class="mb-4">Chúng tôi cung cấp dịch vụ tư vấn và chăm sóc sức khỏe tận tâm, chuyên nghiệp.</p>
                        <form id="#" class="appoinment-form" method="post" action="#">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <select class="form-control" id="department">
                                            <option>Chọn Chuyên Khoa</option>
                                            <option>Thiết Kế Phần Mềm</option>
                                            <option>Chu Kỳ Phát Triển</option>
                                            <option>Phát Triển Phần Mềm</option>
                                            <option>Bảo Trì</option>
                                            <option>Giải Đáp Quy Trình</option>
                                            <option>Chi Phí và Thời Gian</option>
                                            <option>Hình Thức Cung Cấp</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <select class="form-control" id="doctor">
                                            <option>Chọn Bác Sĩ</option>
                                            <option>Dr. Nguyễn Văn A</option>
                                            <option>Dr. Trần Thị B</option>
                                            <option>Dr. Lê Văn C</option>
                                            <option>Dr. Phạm Thị D</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input name="date" id="date" type="text" class="form-control"
                                            placeholder="dd/mm/yyyy">
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input name="time" id="time" type="text" class="form-control"
                                            placeholder="Thời Gian">
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input name="name" id="name" type="text" class="form-control"
                                            placeholder="Họ và Tên">
                                    </div>
                                </div>

                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input name="phone" id="phone" type="number" class="form-control"
                                            placeholder="Số Điện Thoại">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group-2 mb-4">
                                <textarea name="message" id="message" class="form-control" rows="6"
                                    placeholder="Tin Nhắn Của Bạn"></textarea>
                            </div>

                            <a class="btn btn-main btn-round-full" href="">Đặt Lịch Hẹn <i
                                    class="icofont-simple-right ml-2"></i></a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// Logic của component nếu cần
</script>

<style scoped>
/* CSS dành riêng cho component này */
</style>
