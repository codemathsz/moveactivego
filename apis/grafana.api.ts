import axios from "axios";
import * as Device from 'expo-device';
import uuid from 'react-native-uuid';

const LOKI_URL = "http://5.78.115.156:3100/loki/api/v1/push";

const ENVIRONMENT = __DEV__ ? "dev" : "prod";

export async function sendLogGrafana(valuePayload: string){
    console.log("CHAMOU");
    

    const payload = {
        streams: [
            {
            stream: {
                app: "moveapp",
                environment: ENVIRONMENT,
            },
            values: [
                [`${Date.now() * 1000000}`, `[id]: ${uuid.v4()} | [model]: ${Device.modelName} | ${valuePayload}`],
            ],
            },
        ],
    }
    console.log("payload", payload);
    
    const response = await axios
      .post(LOKI_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
    })

    console.log("GRAF", response);
    
}
