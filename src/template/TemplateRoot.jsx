import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store'
import { TenantProvider } from './tenantContext'
import './index.css'
import './utils/axiosConfig'

function TemplateRoot({ slug, tenantId, basename }) {
  const routerBasename = basename || undefined

  return (
    <Provider store={store}>
      <TenantProvider slug={slug} tenantId={tenantId}>
        <BrowserRouter basename={routerBasename} key={routerBasename || 'tenant-root'}>
          <App />
        </BrowserRouter>
      </TenantProvider>
    </Provider>
  )
}

export default TemplateRoot
