import React from 'react'
import { Icon } from '@iconify/react'
import { LEFT_NAV_ITEMS } from '../constants'

const StudioSidebar = ({
    activeMenu,
    onMenuChange,
    onCollapse,
    storage = { maxEvents: 5, usedEvents: 0, remainingEvents: 5 },
    onStorageDetailsClick,
}) => {
    const maxEvents = Math.max(1, Number(storage?.maxEvents || 5))
    const usedEvents = Math.max(0, Number(storage?.usedEvents || 0))
    const remainingEvents = Math.max(0, Number(storage?.remainingEvents ?? (maxEvents - usedEvents)))
    const storageProgress = Math.max(0, Math.min(100, Math.round((usedEvents / maxEvents) * 100)))
    const isLimitReached = remainingEvents <= 0

    return (
        <aside className='w-72 bg-dark-slate text-white flex-col border-r border-white/10 hidden lg:flex animate-slide-in-left'>
            <div className='p-6 flex items-start justify-between gap-3'>
                <div>
                    <h2 className='font-bold text-2xl'>Design Studio</h2>
                    <p className='text-xs text-white/45 tracking-[0.16em] uppercase mt-1'>Event Frame Generator</p>
                </div>
                <button
                    type='button'
                    onClick={onCollapse}
                    className='h-9 w-9 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center'
                    aria-label='Hide design studio sidebar'
                >
                    <Icon icon='mdi:chevron-left' width='20' height='20' />
                </button>
            </div>

            <div className='flex-1 px-4 space-y-2'>
                {LEFT_NAV_ITEMS.map((item) => {
                    const isActive = activeMenu === item.id
                    return (
                        <button
                            key={item.id}
                            type='button'
                            onClick={() => onMenuChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                ? 'bg-forest-green text-white shadow-lg shadow-forest-green/25'
                                : 'text-white/80 hover:bg-white/10'}`}
                        >
                            <Icon icon={item.icon} width='19' height='19' />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>

            <div className='p-6'>
                <div className='bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3'>
                    <div className='flex items-center justify-between gap-3'>
                        <p className='text-[10px] font-bold text-dusty-green uppercase tracking-[0.16em]'>Project Slots</p>
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isLimitReached ? 'text-red-300' : 'text-white/55'}`}>
                            {remainingEvents > 0 ? `${remainingEvents} left` : 'Limit reached'}
                        </span>
                    </div>
                    <div className='h-2 w-full bg-white/10 rounded-full overflow-hidden'>
                        <div
                            className='h-full bg-dusty-green rounded-full transition-all duration-500'
                            style={{ width: `${storageProgress}%` }}
                        />
                    </div>
                    <div className='flex items-center justify-between gap-2 text-[11px] text-white/55'>
                        <p>{usedEvents} / {maxEvents} projects used</p>
                        <p>{storageProgress}% full</p>
                    </div>
                    {isLimitReached && (
                        <button
                            type='button'
                            onClick={onStorageDetailsClick}
                            className='w-full h-9 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/10 hover:bg-white/15 transition-colors'
                        >
                            View storage info
                        </button>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default StudioSidebar