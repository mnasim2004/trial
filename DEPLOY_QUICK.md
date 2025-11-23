# 🚀 Quick Deployment Guide

## Option 1: Render (Recommended - Easiest)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**
   - Authorize Render to access your GitHub
   - Select your `trial` repository

4. **Configure Settings:**
   - **Name**: `trial-mate` (or any name you like)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

5. **Add Environment Variables** (Click "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   IMAGE_UPLOAD_SERVICE=imgbb
   IMGBB_API_KEY=your_imgbb_api_key_here
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your-strong-random-secret-key-here
   ```

6. **Click "Create Web Service"**
   - Render will build and deploy automatically
   - Wait 5-10 minutes for first deployment
   - Your app will be at: `https://trial-mate.onrender.com`

### Step 3: Update MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Network Access" → "Add IP Address"
3. Click "Allow Access from Anywhere" (or add Render's IP ranges)
4. Save

### Step 4: Test Your Deployment

Visit your Render URL and test:
- ✅ Homepage loads
- ✅ Sign up works
- ✅ Login works
- ✅ Products can be added
- ✅ Images upload correctly

---

## Option 2: Vercel (Alternative)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel login
vercel
```

Follow prompts, then:
```bash
vercel --prod
```

### Step 3: Add Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add the same variables as Render:
```
NODE_ENV=production
IMAGE_UPLOAD_SERVICE=imgbb
IMGBB_API_KEY=your_imgbb_api_key
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your-session-secret
```

---

## 🔑 Required Environment Variables

Make sure you have these values ready:

1. **IMGBB_API_KEY**: Get from [imgbb.com](https://api.imgbb.com/)
2. **MONGO_URI**: Your MongoDB Atlas connection string
3. **SESSION_SECRET**: Any random strong string (e.g., use `openssl rand -base64 32`)

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] MongoDB Atlas allows connections from anywhere (or Render IPs)
- [ ] Test user registration
- [ ] Test product upload with images
- [ ] Test login/logout
- [ ] Check chatbot appears on homepage

---

## 🐛 Common Issues

**Build Fails?**
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`

**Database Connection Fails?**
- Check MongoDB Atlas Network Access
- Verify connection string is correct

**Images Not Uploading?**
- Verify IMGBB_API_KEY is correct
- Check environment variable is set

**App Not Loading?**
- Check logs in Render dashboard
- Verify PORT is set to 10000 (or let Render auto-assign)

---

## 📝 Notes

- **Free Tier**: Render free tier sleeps after 15 min inactivity (first load may be slow)
- **Custom Domain**: Add in Render Settings → Custom Domains
- **Auto-Deploy**: Render auto-deploys on every push to main branch

---

**Need Help?** Check `DEPLOYMENT.md` for detailed troubleshooting.

