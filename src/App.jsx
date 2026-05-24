import { useEffect, useMemo, useRef, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const presets = [
  { label: "1 min", minutes: 1 },
  { label: "5 min", minutes: 5 },
  { label: "10 min", minutes: 10 },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clampNumber(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.min(Math.max(number, min), max);
}

function formatTime(ms) {
  const safeMs = Math.max(0, ms);
  const hours = Math.floor(safeMs / HOUR);
  const minutes = Math.floor((safeMs % HOUR) / MINUTE);
  const seconds = Math.floor((safeMs % MINUTE) / SECOND);
  const centiseconds = Math.floor((safeMs % SECOND) / 10);

  return {
    main: [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":"),
    sub: String(centiseconds).padStart(2, "0"),
  };
}

function inputToMs(input) {
  const hours = clampNumber(input.hours, 0, 23);
  const minutes = clampNumber(input.minutes, 0, 59);
  const seconds = clampNumber(input.seconds, 0, 59);

  return hours * HOUR + minutes * MINUTE + seconds * SECOND;
}

function NumberInput({ label, name, value, onChange, disabled, max }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </span>
      <input
        className="h-12 rounded-lg border border-white/15 bg-white/5 px-3 text-center text-base font-semibold text-white outline-none transition-all duration-200 placeholder-white/30 hover:border-white/25 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/40 backdrop-blur"
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min="0"
        name={name}
        onChange={onChange}
        type="number"
        value={value}
      />
    </label>
  );
}

function App() {
  const [activeTool, setActiveTool] = useState("stopwatch");
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [timerInput, setTimerInput] = useState({ hours: "0", minutes: "5", seconds: "0" });
  const [timerMs, setTimerMs] = useState(5 * MINUTE);
  const [timerRunning, setTimerRunning] = useState(false);
  const stopwatchStartRef = useRef(0);
  const timerEndRef = useRef(0);
  const timerDurationRef = useRef(5 * MINUTE);

  const stopwatchTime = useMemo(() => formatTime(stopwatchMs), [stopwatchMs]);
  const timerTime = useMemo(() => formatTime(timerMs), [timerMs]);
  const timerProgress = timerDurationRef.current
    ? ((timerDurationRef.current - timerMs) / timerDurationRef.current) * 100
    : 0;

  useEffect(() => {
    if (!stopwatchRunning) {
      return undefined;
    }

    const id = window.setInterval(() => {
      setStopwatchMs(Date.now() - stopwatchStartRef.current);
    }, 40);

    return () => window.clearInterval(id);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (timerRunning) {
      return undefined;
    }

    const nextMs = inputToMs(timerInput);
    timerDurationRef.current = nextMs;
    setTimerMs(nextMs);
  }, [timerInput]);

  useEffect(() => {
    if (!timerRunning) {
      return undefined;
    }

    const id = window.setInterval(() => {
      const nextMs = Math.max(0, timerEndRef.current - Date.now());
      setTimerMs(nextMs);

      if (nextMs === 0) {
        setTimerRunning(false);
      }
    }, 120);

    return () => window.clearInterval(id);
  }, [timerRunning]);

  function startStopwatch() {
    stopwatchStartRef.current = Date.now() - stopwatchMs;
    setStopwatchRunning(true);
  }

  function pauseStopwatch() {
    setStopwatchRunning(false);
  }

  function resetStopwatch() {
    setStopwatchRunning(false);
    setStopwatchMs(0);
  }

  function updateTimerInput(event) {
    const { name, value, max } = event.target;
    setTimerInput((current) => ({
      ...current,
      [name]: String(clampNumber(value, 0, Number(max))),
    }));
  }

  function applyPreset(minutes) {
    setTimerRunning(false);
    setTimerInput({ hours: "0", minutes: String(minutes), seconds: "0" });
  }

  function startTimer() {
    const duration = timerMs > 0 ? timerMs : inputToMs(timerInput);

    if (duration <= 0) {
      return;
    }

    if (timerMs === inputToMs(timerInput)) {
      timerDurationRef.current = duration;
    }

    timerEndRef.current = Date.now() + duration;
    setTimerRunning(true);
  }

  function pauseTimer() {
    setTimerRunning(false);
  }

  function resetTimer() {
    const nextMs = inputToMs(timerInput);
    setTimerRunning(false);
    setTimerMs(nextMs);
    timerDurationRef.current = nextMs;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 auto-rows-max xl:grid-cols-[1fr_340px]">
        {/* Main Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:gap-6 sm:items-start">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400/70">
                Time Management
              </p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Stopwatch & Timer
              </h1>
            </div>
            
            {/* Toggle Buttons */}
            <div className="flex w-full sm:w-auto rounded-lg border border-white/10 bg-white/5 p-1.5 backdrop-blur">
              {[
                ["stopwatch", "Stopwatch"],
                ["timer", "Timer"],
              ].map(([value, label]) => (
                <button
                  className={cx(
                    "flex-1 sm:flex-none rounded-md px-4 py-2.5 text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                    activeTool === value
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/40"
                      : "text-white/60 hover:text-white/80"
                  )}
                  key={value}
                  onClick={() => setActiveTool(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTool === "stopwatch" ? (
            <div className="grid gap-6">
              {/* Display */}
              <div className="relative overflow-hidden rounded-2xl border border-cyan-600/20 bg-cyan-600/5 p-6 backdrop-blur-lg sm:p-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400/70">
                  Elapsed Time
                </p>
                <div className="flex items-baseline justify-center gap-2 flex-wrap">
                  <span className="font-black text-5xl text-white tabular-nums sm:text-6xl lg:text-8xl">{stopwatchTime.main}</span>
                  <span className="text-xl text-cyan-300/80 font-semibold sm:text-2xl lg:text-3xl">.{stopwatchTime.sub}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  className="h-11 sm:h-12 rounded-lg bg-cyan-600 px-4 sm:px-6 font-semibold text-sm sm:text-base text-white shadow-lg shadow-cyan-600/30 transition-all duration-300 hover:bg-cyan-500 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-cyan-600"
                  disabled={stopwatchRunning}
                  onClick={startStopwatch}
                  type="button"
                >
                  Start
                </button>
                <button
                  className="h-13 rounded-lg bg-amber-600 px-6 font-semibold text-white shadow-lg shadow-amber-600/30 transition-all duration-300 hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-amber-600"
                  disabled={!stopwatchRunning}
                  onClick={pauseStopwatch}
                  type="button"
                >
                  Pause
                </button>
                <button
                  className="h-13 rounded-lg border-2 border-white/20 bg-white/5 px-6 font-semibold text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/20 active:translate-y-0 backdrop-blur"
                  onClick={resetStopwatch}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Display */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-600/20 bg-emerald-600/5 p-6 backdrop-blur-lg sm:p-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400/70">
                  Time Remaining
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-5 flex-wrap">
                  <span className="font-black text-5xl text-white tabular-nums sm:text-6xl lg:text-8xl">{timerTime.main}</span>
                  <span className="text-xl text-emerald-300/80 font-semibold sm:text-2xl lg:text-3xl">.{timerTime.sub}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full w-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(timerProgress, 0), 100)}%` }}
                  />
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <NumberInput
                  disabled={timerRunning}
                  label="Hours"
                  max="23"
                  name="hours"
                  onChange={updateTimerInput}
                  value={timerInput.hours}
                />
                <NumberInput
                  disabled={timerRunning}
                  label="Minutes"
                  max="59"
                  name="minutes"
                  onChange={updateTimerInput}
                  value={timerInput.minutes}
                />
                <NumberInput
                  disabled={timerRunning}
                  label="Seconds"
                  max="59"
                  name="seconds"
                  onChange={updateTimerInput}
                  value={timerInput.seconds}
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white/70 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-600/10 hover:text-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 backdrop-blur"
                    disabled={timerRunning}
                    key={preset.label}
                    onClick={() => applyPreset(preset.minutes)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Buttons */}
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                <button
                  className="h-11 sm:h-12 rounded-lg bg-emerald-600 px-4 sm:px-6 font-semibold text-sm sm:text-base text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-emerald-600"
                  disabled={timerRunning || timerMs <= 0}
                  onClick={startTimer}
                  type="button"
                >
                  Start
                </button>
                <button
                  className="h-11 sm:h-12 rounded-lg bg-amber-600 px-4 sm:px-6 font-semibold text-sm sm:text-base text-white shadow-lg shadow-amber-600/30 transition-all duration-300 hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-amber-600"
                  disabled={!timerRunning}
                  onClick={pauseTimer}
                  type="button"
                >
                  Pause
                </button>
                <button
                  className="h-11 sm:h-12 rounded-lg border-2 border-white/20 bg-white/5 px-4 sm:px-6 font-semibold text-sm sm:text-base text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/20 active:translate-y-0 backdrop-blur"
                  onClick={resetTimer}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4 content-start sm:gap-6">
          {/* Status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">
              Status
            </p>
            <h2 className="mt-4 text-xl font-bold text-white leading-tight">
              {activeTool === "stopwatch"
                ? stopwatchRunning
                  ? "Running"
                  : stopwatchMs > 0
                    ? "Paused"
                    : "Ready"
                : timerRunning
                  ? "Counting"
                  : timerMs === 0
                    ? "Finished"
                    : "Set"}
            </h2>
            <p className="mt-3 text-sm text-white/60">
              {activeTool === "stopwatch"
                ? "Track elapsed time"
                : "Set a countdown"}
            </p>
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400/70">
              Instructions
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>Click Start to begin</li>
              <li>Use Pause to hold time</li>
              <li>Reset clears all data</li>
              <li>Inputs lock while running</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;
