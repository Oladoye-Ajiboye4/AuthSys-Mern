import React, { useState, useEffect, useRef } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Icon } from '@iconify/react'
import SidebarBrand from './components/navItems/SidebarBrand'
import SidebarProfile from './components/navItems/SidebarProfile'
import NavItemsGroup from './components/navItems/NavItemsGroup'
import { primaryNavItems, secondaryNavItems } from './components/navItems/navItemsConfig'


const Dashboard = () => {
  const dashboardUrl = `${import.meta.env.VITE_BASE_URL}getDashboard`
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [recentEvents, setRecentEvents] = useState([])
  const [eventHistory, setEventHistory] = useState([])
  const [storage, setStorage] = useState({ maxEvents: 5, usedEvents: 0, remainingEvents: 5 })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const hasWelcomedRef = useRef(false)
  const navigate = useNavigate()

  function notify(username) {
    toast.success(`Welcome back, ${username || 'User'}!`, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
  }

  function errorNotify(errorMessage) {
    toast.error(`${errorMessage}`, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      errorNotify('No token found. Please sign in again.')
      setTimeout(() => navigate('/signin'), 1500)
      return
    }

    axios.get(dashboardUrl, {
      params: debouncedSearch ? { search: debouncedSearch } : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.status === 200) {
          setUser(result.data.user)
          setRecentEvents(Array.isArray(result.data.recentEventDPs) ? result.data.recentEventDPs : [])
          setEventHistory(Array.isArray(result.data.eventHistory) ? result.data.eventHistory : [])
          setStorage(result.data.storage || { maxEvents: 5, usedEvents: 0, remainingEvents: 5 })
          setLoading(false)
          if (!hasWelcomedRef.current) {
            notify(result.data.user?.username)
            hasWelcomedRef.current = true
          }
        } else if (result.status === 401 || result.status === 500 || result.status === 404) {
          setLoading(false)
          errorNotify(result.data.message)
        } else {
          setLoading(false)
          errorNotify('Unexpected server response. Try again later')
        }
      })
      .catch((error) => {
        setLoading(false)
        errorNotify(error?.response?.data?.message || 'Failed to fetch dashboard data')
      })
  }, [navigate, debouncedSearch, dashboardUrl])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully!', {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'light',
      transition: Bounce,
    })
    setTimeout(() => navigate('/signin'), 1000)
  }

  const handleNavItemClick = (item) => {
    setMobileSidebarOpen(false)

    if (item?.id === 'create-eventdp') {
      navigate('/create-eventdp')
      return
    }

    if (item?.id === 'dashboard') {
      navigate('/dashboard')
      return
    }

    if (item?.id === 'settings') {
      navigate('/settings')
      return
    }

    if (item?.id === 'learning-guide') {
      navigate('/learning-guide')
      return
    }
  }

  const openDraftInStudio = (draftId) => {
    if (!draftId) {
      return
    }

    navigate(`/create-eventdp?draft=${encodeURIComponent(draftId)}`)
  }

  const getStatusPillClass = (status) => {
    return status === 'published'
      ? 'bg-forest-green text-white'
      : 'bg-dark-slate/70 text-white'
  }

  const formatHistoryAction = (action) => {
    if (action === 'created') return 'Draft created'
    if (action === 'published') return 'Published and link generated'
    if (action === 'deleted') return 'Deleted (history preserved)'
    return action || 'Updated'
  }

  const handleDeleteEventDP = async (draftId, eventName) => {
    const token = localStorage.getItem('token')
    if (!token) {
      errorNotify('No token found. Please sign in again.')
      return
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}createEventDP/drafts/${draftId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        toast.success(`${eventName} has been deleted.`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        })
        setDeleteTarget(null)
        // Refresh dashboard
        window.location.reload()
      }
    } catch (error) {
      errorNotify(error?.response?.data?.message || 'Failed to delete EventDP')
    }
  }

  const handleUnpublishEventDP = async (draftId, eventName) => {
    const token = localStorage.getItem('token')
    if (!token) {
      errorNotify('No token found. Please sign in again.')
      return
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}createEventDP/${draftId}/unpublish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 200) {
        toast.success(`${eventName} has been unpublished. You can now edit it.`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        })
        setOpenMenuId(null)
        // Refresh dashboard
        window.location.reload()
      }
    } catch (error) {
      errorNotify(error?.response?.data?.message || 'Failed to unpublish EventDP')
    }
  }

  const getStatsCards = () => {
    const publishedCount = recentEvents.filter((e) => e.status === 'published').length
    const totalEvents = Number(storage.usedEvents || 0)
    const activeCount = recentEvents.filter((e) => e.status === 'published').length

    return [
      {
        id: 'events',
        title: 'Total Events',
        value: totalEvents.toString(),
        helper: `${publishedCount} published`,
        icon: 'mdi:calendar-check-outline',
      },
      {
        id: 'published',
        title: 'Published Events',
        value: publishedCount.toString(),
        helper: `${activeCount} active`,
        icon: 'mdi:cloud-download-outline',
      },
      {
        id: 'member-since',
        title: 'Member Since',
        value: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : 'N/A',
        helper: user.plan ? `${user.plan} Plan` : 'Pro Plan',
        icon: 'mdi:badge-outline',
      },
    ]
  }

  const storageProgress = Math.max(0, Math.min(100, Math.round(((storage.usedEvents || 0) / Math.max(1, storage.maxEvents || 1)) * 100)))

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-pale-sage flex items-center justify-center px-4'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-14 w-14 border-4 border-dusty-green/30 border-t-forest-green mx-auto'></div>
          <p className='text-dark-slate font-semibold'>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className='min-h-screen bg-pale-sage text-dark-slate animate-fade-in'>
      <div className='min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]'>
        <aside className='hidden lg:flex lg:sticky lg:top-0 flex-col border-r border-forest-green/20 bg-dark-slate/95 text-white p-5 animate-slide-in-left h-screen overflow-hidden'>
          <SidebarBrand dark />

          <div className='mt-8 flex-1 space-y-7 animate-fade-in-up overflow-y-auto max-h-[calc(100vh-280px)]' style={{ animationDelay: '120ms' }}>
            <NavItemsGroup items={primaryNavItems} onItemClick={handleNavItemClick} variant='dark' />
          </div>

          <div className='space-y-4 animate-fade-in-up' style={{ animationDelay: '220ms' }}>
            <NavItemsGroup items={secondaryNavItems} onItemClick={handleNavItemClick} variant='dark' />
            <SidebarProfile username={user.username || 'User'} dark />
            <div className='rounded-xl border border-white/10 bg-white/10 px-3 py-3'>
              <p className='text-[10px] font-bold text-dusty-green uppercase tracking-[0.16em] mb-2'>Storage Usage</p>
              <div className='h-2 w-full rounded-full bg-white/15 overflow-hidden'>
                <div
                  className='h-full rounded-full bg-dusty-green transition-all duration-500'
                  style={{ width: `${storageProgress}%` }}
                />
              </div>
              <p className='mt-2 text-xs text-white/75'>{storage.usedEvents || 0} / {storage.maxEvents || 5} projects used</p>
            </div>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div className='fixed inset-0 z-40 bg-dark-slate/60 lg:hidden' onClick={() => setMobileSidebarOpen(false)}></div>
        )}

        <aside className={`fixed top-0 left-0 z-50 h-full w-[84%] max-w-[320px] bg-white border-r border-forest-green/20 p-5 lg:hidden transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='flex items-center justify-between'>
            <SidebarBrand />
            <button
              type='button'
              onClick={() => setMobileSidebarOpen(false)}
              className='h-9 w-9 rounded-lg border border-forest-green/20 hover:bg-forest-green/10 hover:rotate-90 transition duration-300'
              aria-label='Close sidebar'
            >
              <Icon icon='mdi:close' width='20' height='20' className='mx-auto' />
            </button>
          </div>

          <div className='mt-8 flex flex-col h-[calc(100%-4rem)] justify-between'>
            <NavItemsGroup items={primaryNavItems} onItemClick={handleNavItemClick} />
            <div className='space-y-4'>
              <NavItemsGroup items={secondaryNavItems} onItemClick={handleNavItemClick} />
              <SidebarProfile username={user.username || 'User'} />
            </div>
          </div>
        </aside>

        <section className='relative min-w-0 overflow-hidden animate-fade-in'>
          <div className='absolute inset-0 pointer-events-none'>
            <div className='absolute -top-24 -left-8 h-56 w-56 rounded-full bg-forest-green/20 blur-3xl animate-float'></div>
            <div className='absolute top-10 right-6 h-56 w-56 rounded-full bg-dusty-green/20 blur-3xl animate-float-delayed'></div>
          </div>

          <div className='relative p-4 sm:p-6 lg:p-8'>
            <header className='flex flex-wrap items-center justify-between gap-4 mb-7 animate-fade-in-up'>
              <button
                type='button'
                onClick={() => setMobileSidebarOpen(true)}
                className='lg:hidden h-11 w-11 rounded-xl border border-forest-green/20 bg-white/80 backdrop-blur hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300'
                aria-label='Open sidebar'
              >
                <Icon icon='mdi:menu' width='23' height='23' className='mx-auto' />
              </button>

              <div className='flex-1 min-w-60'>
                <h1 className='text-2xl sm:text-3xl font-extrabold'>Welcome back, {user.username || 'there'}!</h1>
                <p className='text-sm sm:text-base text-text-muted mt-1'>Here&apos;s what&apos;s happening with your events today.</p>
              </div>

              <div className='flex items-center gap-3 ml-auto'>
                <div className='hidden sm:flex items-center gap-2 rounded-xl border border-forest-green/20 bg-white/80 px-3 py-2 min-w-65'>
                  <Icon icon='mdi:magnify' width='18' height='18' className='text-text-muted' />
                  <input
                    type='text'
                    placeholder='Search by project title...'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className='w-full bg-transparent text-sm placeholder:text-text-muted/80 outline-none'
                  />
                </div>

                <button type='button' className='h-11 w-11 rounded-xl border border-forest-green/20 bg-white/80 hover:bg-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300'>
                  <Icon icon='mdi:bell-outline' width='21' height='21' className='mx-auto' />
                </button>

                <button
                  onClick={handleLogout}
                  className='hidden sm:flex items-center gap-2 bg-forest-green hover:bg-[#48614F] text-white px-4 py-2.5 rounded-xl font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-forest-green/30 hover:shadow-forest-green/40'
                >
                  <Icon icon='mdi:logout' width='18' height='18' />
                  <span>Logout</span>
                </button>
              </div>
            </header>

            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-7'>
              {getStatsCards().map((card, index) => (
                <article
                  key={card.id}
                  className='rounded-2xl border border-forest-green/15 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-forest-green/10 animate-fade-in-up hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-green/15 transition-all duration-300'
                  style={{ animationDelay: `${120 + (index * 120)}ms` }}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-sm text-text-muted'>{card.title}</p>
                      <p className='text-4xl font-extrabold mt-1'>{card.value}</p>
                      <p className='text-sm text-forest-green mt-2'>↗ {card.helper}</p>
                    </div>
                    <div className='h-12 w-12 rounded-xl bg-forest-green/15 text-forest-green flex items-center justify-center animate-scale-in'>
                      <Icon icon={card.icon} width='22' height='22' />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className='grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-7'>
              <div className='rounded-2xl border border-forest-green/15 bg-white/70 p-5 animate-fade-in-up' style={{ animationDelay: '260ms' }}>
                <div className='flex items-center gap-2 mb-4'>
                  <Icon icon='mdi:lightning-bolt-outline' width='18' height='18' className='text-forest-green' />
                  <h2 className='text-2xl font-bold'>Quick Actions</h2>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <article
                    onClick={() => navigate('/create-eventdp')}
                    className='rounded-2xl border border-dashed border-forest-green/50 bg-pale-sage p-5 text-center hover:bg-white hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                  >
                    <div className='h-16 w-16 mx-auto rounded-full bg-forest-green/20 flex items-center justify-center text-forest-green mb-4 animate-bounce-slow'>
                      <Icon icon='mdi:plus' width='31' height='31' />
                    </div>
                    <h3 className='text-xl font-bold'>Create New EventDP</h3>
                    <p className='text-text-muted mt-2'>Launch a new customized frame campaign for your attendees.</p>
                  </article>

                  <article className='rounded-2xl border border-forest-green/20 bg-pale-sage p-5 hover:bg-white hover:-translate-y-1 transition-all duration-300'>
                    <div className='h-10 w-10 rounded-lg bg-white text-forest-green flex items-center justify-center mb-4'>
                      <Icon icon='mdi:school-outline' width='20' height='20' />
                    </div>
                    <h3 className='text-2xl font-bold'>Learning Center</h3>
                    <p className='text-text-muted mt-2'>Learn how to maximize your event reach with our guide.</p>
                    <button
                      type='button'
                      onClick={() => navigate('/learning-guide')}
                      className='mt-5 text-forest-green font-semibold hover:underline hover:translate-x-1 transition-transform duration-300'
                    >
                      Read Guide →
                    </button>
                  </article>
                </div>
              </div>

              <div className='rounded-2xl border border-forest-green/15 bg-white/70 p-5 space-y-5 animate-fade-in-up' style={{ animationDelay: '360ms' }}>
                <div>
                  <p className='text-xs uppercase tracking-[0.18em] text-text-muted font-semibold'>Account Snapshot</p>
                  <p className='text-3xl font-extrabold mt-2'>Active</p>
                  <p className='text-text-muted text-sm mt-1'>All systems are healthy and running.</p>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-xl bg-pale-sage p-3 border border-forest-green/15'>
                    <p className='text-xs text-text-muted uppercase'>Email</p>
                    <p className='font-semibold'>{user.email || 'N/A'}</p>
                  </div>
                  <div className='rounded-xl bg-pale-sage p-3 border border-forest-green/15'>
                    <p className='text-xs text-text-muted uppercase'>Member Since</p>
                    <p className='font-semibold'>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className='sm:hidden w-full bg-forest-green hover:bg-[#48614F] text-white px-4 py-2.5 rounded-xl font-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300'
                >
                  Logout
                </button>
              </div>
            </section>

            <section className='rounded-2xl border border-forest-green/15 bg-white/80 p-5 animate-fade-in-up' style={{ animationDelay: '460ms' }}>
              <div className='flex items-center justify-between gap-4 mb-4'>
                <div className='flex items-center gap-2'>
                  <Icon icon='mdi:history' width='18' height='18' className='text-forest-green' />
                  <h2 className='text-2xl font-bold'>Recent Events</h2>
                </div>
                <button type='button' className='text-sm font-semibold text-forest-green hover:underline'>View All</button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {recentEvents.map((event, index) => (
                  <article
                    key={event.id}
                    className='overflow-hidden rounded-2xl border border-forest-green/15 bg-white animate-fade-in-up hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-forest-green/15'
                    style={{ animationDelay: `${560 + (index * 120)}ms` }}
                  >
                    <div className='relative h-36'>
                      <img src={event.image} alt={event.name} className='h-full w-full object-cover transition-transform duration-500 hover:scale-105' />
                      <div className='absolute top-2 right-2'>
                        <div className='relative'>
                          <button
                            type='button'
                            onClick={() => setOpenMenuId(openMenuId === `recent-${event.id}` ? null : `recent-${event.id}`)}
                            className='h-8 w-8 rounded-lg bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all'
                            aria-label='Options'
                          >
                            <Icon icon='mdi:dots-vertical' width='18' height='18' />
                          </button>
                          {openMenuId === `recent-${event.id}` && (
                            <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-forest-green/15 z-50 overflow-hidden'>
                              {event.status === 'published' && (
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleUnpublishEventDP(event.id, event.name)
                                  }}
                                  className='w-full text-left px-4 py-2 text-sm hover:bg-pale-sage text-dark-slate flex items-center gap-2 transition-colors'
                                >
                                  <Icon icon='mdi:lock-open-outline' width='16' height='16' />
                                  Unpublish & Edit
                                </button>
                              )}
                              <button
                                type='button'
                                onClick={() => setDeleteTarget({ draftId: event.id, eventName: event.name })}
                                className='w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors border-t border-forest-green/15'
                              >
                                <Icon icon='mdi:delete-outline' width='16' height='16' />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`absolute left-3 bottom-3 rounded-md px-2 py-1 text-xs font-bold ${getStatusPillClass(event.status)}`}>
                        {String(event.status || '').toUpperCase()}
                      </span>
                    </div>
                    <div className='p-4'>
                      <h3 className='text-2xl font-bold leading-tight'>{event.name}</h3>
                      <p className='text-sm text-text-muted mt-1'>Published {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>

                      <div className='mt-4 grid grid-cols-2 gap-4 border-t border-forest-green/15 pt-3'>
                        <div>
                          <p className='text-xs uppercase text-text-muted'>Link</p>
                          <a href={event.publicUrl} target='_blank' rel='noreferrer' className='text-sm font-extrabold text-forest-green hover:underline'>
                            Open
                          </a>
                        </div>
                        <div>
                          <p className='text-xs uppercase text-text-muted'>Slug</p>
                          <p className='text-sm font-extrabold'>{event.slug || 'N/A'}</p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => openDraftInStudio(event.id)}
                        className='mt-3 w-full h-9 rounded-lg border border-forest-green/25 bg-pale-sage text-sm font-semibold text-dark-slate hover:bg-white transition-colors'
                      >
                        Open in Studio
                      </button>
                    </div>

                  </article>
                ))}
                {recentEvents.length === 0 && (
                  <div className='col-span-full rounded-xl border border-dashed border-forest-green/35 p-6 text-center text-sm text-text-muted'>
                    No published EventDP yet. Create one and generate your link.
                  </div>
                )}
              </div>
            </section>

            <section className='rounded-2xl border border-forest-green/15 bg-white/80 p-5 mt-5 animate-fade-in-up'>
              <div className='flex items-center gap-2 mb-4'>
                <Icon icon='mdi:timeline-text-outline' width='18' height='18' className='text-forest-green' />
                <h2 className='text-2xl font-bold'>EventDP History</h2>
              </div>

              <div className='space-y-2'>
                {eventHistory.map((item) => (
                  <div key={item.id} className='rounded-xl border border-forest-green/15 bg-white p-3 flex items-center justify-between gap-3 group relative'>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-dark-slate'>{item.name}</p>
                      <p className='text-xs text-text-muted mt-0.5'>{formatHistoryAction(item.action)}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='text-right'>
                        <p className='text-xs font-semibold text-dark-slate/75'>{item.at ? new Date(item.at).toLocaleString() : 'N/A'}</p>
                        <button
                          type='button'
                          onClick={() => openDraftInStudio(item.draftId)}
                          disabled={Boolean(item.deleted)}
                          className='text-xs text-dark-slate font-semibold hover:underline'
                        >
                          {item.deleted ? 'Deleted' : 'Open in Studio'}
                        </button>
                        {item.publicUrl && (
                          <a href={item.publicUrl} target='_blank' rel='noreferrer' className='text-xs text-forest-green font-semibold hover:underline ml-2'>
                            Open Link
                          </a>
                        )}
                      </div>
                      <div className='relative'>
                        <button
                          type='button'
                          onClick={() => setOpenMenuId(openMenuId === `history-${item.id}` ? null : `history-${item.id}`)}
                          className='h-7 w-7 rounded opacity-0 group-hover:opacity-100 bg-pale-sage hover:bg-white flex items-center justify-center transition-all'
                          aria-label='Options'
                        >
                          <Icon icon='mdi:dots-vertical' width='16' height='16' />
                        </button>
                        {openMenuId === `history-${item.id}` && (
                          <div className='absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-forest-green/15 z-50 overflow-hidden'>
                            {item.action === 'published' && !item.deleted && (
                              <button
                                type='button'
                                onClick={() => {
                                  handleUnpublishEventDP(item.draftId, item.name)
                                }}
                                className='w-full text-left px-3 py-2 text-sm hover:bg-pale-sage text-dark-slate flex items-center gap-2 transition-colors text-nowrap'
                              >
                                <Icon icon='mdi:lock-open-outline' width='16' height='16' />
                                Unpublish & Edit
                              </button>
                            )}
                            <button
                              type='button'
                              onClick={() => setDeleteTarget({ draftId: item.draftId, eventName: item.name })}
                              disabled={Boolean(item.deleted)}
                              className='w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors border-t border-forest-green/15 text-nowrap'
                            >
                              <Icon icon='mdi:delete-outline' width='16' height='16' />
                              {item.deleted ? 'Already Deleted' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {eventHistory.length === 0 && (
                  <div className='rounded-xl border border-dashed border-forest-green/35 p-6 text-center text-sm text-text-muted'>
                    No EventDP history yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/40'>
          <div className='bg-white rounded-2xl p-6 max-w-sm shadow-2xl border border-forest-green/15'>
            <p className='text-lg font-bold text-dark-slate'>Delete "{deleteTarget.eventName}"?</p>
            <p className='text-sm text-text-muted mt-2'>The EventDP will be removed from active projects, but history will be preserved for auditing.</p>
            <div className='flex gap-3 mt-6'>
              <button
                type='button'
                onClick={() => setDeleteTarget(null)}
                className='flex-1 px-4 py-2 rounded-lg border border-forest-green/25 text-dark-slate font-semibold hover:bg-pale-sage transition-colors'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => handleDeleteEventDP(deleteTarget.draftId, deleteTarget.eventName)}
                className='flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position='top-center' theme='light' transition={Bounce} />
    </main>
  )
}

export default Dashboard