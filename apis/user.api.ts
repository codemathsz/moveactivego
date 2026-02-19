
import { axiosInstance, axiosInstanceAuthoraized } from './base.api'
import { UserInterface, UserRegister } from '../interfaces/user.interface';
import { UpdatePassword } from '../interfaces/update-password.interface';
import { UserConfirmation } from '../interfaces/user-confirmation.interface';
import { UserUpdateInfo } from '../interfaces/user-update-info-interface';
import { UpdateProfilePicture } from '../interfaces/update-profile-picture.interface';
import { ConfirmTransferRegister } from '../interfaces/confirmTransfer.interface';
import { ResetPasswordConfirmation } from '../interfaces/reset-password-confirmation.interface';
import { UserSkillInterface } from '../interfaces/user-skill.interface';
import { RunInterface } from '../interfaces/run.interface';
import { UserFriendInterface } from '../interfaces/user-friend.interface';
import { UserFriendAcceptInterface } from '../interfaces/user-friend-accept.interface';
import { UserChatInterface } from '../interfaces/user-chat.interface';
import { UserPointsInterface } from '../interfaces/user-points.interface';
import { NotificationInterface } from '../interfaces/notification.interface';
import { UserInventoryInterface } from '../interfaces/user-inventory.interface';
import { UserInventoryUpdateInterface } from '../interfaces/user-inventory-update.interface';
/* import { IRun, RunFinishDTO, RunUpdateDTO } from '../contexts/RunContext'; */
import { UserVerifyEmailWithCode } from '../interfaces/user-verify-email';
import { IRun, RunFinishDTO, RunUpdateDTO } from '@/contexts/RunContext';
import { Alert } from 'react-native';
import { sendLogGrafana } from './grafana.api';

export const register = async (user: UserRegister) => {
  try {
    // Fazendo a requisição à API
    const response = await axiosInstance.post('/user/create', user);
    console.log(response.data);

    return response.data;
  } catch (error:any) {
    if (error.response && error.response.data) {
      return error.response.data
    } else {
      // Caso seja um erro inesperado
      console.error("Unexpected error: ", error);
      throw {
        success: false,
        message: "Erro desconhecido. Tente novamente mais tarde."
      };
    }
  }
};


export const getUser = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/auth/user');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserByEmail = async (token: string, email:string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get(`/user/byEmail/${email}`);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}


export const getUserTotalInfo = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/run/byUser/TotalData');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }

}

export const getUserInfo = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-info');
    console.log(response);
    
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }

}

