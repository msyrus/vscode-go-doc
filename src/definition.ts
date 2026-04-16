import * as vscode from "vscode";
import { formatHoverOutput } from "./util";
import { showOutput } from "./outputChannel";

class MissingGoDocumentationError extends Error {
  constructor(readonly outputMessage: string) {
    super("Go documentation is unavailable in this workspace.");
  }
}

export async function printDefinition(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No editor is active");
    return;
  }

  if (editor.document.languageId !== "go") {
    vscode.window.showInformationMessage(
      "File in the active editor is not a Go file",
    );
    return;
  }

  showOutput("Generating documentation...", true);

  try {
    const definition = await getDefinition(
      editor.document,
      editor.selection.active,
    );
    if (definition) {
      showOutput(definition, true, true);
    }
  } catch (error) {
    if (error instanceof MissingGoDocumentationError) {
      showOutput(error.outputMessage, true, true);
      vscode.window.showWarningMessage(error.message);
      return;
    }

    vscode.window.showErrorMessage(formatError(error));
  }
}

async function getDefinition(
  doc: vscode.TextDocument,
  pos: vscode.Position,
): Promise<string> {
  const hovers =
    (await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      doc.uri,
      pos,
    )) ?? [];

  const definition = formatHoverOutput(hovers);
  if (definition) {
    return definition;
  }

  throw new MissingGoDocumentationError(buildMissingDocumentationMessage());
}

function buildMissingDocumentationMessage(): string {
  const goExtension = vscode.extensions.getExtension("golang.go");
  const lines = [
    "No Go documentation is available from registered hover providers.",
    "",
    "Try this:",
  ];

  if (!goExtension) {
    lines.push(
      "1. Install the VS Code Go extension (`golang.go`).",
      "2. Reopen the workspace and run the command again.",
    );
  } else if (!goExtension.isActive) {
    lines.push(
      "1. Enable the VS Code Go extension (`golang.go`) for this workspace.",
      "2. Open a Go file to activate the extension, then run the command again.",
    );
  } else {
    lines.push(
      "1. Make sure `gopls` is installed and running for this workspace.",
      "2. Check the Go extension output if hover information is still unavailable.",
    );
  }

  lines.push("3. Confirm the file is part of a valid Go module or workspace.");

  return lines.join("\n");
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
