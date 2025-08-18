/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: MessageRenderer.jsx
 */

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight as github } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const MessageRenderer = ({ content, role, isStreaming = false }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Sanitize content for streaming to prevent markdown parsing issues
  const processedContent = useMemo(() => {
    if (!content) return '';
    
    // If streaming and content looks incomplete, handle it carefully
    if (isStreaming) {
      // Check for incomplete code blocks and temporarily close them
      let processed = content;
      
      // Count backticks to see if we have unclosed code blocks
      const tripleBacktickCount = (processed.match(/```/g) || []).length;
      const singleBacktickCount = (processed.match(/(?<!`)`(?!`)/g) || []).length;
      
      // If we have an odd number of triple backticks, we have an unclosed code block
      if (tripleBacktickCount % 2 !== 0) {
        processed = processed + '\n```';
      }
      
      // If we have an odd number of single backticks, we have unclosed inline code
      if (singleBacktickCount % 2 !== 0) {
        processed = processed + '`';
      }
      
      // Handle incomplete list items or other markdown elements
      // This prevents rendering issues during streaming
      return processed;
    }
    
    return content;
  }, [content, isStreaming]);

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
    const codeString = String(children).replace(/\n$/, '');
   
    if (!inline && match) {
      return (
        <div className="relative group my-4">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-t-lg border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600 capitalize tracking-wide">
              {language}
            </span>
            <button
              onClick={() => copyToClipboard(codeString, codeId)}
              className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Copy code"
            >
              {copiedCode === codeId ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-b-lg overflow-hidden">
            <SyntaxHighlighter
              style={github}
              language={language}
              PreTag="div"
              className="!mt-0 !mb-0 text-sm"
              customStyle={{
                margin: 0,
                borderRadius: '0 0 0.5rem 0.5rem',
                border: '1px solid #e5e7eb',
                borderTop: 'none',
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    }

    return (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
        {children}
      </code>
    );
  };

  // For very simple content or during streaming, render as plain text with basic formatting
  const shouldUseMarkdown = useMemo(() => {
    if (!content) return false;
    
    // If streaming and content is very short or looks incomplete, use plain text
    if (isStreaming && content.length < 50) {
      return false;
    }
    
    // Check if content has markdown syntax
    const hasMarkdownSyntax = /[#*`_\[\]()>-]|\n\n/.test(content);
    return hasMarkdownSyntax;
  }, [content, isStreaming]);

  // Plain text renderer with basic formatting
  const renderPlainText = (text) => {
    if (!text) return null;
    
    return (
      <div className="message-content max-w-none">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    );
  };

  // If content is empty or null, return null
  if (!content) {
    return null;
  }

  // Use plain text renderer for simple content or during early streaming
  if (!shouldUseMarkdown) {
    return renderPlainText(content);
  }

  // Full markdown renderer
  return (
    <div className="message-content max-w-none">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-gray-800 mb-2 mt-4 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-gray-900 mb-4 last:mb-0 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-gray-900">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-gray-900">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-200 pl-6 py-2 my-4 italic text-gray-600">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">
              {children}
            </em>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-gray-900">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-t border-gray-200" />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;