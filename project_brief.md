# Project Brief: EML Editor (windsurf-project-4)

## Overview
This project is a React-based web application structured as a graphical email builder. It empowers users to visually construct emails using drag-and-drop (dnd) principles, configure element properties, and both import from and export to standard `.eml` file formats.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (v4)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Icons**: `lucide-react`
- **Linting**: ESLint

## Core Features
1. **Drag-and-Drop Canvas**: Users can select predefined email elements from a sidebar and arrange them visually on a canvas.
2. **Property Panel**: Selecting elements on the canvas opens a rich configuration panel to customize properties specific to each element (e.g., text, colors, imagery).
3. **Drafting & Persistence**: 
   - **Autosave**: The app autosaves the current editing session to the browser's local storage.
   - **Named Sessions**: Users can save distinct sessions by name within local storage or export them locally as JSON files.
4. **EML Support**:
   - **Import**: Users can upload `.eml` files, which the app parses and converts back into editable structural blocks.
   - **Export**: The visual arrangement can be rendered effectively into HTML text and downloaded as a formatted `.eml` file.
5. **Live Preview**: Allows evaluating how the finished email will look before exporting.

## Project Structure
- `src/`
  - **`App.jsx`**: The main orchestrator connecting the UI layout, storing global states like selected elements, email metadata, and delegating save/export operations.
  - **`components/`**:
    - `Canvas.jsx`: The primary workspace where element blocks are dragged, dropped, ordered, and rendered.
    - `ElementsSidebar.jsx` & `ElementThumbnail.jsx`: Provides the UI for selecting new UI elements and dragging them into the canvas.
    - `PropertyPanel.jsx`: Modifies local settings and aesthetics for individual blocks.
    - `EmailMetaModal.jsx` & `PreviewModal.jsx`: Interfaces for email address configurations and final reviews.
  - **`utils/`**:
    - `emlExporter.js` & `emlImporter.js`: Responsible for formatting into or parsing structural data out of the `.eml` file structure.
    - `htmlRenderer.js`: Transforms internal JSON-like element representations into final HTML chunks appropriate for email environments.
    - `sessionPersistence.js`: Isolates logic for saving data streams directly to the browser or preparing downloads.
  - **`data/`**:
    - `elements.js`: Static definitions or templates of default available editable blocks.

## Development Commands
- `npm run dev`: Launch the Vite development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint on the codebase.
- `npm run preview`: Serve the production build locally.
