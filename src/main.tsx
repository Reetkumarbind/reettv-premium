import { autoRedirectLite } from "./lib/deviceDetection";

// Redirect low-end devices to pure HTML lite mode BEFORE loading React
if (!autoRedirectLite()) {
  // Parallel imports for faster bootstrap
  Promise.all([
    import("react-dom/client"),
    import("./App"),
    import("./components/ErrorBoundary"),
    import("./index.css"),
  ]).then(([{ createRoot }, { default: App }, { default: ErrorBoundary }]) => {
    createRoot(document.getElementById("root")!).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  });
}
