"use client";

import { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-red-400 mb-1">Something went wrong</p>
            <p className="text-xs text-zinc-500">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
