import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import EventTypesPage from './pages/EventTypesPage';
import AvailabilityPage from './pages/AvailabilityPage';
import BookingPage from './pages/BookingPage';
import MeetingsPage from './pages/MeetingsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/event-types" replace />} />
          <Route path="event-types" element={<EventTypesPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
