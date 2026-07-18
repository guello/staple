import type * as vscode from 'vscode'
import { activateGitInstantRefresh } from './features/git-instant-refresh'
import { activateToggleQuotes } from './features/toggle-quotes'

export function activate(context: vscode.ExtensionContext): void {
  void activateGitInstantRefresh(context)
  activateToggleQuotes(context)
}

export function deactivate(): void {}
