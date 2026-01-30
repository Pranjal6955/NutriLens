# 🔐 TEST CREDENTIALS FOR NUTRILENS

## ✅ Ready-to-Use Test Account:

**Email:** `test@nutrilens.com`
**Password:** `test123456`
**Username:** `Test User`

## 🚀 How to Test:

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend  
   npm run dev
   ```

3. **Test Login:**
   - Go to `http://localhost:5173/login`
   - Enter email: `test@nutrilens.com`
   - Enter password: `test123456`
   - Click "Sign In"

4. **Test Signup:**
   - Go to `http://localhost:5173/signup`
   - Create a new account with any email/password
   - Must be 8+ characters for password

## 🔧 Fixed Issues:
- ✅ **API endpoints** now correctly point to `/api/auth/*`
- ✅ **Registration** works with proper backend routes
- ✅ **Login** works with test credentials
- ✅ **Google OAuth** ready (needs Google Client ID setup)

## 📝 Notes:
- Database: MongoDB running on `mongodb://localhost:27017/nutrilens`
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Test user already created in database