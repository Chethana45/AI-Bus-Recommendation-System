import { Check } from 'lucide-react';

const Stepper = ({ steps, activeStep }) => (
  <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-white/10 bg-slate-900/60 p-2.5">
    {steps.map((step, index) => {
      const isActive = index === activeStep;
      const isDone = index < activeStep;
      return (
        <div key={step} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${isActive ? 'bg-violet-500 text-white' : isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
            {isDone ? <Check size={12} /> : index + 1}
          </div>
          <span className={`text-[12px] ${isActive ? 'text-white' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>{step}</span>
          {index < steps.length - 1 ? <div className="h-px w-4 bg-white/10" /> : null}
        </div>
      );
    })}
  </div>
);

export default Stepper;
