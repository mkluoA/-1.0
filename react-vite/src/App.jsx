import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'

function App() {
  return (
    <BrowserRouter data-qoder-id="qel-browserrouter-9d9a9667" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-browserrouter-9d9a9667&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;browserrouter&quot;,&quot;loc&quot;:{&quot;line&quot;:7,&quot;column&quot;:5}}">
      <Routes data-qoder-id="qel-routes-8f4163fa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-routes-8f4163fa&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;routes&quot;,&quot;loc&quot;:{&quot;line&quot;:8,&quot;column&quot;:7}}">
        <Route path="/" element={<LandingPage />}  data-qoder-id="qel-route-e0df725d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-e0df725d&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:9,&quot;column&quot;:9}}"/>
        <Route path="/dashboard" element={<DashboardPage />}  data-qoder-id="qel-route-d9df6758" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-route-d9df6758&quot;,&quot;filePath&quot;:&quot;react-vite/src/App.jsx&quot;,&quot;componentName&quot;:&quot;App&quot;,&quot;elementRole&quot;:&quot;route&quot;,&quot;loc&quot;:{&quot;line&quot;:10,&quot;column&quot;:9}}"/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
