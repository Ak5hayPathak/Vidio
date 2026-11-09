import { activeProcesses } from "./processRegistryState.js";

const trackProcess = (child) => {
  // 1. Declare a variable to store the Promise's resolve function.
  let resolveClose;

  // 2. Create a pending Promise that resolves when the child process closes.
  const closePromise = new Promise((resolve) => {
    resolveClose = resolve; // Assigning resolve method to resolveClose.
    // The Promise remains pending until resolveClose() is called.
  });

  // 3. Register the child process PID and its completion Promise.
  // A PID may be undefined if spawning the process fails.
  if (Number.isInteger(child.pid)) {
    activeProcesses.set(child.pid, closePromise);
  }

  // 4. Listen for the child process's close event (executes only once).
  child.once("close", () => {
    // 5. Remove the completed process from the active processes registry.
    if (Number.isInteger(child.pid)) {
      activeProcesses.delete(child.pid);
    }

    // 6. Resolve the Promise to notify callers that the process has closed.
    resolveClose();
  });

  // 7. Return the Promise so callers can await process completion.
  return closePromise;
};

const killActiveProcesses = async () => {
  // Get the PIDs of all currently registered child processes.
  const processes = Array.from(activeProcesses.entries());

  if (processes.length === 0) return;

  for (const [pid] of processes) {
    try {
      // Forcefully terminate each process using SIGKILL.
      // SIGKILL is an OS signal that immediately and forcefully terminates a process
      // without allowing it to perform cleanup or handle the signal.
      process.kill(pid, "SIGKILL");
      // We have sent the termination signal here.
    } catch (error) {
      // Ignore ESRCH (process doesn't exist) and log other errors.
      if (error.code !== "ESRCH") {
        console.error(`Failed to kill process ${pid}:`, error);
      }
    }
  }

  // Wait until either all active processes close or 5 seconds pass.
  // We are confirming that processes have actually terminated here.
  let timeout;

  try {
    await Promise.race([
      // Wait for all registered process completion Promises to resolve.
      Promise.all(processes.map(([, closePromise]) => closePromise)),

      // Set a maximum timeout of 5 seconds.
      // This prevents shutdown from waiting indefinitely.
      new Promise((resolve) => {
        timeout = setTimeout(resolve, 5000);
      }),
    ]);
  } finally {
    // Clear the timeout if all processes close before the limit.
    clearTimeout(timeout);
  }
};

export { trackProcess, killActiveProcesses };
