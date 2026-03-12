import React from 'react'

const SidebarProfile = ({ username = 'Sarah Jensen', dark = false }) => {
    const cardClass = dark
        ? 'rounded-xl border border-white/10 bg-white/10 px-3 py-3'
        : 'rounded-xl border border-forest-green/20 bg-white/70 px-3 py-3'

    const badgeClass = dark
        ? 'h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold'
        : 'h-9 w-9 rounded-full bg-forest-green/20 flex items-center justify-center text-dark-slate font-semibold'

    const nameClass = dark ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-dark-slate'
    const planClass = dark ? 'text-xs text-white/70' : 'text-xs text-text-muted'

    return (
        <div className={`${cardClass} animate-fade-in-up hover:-translate-y-0.5 transition-all duration-300`}>
            <div className='flex items-center gap-3'>
                <div className={badgeClass}>
                    {username?.slice(0, 1)?.toUpperCase() || 'U'}
                </div>
                <div>
                    <p className={nameClass}>{username}</p>
                    <p className={planClass}>Pro Plan</p>
                </div>
            </div>
        </div>
    )
}

export default SidebarProfile