export const getBalance = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/user/balance');

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const updatePassword = async (token: string, dto: UpdatePassword) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put('/auth/reset-password-confirmation', dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const userUpdateInfo = async (token: string, userId: string, dto: UserUpdateInfo) => {
  try {
    console.log(`update userid`,userId);
    
    const response = await axiosInstanceAuthoraized(token).put(`/user/update/${userId}`, dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const verifyEmail = async (user: UserVerifyEmailWithCode) => {
  try {
    const response = await axiosInstance.put('/auth/verify-code', user);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const confirmRegistration = async (user: UserConfirmation) => {
  try {
    const response = await axiosInstance.post('/user/confirm-registration-code', user);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const updateProfilePicture = async (token: string, dto: UpdateProfilePicture) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put('/user/update-profile-picture', dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const transfer = async (token: string, dto: ConfirmTransferRegister) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/token/transfer-to', dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getProducts = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/product');

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postUserSkill = async (token: string, dto: UserSkillInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/user-skill/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserSkill = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-skill/byUser');

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postRun = async (token: string, dto: IRun): Promise<{ success: boolean; message: string; data: any }> =>  {
  try {
    console.log('📤 Enviando dados para iniciar corrida:', dto);
    
    const response = await axiosInstanceAuthoraized(token).post('/run/start', dto);
    console.log('✅ Resposta da API startRun:', JSON.stringify(response.data, null, 2));
    
    return response.data
  }catch (error:any) {
    if (error.response && error.response.data) {
      console.error('❌ Erro ao iniciar corrida:', error.response.data);
      return error.response.data
    } else {
      console.error("❌ Erro inesperado ao iniciar corrida:", error);
      throw {
        success: false,
        message: "Erro desconhecido. Tente novamente mais tarde."
      };
    }
  }
}


export const updateRun = async (token: string, runId: any,  dto: RunUpdateDTO) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put(`/run/update/${runId}`, dto);
    
    return response.data;
  } catch (error: any) {
    console.log(error.response.data);
    
    throw new Error(error.response.data.message);
  }
}

export const finishRun = async (token: string, runId:number, dto: RunFinishDTO) => {
  try {
    console.log("📤 Finalizando corrida ID:", runId);
    console.log("📤 Dados de finalização:", dto);
    
    const response = await axiosInstanceAuthoraized(token).post(`/run/finish/${runId}`, dto);
    console.log('✅ Resposta da API finishRun:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao finalizar corrida na API:', error);
    console.error('❌ Detalhes do erro:', error?.response?.data);
    
    // Retornar erro tratado sem bloquear o fluxo
    return {
      success: false,
      message: error?.response?.data?.message || 'Erro ao finalizar corrida',
      error: error
    };
  }
}

export const getRun = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/run/user'); 

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getInventoryUserItems = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/inventory'); 
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserFriends = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-friend/byUser');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserFriendsPending = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-friend/byUserPending');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}


export const verifyFriends = async (token: string, _id: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get(`/client/user-friend/verify-friends/${_id}`);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const updateUserFriendAccept = async (token: string, dto: UserFriendAcceptInterface, _id: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put(`/client/user-friend/update/${_id}`, dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postUserFriends = async (token: string, dto: UserFriendInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/user-friend/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const deleteFriendRequest = async (token: string, _id: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).delete(`/client/user-friend/delete/${_id}`);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postChatSendMessage = async (token: string, dto: UserChatInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/user-chat/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserChat = async (token: string, _id: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get(`/client/user-chat/byUserFriend/${_id}`);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postUserInventory = async (token: string, dto: UserInventoryInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/user-inventory/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const updateUserInventory = async (token: string, dto: UserInventoryUpdateInterface, _id: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put(`/client/user-inventory/update/${_id}`, dto);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserInventory = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get(`/client/user-inventory/byUser`);
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getMission = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/mission');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getTotalMission = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/mission/totalMission');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserPoints = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-points');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getTopUsers = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-points/getTopUsers');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserPointsWeek = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-points/week');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserPointsDay = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-points/day');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUserTotalPoints= async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/user-points/totalPointsByUser');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getBox = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/box');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getNotifications = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/notification/byUser');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const getUnreadNotifications = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/notification/unread/byUser');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const markReadNotifications = async (token: string) => {
  try {
    const response = await axiosInstanceAuthoraized(token).get('/client/notification/mark-read/byUser');
    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postNotification = async (token: string, dto: NotificationInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/notification/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const postUserPoints = async (token: string, dto: UserPointsInterface) => {
  try {
    const response = await axiosInstanceAuthoraized(token).post('/client/user-points/register', dto);

    return response.data.data ?? response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const requestCode = async (email: string, type: string) => {
  try {
    console.log(email, type);
    
    const response = await axiosInstance.post('/auth/request-code', {
      email: email, 
      type: type
    });
    console.log(response.data);
    
    return response.data;
  } catch (error: any) {
    return error.response.data
  }
}

export const resetPasswordConfirmation = async (token: string, dto: ResetPasswordConfirmation) => {
  try {
    const response = await axiosInstanceAuthoraized(token).put('/auth/reset-password', dto);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}

export const handleRequestOpenBox = async(token: string, boxId: number) =>{
  try {
    const response = await axiosInstanceAuthoraized(token).post(`/boxes/open/${boxId}`);
    console.log(response.data);

    return response.data;
  } catch (error:any) {
    if (error.response && error.response.data) {
      return error.response.data
    } else {
      // Caso seja um erro inesperado
      console.error("Unexpected error: ", error);
      throw {
        success: false,
        message: "Erro desconhecido. Tente novamente mais tarde."
      };
    }
  }
}