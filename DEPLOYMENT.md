# Deployment Guide - Vercel & Render

This guide will help you deploy Trial Mate to Vercel (frontend) and Render (backend).

## 🚀 Deployment Options

### Option 1: Render (Recommended for Full-Stack)

Render is perfect for full-stack Node.js applications with MongoDB.

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure `.env` is in `.gitignore`**
   - Never commit sensitive data!

#### Step 2: Deploy to Render

1. **Sign up at [render.com](https://render.com)** (free tier available)

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Build Settings**
   - **Name**: `trial-mate` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Add Environment Variables**
   Click "Add Environment Variable" and add:
   ```
   NODE_ENV=production
   PORT=10000
   IMAGE_UPLOAD_SERVICE=imgbb
   IMGBB_API_KEY=your_imgbb_api_key_here
   MONGO_URI=your_mongodb_connection_string
   ```
   
   Optional (if using AWS):
   ```
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_BUCKET_NAME=your_bucket_name
   AWS_REGION=us-east-1
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your app will be available at `https://trial-mate.onrender.com` (or your custom domain)

#### Step 3: Update MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Navigate to "Network Access"
3. Add Render's IP ranges or click "Allow Access from Anywhere" (for development)

#### Step 4: Update Session Secret (Important!)

For production, update the session secret in `app.js`:
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || "your-production-secret-key-here",
  // ... rest of config
}));
```

Add to Render environment variables:
```
SESSION_SECRET=your-strong-random-secret-key
```

### Option 2: Vercel (For Frontend/API Routes)

Vercel is great for serverless functions and static sites, but can also handle Node.js apps.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy to Vercel

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? No
   - Project name: `trial-mate`
   - Directory: `.`
   - Override settings? No

3. **Add Environment Variables**
   Go to your Vercel dashboard → Project → Settings → Environment Variables
   
   Add:
   ```
   NODE_ENV=production
   IMAGE_UPLOAD_SERVICE=imgbb
   IMGBB_API_KEY=your_imgbb_api_key
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your-session-secret
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

#### Important Notes for Vercel

- Vercel uses serverless functions, so sessions might need Redis or database storage
- Consider using Vercel KV (Redis) for session storage
- File uploads work, but consider using Vercel Blob for better performance

### Option 3: Hybrid Deployment (Recommended)

- **Frontend on Vercel** - Fast CDN, great for static assets
- **Backend API on Render** - Full Node.js support, better for database connections

## 🔧 Post-Deployment Checklist

### 1. Environment Variables
- [ ] All environment variables are set
- [ ] No sensitive data in code
- [ ] `.env` is in `.gitignore`

### 2. Database
- [ ] MongoDB Atlas network access configured
- [ ] Connection string is correct
- [ ] Database user has proper permissions

### 3. Image Upload
- [ ] ImgBB API key is set (or AWS credentials)
- [ ] Test image upload functionality

### 4. Security
- [ ] Session secret is strong and unique
- [ ] HTTPS is enabled (automatic on Render/Vercel)
- [ ] CORS is configured if needed

### 5. Testing
- [ ] Test user registration
- [ ] Test product listing
- [ ] Test trial requests
- [ ] Test chat functionality
- [ ] Test image uploads

## 🌐 Custom Domain Setup

### Render
1. Go to your service → Settings → Custom Domains
2. Add your domain
3. Update DNS records as instructed

### Vercel
1. Go to Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## 📊 Monitoring

### Render
- Built-in logs and metrics
- Free tier includes basic monitoring
- Upgrade for advanced analytics

### Vercel
- Built-in analytics
- Function logs
- Performance insights

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in dashboard
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility

2. **Database Connection Fails**
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Ensure database user has correct permissions

3. **Environment Variables Not Working**
   - Restart service after adding variables
   - Check variable names (case-sensitive)
   - Verify no typos

4. **Sessions Not Persisting**
   - Check session secret is set
   - Consider using Redis for production
   - Verify cookie settings

5. **Image Upload Fails**
   - Verify ImgBB API key is correct
   - Check file size limits
   - Verify service is set correctly

## 💰 Cost Considerations

### Render Free Tier
- 750 hours/month (enough for one service)
- Sleeps after 15 minutes of inactivity
- Can upgrade to paid for always-on

### Vercel Free Tier
- Unlimited deployments
- 100GB bandwidth
- Serverless functions included

## 🔄 Continuous Deployment

Both platforms support automatic deployments:
- **Render**: Auto-deploys on push to main branch
- **Vercel**: Auto-deploys on push to main branch

## 📝 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](./DATABASE_SETUP.md)
- [ImgBB Setup](./IMGBB_SETUP.md)

---

**Need Help?** Check the troubleshooting section or review the platform-specific documentation.

