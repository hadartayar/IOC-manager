import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import IndicatorsPage from './pages/IndicatorsPage.jsx'
import SourcesPage from './pages/SourcesPage.jsx'
import TagsPage from './pages/TagsPage.jsx'
import NotFound from './pages/NotFound.jsx'
import './index.css'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route index element={<Navigate to='/indicators' />} />
        <Route path='indicators' element={<IndicatorsPage />} />
        <Route path='sources' element={<SourcesPage />} />
        <Route path='tags' element={<TagsPage />} />
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
