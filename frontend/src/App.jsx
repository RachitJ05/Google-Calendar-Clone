import { useState, useRef, useEffect } from 'react';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';

export default function App() {
  const [currentView, setCurrentView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentDate, setCurrentDate] = useState({ date: new Date(), start: new Date(), end: new Date(), view: 'month' });
  const calendarApiRef = useRef(null);
  const [calendarApi, setCalendarApi] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSidebarDateSelect = (date) => {
    setSelectedDate(date);
    // Optionally navigate calendar to this date
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedEvent(null);
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <div className="app-layout">
        {sidebarOpen && (
          <Sidebar
            onDateSelect={handleSidebarDateSelect}
            onCreateClick={handleCreateClick}
            selectedDate={selectedDate}
          />
        )}
        <main className="main-content">
          <Calendar
            view={currentView}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onCreateClick={handleCreateClick}
            refreshTrigger={refreshTrigger}
            selectedDate={selectedDate}
            onCurrentDateChange={setCurrentDate}
            calendarApiRef={calendarApiRef}
            onCalendarApiReady={setCalendarApi}
          />
        </main>
      </div>
    </div>
  );
}
