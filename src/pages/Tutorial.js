import React, { useState } from 'react';
import './Tutorial.css';

const Tutorial = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedTutorials, setCompletedTutorials] = useState({});

  const tutorials = [
    {
      id: 1,
      title: 'Dashboard Overview',
      category: 'Getting Started',
      description: 'Learn how to navigate the main dashboard',
      content: 'The Dashboard is your central hub for monitoring energy systems. Key sections include: Real-time metrics display, System health status, Quick action buttons, and Navigation menu.',
      duration: '5 min',
      steps: ['Access Dashboard', 'View Real-time Metrics', 'Check System Status']
    },
    {
      id: 2,
      title: 'Energy Report Analysis',
      category: 'Analytics',
      description: 'Master the energy reporting system',
      content: 'The Laporan (Report) page provides comprehensive energy analysis. You can: View multiple time periods (1h, 6h, 24h, 7d, 30d), Export data as CSV or JSON, Analyze efficiency trends.',
      duration: '8 min',
      steps: ['Select Time Period', 'Analyze Charts', 'Export Data']
    },
    {
      id: 3,
      title: 'Master Data Management',
      category: 'Configuration',
      description: 'Manage and organize your device configurations',
      content: 'Master Data section allows you to: Add new devices to the system, Edit existing device configurations, Delete obsolete entries, Search and filter devices.',
      duration: '7 min',
      steps: ['Add Device', 'Edit Device', 'Manage Devices']
    },
    {
      id: 4,
      title: 'Transformer Monitoring',
      category: 'Operations',
      description: 'Real-time monitoring of transformer units',
      content: 'Trafo monitoring provides: Multiple unit overview, Load and temperature tracking, Voltage stability monitoring, Current flow analysis.',
      duration: '6 min',
      steps: ['Select Unit', 'Monitor Metrics', 'View Analytics']
    },
    {
      id: 5,
      title: 'Weather Station Integration',
      category: 'Monitoring',
      description: 'Monitor weather conditions affecting system',
      content: 'Weather Station tracks: Current temperature and humidity, Atmospheric pressure changes, Wind speed monitoring, 7-day forecast.',
      duration: '5 min',
      steps: ['View Weather Data', 'Check Forecast', 'Review Alerts']
    },
    {
      id: 6,
      title: 'Live Stream Analytics',
      category: 'Advanced',
      description: 'Advanced streaming analytics and monitoring',
      content: 'WSLive provides: Stream status and performance metrics, Network bandwidth tracking, CPU/Memory/Disk monitoring, Active stream management.',
      duration: '9 min',
      steps: ['Monitor Stream', 'Check Performance', 'Manage Recordings']
    },
    {
      id: 7,
      title: 'System Navigation',
      category: 'Getting Started',
      description: 'Navigate efficiently through all system pages',
      content: 'The navigation system includes: Main navbar with quick access links, Sidebar menu for detailed options, Search functionality, Mobile-responsive design.',
      duration: '4 min',
      steps: ['Explore Navbar', 'Use Sidebar', 'Learn Shortcuts']
    },
    {
      id: 8,
      title: 'Real-time Updates',
      category: 'Features',
      description: 'Understanding real-time data synchronization',
      content: 'Real-time updates powered by Socket.IO: Live data refresh every 1-2 seconds, Connection status indicators, Auto-reconnect on disconnect.',
      duration: '6 min',
      steps: ['Enable Real-time', 'Monitor Updates', 'Check Connection']
    },
    {
      id: 9,
      title: 'Export & Reporting',
      category: 'Data',
      description: 'Export data for external analysis',
      content: 'Export capabilities include: CSV format for spreadsheet analysis, JSON format for API integration, Custom date range selection, Summary statistics.',
      duration: '7 min',
      steps: ['Select Export Format', 'Configure Options', 'Download File']
    },
    {
      id: 10,
      title: 'Mobile Responsive Design',
      category: 'Features',
      description: 'Access the system from any device',
      content: 'Responsive design supports: Desktop (1920x1080+), Tablet (768px-1024px), Mobile (320px-480px). All features are accessible on smaller screens.',
      duration: '5 min',
      steps: ['Test Responsive', 'Resize Window', 'Try Mobile View']
    },
    {
      id: 11,
      title: 'Dark Theme Design',
      category: 'Interface',
      description: 'Eye-friendly dark theme for extended use',
      content: 'Dark theme features: OLED-optimized colors, Reduced eye strain, Professional appearance. Improves readability in low-light environments.',
      duration: '3 min',
      steps: ['Explore Colors', 'Check Contrast', 'View Components']
    },
    {
      id: 12,
      title: 'Troubleshooting Guide',
      category: 'Support',
      description: 'Common issues and solutions',
      content: 'Troubleshooting common problems: Connection issues, Data not updating, Export failures. Each section includes: Problem description, Symptoms, Solutions.',
      duration: '8 min',
      steps: ['Identify Issue', 'Find Solution', 'Apply Fix']
    }
  ];

  const filteredTutorials = tutorials.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkComplete = (id) => {
    setCompletedTutorials(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentTutorial = tutorials[currentSlide];
  const completedCount = Object.values(completedTutorials).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / tutorials.length) * 100);

  return (
    <div className="tutorial-container">
      <div className="tutorial-header">
        <h1> Interactive Tutorial System</h1>
        <p>Master all features with guided walkthroughs</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: completionPercentage + '%' }}></div>
          <span className="progress-text">{completedCount}/{tutorials.length} Completed ({completionPercentage}%)</span>
        </div>
      </div>

      <div className="tutorial-search">
        <input type="text" placeholder="Search tutorials by title, topic, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="tutorial-layout">
        <div className="tutorial-sidebar">
          <h2>Tutorials ({filteredTutorials.length})</h2>
          <div className="tutorial-list">
            {filteredTutorials.map((t) => (
              <div key={t.id} className={'tutorial-item' + (currentSlide === t.id - 1 ? ' active' : '') + (completedTutorials[t.id] ? ' completed' : '')} onClick={() => setCurrentSlide(t.id - 1)}>
                <div className="item-header">
                  <span className="category-badge">{t.category}</span>
                  {completedTutorials[t.id] && <span className="checkmark"></span>}
                </div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <span className="duration">{t.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tutorial-main">
          {filteredTutorials.length > 0 ? (
            <>
              <div className="tutorial-viewer">
                <div className="tutorial-content">
                  <div className="content-header">
                    <span className="slide-counter">{currentSlide + 1} / {tutorials.length}</span>
                    <span className={'category-badge featured ' + currentTutorial.category.toLowerCase().replace(/ /g, '-')}>{currentTutorial.category}</span>
                  </div>
                  <h1>{currentTutorial.title}</h1>
                  <p className="subtitle">{currentTutorial.description}</p>
                  <div className="content-body">
                    <p>{currentTutorial.content}</p>
                    <div className="steps-section">
                      <h3>Steps to follow:</h3>
                      <ol>
                        {currentTutorial.steps.map((step, idx) => (<li key={idx}>{step}</li>))}
                      </ol>
                    </div>
                    <div className="duration-info">
                      <span>Duration: {currentTutorial.duration}</span>
                    </div>
                  </div>
                  <div className="tutorial-actions">
                    <button className="btn-complete" onClick={() => handleMarkComplete(currentTutorial.id)}>
                      {completedTutorials[currentTutorial.id] ? ' Completed' : 'Mark as Complete'}
                    </button>
                  </div>
                </div>
                <div className="tutorial-navigation">
                  <button className="btn-nav" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}> Previous</button>
                  <span className="slide-info">{currentSlide + 1} of {tutorials.length}</span>
                  <button className="btn-nav" onClick={() => setCurrentSlide(Math.min(tutorials.length - 1, currentSlide + 1))} disabled={currentSlide === tutorials.length - 1}>Next </button>
                </div>
              </div>
              <div className="faq-section">
                <h3>Quick FAQ</h3>
                <div className="faq-items">
                  <div className="faq-item">
                    <q>How do I get started?</q>
                    <p>Start with Dashboard Overview tutorial first.</p>
                  </div>
                  <div className="faq-item">
                    <q>Can I access offline?</q>
                    <p>Tutorials are loaded from the application.</p>
                  </div>
                  <div className="faq-item">
                    <q>How long to complete all?</q>
                    <p>Approximately 60-70 minutes for all 12 tutorials.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No tutorials found matching \"{searchQuery}\"</p>
              <button onClick={() => setSearchQuery('')}>Clear Search</button>
            </div>
          )}
        </div>
      </div>

      <div className="tutorial-footer">
        <div className="stats-summary">
          <div className="stat">
            <span className="label">Total Tutorials</span>
            <span className="value">{tutorials.length}</span>
          </div>
          <div className="stat">
            <span className="label">Completed</span>
            <span className="value">{completedCount}</span>
          </div>
          <div className="stat">
            <span className="label">Remaining</span>
            <span className="value">{tutorials.length - completedCount}</span>
          </div>
          <div className="stat">
            <span className="label">Completion</span>
            <span className="value">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
