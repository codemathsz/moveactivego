import axios, { AxiosError, AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL = "https://moveapp-app-58229.ondigitalocean.app/api";

// Variável para armazenar o callback de logout
let logoutCallback: (() => void) | null = null;

// Função para registrar o callback de logout
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Função para obter o token válido
const getValidToken = async (): Promise<string | null> => {
  try {
    const tokenData = await AsyncStorage.getItem('token');
    if (tokenData) {
      const { token, expiration } = JSON.parse(tokenData);
      if (new Date().getTime() < expiration) {
        return token;
      } else {
        await AsyncStorage.removeItem('token');
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
};

// Criar axios instance base
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Criar axios instance autorizada com interceptors
export const axiosInstanceAuthoraized = (token: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Interceptor de resposta para tratar erros 401
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.log("Token inválido ou expirado (401). Fazendo logout...");
        
        // Limpar token do storage
        await AsyncStorage.removeItem('token');
        
        // Chamar callback de logout se existir
        if (logoutCallback) {
          logoutCallback();
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
