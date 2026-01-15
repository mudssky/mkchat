"use client";

import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";

interface CodeHighlightProps {
  code: string;
  language: string;
}

export function CodeHighlight({ code, language }: CodeHighlightProps) {
  return (
    <Highlight theme={themes.github} code={code} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={cn(
            "overflow-x-auto rounded-lg bg-zinc-950 px-4 py-3 text-[0.85rem] leading-5 text-zinc-100",
            className,
          )}
          style={style}
        >
          {(() => {
            let lineOffset = 0;
            return tokens.map((line) => {
              const lineText = line.map((token) => token.content).join("");
              const lineKey = `line-${lineOffset}-${lineText}`;
              let tokenOffset = lineOffset;
              lineOffset += lineText.length + 1;

              return (
                <div key={lineKey} {...getLineProps({ line })}>
                  {line.map((token) => {
                    const tokenKey = `token-${tokenOffset}-${token.types.join(
                      "-",
                    )}`;
                    tokenOffset += token.content.length;

                    return (
                      <span key={tokenKey} {...getTokenProps({ token })} />
                    );
                  })}
                </div>
              );
            });
          })()}
        </pre>
      )}
    </Highlight>
  );
}
