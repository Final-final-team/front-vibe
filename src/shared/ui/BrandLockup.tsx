type Props = {
  compact?: boolean;
  inverse?: boolean;
  caption?: string;
  className?: string;
};

export default function BrandLockup({ compact = false, inverse = false, caption, className }: Props) {
  return (
    <div className={['flex items-center gap-3', className ?? ''].join(' ').trim()}>
      <div
        className={[
          'relative flex items-center justify-center overflow-hidden rounded-[20px] border',
          compact ? 'h-10 w-10' : 'h-12 w-12',
          inverse
            ? 'border-lime-400/55 bg-[#081121]'
            : 'border-slate-200 bg-[linear-gradient(145deg,#071120,#132242)]',
        ].join(' ')}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,230,53,0.18),transparent_62%)]" />
        <div className="relative flex items-center gap-1">
          <span className={['block rounded-full bg-lime-300', compact ? 'h-5 w-1.5' : 'h-6 w-1.5'].join(' ')} />
          <span className={['block rounded-full bg-white', compact ? 'h-5 w-1.5' : 'h-6 w-1.5'].join(' ')} />
          <span
            className={[
              'absolute rounded-full bg-lime-300',
              compact ? 'left-[5px] top-[8px] h-1.5 w-4.5' : 'left-[6px] top-[10px] h-1.5 w-5.5',
            ].join(' ')}
          />
        </div>
      </div>
      <div className="min-w-0">
        {caption ? (
          <div
            className={[
              'truncate text-[10px] font-semibold uppercase tracking-[0.18em]',
              inverse ? 'text-lime-300/80' : 'text-slate-500',
            ].join(' ')}
          >
            {caption}
          </div>
        ) : null}
        <div className={['truncate text-sm font-black tracking-[0.1em]', inverse ? 'text-white' : 'text-slate-950'].join(' ')}>
          HEY-A-JI
        </div>
        <div className={['truncate text-xs font-semibold', inverse ? 'text-lime-300' : 'text-slate-600'].join(' ')}>해야지, 바로.</div>
      </div>
    </div>
  );
}
