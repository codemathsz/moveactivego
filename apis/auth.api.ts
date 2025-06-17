import {axiosInstance, axiosInstanceAuthoraized} from './base.api'
import { sendLogGrafana } from './grafana.api';

interface ILogout{
  success: boolean,
  message: string
}

export const authenticate = async (email:string, password:string) => {
  try {    
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data
  } catch (error:any) {    
    if (error.response && error.response.data) {
      console.error("LOGIN ERROR",error.response.data);
      await sendLogGrafana('LOGIN: '+  JSON.stringify(error.response.data))
      return error.response.data
    } else {
      console.error("Unexpected error: ", error);
      throw new Error(error.message);
    }
  }
};

export const logoutApi = async (token: string): Promise<ILogout> =>{
  try{
    const response = await axiosInstanceAuthoraized(token).post('/auth/logout')
    return response.data
  }catch(error:any){
    await sendLogGrafana('LOGOUT: '+  JSON.stringify(error.response.data))
    throw new Error(error.message);
  }
}