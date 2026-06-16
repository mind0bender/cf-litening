import { JSX } from "react";
import { useStopwatch } from "react-timer-hook";
import { LucideTimerOff, LucideTimerReset, TimerIcon } from "lucide-react";

export default function StopWatch(): JSX.Element {
  const { seconds, minutes, hours, isRunning, start, pause, reset } = useStopwatch({
    autoStart: false,
  });

  return (
    <div className="flex gap-2 justify-center items-center text-stone-300">
      <div title={isRunning ? "Pause" : "Start"}>
        {isRunning ? (
          <LucideTimerOff className="cursor-pointer" onClick={(): void => pause()} size={16} />
        ) : (
          <TimerIcon className="cursor-pointer" onClick={(): void => start()} size={16} />
        )}
      </div>
      <h1 className="text-base">
        {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </h1>
      {seconds + minutes + hours !== 0 || isRunning ? (
        <div title="Reset">
          <LucideTimerReset
            className="cursor-pointer"
            size={16}
            onClick={(): void => reset(new Date(), false)}
          />
        </div>
      ) : (
        <div className="w-4" />
      )}
    </div>
  );
}
