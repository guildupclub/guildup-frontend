import DOMPurify from "dompurify"

/**
 * Extracts YouTube video ID from a URL
 * @param url YouTube URL
 * @returns Video ID or null if not found
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

/**
 * Converts a YouTube URL to an embed URL
 * @param url YouTube URL
 * @returns Embed URL or null if invalid
 */
export const getYoutubeEmbedUrl = (url: string): string | null => {
  // Extract video ID
  const videoId = extractYoutubeVideoId(url)
  if (!videoId) return null

  // Extract timestamp if present
  const timeMatch = url.match(/[&?]t=(\d+)s/)
  const timestamp = timeMatch ? `?start=${timeMatch[1]}` : ""

  return `https://www.youtube.com/embed/${videoId}${timestamp}`
}

/**
 * Interface for the result of processing post content
 */
export interface ProcessedContent {
  originalContent: string
  youtubeEmbed: string | null
}

/**
 * Processes post body content to extract YouTube URLs and create embeds
 * @param body Post body content
 * @returns Object containing processed content and YouTube embed HTML
 */
export const processPostContent = (body: string): ProcessedContent => {
  try {
    if (!body) return { originalContent: "", youtubeEmbed: null }

    // Remove outer quotes if they exist
    let processedBody = body
    if (processedBody.startsWith('"') && processedBody.endsWith('"')) {
      processedBody = processedBody.slice(1, -1)
    }

    // Unescape the string if it's escaped
    try {
      processedBody = JSON.parse(`"${processedBody}"`)
    } catch (e) {
      // If parsing fails, use the original string
      console.log("JSON parse error:", e)
    }

    // Check if the body contains a YouTube URL
    const youtubeUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/[^\s"'<>]+/g
    const youtubeUrls = processedBody.match(youtubeUrlRegex)
    let contentWithoutYoutubeUrls = processedBody
    let youtubeEmbed = null

    if (youtubeUrls && youtubeUrls.length > 0) {
      // Get the first YouTube URL
      const youtubeUrl = youtubeUrls[0]
      const embedUrl = getYoutubeEmbedUrl(youtubeUrl)

      // Remove the YouTube URL from the content
      // This handles both plain text URLs and URLs inside HTML tags
      youtubeUrls.forEach((url) => {
        // Remove the URL if it's inside an <a> tag
        contentWithoutYoutubeUrls = contentWithoutYoutubeUrls.replace(
          new RegExp(`<a[^>]*href=['"][^'"]*${url}[^'"]*['"][^>]*>[^<]*</a>`, "g"),
          "",
        )

        // Remove the plain URL
        contentWithoutYoutubeUrls = contentWithoutYoutubeUrls.replace(url, "")
      })

      // Clean up any empty paragraphs or double spaces
      contentWithoutYoutubeUrls = contentWithoutYoutubeUrls
        .replace(/<p>\s*<\/p>/g, "")
        .replace(/\s{2,}/g, " ")
        .trim()

      if (embedUrl) {
        // Create an iframe for the YouTube embed
        youtubeEmbed = `<div class="youtube-embed-container"><iframe 
          width="560" 
          height="315" 
          src="${embedUrl}" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin" 
          allowfullscreen></iframe></div>`
      }
    }

    // Return the content without YouTube URLs and the iframe
    return {
      originalContent: contentWithoutYoutubeUrls ? DOMPurify.sanitize(contentWithoutYoutubeUrls) : "",
      youtubeEmbed,
    }
  } catch (error) {
    console.error("Error processing post content:", error)
    return {
      originalContent: body ? DOMPurify.sanitize(body) : "",
      youtubeEmbed: null,
    }
  }
}

/**
 * CSS styles for YouTube embeds
 * Add this to your global styles or component
 */
export const youtubeEmbedStyles = `
  .youtube-embed-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin-top: 1rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
  }
  
  .youtube-embed-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.5rem;
  }
  
  .trending-youtube-embed .youtube-embed-container {
    padding-bottom: 40%; /* Smaller aspect ratio for trending sidebar */
    max-height: 100px;
  }
`
