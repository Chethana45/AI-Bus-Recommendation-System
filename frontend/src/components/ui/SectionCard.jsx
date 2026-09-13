const SectionCard = ({ title, description, icon, children }) => (
  <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

export default SectionCard;
