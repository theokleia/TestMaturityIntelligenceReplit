import React, { useEffect, useState } from 'react';

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Simple markdown to HTML conversion
  useEffect(() => {
    // Convert headers
    let html = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert lists
    html = html
      .replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/g, '');
    
    html = html
      .replace(/^\s*\d+\. (.*$)/gim, '<ol><li>$1</li></ol>')
      .replace(/<\/ol>\s*<ol>/g, '');

    // Convert paragraphs
    html = html
      .replace(/^(?!<h|<ul|<ol|<li|<p|<blockquote|<pre|<table|<code)(.*$)/gim, '<p>$1</p>')
      .replace(/<\/p>\s*<p>/g, '</p><p>');

    // Convert bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    // Convert code blocks
    html = html
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" style="max-width: 100%;" />');

    // Convert horizontal rule
    html = html.replace(/^---$/gim, '<hr />');

    // Convert blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/<\/blockquote>\s*<blockquote>/g, '<br />');

    // Convert tables
    const tableRegex = /\|(.+)\|(.+)\|/g;
    const headerRegex = /\|(.+)\|/g;
    const separatorRegex = /\|([\s-]+)\|/g;

    if (tableRegex.test(content)) {
      const lines = content.split('\n');
      let inTable = false;
      let tableHtml = '<table class="border-collapse border border-slate-700 mt-4">\n<thead>\n<tr>';
      
      lines.forEach((line, index) => {
        if (headerRegex.test(line) && separatorRegex.test(lines[index + 1])) {
          // Table header
          inTable = true;
          const cells = line.split('|').filter(cell => cell.trim() !== '');
          cells.forEach(cell => {
            tableHtml += `<th class="border border-slate-700 px-4 py-2">${cell.trim()}</th>`;
          });
          tableHtml += '</tr>\n</thead>\n<tbody>\n';
        } else if (inTable && headerRegex.test(line) && !separatorRegex.test(line)) {
          // Table row
          tableHtml += '<tr>';
          const cells = line.split('|').filter(cell => cell.trim() !== '');
          cells.forEach(cell => {
            tableHtml += `<td class="border border-slate-700 px-4 py-2">${cell.trim()}</td>`;
          });
          tableHtml += '</tr>\n';
        } else if (inTable && !headerRegex.test(line)) {
          // End of table
          tableHtml += '</tbody>\n</table>';
          inTable = false;
          html = html.replace(/(\|(.+)\|[\s\S]+?(?=\n\n|$))/g, tableHtml);
        }
      });
      
      if (inTable) {
        // Close the table if we reached the end of the content
        tableHtml += '</tbody>\n</table>';
        html = html.replace(/(\|(.+)\|[\s\S]+?(?=\n\n|$))/g, tableHtml);
      }
    }

    setHtmlContent(html);
  }, [content]);

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}