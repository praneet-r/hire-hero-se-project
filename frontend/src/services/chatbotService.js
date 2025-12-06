import api from './api'

export const askChatbot = async (prompt) => {
  const res = await api.post('/chatbot/ask', { prompt })
  return res.data.reply
}