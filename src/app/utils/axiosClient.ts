import axios from "axios";
import { toast } from "react-toastify";
import { decryptData } from "./webCrypto";
import { useRouter } from "next/navigation";
import Router from "next/router";

const getUserToken = async () => {
  const encryptedToken = localStorage.getItem("authToken");
  if (!encryptedToken) return null;

  try {
    const decryptedToken = await decryptData(encryptedToken);
    return decryptedToken;
  } catch {
    return null;
  }
};

// const axiosInstance = axios.create({
//   baseURL: "https://localhost:44358/api/",
// });

const axiosInstance = axios.create({
  baseURL: "https://test.testhfiles.in/api/",
  withCredentials:true
});

axiosInstance.interceptors.request.use(
  async (config) => {
    document.body.classList.add("loading-indicator");

    const token = await getUserToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    document.body.classList.remove("loading-indicator");
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    document.body.classList.remove("loading-indicator");
    return response;
  },
  (error) => {
    document.body.classList.remove("loading-indicator");

    const status = error?.response?.status;
    const message = error?.response?.data?.Message ;
    const message2 = error?.response?.data?.message ;

    if (status === 401) {
      // toast.error(message);
       localStorage.clear(); // Optional: clear user data
        Router.push("/login");
      // window.location.href = "/";
    } else if (status === 404 && error.response.data.data === null){

    }
    
    else {
      toast.error(message2);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
