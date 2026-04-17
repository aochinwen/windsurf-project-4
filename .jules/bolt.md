## 2023-10-27 - Dnd-Kit 60fps Re-rendering bottleneck
**Learning:** During drag-and-drop operations using `@dnd-kit`, the `SortableElement` component re-renders up to 60fps to update transform properties. Expensive synchronous operations inside this component (like regex-heavy HTML string rendering) will block the main thread and cause visible stuttering.
**Action:** Always memoize computationally expensive operations (`useMemo`) inside components that are dragged or frequently re-rendered by animation libraries, ensuring dependencies are strictly defined.
