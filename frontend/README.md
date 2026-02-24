# Waste-to-Resource Marketplace - Frontend

A modern, responsive React.js frontend for the Waste-to-Resource Marketplace platform.

## 🚀 Features

- **Modern UI/UX** with Tailwind CSS
- **Responsive Design** for mobile and desktop
- **React Router** for navigation
- **Component-based Architecture**
- **Professional Green Eco Theme**
- **Interactive Elements** with smooth transitions

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component
│   ├── Footer.jsx          # Footer component
│   └── ListingCard.jsx     # Marketplace listing card
├── pages/
│   ├── Home.jsx            # Landing page with hero and features
│   ├── Login.jsx           # User login page
│   ├── Signup.jsx          # User registration page
│   └── Marketplace.jsx     # Marketplace with listings
├── App.jsx                # Main app with routing
├── main.jsx               # Entry point
└── index.css             # Tailwind CSS + custom styles
```

## 🛠 Tech Stack

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📦 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd waste2Resource/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## 🎯 Available Pages

### Home Page (`/`)
- Hero section with call-to-action buttons
- Features showcase
- Statistics section
- Call-to-action section

### Login Page (`/login`)
- Email and password inputs
- Form validation
- Remember me checkbox
- Link to signup page

### Signup Page (`/signup`)
- Name, email, password fields
- Role selection (Buyer/Seller)
- Password confirmation
- Terms and conditions

### Marketplace Page (`/marketplace`)
- Search and filter functionality
- Grid layout for listings
- Dummy data for demonstration
- Responsive card design

## 🎨 Design System

### Color Palette
- **Primary Green**: `#16a34a` (Eco theme)
- **Secondary Gray**: Various shades for text and backgrounds
- **Success**: Green shades for positive actions
- **Warning**: Yellow/orange for alerts
- **Error**: Red for error states

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Responsive sizing** for different screen sizes

### Components
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Cards**: Shadow effects and hover states
- **Forms**: Consistent styling and validation
- **Navigation**: Sticky navbar with mobile menu

## 📱 Responsive Design

- **Mobile First** approach
- **Breakpoints**: 
  - Small: < 640px
  - Medium: 640px - 1024px
  - Large: > 1024px
- **Touch-friendly** interactions on mobile

## 🔧 Development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_ENV=development
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build files will be in the `build` directory.

### Deploy to Static Hosting

1. Build the project
2. Deploy the `build` folder to your hosting service
3. Configure routing for single-page applications

## 🎯 Next Steps

1. **Backend Integration**: Connect to actual API endpoints
2. **Authentication**: Implement JWT-based auth
3. **State Management**: Add Redux or Context API
4. **Form Handling**: Add form validation libraries
5. **Testing**: Add unit and integration tests
6. **Performance**: Optimize images and code splitting

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **Dependency issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Tailwind CSS not working**:
   - Ensure `tailwind.config.js` is properly configured
   - Check that `index.css` imports Tailwind directives
   - Verify content paths in config

## 📞 Support

For issues and questions:
- Check the console for error messages
- Verify all dependencies are installed
- Ensure Node.js version is compatible (recommended: 16+)

---

**Built with ❤️ for a sustainable future**
