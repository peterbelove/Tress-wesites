import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, safe rich-text renderer. Supports:
 *   ## Heading, ### Subheading, - list item, > quote, blank-line paragraphs.
 * Never injects raw HTML.
 */
export function RichText({ content, className }: { content: string; className?: string }) {
  const lines = (content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={key++}>{para.join(" ")}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++}>
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push(<h3 key={key++}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={key++}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line.startsWith("> ")) {
      flushPara();
      flushList();
      blocks.push(<blockquote key={key++}>{line.slice(2)}</blockquote>);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className={cn("prose-tres", className)}>{blocks}</div>;
}
