# AWS S3 Setup Guide - Free Tier

## Is AWS Free?

**Yes!** AWS offers a **Free Tier** that includes:
- **5 GB of S3 storage** (for 12 months)
- **20,000 GET requests** per month
- **2,000 PUT requests** per month
- After 12 months, you only pay for what you use (very cheap - about $0.023 per GB/month)

## Step-by-Step AWS Account Setup

### 1. Create AWS Account

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Click **"Create an AWS Account"** (top right)
3. Enter your email address and choose a password
4. Complete the registration form:
   - Account name
   - Contact information
   - Payment method (credit card required, but won't be charged for free tier usage)
   - Phone verification
5. Choose a support plan (select **"Basic Plan - Free"**)

### 2. Create S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for **"S3"** in the services search bar
3. Click **"Create bucket"**
4. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `trial-app-uploads-yourname`)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (or keep it checked if you want private uploads)
   - Click **"Create bucket"**

### 3. Create IAM User (for API access)

1. Search for **"IAM"** in AWS Console
2. Click **"Users"** in the left sidebar
3. Click **"Create user"**
4. Enter username: `trial-app-user`
5. Select **"Provide user access to the AWS Management Console"** (optional) OR
   Select **"Access key - Programmatic access"** (recommended for API)
6. Click **"Next"**
7. Click **"Attach policies directly"**
8. Search for and select **"AmazonS3FullAccess"** (or create a custom policy with only needed permissions)
9. Click **"Next"** → **"Create user"**
10. **IMPORTANT**: Copy and save:
    - **Access Key ID**
    - **Secret Access Key** (you can only see this once!)

### 4. Configure Your Application

Create a `.env` file in your project root:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_BUCKET_NAME=your_bucket_name_here
AWS_REGION=us-east-1
PORT=3000
```

### 5. Test Your Setup

After setting up, restart your server:
```bash
npm start
```

Try uploading a file through your application to verify it works.

## Alternative: Run Without AWS (Local Storage)

If you don't want to use AWS right now, you can modify the code to save files locally instead. However, this requires code changes.

## Security Tips

1. **Never commit your `.env` file to Git** (it should be in `.gitignore`)
2. **Rotate your access keys** periodically
3. **Use IAM policies** to limit permissions (only S3 access, not full AWS access)
4. **Enable MFA** on your AWS account

## Cost Monitoring

- AWS Free Tier dashboard: [https://console.aws.amazon.com/billing/home#/freetier](https://console.aws.amazon.com/billing/home#/freetier)
- Set up billing alerts to avoid unexpected charges

## Need Help?

- AWS Documentation: [https://docs.aws.amazon.com/s3/](https://docs.aws.amazon.com/s3/)
- AWS Support: Available in AWS Console

