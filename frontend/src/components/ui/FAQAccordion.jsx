import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQAccordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <div key={item.question} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-lg backdrop-blur-xl">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white transition hover:bg-slate-900/80"
              onClick={() => setActiveIndex(isActive ? -1 : index)}
            >
              <span className="text-base font-semibold">{item.question}</span>
              <ChevronDown className={`h-5 w-5 transition ${isActive ? 'rotate-180 text-violet-300' : 'text-slate-400'}`} />
            </button>
            <div className={`${isActive ? 'max-h-96 py-4' : 'max-h-0'} overflow-hidden transition-all duration-300 px-5 text-sm text-slate-300`}> 
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
