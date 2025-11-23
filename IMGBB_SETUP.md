# ImgBB Setup Guide - FREE Image Hosting

ImgBB is a **completely free** image hosting service - no credit card required, no complex setup!

## Why ImgBB?

✅ **100% Free** - No credit card needed  
✅ **No Setup Complexity** - Just get an API key  
✅ **No Storage Limits** - Free tier is generous  
✅ **Fast & Reliable** - Good performance  
✅ **Easy to Switch** - Can switch to AWS later if needed

## Step-by-Step Setup (Takes 2 minutes!)

### Step 1: Get ImgBB API Key

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/)
2. Click **"Get API Key"** or **"Register"**
3. Sign up with:
   - Email address
   - Password
   - (No credit card required!)
4. After registration, you'll see your **API Key**
5. **Copy the API key** - you'll need it in the next step

### Step 2: Add API Key to Your Project

Create or update your `.env` file in the project root:

```env
# Image Upload Service (imgbb or aws)
IMAGE_UPLOAD_SERVICE=imgbb

# ImgBB API Key (get from https://api.imgbb.com/)
IMGBB_API_KEY=your_api_key_here

# Server Port
PORT=3000
```

Replace `your_api_key_here` with the API key you copied.

### Step 3: Install Dependencies

```bash
npm install
```

This will install `axios` and `form-data` packages needed for ImgBB.

### Step 4: Restart Your Server

```bash
npm start
```

That's it! Your image uploads will now use ImgBB.

## Switching Between ImgBB and AWS

To switch between services, just change the `IMAGE_UPLOAD_SERVICE` in your `.env`:

**For ImgBB (Free):**
```env
IMAGE_UPLOAD_SERVICE=imgbb
IMGBB_API_KEY=your_imgbb_api_key
```

**For AWS S3:**
```env
IMAGE_UPLOAD_SERVICE=aws
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```

The code automatically uses the service you specify!

## Testing

Try uploading an image through your application. It should:
1. Upload to ImgBB
2. Return a URL like: `https://i.ibb.co/xxxxx/image.jpg`
3. Store the URL in your database

## Troubleshooting

### Error: "IMGBB_API_KEY not configured"
- Make sure you added `IMGBB_API_KEY` to your `.env` file
- Restart your server after adding it

### Error: "Invalid API key"
- Check that you copied the full API key correctly
- Get a new API key from [https://api.imgbb.com/](https://api.imgbb.com/)

### Images not uploading
- Check your internet connection
- Verify the API key is correct
- Check server console for error messages

## ImgBB Limits (Free Tier)

- **32 MB** per image
- **No storage limit**
- **No bandwidth limit**
- **No expiration** (images stay forever)

Perfect for most applications!

