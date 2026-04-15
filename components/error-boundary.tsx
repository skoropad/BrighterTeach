"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { STORAGE_KEYS } from "@/lib/constants"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEYS.messages)
    localStorage.removeItem(STORAGE_KEYS.session)
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Oops, something went wrong!
            </h2>
            <p className="text-muted-foreground text-lg">
              Don&apos;t worry — let&apos;s start fresh and try again.
            </p>
            <Button
              onClick={this.handleReset}
              className="h-12 px-6 text-lg font-bold rounded-2xl"
            >
              Start Fresh
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
