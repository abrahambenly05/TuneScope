import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AlbumDetailPage from './pages/AlbumDetailPage'
import ArtistDetailPage from './pages/ArtistDetailPage'
import GenreDetailPage from './pages/GenreDetailPage'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'
import SearchPage from './pages/SearchPage'
import TrackDetailPage from './pages/TrackDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="tracks/:id" element={<TrackDetailPage />} />
        <Route path="artists/:id" element={<ArtistDetailPage />} />
        <Route path="albums/:id" element={<AlbumDetailPage />} />
        <Route path="genres/:id" element={<GenreDetailPage />} />
        <Route path="library" element={<PlaceholderPage title="Library" />} />
        <Route path="profile" element={<PlaceholderPage title="Profile" />} />
      </Route>
    </Routes>
  )
}
