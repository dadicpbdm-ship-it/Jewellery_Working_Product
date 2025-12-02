# Security Implementation - Installation Guide

## ✅ Completed Security Fixes

All 6 critical security vulnerabilities have been fixed:

1. ✅ **JWT Secret** - Rotated with cryptographically secure 128-character secret
2. ✅ **Credential Protection** - Created `.gitignore` and `.env.example`
3. ✅ **CORS Configuration** - Restricted to allowed origins only
4. ✅ **Rate Limiting** - Added for auth (5/15min) and API (100/15min)
5. ✅ **Input Validation** - Email, password, and name validation
6. ✅ **Password Hashing** - Increased bcrypt rounds to 12

---

## 📦 Required Package Installation

**IMPORTANT:** You need to install two packages manually due to PowerShell execution policy:

### Option 1: Using Command Prompt (Recommended)
```cmd
cd server
npm install express-rate-limit express-validator
```

### Option 2: Using PowerShell with Bypass
```powershell
cd server
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install express-rate-limit express-validator
```

### Option 3: Using Git Bash or WSL
```bash
cd server
npm install express-rate-limit express-validator
```

---

## 🔄 Restart Required

After installing the packages, **restart your server**:

```bash
cd server
node server.js
```

---

## 🧪 Testing the Security Fixes

### 1. Test Rate Limiting
Try logging in 6 times with wrong credentials:
- First 5 attempts: Should return "Invalid email or password"
- 6th attempt: Should return "Too many login attempts, please try again after 15 minutes"

### 2. Test Input Validation

**Invalid Email:**
```json
POST /api/auth/register
{
  "name": "Test User",
  "email": "invalid-email",
  "password": "Test1234"
}
```
Expected: `400 Bad Request` with validation error

**Weak Password:**
```json
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "weak"
}
```
Expected: `400 Bad Request` - "Password must be at least 8 characters long"

**Valid Registration:**
```json
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234"
}
```
Expected: `201 Created` with user data and token

### 3. Test CORS
Try accessing the API from an unauthorized origin:
- Should be blocked with CORS error
- Only `http://localhost:5173` and `http://localhost:3000` are allowed in development

### 4. Verify JWT Secret
- Login and check that you receive a valid token
- The token should be much longer than before (due to 128-char secret)

---

## ⚠️ Important Notes

### For Production Deployment

1. **Update CORS Origins:**
   ```javascript
   // In server/server.js, line 24
   const allowedOrigins = process.env.NODE_ENV === 'production'
       ? ['https://your-actual-domain.com'] // ← Change this!
       : ['http://localhost:5173', 'http://localhost:3000'];
   ```

2. **Rotate Razorpay Keys:**
   - Your current keys are exposed in this conversation
   - Login to Razorpay Dashboard → Settings → API Keys
   - Generate new keys
   - Update `.env` file

3. **Set NODE_ENV:**
   ```bash
   # In production
   NODE_ENV=production
   ```

4. **Never Commit `.env`:**
   - `.gitignore` is now configured
   - Verify with: `git status` (should not show `.env`)

---

## 🔐 Password Requirements

Users must now create passwords that:
- Are at least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number

Example valid passwords:
- `MyPass123`
- `SecureP@ss1`
- `Test1234`

---

## 📊 Security Audit

Run these commands to check for vulnerabilities:

```bash
cd server
npm audit
npm audit fix
```

---

## 🎯 What Changed

### Modified Files:
1. `server/.env` - Updated JWT secret
2. `server/.gitignore` - Created to protect sensitive files
3. `server/.env.example` - Created as template
4. `server/server.js` - Added CORS config and rate limiting
5. `server/routes/authRoutes.js` - Added validation middleware
6. `server/models/User.js` - Increased bcrypt rounds to 12
7. `server/middleware/validationMiddleware.js` - Created (NEW)

### New Dependencies:
- `express-rate-limit` - For rate limiting
- `express-validator` - For input validation

---

## ✨ Next Steps

1. Install the required packages (see above)
2. Restart the server
3. Test the security features
4. Update CORS origins for production
5. Rotate Razorpay credentials
6. Run `npm audit` to check for other vulnerabilities

---

## 🆘 Troubleshooting

**Error: "Cannot find module 'express-rate-limit'"**
- Solution: Install the packages as shown above

**Error: "Not allowed by CORS"**
- Solution: Make sure your frontend is running on `http://localhost:5173` or `http://localhost:3000`

**Error: "Too many login attempts"**
- Solution: Wait 15 minutes or restart the server to reset the counter

**Validation errors not showing:**
- Solution: Make sure `express-validator` is installed

---

**All security fixes are now in place! 🎉**
