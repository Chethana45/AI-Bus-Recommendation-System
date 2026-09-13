const SectionTitle = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      {eyebrow ? <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">{eyebrow}</p> : null}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

export default SectionTitle;
