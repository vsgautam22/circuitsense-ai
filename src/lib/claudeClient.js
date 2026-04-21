/**
 * Multi-provider AI client
 * Supports: Google Gemini (AIza...), Anthropic (sk-ant-...), OpenAI (sk-...),
 *            Groq (gsk_...), OpenRouter (sk-or-v1-...)
 */

export function detectProvider(key = '') {
  if (key.startsWith('AIza'))     return 'gemini'
  if (key.startsWith('sk-ant-'))  return 'anthropic'
  if (key.startsWith('gsk_'))     return 'groq'
  if (key.startsWith('sk-or-'))   return 'openrouter'
  if (key.startsWith('sk-'))      return 'openai'
  return 'unknown'
}

export function providerLabel(key = '') {
  const p = detectProvider(key)
  const map = {
    gemini:      'Google Gemini',
    anthropic:   'Anthropic Claude',
    openai:      'OpenAI',
    groq:        'Groq (Free)',
    openrouter:  'OpenRouter',
    unknown:     'Unknown Provider',
  }
  return map[p] || 'Unknown'
}

export function providerColor(key = '') {
  const p = detectProvider(key)
  const map = {
    gemini:     '#00d4ff',
    anthropic:  '#a855f7',
    openai:     '#00ff88',
    groq:       '#ffab40',
    openrouter: '#ff6b6b',
    unknown:    '#6b8499',
  }
  return map[p] || '#6b8499'
}

/* ── Gemini ─────────────────────────────────── */
async function callGemini(apiKey, systemPrompt, userMessage) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
  }
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/* ── Anthropic ──────────────────────────────── */
async function callAnthropic(apiKey, systemPrompt, userMessage) {
  const body = {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userMessage }],
  }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Anthropic HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

/* ── OpenAI-compatible (OpenAI / Groq / OpenRouter) ── */
async function callOpenAICompat(apiKey, systemPrompt, userMessage, baseUrl, model) {
  const messages = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: userMessage })

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
  // OpenRouter requires a Referer header
  if (baseUrl.includes('openrouter')) {
    headers['HTTP-Referer'] = 'https://circuitsense-ai.app'
    headers['X-Title'] = 'CircuitSense AI'
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/* ── Main export ────────────────────────────── */
export async function callClaude(apiKey, systemPrompt, userMessage) {
  if (!apiKey || apiKey.length < 8) {
    throw new Error('No API key provided. Enter your key in the sidebar.')
  }

  const provider = detectProvider(apiKey)

  switch (provider) {
    case 'gemini':
      return callGemini(apiKey, systemPrompt, userMessage)

    case 'anthropic':
      return callAnthropic(apiKey, systemPrompt, userMessage)

    case 'openai':
      return callOpenAICompat(apiKey, systemPrompt, userMessage, 'https://api.openai.com', 'gpt-4o-mini')

    case 'groq':
      return callOpenAICompat(apiKey, systemPrompt, userMessage, 'https://api.groq.com/openai', 'llama-3.1-8b-instant')

    case 'openrouter':
      return callOpenAICompat(apiKey, systemPrompt, userMessage, 'https://openrouter.ai/api', 'meta-llama/llama-3.1-8b-instruct:free')

    default:
      throw new Error(
        'Unrecognised API key format.\n\n' +
        'Supported providers:\n' +
        '• Google Gemini  — starts with AIza  (free at aistudio.google.com)\n' +
        '• Anthropic      — starts with sk-ant-\n' +
        '• OpenAI         — starts with sk-\n' +
        '• Groq (free)    — starts with gsk_  (free at console.groq.com)\n' +
        '• OpenRouter     — starts with sk-or-'
      )
  }
}
