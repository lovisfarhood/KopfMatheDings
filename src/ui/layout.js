export function dockMetrics({ width, height, safeBottom = 0 }) {
  const landscape = height <= 520 && width > height;
  const keyboardHeight = landscape ? 210 : width <= 390 ? 312 : 320;
  const workspaceHeight = landscape ? 56 : width <= 390 ? 64 : 70;
  const keyboardBottom = height;
  const keyboardTop = keyboardBottom - safeBottom - keyboardHeight;
  const workspaceBottom = keyboardTop;
  const workspaceTop = workspaceBottom - workspaceHeight;
  return Object.freeze({
    width,
    height,
    safeBottom,
    keyboardHeight,
    workspaceHeight,
    keyboardTop,
    keyboardBottom,
    workspaceTop,
    workspaceBottom,
    contentPaddingBottom: keyboardHeight + workspaceHeight + safeBottom + 32
  });
}

export function applyDockMetrics(root = document.documentElement, viewport = window) {
  const metrics = dockMetrics({ width: viewport.innerWidth, height: viewport.innerHeight });
  root.style.setProperty("--keyboard-height", `${metrics.keyboardHeight}px`);
  root.style.setProperty("--workspace-height", `${metrics.workspaceHeight}px`);
  return metrics;
}
