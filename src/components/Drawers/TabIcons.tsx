import React from 'react';
import { FileCode2, SquareLibrary, ScrollText, LucideProps } from 'lucide-react';

interface TabIconProps extends LucideProps {}

export const CodeTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="HTML Tab Icon" data-component="HtmlTabIcon">
    <FileCode2 {...props} />
  </span>
);

export const LivePreviewTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="CSS Tab Icon" data-component="CssTabIcon">
    <SquareLibrary {...props} />
  </span>
);

export const MarkdownTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="JavaScript Tab Icon" data-component="JsTabIcon">
    <ScrollText {...props} />
  </span>
);