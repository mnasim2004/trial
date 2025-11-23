# How to Restart Your Server

## The Problem

Your server is running **old code**. The terminal shows:
- "Server running on port{5000}" (old code)
- Database error with `throw` (old code - we fixed this!)

## Solution: Restart the Server

### Step 1: Stop the Current Server

1. **Go to your terminal** where the server is running
2. **Press `Ctrl+C`** to stop the server
3. You should see the command prompt again

### Step 2: Start the Server Again

```bash
npm start
```

### Step 3: Check for Success

You should see:
- ✅ "Connected to database" (or error message, but app continues)
- ✅ "Listening on port 3000" (or your PORT)
- ❌ NO "Server running on port{5000}" message
- ❌ NO database error that crashes the app

### Step 4: Access the Frontend

1. **Open your browser**
2. **Go to:** `http://localhost:3000`
3. You should see the **Trial Mate** home page!

## If You Still Get 404 Error

### Check the URL

Make sure you're accessing:
- ✅ `http://localhost:3000` (home page)
- ✅ `http://localhost:3000/users/signin` (login)
- ✅ `http://localhost:3000/users/signup` (sign up)

### Common Mistakes:
- ❌ `http://localhost:5000` (wrong port - old code)
- ❌ `http://localhost:3000/home` (route doesn't exist)
- ❌ `http://localhost:3000/index` (use `/` instead)

## Quick Test

After restarting, try these URLs in order:

1. `http://localhost:3000` → Should show home page
2. `http://localhost:3000/users/signin` → Should show login page
3. `http://localhost:3000/users/signup` → Should show signup page

If all three work, your server is running correctly! 🎉

## Still Having Issues?

1. **Check terminal for errors** - Look for red error messages
2. **Check browser console** - Press F12, look at Console tab
3. **Try a different browser** - Sometimes cache causes issues
4. **Clear browser cache** - Ctrl+Shift+Delete

