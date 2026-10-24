import { Navigate, useSearchParams } from 'react-router-dom'
import { isTenantAuthenticated } from '../api/tenantAuth'
import Roles from './Roles'
import CoOwners from './CoOwners'
import RoleAssignments from './RoleAssignments'

const TABS = [
  { id: 'roles', label: 'Roles' },
  { id: 'co-owners', label: 'Co-owners' },
  { id: 'assignments', label: 'Assignments' },
]

function AccessHub() {
  const canAccess = isTenantAuthenticated()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab =
    TABS.some((tab) => tab.id === searchParams.get('tab'))
      ? searchParams.get('tab')
      : 'roles'

  if (!canAccess) {
    return <Navigate to="/login" replace />
  }

  function selectTab(tabId) {
    setSearchParams(tabId === 'roles' ? {} : { tab: tabId }, { replace: true })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        Access
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Roles &amp; assignments
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage roles, co-owners, and role assignments.
      </p>

      <div
        className="mt-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
        role="tablist"
        aria-label="Roles and assignments"
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
        {activeTab === 'roles' ? <Roles embedded /> : null}
        {activeTab === 'co-owners' ? <CoOwners embedded /> : null}
        {activeTab === 'assignments' ? <RoleAssignments embedded /> : null}
      </div>
    </div>
  )
}

export default AccessHub
