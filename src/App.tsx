import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import './App.css'
import ITEMS_DATA from './trips.json'

interface Photo {
  id: number;
  url: string;
  title: string;
  film: string;
  camera: string;
  orientation: 'landscape' | 'portrait' | 'unknown';
}

interface Item {
  id: string;
  title: string;
  date: string;
  highlightUrl: string;
  camera: string;
  lens: string;
  film: string;
  asa: string;
  photos: Photo[];
  type: 'trip' | 'album';
}

interface Camera {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  type: 'film' | 'digital';
  specs: {
    type: string;
    lens: string;
    shutter: string;
    year: string;
  };
}

const ITEMS: Item[] = ITEMS_DATA as Item[];
const TRIPS = ITEMS.filter(item => item.type === 'trip');
const ALBUMS = ITEMS.filter(item => item.type === 'album');

const CAMERAS: Camera[] = [
  {
    id: 'olympus-xa2',
    name: 'Olympus XA2',
    type: 'film',
    imageUrl: '/photos/0 - Cameras/Olympus_XA2_7890.webp',
    description: 'The Olympus XA2 is a point-and-shoot 35mm film camera, released in 1980. It features a zone-focusing system and a sharp 35mm f/3.5 lens.',
    specs: {
      type: 'Electronic Point & Shoot',
      lens: '35mm f/3.5 Zuiko',
      shutter: '1/2s – 1/750s',
      year: '1980'
    }
  },
  {
    id: 'contax-g2',
    name: 'Contax G2',
    type: 'film',
    imageUrl: '/photos/0 - Cameras/Contax_G2_Rangefinder.webp',
    description: 'The Contax G2 is an advanced 35mm autofocus rangefinder camera produced by Kyocera. It is widely considered one of the finest electronic film cameras ever made.',
    specs: {
      type: 'Autofocus Rangefinder',
      lens: 'Contax G Mount',
      shutter: '16s – 1/4000s (up to 1/6000s in Aperture Priority)',
      year: '1996'
    }
  },
  {
    id: 'canon-ae-1',
    name: 'Canon AE-1',
    type: 'film',
    imageUrl: '/photos/0 - Cameras/Canon_AE-1_with_50mm_f1.8_S.C._II.webp',
    description: 'The Canon AE-1 is a 35mm SLR (single-lens reflex) camera for use with interchangeable lenses. It was manufactured by Canon in Japan from April 1976 to 1984.',
    specs: {
      type: 'Single Lens Reflex (SLR)',
      lens: 'Canon FD Mount',
      shutter: '2s – 1/1000s',
      year: '1976'
    }
  },
  {
    id: 'fujifilm-x-t2',
    name: 'Fujifilm X-T2',
    type: 'digital',
    imageUrl: '/photos/0 - Cameras/Fujifilm_X-T2_20160716a.webp',
    description: 'The Fujifilm X-T2 is a professional-grade weather-sealed mirrorless camera. It is known for its tactile analog-style dials and excellent film simulations.',
    specs: {
      type: 'Mirrorless Digital',
      lens: 'Fujifilm X-mount',
      shutter: '30s – 1/8000s (1/32000s electronic)',
      year: '2016'
    }
  },
  {
    id: 'canon-g7x-ii',
    name: 'Canon G7 X Mark II',
    type: 'digital',
    imageUrl: '/photos/0 - Cameras/g7xii.webp',
    description: 'The PowerShot G7 X Mark II is a high-performance compact camera with a large 1.0-type sensor and a fast f/1.8-2.8 zoom lens.',
    specs: {
      type: 'Compact Digital',
      lens: '24-100mm (equiv.) f/1.8-2.8',
      shutter: '15s – 1/2000s',
      year: '2016'
    }
  },
  {
    id: 'canon-70d',
    name: 'Canon 70D',
    type: 'digital',
    imageUrl: '/photos/0 - Cameras/Canon_70D.webp',
    description: 'The Canon EOS 70D is a digital single-lens reflex camera by Canon. It is known for its Dual Pixel CMOS AF, which provides high-speed autofocus during video and live view.',
    specs: {
      type: 'Digital SLR',
      lens: 'Canon EF/EF-S Mount',
      shutter: '30s – 1/8000s',
      year: '2013'
    }
  }
];

const FILM_CAMERAS = CAMERAS.filter(c => c.type === 'film');
const DIGITAL_CAMERAS = CAMERAS.filter(c => c.type === 'digital');

function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="close-button" onClick={onClose}>&times;</button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt={photo.title} className="lightbox-image" />
      </div>
    </div>
  );
}

