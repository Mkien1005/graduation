// pages/api/chat.js
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { messages } = req.body

    // Đây là nơi bạn sẽ kết nối với API của mô hình AI
    // Ví dụ sử dụng OpenAI API
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
    //   }),
    // });
    // const data = await response.json();
    // return res.status(200).json({ message: data.choices[0].message.content });

    // Mô phỏng phản hồi cho mục đích demo
    const lastMessage = messages[messages.length - 1].content
    const aiResponse = `Đây là phản hồi mẫu cho: "${lastMessage}". Trong ứng dụng thực tế, đây sẽ là phản hồi từ mô hình AI.`

    // Giả lập độ trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return res.status(200).json({ message: aiResponse })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
