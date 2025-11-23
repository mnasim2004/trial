# Database Setup Guide

Your application uses **MongoDB** (specifically MongoDB Atlas - cloud database).

## Current Status

The database connection string is hardcoded in `db.js`. The connection might be failing because:
1. The database cluster doesn't exist anymore
2. The credentials are invalid
3. Network/firewall issues

## Option 1: Use Existing MongoDB Atlas (Recommended - Free)

### Step 1: Check if Database Exists
The connection string in `db.js` points to:
- Cluster: `trialmate.fasasom.mongodb.net`
- Database name: Not specified (will use default)

### Step 2: Create/Update MongoDB Atlas Database

1. **Go to MongoDB Atlas**: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up/Log in** (Free tier available!)
3. **Create a Cluster** (if you don't have one):
   - Choose "Free" tier (M0)
   - Select a region close to you
   - Click "Create Cluster"
4. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `mohammednasim2004` (or create new)
   - Password: Create a strong password
   - Click "Add User"
5. **Whitelist IP Address**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
6. **Get Connection String**:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `trialmate`)

### Step 3: Update Connection String

**Option A: Update `db.js` directly**
```javascript
const mongo_uri = "mongodb+srv://username:password@cluster.mongodb.net/trialmate?retryWrites=true&w=majority";
```

**Option B: Use Environment Variable (Recommended)**
Create/update `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trialmate?retryWrites=true&w=majority
```

## Option 2: Use Local MongoDB (Alternative)

If you prefer to run MongoDB locally:

1. **Install MongoDB**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. **Start MongoDB service**
3. **Update connection string** in `db.js`:
```javascript
const mongo_uri = "mongodb://localhost:27017/trialmate";
```

## Database Collections

Your app will automatically create these collections when you use them:
- `users` - User accounts
- `products` - Product listings
- `trials` - Trial bookings

## Troubleshooting

### Error: "querySrv ENOTFOUND"
- The MongoDB cluster doesn't exist or is unreachable
- Check if the cluster name in connection string is correct
- Verify network access in MongoDB Atlas

### Error: "Authentication failed"
- Wrong username/password
- Update credentials in connection string

### Error: "Connection timeout"
- IP address not whitelisted in MongoDB Atlas
- Go to Network Access and add your IP

### App Still Works Without Database?
- The app will start even if database connection fails
- Database features (user registration, products, etc.) won't work
- You'll see error messages in console but app won't crash

## Quick Test

After setting up, restart your server:
```bash
npm start
```

You should see: `Connected to database` in the console.

If you see an error, check:
1. Connection string format
2. Username/password
3. Network access settings
4. Cluster status in MongoDB Atlas

