import * as vscode from 'vscode'
import { normalizeChars, toggleLine } from './quote-core'

const SECTION = 'vscodeTools.toggleQuotes'

export function activateToggleQuotes(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('vscodeTools.toggleQuotes', editor => {
      const scope = { uri: editor.document.uri, languageId: editor.document.languageId }
      const config = vscode.workspace.getConfiguration(SECTION, scope)
      if (!config.get('enabled', true)) return

      const pairs = normalizeChars(config.get('chars'))
      if (pairs.length < 2) return

      void editor.edit(builder => {
        for (const selection of editor.selections) {
          const lineNumber = selection.active.line
          const line = editor.document.lineAt(lineNumber)
          const edit = toggleLine(line.text, selection.active.character, pairs)
          if (edit) {
            builder.replace(new vscode.Range(lineNumber, edit.start, lineNumber, edit.end), edit.text)
          }
        }
      })
    })
  )
}