function Grid({ items, title }: { items: Item[], title: string }) {
  if (items.length === 0) return null;
  return (
    <section className="home-section">
      <h2 className="section-title">{title}</h2>
      <div className="trip-grid">
        {items.map((item) => (
          <Link to={`/item/${item.id}`} key={item.id} className="trip-card">
            <div className="trip-image-container">
              <img src={item.highlightUrl} alt={item.title} />
              <div className="trip-overlay">
                <span className="view-trip">View Series</span>
              </div>
            </div>
            <div className="trip-info">
              <h2 className="trip-title">{item.title}</h2>
              <span className="trip-date">{item.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const CHAR_LIMIT = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('message', message);
    formData.append('_subject', 'New Portfolio Inquiry');

    try {
      const response = await fetch('https://formspree.io/Frantellizzi17@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
    }
  };

  return (
    <section className="contact-section" id="contact">
      <h2 className="specs-title">Get In Touch</h2>
      {status === 'success' ? (
        <div className="status-message success">
          <p>Thank you! Your message has been sent successfully. I'll get back to you soon.</p>
          <button onClick={() => setStatus('idle')} className="submit-button">Send Another</button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Your Email</label>
            <input 
              type="email" 
              name="email"
              id="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="email@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea 
              name="message"
              id="message" 
              className="form-textarea" 
              maxLength={CHAR_LIMIT}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Tell me more..."
            ></textarea>
            <div className="char-count">{message.length} / {CHAR_LIMIT}</div>
          </div>
          {status === 'error' && (
            <p className="status-message error">Oops! There was a problem sending your message. Please try again.</p>
          )}
          <button 
            type="submit" 
            className="submit-button" 
            disabled={status === 'sending' || !email || !message}
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </section>
  );
}

function HomepageHero() {
  const [spotlighted, setSpotlighted] = useState<string | null>(null);

  const photos = [
    '/photos/0 - Homepage Photos/20151026-IMG_3007.webp',
    '/photos/0 - Homepage Photos/dscf4923040620.webp',
    '/photos/0 - Homepage Photos/DSCF5642.webp',
    '/photos/0 - Homepage Photos/DSCF6103.webp',
    '/photos/0 - Homepage Photos/dscf6407082920.webp',
    '/photos/0 - Homepage Photos/DSCF7437.webp',
    '/photos/0 - Homepage Photos/dscf7799041422.webp',
    '/photos/0 - Homepage Photos/DSCF8947.webp',
    '/photos/0 - Homepage Photos/IMG_4619.webp',
    '/photos/0 - Homepage Photos/IMG_5288.webp',
    '/photos/0 - Homepage Photos/IMG_6837.webp',
    '/photos/0 - Homepage Photos/IMG_9801.webp'
  ];

  return (
    <section className="homepage-hero">
      <div 
        className={`spotlight-overlay ${spotlighted ? 'active' : ''}`} 
        onClick={() => setSpotlighted(null)}
      >
        {spotlighted && <img src={spotlighted} className="spotlight-image" alt="Spotlight" />}
      </div>
      <div className="hero-grid">
        {photos.map((url, index) => (
          <div 
            key={index} 
            className="hero-photo"
            onClick={() => setSpotlighted(url)}
          >
            <img src={url} alt={`Homepage feature ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  return (
    <main>
      <HomepageHero />
      <Grid items={TRIPS} title="Trips" />
      <Grid items={ALBUMS} title="Albums" />
    </main>
  );
}

function ItemDetails() {
  const { id } = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  const item = ITEMS.find(i => i.id === id);

  if (!item) return <div>Series not found</div>;

  return (
    <main>
      <div className="trip-header">
        <Link to="/" className="back-link">&larr; Back to Gallery</Link>
        <h1 className="page-title">{item.title}</h1>
        <div className="trip-metadata-header">
          <div className="meta-item">
            <span className="meta-label">Date</span>
            <span className="meta-value">{item.date}</span>
          </div>
          {item.camera && (
            <div className="meta-item">
              <span className="meta-label">Camera</span>
              <span className="meta-value">{item.camera} {item.lens && `(${item.lens})`}</span>
            </div>
          )}
          {item.film && (
            <div className="meta-item">
              <span className="meta-label">Film</span>
              <span className="meta-value">{item.film} {item.asa && `(ASA ${item.asa})`}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid">
        {item.photos.map((photo) => (
          <div 
            key={photo.id} 
            className={`photo-card ${photo.orientation === 'landscape' ? 'photo-landscape' : ''}`} 
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.url} alt={photo.title} />
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </main>
  );
}

function CameraGrid({ cameras, title }: { cameras: Camera[], title: string }) {
  return (
    <section className="camera-section">
      <h2 className="section-title">{title}</h2>
      <div className="trip-grid">
        {cameras.map(camera => (
          <Link key={camera.id} to={`/camera/${camera.id}`} className="trip-card">
            <div className="trip-image-container">
              <img src={camera.imageUrl} alt={camera.name} />
              <div className="trip-overlay">
                <span className="view-trip">View Camera</span>
              </div>
            </div>
            <div className="trip-info">
              <h2 className="trip-title">{camera.name}</h2>
              <span className="trip-date">{camera.specs.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CamerasOverview() {
  return (
    <main>
      <div className="trip-header">
        <h1 className="page-title">Cameras</h1>
        <p className="page-subtitle">My Photography Equipment</p>
      </div>
      <CameraGrid cameras={FILM_CAMERAS} title="Film" />
      <CameraGrid cameras={DIGITAL_CAMERAS} title="Digital" />
    </main>
  );
}

function CameraDetails() {
  const { id } = useParams();
  const camera = CAMERAS.find(c => c.id === id);

  if (!camera) return <div>Camera not found</div>;

  const usedInItems = ITEMS.filter(item => 
    item.camera.toLowerCase().includes(camera.name.toLowerCase())
  );

  return (
    <main className="camera-detail">
      <div className="trip-header">
        <Link to="/cameras" className="back-link">&larr; Back to Cameras</Link>
        <h1 className="page-title">{camera.name}</h1>
      </div>

      <div className="camera-content">
        <div className="camera-image">
          <img src={camera.imageUrl} alt={camera.name} />
        </div>
        <div className="camera-info">
          <p className="camera-description">{camera.description}</p>
          <div className="camera-specs">
            <h3 className="specs-title">Technical Specifications</h3>
            <div className="trip-metadata-header camera-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Type</span>
                <span className="meta-value">{camera.specs.type}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Lens</span>
                <span className="meta-value">{camera.specs.lens}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Shutter</span>
                <span className="meta-value">{camera.specs.shutter}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Year</span>
                <span className="meta-value">{camera.specs.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {usedInItems.length > 0 && (
        <div className="related-trips">
          <h3 className="specs-title">Used In</h3>
          <div className="related-grid">
            {usedInItems.map(item => (
              <Link to={`/item/${item.id}`} key={item.id} className="related-trip-card">
                <div className="related-image">
                  <img src={item.highlightUrl} alt={item.title} />
                </div>
                <div className="related-info">
                  <span className="related-title">{item.title}</span>
                  <span className="related-date">{item.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function About() {
  return (
    <main className="about-page">
      <div className="trip-header">
        <h1 className="page-title">About</h1>
      </div>
      <div className="about-content">
        <div className="about-text">
          <p>
            I’ve created this website to tell the story of my journey as a photographer. 
            Photography for me exists at the intersection of many of my passions, namely: 
            travel, storytelling, image composition, and technology. I’ve owned many 
            cameras in my life, each has served a unique purpose and has helped me hone 
            this craft. They each require different skillsets to master, and some have 
            such deep feature sets that it could take years of shooting exclusively with 
            them to master.
          </p>
          <p>
            My hope for this website is for it help me organize my thoughts around the 
            craft of photography and share images that bring me joy. If there is a theme 
            to what I find inspired to photograph, I believe it is about finding a frame 
            that gives me pause and pulls me into the present.
          </p>
        </div>
        <div className="about-image">
          <img src="/about_me/IMG_6587.webp" alt="Peter Frantellizzi" />
        </div>
      </div>
      <ContactForm />
    </main>
  );
}

function SiteFooter() {
  return (
    <div className="album-footer">
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="thank-you-message"
      >
        ~ thank you for visiting ~
      </button>
    </div>
  );
}

function AppContent() {
  useHashScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<'trips' | 'albums' | 'cameras' | 'about' | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenSection(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleSection = (section: 'trips' | 'albums' | 'cameras' | 'about') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <>
      <ScrollToTop />
      <div className="container">
        <div className="site-banner">
          <h1 className="site-title-main">Aperture Priority</h1>
          <p className="site-subtitle">Peter Frantellizzi's Photography Portfolio</p>
        </div>
        <header className="header">
          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <div className="nav-dropdown">
              <span className="nav-link">Trips</span>
              <div className="dropdown-menu">
                {TRIPS.map(item => (
                  <Link key={item.id} to={`/item/${item.id}`} className="dropdown-item">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="nav-dropdown">
              <span className="nav-link">Albums</span>
              <div className="dropdown-menu">
                {ALBUMS.map(item => (
                  <Link key={item.id} to={`/item/${item.id}`} className="dropdown-item">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="nav-dropdown">
              <Link to="/cameras" className="nav-link clickable-link">Cameras</Link>
              <div className="dropdown-menu sub-dropdown">
                <div className="dropdown-section">
                  <span className="dropdown-header">Film</span>
                  {FILM_CAMERAS.map(camera => (
                    <Link key={camera.id} to={`/camera/${camera.id}`} className="dropdown-item">
                      {camera.name}
                    </Link>
                  ))}
                </div>
                <div className="dropdown-section">
                  <span className="dropdown-header">Digital</span>
                  {DIGITAL_CAMERAS.map(camera => (
                    <Link key={camera.id} to={`/camera/${camera.id}`} className="dropdown-item">
                      {camera.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="nav-dropdown">
              <Link to="/about" className="nav-link clickable-link">About</Link>
              <div className="dropdown-menu">
                <Link to="/about" className="dropdown-item">About Me</Link>
                <Link to="/about#contact" className="dropdown-item">Get In Touch</Link>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <div 
          className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="mobile-nav-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">Menu</span>
              <button 
                className="mobile-nav-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>

            <nav className="mobile-nav-list">
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>

              <div className="mobile-nav-accordion">
                <button 
                  className="mobile-accordion-toggle"
                  onClick={() => toggleSection('trips')}
                >
                  <span>Trips ({TRIPS.length})</span>
                  <span className={`accordion-icon ${openSection === 'trips' ? 'open' : ''}`}>▾</span>
                </button>
                {openSection === 'trips' && (
                  <div className="mobile-accordion-content">
                    {TRIPS.map(item => (
                      <Link 
                        key={item.id} 
                        to={`/item/${item.id}`} 
                        className="mobile-accordion-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mobile-nav-accordion">
                <button 
                  className="mobile-accordion-toggle"
                  onClick={() => toggleSection('albums')}
                >
                  <span>Albums ({ALBUMS.length})</span>
                  <span className={`accordion-icon ${openSection === 'albums' ? 'open' : ''}`}>▾</span>
                </button>
                {openSection === 'albums' && (
                  <div className="mobile-accordion-content">
                    {ALBUMS.map(item => (
                      <Link 
                        key={item.id} 
                        to={`/item/${item.id}`} 
                        className="mobile-accordion-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mobile-nav-accordion">
                <button 
                  className="mobile-accordion-toggle"
                  onClick={() => toggleSection('cameras')}
                >
                  <span>Cameras</span>
                  <span className={`accordion-icon ${openSection === 'cameras' ? 'open' : ''}`}>▾</span>
                </button>
                {openSection === 'cameras' && (
                  <div className="mobile-accordion-content">
                    <Link 
                      to="/cameras" 
                      className="mobile-accordion-link mobile-accordion-overview"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      All Equipment Overview &rarr;
                    </Link>
                    <div className="mobile-sub-group">
                      <span className="mobile-sub-header">Film</span>
                      {FILM_CAMERAS.map(camera => (
                        <Link 
                          key={camera.id} 
                          to={`/camera/${camera.id}`} 
                          className="mobile-accordion-link"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {camera.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mobile-sub-group">
                      <span className="mobile-sub-header">Digital</span>
                      {DIGITAL_CAMERAS.map(camera => (
                        <Link 
                          key={camera.id} 
                          to={`/camera/${camera.id}`} 
                          className="mobile-accordion-link"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {camera.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mobile-nav-accordion">
                <button 
                  className="mobile-accordion-toggle"
                  onClick={() => toggleSection('about')}
                >
                  <span>About</span>
                  <span className={`accordion-icon ${openSection === 'about' ? 'open' : ''}`}>▾</span>
                </button>
                {openSection === 'about' && (
                  <div className="mobile-accordion-content">
                    <Link 
                      to="/about" 
                      className="mobile-accordion-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About Me
                    </Link>
                    <Link 
                      to="/about#contact" 
                      className="mobile-accordion-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get In Touch
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item/:id" element={<ItemDetails />} />
          <Route path="/cameras" element={<CamerasOverview />} />
          <Route path="/camera/:id" element={<CameraDetails />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <SiteFooter />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App
