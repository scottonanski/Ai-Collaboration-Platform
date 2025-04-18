import React from "react";
import LivePreview from "./LivePreview";

interface MockPreviewWindowProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const MockPreviewWindow: React.FC<MockPreviewWindowProps> = ({ htmlCode, cssCode, jsCode }) => (
  <div className="h-full w-full flex flex-col">
    <div className="mockup-window border bg-base-200 h-full flex flex-col">
      <div className="flex-1 overflow-auto p-0">
        <LivePreview htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
      </div>
    </div>
  </div>
);

export default MockPreviewWindow;