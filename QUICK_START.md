# Quick Start Guide

Get your app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up ImgBB (FREE - 2 minutes)

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/)
2. Click "Get API Key" and sign up (no credit card needed!)
3. Copy your API key

## Step 3: Create .env File

Create a `.env` file in the project root:

```env
# Image Upload - Use ImgBB (free and easy!)
IMAGE_UPLOAD_SERVICE=imgbb
IMGBB_API_KEY=paste_your_api_key_here

# Server Port
PORT=3000
```

## Step 4: Set Up Database (Optional for now)

The app will run even without a database, but features won't work.

**Quick MongoDB Atlas Setup:**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free tier available)
3. Create a cluster
4. Get connection string
5. Add to `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trialmate?retryWrites=true&w=majority
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

## Step 5: Start the Server

```bash
npm start
```

Visit: **http://localhost:3000**

## That's It! 🎉

Your app is now running with:
- ✅ ImgBB image uploads (free!)
- ✅ Easy to switch to AWS later if needed
- ✅ Database connection (if configured)

## Need Help?

- **ImgBB Setup**: See [IMGBB_SETUP.md](./IMGBB_SETUP.md)
- **Database Setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **AWS Setup** (if needed): See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)

## Switching to AWS Later

Just change in `.env`:
```env
IMAGE_UPLOAD_SERVICE=aws
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your_bucket
AWS_REGION=us-east-1
```

No code changes needed! 🚀

