import React from 'react'
import { Icon } from '@iconify/react'
import { LEFT_NAV_ITEMS } from '../constants'

const StudioSidebar = ({ activeMenu, onMenuChange, onCollapse }) => {
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
                <div className='bg-white/5 rounded-2xl p-4 border border-white/10'>
                    <p className='text-[10px] font-bold text-dusty-green uppercase tracking-[0.16em] mb-2'>Storage Usage</p>
                    <div className='h-1.5 w-full bg-white/10 rounded-full overflow-hidden'>
                        <div className='h-full bg-dusty-green w-3/4'></div>
                    </div>
                    <p className='text-[11px] text-white/50 mt-2'>75% of 2GB used</p>
                </div>
            </div>
        </aside>
    )
}

export default StudioSidebar