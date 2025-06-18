import { NativeModules } from "react-native";

const { Autostart } = NativeModules;
export async function checkAutostartXiaomi() {

    return {
      type: 'xiaomi',
      title: 'Permissão de Autostart',
      description:
        'Para que o app funcione corretamente em segundo plano, ative "Início automático" nas configurações da Xiaomi.\n\nVá em: Configurações > Permissões > Início automático e ative para este app.',
      action: () => {
        Autostart.openAutostartSettings();
      }
    }
}
