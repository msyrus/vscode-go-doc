import * as vscode from "vscode";

type HoverContent = vscode.MarkdownString | vscode.MarkedString;

export function formatHoverOutput(hovers: readonly vscode.Hover[]): string {
  const sections = hovers
    .flatMap((hover) => hover.contents)
    .map(formatHoverContent)
    .map(normalizeMarkdownForOutput)
    .filter((section): section is string => Boolean(section));

  return dedupeSections(sections).join("\n\n");
}

function formatHoverContent(content: HoverContent): string {
  if (typeof content === "string") {
    return content;
  }

  if (isCodeblockContent(content)) {
    return content.value;
  }

  return content.value;
}

function isCodeblockContent(
  content: HoverContent,
): content is vscode.MarkedString & { language: string; value: string } {
  return (
    typeof content === "object" &&
    "language" in content &&
    typeof content.language === "string"
  );
}

function normalizeMarkdownForOutput(value: string): string {
  return value
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function dedupeSections(sections: readonly string[]): string[] {
  return [...new Set(sections)];
}
