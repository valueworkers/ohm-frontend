import './App.css'
import homepageImage from './assets/new pic.jpeg'
import newPic from './assets/adver.jpeg'

function App() {
  return (
    <div className="coming-soon-container">
      <div className="content-wrapper">
        <div className="logo-section">
          <div className="logo-container">
            <h1 className="logo-text">
              Senior Care Directory
              <span className="logo-icon">📍</span>
            </h1>
            <p className="tagline">The Easiest Way to Find Senior Care</p>
          </div>
        </div>
        <div className="homepage-image-container new-pic-container">
          <img 
            src={newPic} 
            alt="Senior Care Directory Homepage" 
            className="homepage-image"
          />
        </div>
        <div className="homepage-image-container">
          <img 
            src={homepageImage} 
            alt="Senior Care Directory Homepage" 
            className="homepage-image"
          />
        </div>

        <div className="coming-soon-card">
          <div className="icon-wrapper">
            <div className="icon-circle">
              <svg className="construction-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <h1 className="coming-soon-title">
            <span className="title-main">Coming Soon</span>
            <span className="title-underline"></span>
          </h1>
          
          <p className="coming-soon-message">
            We're crafting an exceptional experience to help you find the perfect senior care services.
          </p>
          
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="progress-text">We're working hard to bring you something amazing</p>
          </div>

          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span className="feature-text">Search Members</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span className="feature-text">Review & Compare</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span className="feature-text">Connect Easily</span>
            </div>
          </div>
        </div>

        <div className="footer-note">
          <p>Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  )
}

export default App
