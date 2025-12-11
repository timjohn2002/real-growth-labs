// Real Growth Book Template Structure
// Based on the Real Growth framework

export interface ChapterTemplate {
  id: string
  number: number
  title: string
  sections: SectionTemplate[]
  description: string
}

export interface SectionTemplate {
  id: string
  title: string
  placeholder: string
  required: boolean
}

export const REAL_GROWTH_BOOK_TEMPLATE: ChapterTemplate[] = [
  {
    id: "intro",
    number: 0,
    title: "Introduction",
    description: "Set the stage and hook your reader",
    sections: [
      {
        id: "how-to-read",
        title: "🟧 How to Read This Book",
        placeholder: "Guide your reader on how to get the most out of this book...",
        required: true,
      },
      {
        id: "why-exists",
        title: "Why does this book exist?",
        placeholder: "Explain the purpose and motivation behind this book...",
        required: true,
      },
      {
        id: "outcomes",
        title: "The outcomes of the book",
        placeholder: "What will readers achieve by reading this book?",
        required: true,
      },
      {
        id: "mastery-summary",
        title: "The 'Mastery Summary'",
        placeholder: "Provide a high-level overview of what mastery looks like...",
        required: true,
      },
      {
        id: "takeaway",
        title: "What's the #1 thing you want them to take away?",
        placeholder: "The single most important insight or principle...",
        required: true,
      },
      {
        id: "cta",
        title: "The most direct CTA",
        placeholder: "Your primary call-to-action (e.g., book a call, join program)...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-1",
    number: 1,
    title: "Chapter 1: A New Reality",
    description: "Show them what's possible",
    sections: [
      {
        id: "day-in-life",
        title: "What a day in the life is like with your framework",
        placeholder: "Describe a typical day when someone has implemented your framework successfully...",
        required: true,
      },
      {
        id: "case-studies",
        title: "Case studies and stories to prove that your framework works",
        placeholder: "Share real examples and success stories...",
        required: true,
      },
      {
        id: "expectations",
        title: "Show them what to expect from implementing your framework",
        placeholder: "Set clear expectations for what they'll achieve...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-2",
    number: 2,
    title: "Chapter 2: Who This Book Is For",
    description: "Help them identify if this is for them",
    sections: [
      {
        id: "before-after",
        title: "Before & After Story",
        placeholder: "Paint a clear picture of the transformation...",
        required: true,
      },
      {
        id: "before-who",
        title: "Show them 'who' the 'before' is that this works for",
        placeholder: "Describe the person before they implement your framework...",
        required: true,
      },
      {
        id: "after-what",
        title: "Show them 'what' the after is so they can determine if it's for them",
        placeholder: "Describe what they become after implementing your framework...",
        required: true,
      },
      {
        id: "objections",
        title: "Overcome common objections of 'this might not work for me'",
        placeholder: "Address doubts and concerns...",
        required: true,
      },
      {
        id: "self-assessment-1",
        title: "Self-Assessment: Exposing Their Fundamental Unhappiness",
        placeholder: "Create a self-assessment that helps them recognize their current state...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-3",
    number: 3,
    title: "Chapter 3: Overcoming Their Biggest Hurdles",
    description: "Address their pain points",
    sections: [
      {
        id: "hurdle-1",
        title: "Hurdle #1",
        placeholder: "Identify and describe the first major hurdle...",
        required: true,
      },
      {
        id: "hurdle-1-solution",
        title: "How your framework is unique to overcoming Hurdle #1",
        placeholder: "Explain how your framework specifically addresses this hurdle...",
        required: true,
      },
      {
        id: "hurdle-1-assessment",
        title: "Self-Assessment: How bad is Hurdle #1 in your life really?",
        placeholder: "Create a self-assessment for this hurdle...",
        required: true,
      },
      {
        id: "hurdle-2",
        title: "Hurdle #2",
        placeholder: "Identify and describe the second major hurdle...",
        required: true,
      },
      {
        id: "hurdle-2-solution",
        title: "How your framework is unique to overcoming Hurdle #2",
        placeholder: "Explain how your framework specifically addresses this hurdle...",
        required: true,
      },
      {
        id: "hurdle-2-assessment",
        title: "Self-Assessment: How bad is Hurdle #2 in your life really?",
        placeholder: "Create a self-assessment for this hurdle...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-4",
    number: 4,
    title: "Chapter 4: The Secret Key That Unlocks the One Big Benefit",
    description: "Reveal the core mechanism",
    sections: [
      {
        id: "things-must-occur",
        title: "To achieve [outcome], these [#] things must occur",
        placeholder: "List the essential components that must happen...",
        required: true,
      },
      {
        id: "thing-1",
        title: "Thing #1",
        placeholder: "Describe the first essential thing...",
        required: true,
      },
      {
        id: "thing-1-framework",
        title: "How the core piece of my framework makes Thing #1 really easy",
        placeholder: "Explain how your framework simplifies this...",
        required: true,
      },
      {
        id: "thing-2",
        title: "Thing #2",
        placeholder: "Describe the second essential thing...",
        required: true,
      },
      {
        id: "thing-2-framework",
        title: "How the core piece of my framework makes Thing #2 really easy",
        placeholder: "Explain how your framework simplifies this...",
        required: true,
      },
      {
        id: "secret-key-assessment",
        title: "Self-Assessment: Expose Their Lack of Executing on the Secret Key",
        placeholder: "Create a self-assessment that reveals gaps...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-5",
    number: 5,
    title: "Chapter 5: The Catch",
    description: "Address what they've tried before",
    sections: [
      {
        id: "acknowledge-tried",
        title: "Acknowledge what they've tried before / what's popular or common",
        placeholder: "Recognize common approaches they may have attempted...",
        required: true,
      },
      {
        id: "framework-deals-with",
        title: "Show why your framework deals with this on purpose",
        placeholder: "Explain how your framework intentionally addresses these issues...",
        required: true,
      },
      {
        id: "aware-of-options",
        title: "Show that you're aware of other options (and maybe tried them)",
        placeholder: "Demonstrate understanding of alternatives...",
        required: true,
      },
      {
        id: "framework-created-for",
        title: "Show how your framework was created to deal with this specifically",
        placeholder: "Explain the origin and purpose of your framework...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-6",
    number: 6,
    title: "Chapter 6: The Core Mechanism",
    description: "Explain how it works",
    sections: [
      {
        id: "core-mechanism",
        title: "What is the core mechanism that makes your framework work?",
        placeholder: "Describe the fundamental mechanism or principle...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-7",
    number: 7,
    title: "Chapter 7: The Step-by-Step Reveal",
    description: "Lay out the framework",
    sections: [
      {
        id: "step-by-step",
        title: "Lay out all the steps of your framework",
        placeholder: "Provide a detailed, step-by-step breakdown of your framework...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-8",
    number: 8,
    title: "Chapter 8: Critical Components to the Successful Outcome",
    description: "What must be in place",
    sections: [
      {
        id: "critical-components",
        title: "What critical pieces need to be in place in order to achieve the outcome your framework promises?",
        placeholder: "List and explain the essential components...",
        required: true,
      },
    ],
  },
  {
    id: "chapter-9",
    number: 9,
    title: "Chapter 9: How to Get the First Step Done Quickly",
    description: "Break down the first critical step",
    sections: [
      {
        id: "first-step-tip-1",
        title: "Top Tip #1",
        placeholder: "First tip for executing the first step...",
        required: true,
      },
      {
        id: "first-step-tip-2",
        title: "Top Tip #2",
        placeholder: "Second tip for executing the first step...",
        required: true,
      },
      {
        id: "first-step-tip-3",
        title: "Top Tip #3",
        placeholder: "Third tip for executing the first step...",
        required: true,
      },
    ],
  },
  {
    id: "conclusion",
    number: 10,
    title: "🏁 Conclusion",
    description: "Wrap up and guide next steps",
    sections: [
      {
        id: "what-to-do-next",
        title: "What to Do Next",
        placeholder: "Summarize and recap the key points...",
        required: true,
      },
      {
        id: "remind-first-step",
        title: "Remind of the first step of their journey",
        placeholder: "Reinforce the first action they should take...",
        required: true,
      },
      {
        id: "invite-help",
        title: "Invite to get help (Your most direct CTA = free coaching session)",
        placeholder: "Extend an invitation for additional support...",
        required: true,
      },
      {
        id: "how-to-get-help",
        title: "How to Get Help",
        placeholder: "Provide clear next steps for getting support...",
        required: true,
      },
      {
        id: "bonus-content",
        title: "Direct to your bonus content (if you have it)",
        placeholder: "Mention any bonus materials or resources...",
        required: false,
      },
      {
        id: "direct-ctas",
        title: "Direct CTAs",
        placeholder: "Final call-to-action...",
        required: true,
      },
    ],
  },
]

// Helper function to generate chapter content from template
// Generates structured format with headings, short placeholders, and separators
// Matches the format shown in the book editor interface
export function generateChapterContent(
  chapterTemplate: ChapterTemplate,
  answers: any,
  contentVaultItems?: any[]
): string {
  // Start with chapter title as level 1 heading
  let content = `# ${chapterTemplate.title}\n\n`
  
  // Generate each section with structured format
  chapterTemplate.sections.forEach((section, index) => {
    // Add section heading as level 2 heading (preserves emojis if present)
    content += `## ${section.title}\n\n`
    
    // Add short placeholder text (not paragraphs - just instructional text)
    content += `${section.placeholder}\n\n`
    
    // Add horizontal rule separator between sections (not after last section)
    if (index < chapterTemplate.sections.length - 1) {
      content += `---\n\n`
    }
  })
  
  return content.trim() + "\n"
}

// Generate all chapters from template
export function generateAllChapters(
  answers: any,
  contentVaultItems?: any[]
): Array<{ id: string; number: number; title: string; content: string }> {
  return REAL_GROWTH_BOOK_TEMPLATE.map((chapterTemplate) => ({
    id: chapterTemplate.id,
    number: chapterTemplate.number,
    title: chapterTemplate.title,
    content: generateChapterContent(chapterTemplate, answers, contentVaultItems),
  }))
}

