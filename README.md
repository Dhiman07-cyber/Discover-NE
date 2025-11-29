# Discover NorthEast India 🏔️

A modern Next.js tourism platform showcasing the beauty and culture of Northeast India's 8 states through interactive maps, dynamic galleries, and engaging user experiences.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Dhiman07-cyber/Discover-NE.git
cd Discover-NE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## ✨ Features

### 🌟 User Experience
- **Interactive Maps**: Explore 8 NE states with clickable markers using Leaflet.js
- **Dynamic Hero Sliders**: Engaging image carousels with smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Photo Galleries**: Lightbox viewing with user upload capabilities
- **Real-time Feedback**: Contact forms with instant notifications
- **AI Chatbot**: Interactive assistance for visitors
- **Infinite Carousel**: Showcasing regional highlights

### 🔧 Admin Features
- **Content Management**: Edit state and city information dynamically
- **Image Moderation**: Approve/reject user-uploaded photos
- **Feedback Dashboard**: View and manage user submissions
- **Real-time Statistics**: Live dashboard with content metrics
- **Secure Authentication**: Password-protected admin panel

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, Framer Motion
- **Backend**: Express.js API routes, Node.js
- **Maps**: Leaflet.js with OpenStreetMap
- **Styling**: CSS3 with CSS Grid/Flexbox
- **File Handling**: Multer for uploads
- **Data Storage**: JSON-based with file system

### Project Structure
```
Discover-NE/
├── components/              # React components
│   ├── ChatBot.jsx         # AI chatbot component
│   ├── HeroSlider.jsx      # Homepage hero slider
│   ├── InteractiveMap.jsx  # Map component
│   ├── InfiniteCarousel.jsx # Feature carousel
│   └── Lightbox.jsx        # Image lightbox
├── pages/                  # Next.js pages
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── cities/        # City data endpoints
│   │   ├── states/        # State data endpoints
│   │   ├── chat.jsx       # Chatbot API
│   │   ├── feedback.jsx   # Feedback handling
│   │   └── upload.jsx     # File upload
│   ├── city/              # Dynamic city pages
│   ├── state/             # Dynamic state pages
│   ├── admin.jsx          # Admin dashboard
│   ├── index.jsx          # Homepage
│   ├── _app.jsx           # App wrapper
│   └── _document.jsx      # Document structure
├── server/                # Backend server
│   ├── data/              # JSON data storage
│   │   ├── states.json    # 8 NE states data
│   │   ├── cities.json    # 16 cities data
│   │   ├── feedback.json  # User feedback
│   │   └── tourist-attractions.json
│   └── index.js           # Express server
├── styles/                # CSS stylesheets
├── utils/                 # Utility functions
├── public/                # Static assets
│   ├── ASSAM/            # State-specific images
│   ├── SIKKIM/
│   ├── TRIPURA/
│   └── uploads/          # User uploads
└── tests/                # Test files
```

## 🗺️ Coverage

### 8 Northeast States
1. **Assam** - Tea gardens and Kaziranga National Park
2. **Arunachal Pradesh** - Pristine mountains and monasteries
3. **Meghalaya** - Living root bridges and waterfalls
4. **Manipur** - Cultural heritage and Loktak Lake
5. **Mizoram** - Hills and tribal culture
6. **Nagaland** - Festivals and warrior traditions
7. **Sikkim** - Himalayan peaks and Buddhist monasteries
8. **Tripura** - Palaces and tribal diversity

### 16 Featured Cities
Each state features 2 major cities with detailed information, attractions, and photo galleries.

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Admin Authentication
ADMIN_PASS=your-secure-password

# Optional Integrations
MAPBOX_TOKEN=              # For enhanced maps
OPENAI_API_KEY=           # For chatbot functionality
```

### Admin Access
- **URL**: `/admin`
- **Default Password**: Set in `.env` file
- **Features**: Content management, image moderation, feedback review

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm test            # Run data validation tests
npm run seed        # Seed database with sample data
```

### API Endpoints

#### Public APIs
- `GET /api/states` - Get all states
- `GET /api/cities` - Get all cities
- `GET /api/states/[slug]` - Get specific state
- `GET /api/cities/[slug]` - Get specific city
- `POST /api/feedback` - Submit feedback
- `POST /api/upload` - Upload photos
- `POST /api/chat` - Chatbot interaction

