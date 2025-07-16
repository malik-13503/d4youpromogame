# D4U Pros Scratch & Win Game Platform

An advanced interactive scratch-off lottery game platform featuring sophisticated user engagement mechanics, dynamic digital experiences, and robust communication systems.

## 🎮 Features

### Core Functionality
- **Interactive Scratch Cards**: Realistic finger/touch interaction using HTML5 canvas
- **Video Integration**: HTML5 video player with progress tracking
- **User Registration**: Complete form validation with duplicate checking
- **Email Notifications**: Winner confirmation emails via Resend API
- **Admin Dashboard**: Comprehensive management interface

### Game Mechanics
- **Two-Card System**: Sequential card unlocking with security
- **Prize Management**: Configurable prizes and win conditions
- **Winner Popups**: Eye-catching celebration animations
- **Lose Popups**: Encouraging second-chance messaging

### Admin Features
- **User Management**: View, search, filter, and delete users
- **Bulk Operations**: Select and delete multiple users at once
- **Analytics Dashboard**: Registration trends and video engagement metrics
- **Email Testing**: Test winner notification system
- **Data Export**: CSV and JSON export capabilities
- **Settings Management**: Configure video requirements and duplicate checks

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Email**: Resend API for transactional emails
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/malik-13503/D4YouPromotion.git
   cd D4YouPromotion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your values:
   ```
   DATABASE_URL=your_postgresql_connection_string
   RESEND_API_KEY=your_resend_api_key
   NODE_ENV=development
   ```

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Railway Deployment

### Quick Deploy
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL service
4. Set environment variables:
   - `RESEND_API_KEY` (get from resend.com)
   - `NODE_ENV=production`
5. Deploy automatically

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

## 📊 Admin Dashboard

### Default Login
- **Email**: admin@doneforyoupros.com
- **Password**: password@security

### Features
- **Overview**: Registration statistics and recent activity
- **Users**: Complete user management with search/filter
- **Analytics**: Video engagement and registration trends
- **Tools**: Data export and system configuration

## 🎯 Game Flow

1. **Landing Page**: Video introduction and registration form
2. **Video Watching**: Progress tracking unlocks form at 80%
3. **Registration**: User details with validation
4. **Game Page**: Interactive scratch cards with prizes
5. **Winner Flow**: Celebration popup and email collection
6. **Email Confirmation**: Automated winner notification

## 🔧 Configuration

### Email Settings
- Configure Resend API key in environment variables
- Customize email templates in `server/emailTemplates.ts`

### Game Settings
- Prize configuration in `client/src/pages/Game.tsx`
- Video requirement toggle in admin dashboard

### Brand Colors
- Primary: #2C5CDC (Blue)
- Secondary: #F76D46 (Orange)
- Font: Montserrat

## 📱 Responsive Design

- Mobile-first approach
- Touch-optimized scratch interaction
- Responsive popups and modals
- Optimized for all screen sizes

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- Session-based authentication
- Rate limiting on API endpoints
- Secure password handling

## 📈 Analytics & Monitoring

- Registration tracking
- Video completion rates
- User engagement metrics
- Email delivery status
- System performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🎨 Brand Guidelines

- Use Montserrat font for all text elements
- Maintain brand color consistency
- Follow responsive design principles
- Ensure accessibility standards

---

Built with ❤️ for Done For You Pros