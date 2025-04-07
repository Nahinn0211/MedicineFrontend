import axios from "axios";

export const Profile = {
  getHeaders() {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
  async getProfile() {
    return await axios.get("http://localhost:8080/api/profile/me", {
      headers: this.getHeaders(),
    });
  },
//   async updateProfile(profileData) {
//     return await axios.put("http://localhost:8080/api/profile/update", profileData, {
//       headers: this.getHeaders(),
//     });
//   },
//   async changePassword(passwordData) {
//     return await axios.post("http://localhost:8080/api/profile/change-password", passwordData, {
//       headers: this.getHeaders(),
//     });
//   }
};