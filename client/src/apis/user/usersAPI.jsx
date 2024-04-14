import axios from "axios";

export const registerAPI = async (userData) => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/user/register",
    {
      email: userData?.email,
      password: userData?.password,
      username: userData?.username,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};

export const loginAPI = async (userData) => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/user/login",
    {
      email: userData?.email,
      password: userData?.password,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};

export const logoutAPI = async () => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/user/logout",
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};

export const getUserProfileAPI = async () => {
  const response = await axios.get(
    "http://localhost:5000/api/v1/user/user-profile",

    {
      withCredentials: true,
    }
  );
  return response?.data;
};

export const checkUserAuthStatusAPI = async () => {
  const response = await axios.get(
    "http://localhost:5000/api/v1/user/auth/check",
    {
      withCredentials: true,
    }
  );
  return response?.data;
};

