import React from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router'

const sections = [
    {
        id: 'start',
        title: '1. Start A New EventDP Project',
        body: 'From Dashboard, click Create New EventDP. Upload a high-quality image (recommended 1080x1080 or above) to get better guest download quality.',
        tips: [
            'Use clear titles so your project is easy to search later.',
            'Leave enough empty visual space where guest photo/text zones will be placed.',
        ],
    },
    {
        id: 'zones',
        title: '2. Configure Guest Zones',
        body: 'In Design Studio, set your guest photo zone and optional text zones. Position these where guest content should appear in the final downloadable image.',
        tips: [
            'Choose circle zone for profile-style pictures.',
            'Use square/rounded zone for banners, cards, and certificates.',
            'Keep text zones away from very bright background areas for readability.',
        ],
    },
    {
        id: 'publish',
        title: '3. Publish And Share',
        body: 'Set an expiry date, publish the EventDP, and share the generated link. Guests can upload, preview, and download in PNG/JPG.',
        tips: [
            'Set realistic expiry dates for campaigns.',
            'Test your public link on mobile before posting.',
        ],
    },
    {
        id: 'track',
        title: '4. Track Results',
        body: 'Monitor download activity and campaign usage from your dashboard history and project analytics.',
        tips: [
            'Unpublish an EventDP if you need to edit it again.',
            'Deleting removes active access but keeps a history audit trail.',
        ],
    },
]

const LearningGuide = () => {
    return (
        <main className='min-h-screen bg-pale-sage text-dark-slate'>
            <div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8'>
                <div className='rounded-2xl border border-forest-green/20 bg-white/80 backdrop-blur-sm p-6 sm:p-8'>
                    <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div>
                            <p className='text-xs uppercase tracking-[0.2em] text-forest-green font-semibold'>Tutorial Guide</p>
                            <h1 className='text-3xl sm:text-4xl font-extrabold mt-2'>EventDP Learning Center</h1>
                            <p className='text-text-muted mt-3 max-w-3xl'>
                                This guide walks you through the full EventDP flow: creating a project,
                                configuring zones, publishing for guests, and managing updates safely.
                            </p>
                        </div>
                        <Link
                            to='/dashboard'
                            className='inline-flex items-center gap-2 rounded-xl border border-forest-green/25 bg-pale-sage px-4 py-2.5 text-sm font-semibold hover:bg-white transition-colors'
                        >
                            <Icon icon='mdi:arrow-left' width='18' height='18' />
                            Back To Dashboard
                        </Link>
                    </div>
                </div>

                <section className='mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5'>
                    <article className='lg:col-span-2 rounded-2xl border border-forest-green/15 bg-white p-5 sm:p-6'>
                        <h2 className='text-xl font-bold'>Step-by-Step Tutorial</h2>
                        <div className='mt-4 space-y-5'>
                            {sections.map((section) => (
                                <div key={section.id} className='rounded-xl border border-forest-green/10 bg-pale-sage/45 p-4'>
                                    <h3 className='text-lg font-bold'>{section.title}</h3>
                                    <p className='text-sm text-dark-slate/85 mt-2'>{section.body}</p>
                                    <div className='mt-3 space-y-2'>
                                        {section.tips.map((tip) => (
                                            <div key={tip} className='flex items-start gap-2'>
                                                <Icon icon='mdi:check-circle-outline' width='16' height='16' className='mt-0.5 text-forest-green' />
                                                <p className='text-sm text-dark-slate/80'>{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className='rounded-2xl border border-forest-green/15 bg-white p-5 sm:p-6'>
                        <h2 className='text-xl font-bold'>App In Action</h2>
                        <p className='text-sm text-text-muted mt-2'>Reference checklist while building campaigns.</p>

                        <div className='mt-4 space-y-3'>
                            <div className='rounded-xl border border-forest-green/15 bg-pale-sage p-3'>
                                <p className='text-xs uppercase tracking-wide text-text-muted'>Host Workflow</p>
                                <p className='text-sm font-semibold mt-1'>Dashboard {'->'} Studio {'->'} Publish</p>
                            </div>
                            <div className='rounded-xl border border-forest-green/15 bg-pale-sage p-3'>
                                <p className='text-xs uppercase tracking-wide text-text-muted'>Guest Workflow</p>
                                <p className='text-sm font-semibold mt-1'>Open Link {'->'} Upload {'->'} Preview {'->'} Download</p>
                            </div>
                            <div className='rounded-xl border border-forest-green/15 bg-pale-sage p-3'>
                                <p className='text-xs uppercase tracking-wide text-text-muted'>Recommended Assets</p>
                                <p className='text-sm font-semibold mt-1'>Square 1080x1080 or Portrait 1080x1920</p>
                            </div>
                        </div>

                        <div className='mt-5 rounded-xl border border-dashed border-forest-green/30 p-4'>
                            <p className='text-xs uppercase tracking-wide text-text-muted'>Note</p>
                            <p className='text-sm mt-1 text-dark-slate/85'>
                                Add product screenshots to client/public for richer visual documentation.
                                You can then embed them in this guide with regular image tags.
                            </p>
                        </div>
                    </article>
                </section>
            </div>
        </main>
    )
}

export default LearningGuide
