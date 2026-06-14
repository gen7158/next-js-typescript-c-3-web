"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownAnswer({ text }: { text: string }) {
  return (
    <div className="break-words text-sm leading-7 text-[#d7dce7] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-cyan [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-3 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/10 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_code]:rounded [&_code]:border [&_code]:border-primary/20 [&_code]:bg-background [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[.9em] [&_code]:text-cyan [&_h1]:my-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:my-4 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-[#c8c2ff] [&_hr]:my-5 [&_hr]:border-border [&_li]:my-1.5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#07090d] [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#d7dce7] [&_strong]:font-bold [&_strong]:text-white [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-panel [&_th]:p-2 [&_th]:text-left [&_th]:text-white [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
