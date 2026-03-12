import React from 'react'
import { Link } from 'react-router'

const SidebarBrand = ({ dark = false }) => {
    const textClass = dark ? 'text-white' : 'text-dark-slate'

    return (
        <Link to='/' className='shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all duration-300'>
            <div className='w-8 h-8 rounded-lg bg-forest-green flex items-center justify-center text-white font-bold text-lg'>
                E
            </div>
            <span className={`font-bold text-xl tracking-tight ${textClass}`}>
                EventDP
            </span>
        </Link>
    )
}

export default SidebarBrand
