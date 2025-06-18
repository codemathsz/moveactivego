export async function checkSamsungBattery() {
  return {
    type: 'samsung',
    title: 'Otimização de bateria',
    description: 'Vá em Configurações → Aplicativos → [MoveActive: Go] → Bateria → e selecione "Sem restrições". Isso garante que o app funcione em segundo plano.',
  };
}
