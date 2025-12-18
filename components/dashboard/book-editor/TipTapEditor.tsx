"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Sparkles, Undo2, Redo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, useRef } from "react"

const BRAND_COLOR = "#a6261c"

interface TipTapEditorProps {
  content: string
  placeholder?: string
  onUpdate: (content: string) => void
  onWordCountChange?: (count: number) => void
  onSelectionChange?: (selectedText: string) => void
  insertContent?: string | null
  onInsertComplete?: () => void
}

export function TipTapEditor({
  content,
  placeholder = "Start writing...",
  onUpdate,
  onWordCountChange,
  onSelectionChange,
  insertContent,
  onInsertComplete,
}: TipTapEditorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Helper function to force scroll container to recalculate
  const forceScrollUpdate = useCallback((container?: Element) => {
    const targetContainer = (container || scrollContainerRef.current) as HTMLElement
    if (!targetContainer || !(targetContainer instanceof HTMLElement)) return
    
    // Force a layout recalculation by reading layout properties
    void targetContainer.clientHeight
    void targetContainer.scrollHeight
    void targetContainer.offsetHeight
    
    // Trigger a resize event to force browser to recalculate
    if (typeof ResizeObserver !== 'undefined') {
      // Use ResizeObserver if available
      const resizeObserver = new ResizeObserver(() => {
        // Force scroll height recalculation
        void targetContainer.scrollHeight
      })
      resizeObserver.observe(targetContainer)
      setTimeout(() => resizeObserver.disconnect(), 100)
    }
    
    // Also trigger scroll event
    targetContainer.dispatchEvent(new Event('scroll', { bubbles: true }))
    
    // Force a reflow by toggling display (more aggressive)
    const originalDisplay = targetContainer.style.display
    targetContainer.style.display = 'none'
    void targetContainer.offsetHeight // Force reflow
    targetContainer.style.display = originalDisplay || ''
    
    // One more read to ensure browser has recalculated
    void targetContainer.scrollHeight
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Image.configure({
        inline: false, // Set to false so images are block-level elements
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content,
    editable: true, // Explicitly enable editing
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate(html)
      const text = editor.getText()
      const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
      onWordCountChange?.(wordCount)
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, " ")
        onSelectionChange?.(selectedText)
      } else {
        onSelectionChange?.("")
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none px-8 py-6",
        contenteditable: "true",
        'data-placeholder': placeholder,
      },
      handleDOMEvents: {
        // Ensure keyboard events are handled
        keydown: (view, event) => {
          // Allow all keyboard input
          return false // Don't prevent default
        },
        keyup: (view, event) => {
          return false
        },
        input: (view, event) => {
          return false
        },
      },
    },
    enableInputRules: true,
    enablePasteRules: true,
    autofocus: false, // Don't auto-focus on mount
  })

  useEffect(() => {
    if (editor) {
      const currentHTML = editor.getHTML()
      // Only update if content actually changed (avoid unnecessary updates and editing conflicts)
      if (content !== currentHTML) {
        console.log(`[TipTapEditor] Content changed, updating editor. Content length: ${content?.length || 0}, Current HTML length: ${currentHTML.length}`)
        // Use setContent with emitUpdate set to false to avoid triggering updates
        // TipTap setContent accepts: setContent(content: string | JSONContent, options?: SetContentOptions)
        const wasEditable = editor.isEditable
        editor.commands.setContent(content || "", { emitUpdate: false })
        // CRITICAL: Ensure editor remains editable after content update
        if (!wasEditable || !editor.isEditable) {
          console.log(`[TipTapEditor] Editor was not editable, setting to editable`)
          editor.setEditable(true)
        }
        // Focus the editor after content update to allow typing
        setTimeout(() => {
          editor.commands.focus()
          // Scroll to top when content changes (e.g., when switching chapters)
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
            // Force scroll update after content change
            forceScrollUpdate()
          }
        }, 50)
      }
    }
  }, [content, editor, forceScrollUpdate])
  
  // Ensure editor is always editable and can receive focus
  useEffect(() => {
    if (editor) {
      // Force editor to be editable
      editor.setEditable(true)
      
      // Ensure the DOM element is also editable
      const editorElement = editor.view.dom
      if (editorElement instanceof HTMLElement) {
        // Remove any readonly or disabled attributes
        editorElement.removeAttribute('readonly')
        editorElement.removeAttribute('disabled')
        editorElement.removeAttribute('contenteditable')
        
        // Set contenteditable explicitly
        editorElement.setAttribute('contenteditable', 'true')
        editorElement.contentEditable = 'true'
        
        // Ensure it can receive focus
        editorElement.tabIndex = 0
        
        // Add event listeners to ensure input works
        const handleKeyDown = (e: KeyboardEvent) => {
          // Allow all keyboard input - don't prevent default
          console.log('[TipTapEditor] Key pressed:', e.key, 'Editor editable:', editor.isEditable)
        }
        
        const handleInput = (e: Event) => {
          console.log('[TipTapEditor] Input event fired')
        }
        
        editorElement.addEventListener('keydown', handleKeyDown)
        editorElement.addEventListener('input', handleInput)
        
        // Focus editor after a short delay
        setTimeout(() => {
          editorElement.focus()
          editor.commands.focus()
          console.log('[TipTapEditor] Editor focused, editable:', editor.isEditable, 'DOM contenteditable:', editorElement.contentEditable)
        }, 200)
        
        return () => {
          editorElement.removeEventListener('keydown', handleKeyDown)
          editorElement.removeEventListener('input', handleInput)
        }
      }
    }
  }, [editor])

  // Handle content insertion
  useEffect(() => {
    if (editor && insertContent) {
      const trimmedContent = insertContent.trim()
      
      // Check if content is an image markdown: ![alt](url)
      // Handle both single-line and multi-line base64 URLs
      // More flexible regex that handles whitespace and very long base64 strings
      // Pattern: ![alt text](url) - with optional whitespace
      const imageMarkdownRegex = /^!\s*\[\s*([^\]]*?)\s*\]\s*\(\s*([\s\S]+?)\s*\)\s*$/m
      const imageMatch = trimmedContent.match(imageMarkdownRegex)
      
      if (imageMatch) {
        // It's an image - extract alt text and URL
        const altText = (imageMatch[1] || "Image").trim()
        // Clean up the URL (remove any whitespace/newlines from base64, but preserve the data URI)
        let imageUrl = imageMatch[2].trim()
        
        // If it's a base64 data URI, ensure it's properly formatted
        if (imageUrl.startsWith("data:")) {
          // Remove any whitespace/newlines from the base64 data portion
          // Keep the data:image/...;base64, prefix intact
          const dataUriMatch = imageUrl.match(/^(data:[^;]+;base64,)([\s\S]+)$/)
          if (dataUriMatch) {
            const prefix = dataUriMatch[1]
            const base64Data = dataUriMatch[2].replace(/\s+/g, "")
            imageUrl = prefix + base64Data
          } else {
            // Fallback: just remove all whitespace
            imageUrl = imageUrl.replace(/\s+/g, "")
          }
        }
        
        console.log("Inserting image:", { 
          altText, 
          urlLength: imageUrl.length, 
          urlPreview: imageUrl.substring(0, 100) + "...",
          isBase64: imageUrl.startsWith("data:"),
          originalContent: trimmedContent.substring(0, 200) + "..."
        })
        
        // Ensure editor is focused and ready
        editor.chain().focus()
        
        try {
          // Insert as image node using TipTap's image extension
          const success = editor.chain().focus().setImage({ 
            src: imageUrl, 
            alt: altText 
          }).run()
          
          if (success) {
            console.log("Image inserted successfully via setImage")
            // Wait for image to load, then ensure scroll container updates
            setTimeout(() => {
              if (scrollContainerRef.current) {
                // Find the inserted image
                const images = scrollContainerRef.current.querySelectorAll('img')
                if (images.length > 0) {
                  const lastImage = images[images.length - 1] as HTMLImageElement
                  
                  // Wait for image to load before scrolling
                  if (lastImage.complete) {
                    // Image already loaded - force multiple updates
                    forceScrollUpdate()
                    setTimeout(() => forceScrollUpdate(), 100)
                    setTimeout(() => forceScrollUpdate(), 300)
                    setTimeout(() => forceScrollUpdate(), 500)
                  } else {
                    // Wait for image to load
                    lastImage.onload = () => {
                      forceScrollUpdate()
                      setTimeout(() => forceScrollUpdate(), 100)
                      setTimeout(() => forceScrollUpdate(), 300)
                      setTimeout(() => forceScrollUpdate(), 500)
                    }
                    lastImage.onerror = () => {
                      // Even if image fails to load, update scroll
                      forceScrollUpdate()
                      setTimeout(() => forceScrollUpdate(), 100)
                    }
                  }
                } else {
                  // No images found yet, but still update scroll
                  forceScrollUpdate()
                  setTimeout(() => forceScrollUpdate(), 100)
                  setTimeout(() => forceScrollUpdate(), 300)
                }
              }
            }, 50)
          } else {
            console.warn("setImage returned false, trying HTML fallback")
            // Fallback: try inserting as HTML img tag
            editor.commands.insertContent(`<img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${altText.replace(/"/g, '&quot;')}" class="max-w-full h-auto" />`)
            // Wait for image to load and update scroll
            setTimeout(() => {
              if (scrollContainerRef.current) {
                const images = scrollContainerRef.current.querySelectorAll('img')
                if (images.length > 0) {
                  const lastImage = images[images.length - 1] as HTMLImageElement
                  if (lastImage.complete) {
                    forceScrollUpdate()
                    setTimeout(() => forceScrollUpdate(), 100)
                    setTimeout(() => forceScrollUpdate(), 300)
                  } else {
                    lastImage.onload = () => {
                      forceScrollUpdate()
                      setTimeout(() => forceScrollUpdate(), 100)
                      setTimeout(() => forceScrollUpdate(), 300)
                    }
                    lastImage.onerror = () => forceScrollUpdate()
                  }
                } else {
                  forceScrollUpdate()
                  setTimeout(() => forceScrollUpdate(), 100)
                }
              }
            }, 50)
          }
        } catch (error) {
          console.error("Error inserting image:", error)
          // Fallback: try inserting as HTML img tag
          try {
            editor.commands.insertContent(`<img src="${imageUrl.replace(/"/g, '&quot;')}" alt="${altText.replace(/"/g, '&quot;')}" class="max-w-full h-auto" />`)
            console.log("Image inserted via HTML fallback")
            // Wait for image to load and update scroll
            setTimeout(() => {
              if (scrollContainerRef.current) {
                const images = scrollContainerRef.current.querySelectorAll('img')
                if (images.length > 0) {
                  const lastImage = images[images.length - 1] as HTMLImageElement
                  if (lastImage.complete) {
                    forceScrollUpdate()
                    setTimeout(() => forceScrollUpdate(), 100)
                    setTimeout(() => forceScrollUpdate(), 300)
                  } else {
                    lastImage.onload = () => {
                      forceScrollUpdate()
                      setTimeout(() => forceScrollUpdate(), 100)
                      setTimeout(() => forceScrollUpdate(), 300)
                    }
                    lastImage.onerror = () => forceScrollUpdate()
                  }
                } else {
                  forceScrollUpdate()
                  setTimeout(() => forceScrollUpdate(), 100)
                }
              }
            }, 50)
          } catch (htmlError) {
            console.error("HTML fallback also failed:", htmlError)
            // Last resort: insert as plain text (shouldn't happen)
            editor.commands.insertContent(`<p>Image: ${altText}</p>`)
          }
        }
      } else {
        // Check if it's already an HTML img tag
        const imgTagMatch = trimmedContent.match(/^<img[^>]+src=["']([^"']+)["'][^>]*>/i)
        if (imgTagMatch) {
          const imageUrl = imgTagMatch[1]
          const altMatch = trimmedContent.match(/alt=["']([^"']*)["']/i)
          const altText = altMatch ? altMatch[1] : "Image"
          
          try {
            editor.chain().focus().setImage({ 
              src: imageUrl, 
              alt: altText 
            }).run()
            console.log("Image inserted from HTML tag")
            // Wait for image to load and update scroll
            setTimeout(() => {
              if (scrollContainerRef.current) {
                const images = scrollContainerRef.current.querySelectorAll('img')
                if (images.length > 0) {
                  const lastImage = images[images.length - 1] as HTMLImageElement
                  if (lastImage.complete) {
                    forceScrollUpdate()
                    setTimeout(() => forceScrollUpdate(), 100)
                    setTimeout(() => forceScrollUpdate(), 300)
                  } else {
                    lastImage.onload = () => {
                      forceScrollUpdate()
                      setTimeout(() => forceScrollUpdate(), 100)
                      setTimeout(() => forceScrollUpdate(), 300)
                    }
                    lastImage.onerror = () => forceScrollUpdate()
                  }
                } else {
                  forceScrollUpdate()
                  setTimeout(() => forceScrollUpdate(), 100)
                }
              }
            }, 50)
          } catch (error) {
            console.error("Error inserting image from HTML:", error)
            // Fallback: insert as HTML
            editor.commands.insertContent(trimmedContent)
            setTimeout(() => {
              forceScrollUpdate()
              setTimeout(() => forceScrollUpdate(), 100)
            }, 50)
          }
        } else {
          // Check if content starts with markdown image but regex didn't match (debug)
          if (trimmedContent.startsWith("![")) {
            console.warn("Content looks like image markdown but regex didn't match:", trimmedContent.substring(0, 200))
          }
          
          // Regular text content - insert as HTML
          const text = insertContent.replace(/\n/g, "<br>")
          editor.commands.insertContent(`<p>${text}</p>`)
        }
      }
      
      onInsertComplete?.()
    }
  }, [insertContent, editor, onInsertComplete])

  // Handle image load events and content size changes to update scroll height
  useEffect(() => {
    if (!editor || !scrollContainerRef.current) return

    const handleImageLoad = () => {
      // Force update scroll container
      forceScrollUpdate()
      // Also update after delays to ensure browser has recalculated
      setTimeout(() => forceScrollUpdate(), 50)
      setTimeout(() => forceScrollUpdate(), 200)
      setTimeout(() => forceScrollUpdate(), 500)
    }

    // Listen for image load events in the editor
    const editorElement = editor.view.dom
    const images = editorElement.querySelectorAll('img')
    
    images.forEach((img) => {
      const imageEl = img as HTMLImageElement
      if (!imageEl.complete) {
        imageEl.addEventListener('load', handleImageLoad, { once: true })
        imageEl.addEventListener('error', handleImageLoad, { once: true })
      }
    })

    // Use ResizeObserver to watch for content size changes
    const resizeObserver = new ResizeObserver(() => {
      // Content size changed, update scroll
      forceScrollUpdate()
      setTimeout(() => forceScrollUpdate(), 50)
    })

    resizeObserver.observe(editorElement)

    // Also listen for new images added dynamically
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element
            const newImages = element.querySelectorAll('img')
            newImages.forEach((img) => {
              const imageEl = img as HTMLImageElement
              if (!imageEl.complete) {
                imageEl.addEventListener('load', handleImageLoad, { once: true })
                imageEl.addEventListener('error', handleImageLoad, { once: true })
              } else {
                handleImageLoad()
              }
            })
          }
        })
      })
      // Also trigger scroll update on any DOM change
      forceScrollUpdate()
      setTimeout(() => forceScrollUpdate(), 50)
    })

    mutationObserver.observe(editorElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      images.forEach((img) => {
        const imageEl = img as HTMLImageElement
        imageEl.removeEventListener('load', handleImageLoad)
        imageEl.removeEventListener('error', handleImageLoad)
      })
    }
  }, [editor, forceScrollUpdate])

  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount.words()
  const readingTime = Math.ceil(wordCount / 200) // Average reading speed

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-border bg-muted px-4 py-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className={`h-4 w-4 ${editor.can().undo() ? "" : "opacity-50"}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className={`h-4 w-4 ${editor.can().redo() ? "" : "opacity-50"}`} />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-background" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-background" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-background" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-background" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-background" : ""}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-background" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-background" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-background" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="text-[#a6261c]"
          onClick={() => {
            // Trigger AI action from selection
            const { from, to } = editor.state.selection
            const selectedText = editor.state.doc.textBetween(from, to, " ")
            console.log("AI action on:", selectedText)
          }}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI
        </Button>
      </div>

      {/* Editor Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-background min-h-0" 
        style={{ 
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
        }}
        onClick={(e) => {
          // Ensure editor gets focus when clicking in the scroll container
          if (editor && e.target === scrollContainerRef.current) {
            editor.commands.focus()
          }
        }}
      >
        <style jsx global>{`
          .ProseMirror {
            min-height: 100%;
            padding: 1.5rem 2rem;
            outline: none;
            height: auto;
            overflow: visible;
            pointer-events: auto !important;
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            cursor: text;
          }
          .ProseMirror[contenteditable="false"] {
            pointer-events: none;
            cursor: default;
          }
          .ProseMirror[contenteditable="true"] {
            pointer-events: auto !important;
            cursor: text;
          }
          /* Ensure ProseMirror can receive focus and input */
          .ProseMirror:focus {
            outline: none;
          }
          /* Prevent any overlay from blocking input */
          .ProseMirror * {
            pointer-events: auto;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1rem 0;
            border-radius: 0.5rem;
            pointer-events: auto;
            vertical-align: bottom;
          }
          .ProseMirror:focus {
            outline: none;
          }
          /* Ensure the editor content container expands with content */
          .ProseMirror > * {
            min-height: auto;
          }
          /* Ensure scrollbar is always visible when content overflows */
          .flex-1.overflow-y-auto {
            overflow-y: scroll !important;
          }
        `}</style>
        <div 
          style={{ position: 'relative', width: '100%', height: '100%' }}
          onClick={(e) => {
            // Ensure editor is editable and focused when clicked
            if (editor) {
              editor.setEditable(true)
              const editorElement = editor.view.dom as HTMLElement
              if (editorElement) {
                editorElement.setAttribute('contenteditable', 'true')
                editorElement.contentEditable = 'true'
                editorElement.focus()
              }
              editor.commands.focus()
              console.log('[TipTapEditor] Clicked, editor editable:', editor.isEditable)
            }
          }}
          onFocus={(e) => {
            // Ensure editor is editable when focused
            if (editor) {
              editor.setEditable(true)
              const editorElement = editor.view.dom as HTMLElement
              if (editorElement) {
                editorElement.setAttribute('contenteditable', 'true')
              }
            }
          }}
          onKeyDown={(e) => {
            // Ensure editor receives keyboard events
            if (editor) {
              const editorElement = editor.view.dom as HTMLElement
              if (editorElement && document.activeElement !== editorElement) {
                editorElement.focus()
                editor.commands.focus()
              }
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