#### Admin APIs (Protected)
- `PUT /api/admin/states/[slug]` - Update state
- `PUT /api/admin/cities/[slug]` - Update city
- `POST /api/admin/moderate` - Moderate images
- `GET /api/admin/feedback` - Get all feedback

### Component Usage

#### Interactive Map
```jsx
import InteractiveMap from '@/components/InteractiveMap';

<InteractiveMap 
  type="overview" 
  data={{ states }} 
/>
```

#### Hero Slider
```jsx
import HeroSlider from '@/components/HeroSlider';

<HeroSlider slides={slideData} />
```

#### Chatbot
```jsx
import ChatBot from '@/components/ChatBot';

<ChatBot />
```

## 🎨 Styling

### CSS Architecture
- **Global Styles**: `styles/globals.css`
- **Component Styles**: `styles/components.css`
- **Page Styles**: `styles/styles.css`
- **Admin Styles**: `styles/admin.css`
- **Responsive**: Mobile-first approach

### Design System
- **Colors**: CSS custom properties for theming
- **Typography**: System fonts with fallbacks
- **Animations**: Framer Motion for smooth transitions
- **Grid System**: CSS Grid and Flexbox

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Touch-optimized navigation
- Swipe gestures for galleries
- Collapsible menus
- Optimized image loading

## 🔒 Security

### Implemented Measures
- Input validation and sanitization
- File upload restrictions (type, size)
- XSS protection
- Admin authentication
- CORS configuration
- Environment variable protection

### Best Practices
- Regular security updates
- Secure file handling
- Protected admin routes
- Input escaping
- Error handling

## 🧪 Testing

### Data Validation
```bash
npm test  # Validates JSON data integrity
```

### Manual Testing Checklist
- [ ] Homepage loads with hero slider
- [ ] Interactive map displays correctly
- [ ] State pages show proper content
- [ ] City pages load with galleries
- [ ] Photo upload functionality
- [ ] Feedback form submission
- [ ] Admin login and dashboard
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance

### Optimization Features
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Static generation for better SEO
- Client-side caching
- Lazy loading components
- Compressed assets

### Lighthouse Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

## 🔄 Data Management

### JSON Structure
States and cities data is stored in JSON files with the following structure:

```json
{
  "states": [
    {
      "id": "assam",
      "name": "Assam",
      "slug": "assam",
      "description": "Gateway to Northeast India...",
      "coordinates": [26.2006, 92.9376],
      "featuredImages": ["image1.jpg", "image2.jpg"],
      "highlights": ["Kaziranga", "Kamakhya Temple"],
      "festivals": ["Bihu", "Durga Puja"]
    }
  ]
}
```

### Database Migration
For production scaling, consider migrating to:
- PostgreSQL for relational data
- MongoDB for document storage
- Supabase for full-stack solution
- Firebase for real-time features

## 🤖 AI Features

### Chatbot Integration
- OpenAI GPT integration
- Context-aware responses
- Tourism-focused knowledge base
- Multi-language support (planned)

### Future AI Enhancements
- Image recognition for uploads
- Personalized recommendations
- Voice assistance
- Translation services

## 🌐 Internationalization

### Planned Features
- Multi-language support
- Regional content variations
- Currency conversion
- Local time zones

## 📈 Analytics & Monitoring

### Recommended Tools
- Google Analytics 4
- Vercel Analytics
- Sentry for error tracking
- LogRocket for user sessions

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ Interactive maps and galleries
- ✅ Admin panel and content management
- ✅ Responsive design
- ✅ Basic chatbot integration

### Phase 2 (Planned)
- [ ] User authentication system
- [ ] Booking integration
- [ ] Advanced search and filters
- [ ] Social media integration
- [ ] Review and rating system

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] AR/VR experiences
- [ ] AI-powered trip planning
- [ ] Real-time weather integration
- [ ] Offline functionality

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- ESLint configuration
- Prettier formatting
- Conventional commits
- Component documentation

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Leaflet.js** - For interactive maps
- **OpenStreetMap** - For map data
- **Northeast India Tourism Boards** - For inspiration and content
- **Local Communities** - For cultural insights
- **Contributors** - For ongoing improvements

## 📞 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly

### Community
- **Discord**: Join our development community
- **Twitter**: Follow for updates
- **Blog**: Read development insights

---

**🌟 Discover the unexplored beauty of Northeast India**

*Built with ❤️ using Next.js | Responsive | Production Ready*