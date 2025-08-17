import React, { Component, ErrorInfo, ReactNode } from 'react'
import { toast } from '@/hooks/use-toast'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return { hasError: true, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown'
    
    console.error(`[ERROR ${errorId}]`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    toast({
      title: 'Something went wrong',
      description: `Error ID: ${errorId}. Please refresh the page or try again.`,
      variant: 'destructive',
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              Error ID: {this.state.errorId}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}