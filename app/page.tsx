"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { WorkspaceCard } from "@/components/workspace-card"
import { TutorChat, type Message } from "@/components/tutor-chat"

type Subject = "math" | "reading"

// Simulated AI responses for demo purposes
const generateMathExplanation = (problem: string, grade: string): string => {
  const gradeNum = parseInt(grade)
  
  if (gradeNum <= 3) {
    return `Great math question! Let me help you understand this step by step!

Step 1: First, let's look at what we have here. We're working with numbers!

Step 2: Let's break it down into smaller, easier parts.

Step 3: Now we can solve it piece by piece.

Step 4: When we put it all together, we get our answer!

Remember: Take your time and don't be afraid to count on your fingers or use objects to help you visualize! You're doing amazing!`
  } else {
    return `Excellent math question! Let's work through this together step by step.

Step 1: Identify what we know
Let's carefully read the problem and pick out the important information.

Step 2: Plan our approach
Think about which operation(s) we need to use.

Step 3: Execute the solution
Work through the calculation carefully, showing each step.

Step 4: Check our answer
Does our answer make sense? Let's verify by working backwards!

Pro tip: Always double-check your work by estimating first! You've got this!`
  }
}

const generateReadingExplanation = (question: string, grade: string, context?: string): string => {
  const gradeNum = parseInt(grade)
  const hasContext = context && context.trim().length > 0
  
  if (gradeNum <= 3) {
    return `That's a wonderful reading question! Let's explore this together.

${hasContext ? "Step 1: Looking at the Story\nI can see you shared a text with me. Let's find the important parts!\n\n" : ""}Step ${hasContext ? "2" : "1"}: Understanding Your Question
First, let's make sure we understand what you're asking about.

Step ${hasContext ? "3" : "2"}: Finding Clues
When we read carefully, we can find clues that help us understand!

Step ${hasContext ? "4" : "3"}: Putting It Together
Now let's think about what all these clues mean!

Remember: Good readers always ask questions like you just did! Keep being curious!`
  } else {
    return `Great reading comprehension question! Let's analyze this thoughtfully.

${hasContext ? "Step 1: Text Analysis\nLet's examine the passage you've shared and identify key details.\n\n" : ""}Step ${hasContext ? "2" : "1"}: Understanding the Question
Your question asks us to think deeply about the text.

Step ${hasContext ? "3" : "2"}: Identifying Evidence
Let's find specific examples or quotes that support our answer.

Step ${hasContext ? "4" : "3"}: Making Inferences
Based on what we've read, we can draw conclusions.

Step ${hasContext ? "5" : "4"}: Forming Our Response
Now we can put together a complete, thoughtful answer!

Tip: The best readers always support their ideas with evidence from the text!`
  }
}

const generateMathHint = (problem: string, grade: string): string => {
  const gradeNum = parseInt(grade)
  
  if (gradeNum <= 3) {
    return `Here's a helpful hint for your math problem!

Think about what operation you need to use. Are we putting things together (adding) or taking them apart (subtracting)?

Try drawing pictures or using objects like blocks to help you see the problem!`
  } else {
    return `Here's a hint to get you started with this math problem!

Look carefully at the numbers and operations in your problem. 

Ask yourself: What is the question really asking? What information do I have? What's the relationship between these numbers?

Try working with simpler numbers first to understand the pattern!`
  }
}

const generateReadingHint = (question: string, grade: string, context?: string): string => {
  const hasContext = context && context.trim().length > 0
  
  return `Here's a helpful hint for your reading question!

${hasContext ? "Go back to the text and read it one more time, slowly.\n\n" : ""}Look for key words that tell you what's important. Words like "because," "therefore," "however," and "for example" often signal important ideas!

${hasContext ? "Try to find a specific sentence or paragraph that relates to your question." : "Think about what you already know about this topic that might help."}

What's the main thing you're trying to understand?`
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentGrade, setCurrentGrade] = useState<string>("")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleClearHistory = () => {
    setMessages([])
    setHasSubmitted(false)
    setCurrentGrade("")
  }

  const handleExplain = async (problem: string, grade: string, subject: Subject, context?: string) => {
    setIsLoading(true)
    setCurrentGrade(grade)
    setHasSubmitted(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: subject === "reading" && context 
        ? `[Reading Question]\n\nText: "${context.slice(0, 100)}${context.length > 100 ? '...' : ''}"\n\nQuestion: ${problem}`
        : `[${subject === "math" ? "Math" : "Reading"} Question]\n\n${problem}`,
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate and add assistant response
    const response = subject === "math" 
      ? generateMathExplanation(problem, grade)
      : generateReadingExplanation(problem, grade, context)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleHint = async (problem: string, grade: string, subject: Subject, context?: string) => {
    setIsLoading(true)
    setCurrentGrade(grade)
    setHasSubmitted(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Need a hint for: ${problem}`,
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate and add hint response
    const response = subject === "math"
      ? generateMathHint(problem, grade)
      : generateReadingHint(problem, grade, context)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      isHint: true,
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSendMessage = async (message: string) => {
    setIsLoading(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Generate follow-up response
    const gradeNum = currentGrade ? parseInt(currentGrade) : 5
    const responses = [
      `That's a great follow-up question! ${gradeNum <= 3 ? "" : ""}\n\nLet me explain that in a different way. When we think about it step by step, it becomes much clearer!\n\nDoes that help? Feel free to ask more questions!`,
      `I love that you're curious!\n\nThink of it like this: we're building understanding piece by piece, just like building with blocks!\n\nWhat other questions do you have?`,
      `Great thinking!\n\nYou're on the right track! Remember, making mistakes is part of learning - that's how our brains grow!\n\nKeep asking questions - you're doing wonderfully!`,
    ]
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onClearHistory={handleClearHistory} hasHistory={messages.length > 0} />
      
      <main className="flex-1 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-180px)]">
            {/* Left Column - Workspace */}
            <div className="lg:h-full lg:overflow-auto">
              <WorkspaceCard
                onExplain={handleExplain}
                onHint={handleHint}
                isLoading={isLoading}
              />
            </div>
            
            {/* Right Column - Tutor Chat */}
            <div className="lg:h-full">
              <TutorChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isEnabled={hasSubmitted}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Fun footer */}
      <footer className="py-4 px-4 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Made with care for curious learners everywhere!
        </p>
      </footer>
    </div>
  )
}
