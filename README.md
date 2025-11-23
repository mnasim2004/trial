# Trial Mate 🚀

**Try Before You Buy - Get Honest Reviews from Real Users**

Trial Mate is a peer-to-peer platform that connects product owners with potential buyers, allowing users to test products in person before making a purchase decision. Think of it as a "test drive" for any product - from electronics to furniture, from gadgets to appliances.

## 🎯 The Problem We Solve

When shopping online, buyers often rely on:
- ✗ **Seller reviews** - which can be biased or fake
- ✗ **Marketing descriptions** - which highlight only the positives
- ✗ **Photos and videos** - which don't show the real experience

**Trial Mate solves this by:**
- ✅ Connecting buyers with **real product owners** in their area
- ✅ Allowing **hands-on testing** before purchase
- ✅ Getting **honest, unbiased reviews** from actual users
- ✅ Building **trust through real interactions**

## 💡 How It Works

1. **Product Owners** list their products (electronics, furniture, gadgets, etc.)
2. **Potential Buyers** browse and search for products they want to try
3. **Trial Requests** are sent with preferred date and time
4. **Owners** accept or reject requests based on availability
5. **Meet & Test** - Buyers try the product in person
6. **Make Informed Decision** - Buyers can purchase with confidence or negotiate

## ✨ Key Features

### For Product Owners
- 📦 **List Products** - Add products with photos, descriptions, and pricing
- 📅 **Manage Trials** - Accept/reject trial requests with scheduling
- 💬 **Chat System** - Negotiate and communicate with potential buyers
- 📊 **Dashboard** - Track all your products and trial requests

### For Buyers
- 🔍 **Search & Filter** - Find products by brand, price, location
- 📅 **Schedule Trials** - Request trials at convenient times
- 💬 **Direct Messaging** - Chat with product owners
- ✅ **Smart Scheduling** - Prevents overlapping trial times
- 📝 **Reschedule Options** - Flexibility to change trial dates

### Platform Features
- 🔐 **Secure Authentication** - User accounts with session management
- 🖼️ **Image Upload** - Support for ImgBB (free) or AWS S3
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface
- 🔔 **Real-time Notifications** - Success and error popups

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Handlebars** - Template engine
- **Express Session** - Session management
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### Frontend
- **Handlebars** - Server-side templating
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript** - Client-side interactivity
- **AJAX** - Asynchronous requests

