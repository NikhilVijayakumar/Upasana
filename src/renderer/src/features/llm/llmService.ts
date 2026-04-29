const DEFAULT_ENDPOINT = 'http://localhost:1234/v1'

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const callLLM = async (messages: LLMMessage[], endpoint = DEFAULT_ENDPOINT): Promise<string> => {
  const res = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature: 0.7, max_tokens: 512, stream: false }),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`LLM returned ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content as string
}

export const explainSentence = (
  sentence: string,
  context: string,
  mode: 'simple' | 'exam' = 'simple'
): Promise<string> => {
  const system =
    mode === 'exam'
      ? 'You are a study tutor. Explain the concept for exam preparation. Give key points as a short bullet list.'
      : 'You are a helpful teacher. Explain this simply and clearly in 2-3 sentences.'

  return callLLM([
    { role: 'system', content: system },
    { role: 'user', content: `Topic context: ${context.slice(0, 300)}\n\nExplain this: "${sentence}"` },
  ])
}

interface GeneratedQuestion {
  question: string
  marks: number
  keyPoints: string[]
}

export const generateQuestions = async (content: string): Promise<GeneratedQuestion[]> => {
  const raw = await callLLM([
    {
      role: 'system',
      content:
        'You are an exam paper setter. Respond ONLY with valid JSON in this exact format: {"questions":[{"question":"...","marks":5,"keyPoints":["...","..."]}]}. No other text.',
    },
    {
      role: 'user',
      content: `Generate 2 five-mark questions and 1 ten-mark question for this content:\n\n${content.slice(0, 2000)}`,
    },
  ])

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch?.[0] ?? raw)
    return parsed.questions as GeneratedQuestion[]
  } catch {
    return [
      {
        question: 'Summarize the key concepts from this topic.',
        marks: 10,
        keyPoints: ['See content for details'],
      },
    ]
  }
}
