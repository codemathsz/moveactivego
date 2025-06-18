export async function checkMotorolaBattery() {

  return {
    type: 'motorola',
    title: 'Ajuste de bateria',
    description: 'Vá em Configurações → Bateria → e desative "Melhorar a bateria enquanto inativo". Depois, ative "Uso irrestrito de bateria" para o app.',
  };
}