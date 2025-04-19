To get started with the project, follow these steps:

Clone the Repository:
```bash
git clone https://github.com/scottonanski/collaboration.git
cd collaboration
```

Switch to the Feature Branch:
```bash
git checkout scott/feature/react-18-downgrade
```

Install Dependencies:
```bash
npm install
```

Run the Development Server:
```bash
npm run dev
```

This will start the Vite development server, and you can view the app in your browser (typically at http://localhost:5173).


---
# Project Status Update
### Overview
The project has made significant progress, with the Live Preview component now fully functional and several key features completed. Development is ongoing, with some areas requiring minor tweaks and additional logic implementation to reach full functionality.

### Live Preview:

The Live Preview component is operational, successfully rendering code in real-time.

### Preview Tabs: The Code, Live, and Markdown preview features are complete, though minor adjustments are still needed to polish the experience.
Decision Tree UI: A decision tree interface with folders for storing pages, stylesheets, and scripts has been implemented. Currently, this is limited to the UI and lacks full functionality.

# Ongoing Work

### Chat Input:

The chat input feature requires some logic refinements to ensure smooth operation and integration with the rest of the system.

# Next Steps

### Preview Tweaks: 

Apply minor adjustments to the Code, Live, and Markdown preview tabs to enhance usability and performance.


### Decision Tree Functionality:

Extend the decision tree beyond the UI, enabling it to store and manage pages, stylesheets, and scripts effectively.

### Chat Input Logic:

Finalize the logic adjustments for the chat input to ensure it meets project requirements.

# Summary

The project is advancing well, with core features like Live Preview and preview tabs in place. The focus moving forward will be on refining existing components and activating the decision tree's functionality, setting the stage for a robust and user-friendly application.

---
# Previous Changes

# React 18 Downgrade for LivePreview Component

## Objective
Downgrade the project from React 19.1.0 to React 18.3.1 to resolve errors in the `LivePreview` component (`exports is not defined`, `require is not defined`, `ReactDOM is not defined`, `createRoot is not defined`). The goal was to render the test code error `ReferenceError: undefinedVar is not defined` in the `LivePreview` iframe, using browser-compatible UMD builds.

**Test Code** (in `ResizableDrawer.tsx`):
```tsx
const [htmlCode] = useState('<div id="root"></div>');
const [cssCode] = useState('h1 { color: blue; }');
const [jsCode] = useState(`
  const App = () => <h1>{undefinedVar.toString()}</h1>;
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
`);
```

## Process
1. **Git Setup**:
   - Created a new branch: `scott/feature/react-18-downgrade`.
   - Committed all project files: `git add . && git commit -m "Add all project files on react-18-downgrade branch"`.
   - Removed Storybook dependencies and `.storybook/` directory: `git commit -m "Remove Storybook dependencies and files"`.
   - Pushed to remote: `git push origin scott/feature/react-18-downgrade`.

2. **Downgrade to React 18**:
   - Updated `package.json`:
     ```json
     "dependencies": {
       ...
       "react": "^18.3.1",
       "react-dom": "^18.3.1",
       ...
     }
     ```
   - Ran `npm install` to install React 18.3.1.

3. **Copied UMD Builds**:
   - Removed incompatible CJS files: `rm public/lib/react.development.js public/lib/react-dom.development.js`.
   - Copied React 18 UMD builds:
     ```bash
     cp node_modules/react/umd/react.development.js public/lib/
     cp node_modules/react-dom/umd/react-dom.development.js public/lib/
     ```

4. **Updated Code**:
   - Modified `LivePreview.tsx`:
     - Used local UMD scripts: `<script src="/lib/react.development.js"></script>`, `<script src="/lib/react-dom.development.js"></script>`.
     - Simplified preprocessing to remove only React/ReactDOM imports.
   - Updated `ResizableDrawer.tsx` to use `ReactDOM.createRoot` for React 18 compatibility.

## Outcome
- **Success**:
  - Console output:
    ```
    esbuild-wasm initialized successfully with version 0.25.2
    compileAndRender: 134.6259765625 ms
    react-dom.development.js:18693 ReferenceError: undefinedVar is not defined
    ```
  - Live Preview error: `Error: Script error.` (Expected `Error: ReferenceError: undefinedVar is not defined`, indicating a minor error display issue).
  - Network status: `/lib/react.development.js` and `/lib/react-dom.development.js` load with `200 OK`.
  - The `undefinedVar` error confirms `LivePreview`, `MockPreviewWindow`, and React 18 UMD builds work correctly.
- **Minor Issue**:
  - The Live Preview error panel shows `Error: Script error.` instead of the full `ReferenceError: undefinedVar is not defined`. This requires a tweak to error handling in `LivePreview.tsx`.

## Next Steps
1. **Fix Error Display**:
   - Update `LivePreview.tsx` error handling to show `Error: ReferenceError: undefinedVar is not defined`:
     ```tsx
     <script>
       window.onerror = (msg, url, line, col, error) => {
         const message = error ? error.stack || error.message : String(msg);
         parent.postMessage({ type: 'error', message }, '*');
         return true;
       };
       try {
         ${compiledJS}
       } catch (error) {
         parent.postMessage({ type: 'error', message: error.stack || error.message }, '*');
       }
     </script>
     ```

2. **Integrate Dynamic LLM Input**:
   - Modify `ResizableDrawer.tsx` to accept `htmlCode`, `cssCode`, and `jsCode` from `CodeSubTabs.tsx` for user/LLM input.
   - Enable dynamic code updates instead of static `useState`.

3. **JSZip Export**:
   - Implement export feature to zip HTML, CSS, JS files, including React 18 UMD scripts or CDN links in the HTML.
   - Example HTML:
     ```html
     <!DOCTYPE html>
     <html lang="en">
       <head>
         <meta charset="UTF-8">
         <style>h1 { color: blue; }</style>
         <script src="react.development.js"></script>
         <script src="react-dom.development.js"></script>
       </head>
       <body>
         <div id="root"></div>
         <script>
           const App = () => <h1>Hello</h1>;
           ReactDOM.createRoot(document.getElementById("root")).render(<App />);
         </script>
       </body>
     </html>
     ```

4. **Security**:
   - Address 3 moderate vulnerabilities: `npm audit fix`.

5. **Test and Commit**:
   - Test changes: `npm run dev`.
   - Commit and push: `git push origin scott/feature/react-18-downgrade`.

## Notes
- **Why React 18**: React 19 lacks UMD builds, causing errors with CJS files in the browser. React 18’s UMD builds are ideal for `LivePreview`’s iframe and future JSZip exports.
- **SaaS Context**: The app is a SaaS with a code editor and live preview. Future exports may use CDNs for scalability, but React 18 UMD builds support offline development.
- **Repository**: `https://github.com/scottonanski/collaboration`, branch `scott/feature/react-18-downgrade`.

