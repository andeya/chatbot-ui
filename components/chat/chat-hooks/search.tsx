import endent from "endent"

type Source = {
  url: string
  text: string
}

const fetchSources = async (query: string) => {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  const { sources }: { sources: Source[] } = await response.json()

  return sources
}

const searchHandle = async (query: string): Promise<string> => {
  let sources = await fetchSources(query)

  const prompt = endent`Provide a 2-5 sentence answer to question ${JSON.stringify(query)} based on the following sources and your own knowledge. Be original, concise, accurate, and helpful. Cite sources as [1] or [2] after each sentence (not just the very end) to back up your answer.
      
      ${sources.map((source, idx) => `Source [${idx + 1}]:\n${source.text}`).join("\n\n")}
      `
  return prompt
}

export default searchHandle
