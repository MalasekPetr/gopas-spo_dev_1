import * as React from 'react';
import { Log } from '@microsoft/sp-core-library';
import styles from './ErrorBoundary.module.scss';

export interface IErrorBoundaryProps {
  /** Log source, max. 20 characters (SPFx truncates longer values). */
  source: string;
  fallbackText: string;
  children?: React.ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches errors thrown while rendering the component tree below it, so one broken web part
 * shows a message instead of an empty box. Errors in event handlers and promises are NOT
 * caught here -- those are handled where they happen (hooks, services).
 * Error boundaries must be class components (React 17 and 18).
 * The fallback is plain markup: Fluent UI MessageBar would add ~8 KB to web parts that do not
 * use it otherwise (measured on Portal, 2026-10-16).
 */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): IErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    Log.error(this.props.source, error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <div role="alert" className={styles.error}>{this.props.fallbackText}</div>;
    }
    return this.props.children;
  }
}
