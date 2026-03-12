import React from 'react'
import { Icon } from '@iconify/react'

const NavItem = ({ item, onClick, variant = 'light' }) => {
    const isDark = variant === 'dark'

    const activeClass = isDark
        ? 'bg-forest-green/30 text-white border border-forest-green/40'
        : 'bg-forest-green/30 text-dark-slate border border-forest-green/30 shadow-md shadow-forest-green/10'

    const inactiveClass = isDark
        ? 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent'
        : 'text-dark-slate/85 hover:bg-white/50 hover:text-dark-slate border border-transparent'

    return (
        <button
            type='button'
            onClick={() => onClick?.(item)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all duration-300 hover:translate-x-1 active:translate-x-0 active:scale-[0.99] ${item.active ? activeClass : inactiveClass}`}
        >
            <Icon icon={item.icon} width='19' height='19' />
            <span>{item.label}</span>
        </button>
    )
}

export default NavItem
