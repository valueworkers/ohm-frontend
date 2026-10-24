import { Navigate, useSearchParams } from 'react-router-dom'
import { isTenantAuthenticated } from '../api/tenantAuth'
import OwnerProfile from './OwnerProfile'
import MyTenants from './MyTenants'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'tenants', label: 'My tenants' },
]

function AccountHub() {
  const canAccess = isTenantAuthenticated()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab =
    TABS.some((tab) => tab.id === searchParams.get('tab'))
      ? searchParams.get('tab')
      : 'profile'

  if (!canAccess) {
    return <Navigate to="/login" replace />
  }

  function selectTab(tabId) {
    setSearchParams(tabId === 'profile' ? {} : { tab: tabId }, { replace: true })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Account
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Profile &amp; tenants
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage your profile and organizations.
      </p>

      <div
        className="mt-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
        role="tablist"
        aria-label="Profile and tenants"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6" role="tabpanel">
        {activeTab === 'profile' ? <OwnerProfile embedded /> : null}
        {activeTab === 'tenants' ? <MyTenants embedded /> : null}
      </div>
    </div>
  )
}

export default AccountHub
