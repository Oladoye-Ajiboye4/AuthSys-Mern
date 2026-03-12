import React from 'react'
import NavItem from './NavItem'

const NavItemsGroup = ({ items, onItemClick, className = '', variant = 'light' }) => {
    return (
        <div className={`space-y-2 animate-fade-in-up ${className}`}>
            {items.map((item) => (
                <NavItem key={item.id} item={item} onClick={onItemClick} variant={variant} />
            ))}
        </div>
    )
}

export default NavItemsGroup
