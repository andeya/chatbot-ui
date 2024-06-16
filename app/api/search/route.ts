import { Readability } from "@mozilla/readability"
import * as cheerio from "cheerio"
import { JSDOM } from "jsdom"
import { createResponse } from "@/lib/server/server-utils"
import { stringify } from "querystring"

const cleanSourceText = (text: string) => {
  return text
    .trim()
    .replace(/(\n){4,}/g, "\n\n\n")
    .replace(/\n\n/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\t/g, "")
    .replace(/\n+(\s*\n)*/g, "\n")
}

type Source = {
  url: string
  text: string
}

type Data = {
  sources: Source[]
}

// export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { query } = json as {
    query: string
  }

  try {
    const sourceCount = 4

    // GET LINKS
    const response = await fetch(`https://www.google.com/search?q=${query}`)
    const html = await response.text()
    const $ = cheerio.load(html)
    const linkTags = $("a")

    let links: string[] = []

    const excludeList = [
      "google",
      "facebook",
      "twitter",
      "instagram",
      "youtube",
      "tiktok"
    ]

    linkTags.each((i, link) => {
      let href = $(link).attr("href")
      try {
        if (href) {
          if (href.startsWith("/url?q=")) {
            href = href.replace("/url?q=", "").split("&")[0]
          }
          if (!links.includes(href)) {
            const domain = new URL(href).hostname
            if (!excludeList.some(site => domain.includes(site))) {
              links.push(href)
            }
          }
        }
      } catch (err) {
        err = null
      }
    })

    const finalLinks = links.slice(0, sourceCount)

    // SCRAPE TEXT FROM LINKS
    const sources = (await Promise.all(
      finalLinks.map(async link => {
        const response = await fetch(link)
        const html = await response.text()
        const dom = new JSDOM(html)
        const doc = dom.window.document
        // const parser = new DOMParser()
        // const doc = parser.parseFromString(html, "text/html")
        const parsed = new Readability(doc).parse()

        if (parsed) {
          let sourceText = cleanSourceText(parsed.textContent)

          return { url: link, text: sourceText }
        }
      })
    )) as Source[]

    const filteredSources = sources.filter(source => source !== undefined)

    for (const source of filteredSources) {
      source.text = source.text.slice(0, 1000)
    }

    return createResponse({ sources: filteredSources }, 200)
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
