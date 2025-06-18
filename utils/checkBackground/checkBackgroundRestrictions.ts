import { Platform } from "react-native";
import * as Device from 'expo-device';
import { checkAutostartXiaomi } from "./checkAutoStartXiaomi";
import { checkMotorolaBattery } from "./checkMotorolaBattery";
import { checkSamsungBattery } from "./checkSamsungBattery";

export async function checkBackgroundRestrictions() {

    if(Platform.OS !== 'android') return null;

    const manufacturer = Device.manufacturer?.toLowerCase()

    switch (manufacturer) {
    case 'xiaomi':
      return await checkAutostartXiaomi();
    case 'motorola':
      return await checkMotorolaBattery();
    case 'samsung':
      return await checkSamsungBattery();
    default:
      return null;
  }
}