import React, { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'

const TEXT_ALIGN_OPTIONS = [
    { value: 'left', icon: 'mdi:format-align-left' },
    { value: 'center', icon: 'mdi:format-align-center' },
    { value: 'right', icon: 'mdi:format-align-right' },
]

const TEXT_TRANSFORM_OPTIONS = [
    { value: 'none', label: 'Normal' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
]

const SettingsPanel = ({
    // zone shape
    zoneShapes,
    zoneShape,
    onSelectZoneShape,
    committedZone,
    onClearZone,
    // canvas info
    canvasDimensions,
    cornerRadius,
    onRadiusChange,
    // guest text
    allowGuestText,
    onToggleGuestText,
    activeCanvasTool,
    onSelectCanvasTool,
    textZones,
    activeTextZoneIndex,
    onSelectTextZone,
    onAddTextZone,
    maxTextZones,
    onClearTextZone,
    guestTextStyle,
    onGuestTextStyleChange,
    fontOptions,
    fontWeightOptions,
    fontCatalogError,
    disabled,
    className,
    onClose,
}) => {
    const zoneEntries = Object.entries(zoneShapes)
    const safeFontOptions = Array.isArray(fontOptions) && fontOptions.length > 0
        ? fontOptions
        : [guestTextStyle.fontFamily || 'Poppins']
    const safeWeightOptions = Array.isArray(fontWeightOptions) && fontWeightOptions.length > 0
        ? fontWeightOptions
        : [{ value: guestTextStyle.fontWeight || 700, label: String(guestTextStyle.fontWeight || 700) }]
    const [fontQuery, setFontQuery] = useState('')

    // Filter fonts by query (case-insensitive)
    const filteredFontOptions = useMemo(() => {
        if (!fontQuery) return safeFontOptions
        const q = fontQuery.trim().toLowerCase()
        return safeFontOptions.filter((f) => String(f || '').toLowerCase().includes(q))
    }, [safeFontOptions, fontQuery])

    return (
        <aside className={`${className || 'w-80 bg-white border-l border-dusty-green/25 flex-col overflow-y-auto hidden xl:flex animate-slide-in-right'} ${disabled ? 'opacity-70' : ''}`}>
            <fieldset disabled={disabled} className='contents'>
                <div className='p-6 border-b border-dusty-green/15 flex items-start justify-between gap-3'>
                    <div>
                        <p className='text-[10px] font-bold text-forest-green tracking-[0.15em] uppercase mb-1'>Design Properties</p>
                        <h3 className='font-bold text-2xl text-dark-slate'>Template Settings</h3>
                    </div>
                    {onClose && (
                        <button
                            type='button'
                            onClick={onClose}
                            className='h-9 w-9 rounded-lg border border-dusty-green/35 text-dark-slate/75 hover:bg-pale-sage transition-colors'
                            aria-label='Close settings panel'
                        >
                            <Icon icon='mdi:close' width='18' height='18' className='mx-auto' />
                        </button>
                    )}
                </div>

                {/* ── Guest Photo Zone ────────────────────────────────────────── */}
                <div className='p-6 border-b border-dusty-green/15 space-y-4'>
                    <div>
                        <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Guest Photo Zone</label>
                        <p className='text-[11px] text-dark-slate/55 mt-1'>
                            Pick a shape, then drag on your uploaded image to mark where guests will place their photo.
                        </p>
                    </div>

                    {/* shape picker */}
                    <div className='grid grid-cols-2 gap-2'>
                        {zoneEntries.map(([key, shape]) => {
                            const isActive = zoneShape === key
                            return (
                                <button
                                    key={key}
                                    type='button'
                                    onClick={() => onSelectZoneShape(key)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-colors ${isActive
                                        ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                        : 'border-dusty-green/35 text-dark-slate/70 hover:bg-pale-sage'}`}
                                >
                                    <Icon icon={shape.icon} width='20' height='20' />
                                    <span className='mt-1'>{shape.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* radius — only relevant for square */}
                    {zoneShape === 'square' && (
                        <div className='space-y-2 pt-1'>
                            <div className='flex justify-between text-[11px] text-dark-slate'>
                                <span>Corner Radius</span>
                                <span className='font-bold'>{cornerRadius}px</span>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-pale-sage rounded-lg'>
                                    <Icon icon='mdi:rounded-corner' width='18' height='18' />
                                </div>
                                <input
                                    type='range'
                                    min='0'
                                    max='52'
                                    value={cornerRadius}
                                    onChange={(event) => onRadiusChange(Number(event.target.value))}
                                    className='flex-1 accent-forest-green h-1.5'
                                />
                            </div>
                        </div>
                    )}

                    {committedZone && (
                        <button
                            type='button'
                            onClick={onClearZone}
                            className='text-[11px] text-dark-slate/65 underline hover:text-dark-slate'
                        >
                            Clear selected zone
                        </button>
                    )}

                    {/* canvas dimensions for reference */}
                    <div className='grid grid-cols-2 gap-3 pt-1'>
                        <div className='space-y-1'>
                            <span className='text-[10px] text-dark-slate/60'>Image Width</span>
                            <div className='bg-pale-sage p-2 rounded-lg text-xs font-mono text-center'>{canvasDimensions.width}px</div>
                        </div>
                        <div className='space-y-1'>
                            <span className='text-[10px] text-dark-slate/60'>Image Height</span>
                            <div className='bg-pale-sage p-2 rounded-lg text-xs font-mono text-center'>{canvasDimensions.height}px</div>
                        </div>
                    </div>
                </div>

                {/* ── Guest Custom Text ─────────────────────────────────────── */}
                <div className='p-6 border-t border-dusty-green/15 space-y-4'>
                    <div className='flex items-start justify-between gap-3'>
                        <div>
                            <label className='text-xs font-bold text-dark-slate uppercase tracking-wider'>Guest Custom Text</label>
                            <p className='text-[11px] text-dark-slate/55 mt-1'>
                                Allow guests to add personalized text in a dedicated editable zone.
                            </p>
                        </div>
                        <button
                            type='button'
                            onClick={onToggleGuestText}
                            aria-pressed={allowGuestText}
                            className={`inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full border text-[10px] font-bold tracking-wide uppercase transition-colors ${allowGuestText
                                ? 'bg-forest-green text-white border-forest-green'
                                : 'bg-white text-dark-slate/70 border-dusty-green/35 hover:bg-pale-sage'}`}
                        >
                            <Icon icon={allowGuestText ? 'mdi:check-circle' : 'mdi:close-circle-outline'} width='14' height='14' />
                            <span>{allowGuestText ? 'On' : 'Off'}</span>
                        </button>
                    </div>

                    {allowGuestText && (
                        <>
                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-[11px] text-dark-slate/70 font-medium'>Text Areas</span>
                                    <button
                                        type='button'
                                        onClick={onAddTextZone}
                                        disabled={textZones.length >= maxTextZones}
                                        className='inline-flex items-center gap-1 rounded-lg px-2.5 h-8 text-[10px] font-bold uppercase tracking-wide bg-dark-slate text-white disabled:opacity-35 disabled:cursor-not-allowed'
                                    >
                                        <Icon icon='mdi:plus' width='14' height='14' />
                                        Add Area
                                    </button>
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    {[0, 1].map((slotIndex) => {
                                        const exists = slotIndex < textZones.length
                                        const isSelected = activeTextZoneIndex === slotIndex

                                        return (
                                            <button
                                                key={`text-slot-${slotIndex}`}
                                                type='button'
                                                disabled={!exists}
                                                onClick={() => onSelectTextZone(slotIndex)}
                                                className={`h-9 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${isSelected
                                                    ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                                    : exists
                                                        ? 'border-dusty-green/40 text-dark-slate/75 hover:bg-pale-sage'
                                                        : 'border-dusty-green/20 text-dark-slate/35 bg-pale-sage/45 cursor-not-allowed'}`}
                                            >
                                                {exists ? `Text Area ${slotIndex + 1}` : `Slot ${slotIndex + 1} Empty`}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className='text-[10px] text-dark-slate/55'>
                                    Maximum of {maxTextZones} text areas.
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <span className='text-[11px] text-dark-slate/70 font-medium'>Canvas Target</span>
                                <div className='grid grid-cols-2 gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => onSelectCanvasTool('photo')}
                                        className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[11px] font-bold tracking-wide uppercase ${activeCanvasTool === 'photo'
                                            ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                            : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                    >
                                        <Icon icon='mdi:image-area' width='14' height='14' />
                                        Photo Zone
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => onSelectCanvasTool('text')}
                                        className={`inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[11px] font-bold tracking-wide uppercase ${activeCanvasTool === 'text'
                                            ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                            : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                    >
                                        <Icon icon='mdi:format-text-rotation-none' width='14' height='14' />
                                        Text Zone
                                    </button>
                                </div>
                                <p className='text-[10px] text-dark-slate/55'>
                                    Select Text Zone, then drag on canvas to place and resize where guest text will appear.
                                </p>
                            </div>

                            {Number.isInteger(activeTextZoneIndex) && (
                                <button
                                    type='button'
                                    onClick={() => onClearTextZone(activeTextZoneIndex)}
                                    className='text-[11px] text-dark-slate/65 underline hover:text-dark-slate'
                                >
                                    Clear selected text area
                                </button>
                            )}

                            <div className='space-y-2'>
                                <span className='text-[11px] text-dark-slate/70 font-medium'>Default Guest Text</span>
                                <textarea
                                    value={guestTextStyle.text}
                                    maxLength={90}
                                    onChange={(event) => onGuestTextStyleChange({ text: event.target.value.slice(0, 90) })}
                                    className='w-full rounded-xl border border-dusty-green/35 bg-pale-sage/50 px-3 py-2 text-xs text-dark-slate outline-none focus:border-forest-green'
                                    style={{
                                        fontFamily: guestTextStyle.fontFamily,
                                        fontWeight: guestTextStyle.fontWeight,
                                        fontStyle: guestTextStyle.fontStyle,
                                        textDecoration: guestTextStyle.textDecoration,
                                        textTransform: guestTextStyle.textTransform,
                                        fontSize: `${Math.max(12, Math.min(Number(guestTextStyle.fontSize) || 12, 26))}px`,
                                        color: guestTextStyle.color,
                                        letterSpacing: `${guestTextStyle.letterSpacing}px`,
                                        lineHeight: guestTextStyle.lineHeight,
                                        textAlign: guestTextStyle.textAlign,
                                    }}
                                    rows={3}
                                    placeholder='Type sample text shown in preview'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-2'>
                                <label className='space-y-1'>
                                    <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Font</span>
                                    <div className='relative'>
                                        <input
                                            type='search'
                                            value={fontQuery}
                                            onChange={(e) => setFontQuery(e.target.value)}
                                            placeholder='Search fonts…'
                                            className='w-full h-9 rounded-lg border border-dusty-green/35 bg-white px-3 text-xs text-dark-slate outline-none focus:border-forest-green'
                                        />
                                        <select
                                            value={guestTextStyle.fontFamily}
                                            onChange={(event) => onGuestTextStyleChange({ fontFamily: event.target.value })}
                                            className='w-full h-9 rounded-lg border border-dusty-green/35 bg-white px-2 text-xs text-dark-slate outline-none focus:border-forest-green mt-2'
                                        >
                                            {filteredFontOptions.length > 0 ? (
                                                filteredFontOptions.map((font) => (
                                                    <option key={font} value={font}>{font}</option>
                                                ))
                                            ) : (
                                                <option value={guestTextStyle.fontFamily || ''} disabled>No fonts found</option>
                                            )}
                                        </select>
                                    </div>
                                    {fontCatalogError ? (
                                        <p className='text-[10px] text-red-600'>{fontCatalogError}</p>
                                    ) : null}
                                </label>
                                <label className='space-y-1'>
                                    <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Weight</span>
                                    <select
                                        value={guestTextStyle.fontWeight}
                                        onChange={(event) => onGuestTextStyleChange({ fontWeight: Number(event.target.value) })}
                                        className='w-full h-9 rounded-lg border border-dusty-green/35 bg-white px-2 text-xs text-dark-slate outline-none focus:border-forest-green'
                                    >
                                        {safeWeightOptions.map((weight) => (
                                            <option key={weight.value} value={weight.value}>{weight.label}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Size</span>
                                        <span className='text-[10px] font-bold text-dark-slate'>{guestTextStyle.fontSize}px</span>
                                    </div>
                                    <input
                                        type='range'
                                        min='12'
                                        max='220'
                                        value={guestTextStyle.fontSize}
                                        onChange={(event) => onGuestTextStyleChange({ fontSize: Number(event.target.value) })}
                                        className='w-full accent-forest-green h-1.5'
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Color</span>
                                    <label className='h-9 rounded-lg border border-dusty-green/35 bg-white px-2 flex items-center gap-2'>
                                        <input
                                            type='color'
                                            value={guestTextStyle.color}
                                            onChange={(event) => onGuestTextStyleChange({ color: event.target.value })}
                                            className='h-5 w-6 border-0 bg-transparent p-0'
                                        />
                                        <span className='text-[10px] font-mono text-dark-slate/75'>{guestTextStyle.color}</span>
                                    </label>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Letter Spacing</span>
                                    <span className='text-[10px] font-bold text-dark-slate'>{guestTextStyle.letterSpacing}px</span>
                                </div>
                                <input
                                    type='range'
                                    min='-1'
                                    max='12'
                                    step='0.5'
                                    value={guestTextStyle.letterSpacing}
                                    onChange={(event) => onGuestTextStyleChange({ letterSpacing: Number(event.target.value) })}
                                    className='w-full accent-forest-green h-1.5'
                                />
                            </div>

                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Line Height</span>
                                    <span className='text-[10px] font-bold text-dark-slate'>{guestTextStyle.lineHeight.toFixed(2)}</span>
                                </div>
                                <input
                                    type='range'
                                    min='0.9'
                                    max='2'
                                    step='0.05'
                                    value={guestTextStyle.lineHeight}
                                    onChange={(event) => onGuestTextStyleChange({ lineHeight: Number(event.target.value) })}
                                    className='w-full accent-forest-green h-1.5'
                                />
                            </div>

                            <div className='space-y-2'>
                                <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Text Style</span>
                                <div className='grid grid-cols-3 gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => onGuestTextStyleChange({
                                            fontStyle: guestTextStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                                        })}
                                        className={`h-9 rounded-lg border flex items-center justify-center text-xs font-semibold ${guestTextStyle.fontStyle === 'italic'
                                            ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                            : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                        aria-pressed={guestTextStyle.fontStyle === 'italic'}
                                        title='Italic'
                                    >
                                        <span className='italic'>I</span>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => onGuestTextStyleChange({
                                            textDecoration: guestTextStyle.textDecoration === 'underline' ? 'none' : 'underline',
                                        })}
                                        className={`h-9 rounded-lg border flex items-center justify-center text-xs font-semibold ${guestTextStyle.textDecoration === 'underline'
                                            ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                            : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                        aria-pressed={guestTextStyle.textDecoration === 'underline'}
                                        title='Underline'
                                    >
                                        <span className='underline'>U</span>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => onGuestTextStyleChange({
                                            textDecoration: guestTextStyle.textDecoration === 'line-through' ? 'none' : 'line-through',
                                        })}
                                        className={`h-9 rounded-lg border flex items-center justify-center text-xs font-semibold ${guestTextStyle.textDecoration === 'line-through'
                                            ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                            : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                        aria-pressed={guestTextStyle.textDecoration === 'line-through'}
                                        title='Strikethrough'
                                    >
                                        <span className='line-through'>S</span>
                                    </button>
                                </div>
                            </div>

                            <div className='space-y-1'>
                                <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Case</span>
                                <select
                                    value={guestTextStyle.textTransform}
                                    onChange={(event) => onGuestTextStyleChange({ textTransform: event.target.value })}
                                    className='w-full h-9 rounded-lg border border-dusty-green/35 bg-white px-2 text-xs text-dark-slate outline-none focus:border-forest-green'
                                >
                                    {TEXT_TRANSFORM_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='space-y-2'>
                                <span className='text-[10px] font-semibold text-dark-slate/65 uppercase'>Text Align</span>
                                <div className='grid grid-cols-3 gap-2'>
                                    {TEXT_ALIGN_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type='button'
                                            onClick={() => onGuestTextStyleChange({ textAlign: option.value })}
                                            className={`h-9 rounded-lg border flex items-center justify-center ${guestTextStyle.textAlign === option.value
                                                ? 'border-2 border-forest-green bg-forest-green/10 text-forest-green'
                                                : 'border-dusty-green/40 text-dark-slate/70 hover:bg-pale-sage'}`}
                                        >
                                            <Icon icon={option.icon} width='16' height='16' />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </fieldset>
        </aside>
    )
}

export default SettingsPanel