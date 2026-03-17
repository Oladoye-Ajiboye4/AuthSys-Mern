import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Icon } from '@iconify/react'
import { getPublicEventDP } from '../create_EventDP/logic/draftSync'

const PublicEventDP = () => {
    const { slug } = useParams()
    const [loading, setLoading] = useState(true)
    const [eventDP, setEventDP] = useState(null)

    useEffect(() => {
        const fetchEventDP = async () => {
            try {
                setLoading(true)
                const response = await getPublicEventDP({ slug })
                setEventDP(response.eventDP || null)
            } catch (error) {
                console.error('Failed to load public EventDP:', error)
                setEventDP(null)
            } finally {
                setLoading(false)
            }
        }

        fetchEventDP()
    }, [slug])

    if (loading) {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center'>
                <div className='text-center space-y-3'>
                    <div className='h-12 w-12 rounded-full border-4 border-dusty-green/35 border-t-forest-green animate-spin mx-auto' />
                    <p className='text-sm font-semibold text-dark-slate'>Loading EventDP...</p>
                </div>
            </main>
        )
    }

    if (!eventDP) {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center px-4'>
                <div className='max-w-md w-full rounded-2xl bg-white border border-dusty-green/30 p-6 text-center'>
                    <Icon icon='mdi:link-off' width='36' height='36' className='mx-auto text-dark-slate/65' />
                    <h1 className='text-xl font-bold text-dark-slate mt-3'>Link not available</h1>
                    <p className='text-sm text-dark-slate/65 mt-2'>This EventDP link is invalid or no longer active.</p>
                </div>
            </main>
        )
    }

    return (
        <main className='min-h-screen bg-pale-sage px-4 py-8'>
            <div className='max-w-3xl mx-auto space-y-4'>
                <header className='rounded-2xl border border-dusty-green/30 bg-white p-4 sm:p-6'>
                    <p className='text-[11px] uppercase tracking-[0.15em] font-bold text-forest-green'>Published EventDP</p>
                    <h1 className='text-2xl sm:text-3xl font-extrabold text-dark-slate mt-2'>
                        {eventDP.asset?.originalFilename || 'Shared EventDP'}
                    </h1>
                    <p className='text-sm text-dark-slate/65 mt-1'>
                        Published {eventDP.publish?.publishedAt ? new Date(eventDP.publish.publishedAt).toLocaleString() : 'N/A'}
                    </p>
                </header>

                <article className='overflow-hidden rounded-2xl border border-dusty-green/30 bg-white shadow-lg'>
                    <img
                        src={eventDP.asset?.secureUrl}
                        alt={eventDP.asset?.originalFilename || 'EventDP'}
                        className='w-full h-auto object-cover'
                    />
                </article>
            </div>
        </main>
    )
}

export default PublicEventDP
