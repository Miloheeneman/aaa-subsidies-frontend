import { Component } from "react";

import ServerError from "../pages/ServerError.jsx";

/**
 * Top-level React error boundary. Wraps the entire route tree so that a
 * thrown render-time exception in any page produces our branded
 * ServerError screen instead of a blank page. The "Opnieuw proberen"
 * button does a soft reload of the current URL.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (typeof console !== "undefined") {
      console.error("[ErrorBoundary]", error, info?.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.error) {
      return (
        <ServerError
          message={this.state.error?.message}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
