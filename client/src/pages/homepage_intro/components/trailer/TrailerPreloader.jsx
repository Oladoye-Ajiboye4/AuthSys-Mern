const loadingDots = Array.from({ length: 6 }, (_, index) => index)

export default function TrailerPreloader({
    visible = false,
    progress = 0,
    loaded = 0,
    total = 0,
    item = '',
}) {
    if (!visible) {
        return null
    }

    const safeProgress = Math.max(0, Math.min(100, Math.round(progress)))

    return (
        <div className='fixed inset-0 z-50 overflow-hidden bg-slate-950 text-white'>
            <div
                className='absolute inset-0'
                style={{
                    backgroundImage: 'radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 35%), radial-gradient(circle at 80% 20%, rgba(56,189,248,0.12), transparent 28%), radial-gradient(circle at 50% 85%, rgba(15,23,42,0.92), rgba(2,6,23,0.98))',
                }}
            />

            <div
                className='absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/12 blur-3xl'
                style={{ animation: 'pulse 4.8s ease-in-out infinite alternate' }}
            />
            <div
                className='absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl'
                style={{ animation: 'pulse 5.6s ease-in-out infinite alternate-reverse' }}
            />
            <div
                className='absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl'
                style={{ animation: 'pulse 6.4s ease-in-out infinite alternate' }}
            />

            <div className='relative flex h-full items-center justify-center px-6'>
                <div className='w-full max-w-md rounded-4xl border border-white/10 bg-white/5 px-6 py-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:px-8 sm:py-10'>
                    <div className='mb-7 flex items-center justify-center'>
                        <div className='relative flex h-24 w-24 items-center justify-center'>
                            <div
                                className='absolute inset-0 rounded-full border border-emerald-400/25'
                                style={{ animation: 'spin 12s linear infinite' }}
                            />
                            <div
                                className='absolute inset-3 rounded-full border border-cyan-300/20'
                                style={{ animation: 'spin 8s linear infinite reverse' }}
                            />
                            <div className='absolute inset-6 rounded-full bg-emerald-400/15 blur-sm' />
                            <div className='relative flex items-center gap-1.5'>
                                {loadingDots.map((dot) => (
                                    <span
                                        key={dot}
                                        className='h-2.5 w-2.5 rounded-full bg-emerald-300'
                                        style={{
                                            opacity: 0.35 + (dot * 0.1),
                                            transform: `translateY(${dot % 2 === 0 ? '-3px' : '3px'})`,
                                            animation: 'pulse 1.4s ease-in-out infinite',
                                            animationDelay: `${dot * 0.12}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-3 text-center'>
                        <p className='text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300/85'>
                            Rendering trailer
                        </p>
                        <h2 className='text-3xl font-black tracking-tight text-white sm:text-4xl'>
                            Drawing pixels...
                        </h2>
                        <p className='mx-auto max-w-sm text-sm leading-6 text-slate-300'>
                            The trailer is loading in the background. This keeps the experience smooth while the scene,
                            lighting, and assets finish preparing.
                        </p>
                    </div>

                    <div className='mt-7 space-y-3'>
                        <div className='h-2 overflow-hidden rounded-full bg-white/10'>
                            <div
                                className='h-full rounded-full bg-linear-to-r from-emerald-400 via-cyan-300 to-emerald-200 transition-[width] duration-300 ease-out'
                                style={{ width: `${safeProgress}%` }}
                            />
                        </div>

                        <div className='flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400'>
                            <span>{safeProgress}%</span>
                            <span>
                                {loaded}/{total || 0} assets
                            </span>
                        </div>

                        <div className='h-6 overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
                            <div className='flex items-center gap-2 text-[11px] font-medium text-slate-300'>
                                <span className='inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.65)]' />
                                <span className='truncate'>
                                    {item ? `Loading ${item}` : 'Preparing visuals'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}