import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<PlaceholderPage title="Search" />} />
        <Route path="library" element={<PlaceholderPage title="Library" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
      </Route>
    </Routes>
  )
}
