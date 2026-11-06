import { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { btnPrimary, glass } from './ui';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('UI crashed:', error, info.componentStack); }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="grid min-h-screen place-items-center bg-slate-950 p-6">
        <div className={`${glass} max-w-md p-8 text-center`}>
          <AlertTriangle className="mx-auto h-9 w-9 text-rose-300" />
          <h1 className="mt-4 text-lg font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">{this.state.error.message || 'An unexpected error occurred.'} Your file stays on your device.</p>
          <button className={`${btnPrimary} mt-6`} onClick={() => this.setState({ error: null })}>
            <RotateCcw className="h-4 w-4" />Try again
          </button>
        </div>
      </div>
    );
  }
}
ErrorBoundary.propTypes = { children: PropTypes.node };