### Services
- **ImgBB** - Free image hosting (recommended)
- **AWS S3** - Alternative image storage
- **MongoDB Atlas** - Cloud database

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (free tier available) - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **ImgBB Account** (free, recommended) - [Get API Key](https://api.imgbb.com/)
- **OR AWS Account** (optional, for S3 storage)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trial
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Image Upload Service - Choose 'imgbb' (free) or 'aws'
IMAGE_UPLOAD_SERVICE=imgbb

# ImgBB Configuration (FREE - Recommended)
# Get API key from: https://api.imgbb.com/
IMGBB_API_KEY=your_imgbb_api_key_here

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trialmate?retryWrites=true&w=majority

# Server Port (optional, defaults to 3000)
PORT=3000

# AWS S3 Configuration (Optional - only if using AWS)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_BUCKET_NAME=your_bucket_name
# AWS_REGION=us-east-1
```

### 4. Quick Setup Guides

- **ImgBB Setup** (2 minutes, FREE): See [IMGBB_SETUP.md](./IMGBB_SETUP.md)
- **Database Setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **AWS Setup** (optional): See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)

### 5. Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000` (or your specified PORT).

### 6. Access the Application

Open your browser and navigate to:
- **Home Page**: `http://localhost:3000`
- **Sign Up**: `http://localhost:3000/users/signup`
- **Login**: `http://localhost:3000/users/signin`
- **Dashboard**: `http://localhost:3000/users/dashboard` (requires login)

## 📖 Usage Guide

### For New Users

1. **Sign Up** - Create an account with your details
2. **Add Products** (if you're a seller) - List products you own
3. **Browse Products** - Search for products you want to try
4. **Request Trial** - Send a trial request with your preferred date/time
5. **Chat** - Communicate with product owners
6. **Schedule Meeting** - Meet and test the product
7. **Make Decision** - Purchase with confidence or look elsewhere

### For Product Owners

1. **Add Product** - Click "Add Product" in dashboard
2. **Fill Details** - Brand, title, description, price, location, photo
3. **Manage Requests** - Accept or reject trial requests
4. **Chat** - Negotiate with potential buyers
5. **Schedule** - Coordinate meeting times

### For Buyers

1. **Search Products** - Use filters to find what you need
2. **View Details** - Check product information and owner profile
3. **Request Trial** - Select date and time slot
4. **Chat** - Ask questions before meeting
5. **Test Product** - Try it in person
6. **Decide** - Make an informed purchase decision

## 📁 Project Structure

```
trial/
├── app.js                 # Main application configuration
├── bin/
│   └── www               # Server entry point
├── db.js                 # MongoDB connection
├── routes/
│   ├── index.js          # Home page routes
│   ├── users.js          # User authentication & profile routes
│   └── product.js       # Product & trial management routes
├── model/
│   ├── user_model.js     # User schema
│   ├── product_model.js  # Product schema
│   ├── trial_model.js    # Trial request schema
│   └── message_model.js  # Chat message schema
├── views/
│   ├── layout.hbs        # Main layout template
│   ├── index.hbs         # Home page
│   ├── login.hbs         # Login page
│   ├── users.hbs         # Signup page
│   ├── profile.hbs       # Dashboard
│   ├── product.hbs      # Product listing
│   ├── searchp.hbs      # Product search
│   ├── editp.hbs        # Edit product
│   ├── trial.hbs        # Trial booking
│   ├── editt.hbs        # Reschedule trial
│   └── chat.hbs         # Chat interface
├── public/
│   ├── javascripts/     # Client-side scripts
│   ├── stylesheets/    # CSS files
│   └── images/          # Static images
├── s3Service.js          # AWS S3 upload service
├── imgbbService.js      # ImgBB upload service
└── uploadService.js     # Unified upload service
```

## 🔧 Configuration

### Image Upload Service

The platform supports two image upload services:

1. **ImgBB** (Recommended - FREE)
   - No credit card required
   - Easy setup (2 minutes)
   - See [IMGBB_SETUP.md](./IMGBB_SETUP.md)

2. **AWS S3** (Optional)
   - Free tier available (12 months)
   - More control and scalability
   - See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)

Switch between services by changing `IMAGE_UPLOAD_SERVICE` in `.env`.

### Database

- **MongoDB Atlas** (Cloud - Recommended)
  - Free tier available
  - Automatic backups
  - See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

- **Local MongoDB** (Alternative)
  - Install MongoDB locally
  - Update connection string in `db.js`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MongoDB connection string in `.env`
   - Verify network access in MongoDB Atlas
   - The app continues running even if DB connection fails

2. **Image Upload Errors**
   - Verify `IMGBB_API_KEY` is correct
   - Check `IMAGE_UPLOAD_SERVICE` setting
   - See [IMGBB_SETUP.md](./IMGBB_SETUP.md) for help

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Or kill the process: `netstat -ano | findstr :3000`

4. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check `package.json` for required packages

5. **Session Issues**
   - Clear browser cookies
   - Check session configuration in `app.js`

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Input validation and sanitization
- ✅ CSRF protection (via Express)
- ✅ Secure file upload handling
- ✅ User authorization checks

## 🎨 UI/UX Features

- Modern gradient designs
- Responsive layout (mobile-friendly)
- Floating navigation header
- Real-time notifications
- Smooth animations and transitions
- Intuitive multi-step forms
- Chat interface with message alignment
- Beautiful dashboard with stats

## 📝 API Endpoints

### Authentication
- `POST /users/profile` - Sign up
- `POST /users/login` - Login
- `GET /users/logout` - Logout
- `GET /users/dashboard` - User dashboard

### Products
- `GET /product/searchp` - Search products
- `POST /product/upload` - Add product
- `GET /product/editp/:id` - Edit product page
- `POST /product/updatep/:id` - Update product
- `POST /product/delete/:id` - Delete product

### Trials
- `GET /product/trial` - Trial booking page
- `POST /product/book` - Request trial
- `GET /product/editt/:id` - Reschedule page
- `POST /product/updatet/:id` - Reschedule trial
- `POST /product/accept-trial/:id` - Accept request
- `POST /product/reject-trial/:id` - Reject request
- `POST /product/tdelete/:id` - Cancel trial

### Chat
- `GET /product/chat/:trialId` - Chat interface
- `POST /product/chat/:trialId` - Send message
- `GET /product/messages/:trialId` - Get messages (AJAX)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- UI powered by Tailwind CSS
- Icons from Heroicons

## 📞 Support

For issues, questions, or contributions:
- Check the troubleshooting section
- Review setup guides in the repository
- Open an issue on GitHub

---

**Made with ❤️ for honest product reviews**

*Know Before You Own - Try Before You Buy*
