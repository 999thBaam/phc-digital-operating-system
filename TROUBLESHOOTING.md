# Login Error Fix - Troubleshooting Guide

## 🔴 Issue Encountered

**Error Message:** "Internal server error"

**Screenshot:**

![Login Error](file:///Users/amitbagra/.gemini/antigravity/brain/900cf4af-29f8-42d8-9fa9-f718a9623bdb/uploaded_image_1764426151981.png)

**Root Cause:**
User attempted to login with:
- License Number: `9087654321`
- Email: `demo2@phc.com`

But this PHC doesn't exist in the database. The system tried to query schema `phc_9087654321` which hasn't been created yet.

---

## ✅ Fix Applied

**File Modified:** [server/src/routes/auth.ts](file:///Users/amitbagra/Desktop/Sanjeevani%20OS/server/src/routes/auth.ts#L102-L116)

**What Changed:**
Added error handling to detect when a PHC schema doesn't exist and return a user-friendly error message instead of exposing internal Prisma errors.

**Before:**
```typescript
user = await tenantClient.user.findUnique({ where: { email } });
```

**After:**
```typescript
try {
    user = await tenantClient.user.findUnique({ where: { email } });
} catch (schemaError: any) {
    if (schemaError.code === 'P2021') {
        return res.status(500).json({
            error: 'PHC database schema not found. Please contact Super Admin to complete PHC setup.'
        });
    }
    throw schemaError;
}
```

**New Error Message:**
Instead of "Internal server error", users will now see:
> "PHC database schema not found. Please contact Super Admin to complete PHC setup."

---

## 📝 How to Use the System Correctly

### ✅ Option 1: Use Demo PHC (Quickest)

**For Testing, Use These Working Credentials:**

**License Number:** `PHC-DEMO-001`

**Choose any role:**
- **Admin:** `admin@demo.phc.com` / `admin123`
- **Doctor:** `doctor@demo.phc.com` / `admin123`
- **Nurse:** `nurse@demo.phc.com` / `admin123`
- **Lab Tech:** `lab@demo.phc.com` / `admin123`
- **Pharmacist:** `pharma@demo.phc.com` / `admin123`

### ✅ Option 2: Create a New PHC

**Step 1: Login as Super Admin**
1. Go to http://localhost:5173
2. **Leave the "PHC License Number" field EMPTY**
3. Email: `superadmin@phc-platform.com`
4. Password: `SuperAdmin@123`
5. Click Login

**Step 2: Create New PHC**
1. Click **"Create New PHC"** button
2. Fill in the form:
   - **PHC Name:** `Test Health Centre`
   - **License Number:** `9087654321` (or any unique number)
   - **Address:** `123 Test Street, City`
   - **Contact Number:** `9876543210`
   - **Admin Email:** `demo2@phc.com` (or any email)
   - **Admin Name:** `Test Admin`
   - **Admin Password:** `password123`
3. Click **"Create PHC"**
4. Wait for success message

**Step 3: Login to New PHC**
1. Logout from Super Admin
2. Go to login page
3. Now use:
   - **License Number:** `9087654321`
   - **Email:** `demo2@phc.com`
   - **Password:** `password123`
4. Login successfully!

---

## 🔍 Understanding PHC Status

PHCs can have different statuses that affect login:

| Status | Can Login? | Created By |
|--------|-----------|------------|
| **PENDING** | ❌ No | Public registration (awaiting approval) |
| **VERIFIED** | ✅ Yes | Super Admin approved |
| **ACTIVE** | ✅ Yes | Super Admin activated |
| **SUSPENDED** | ❌ No | Super Admin suspended |
| **INACTIVE** | ❌ No | Super Admin deactivated |

**Error Messages You Might See:**

- ❌ "Invalid PHC License Number" → License doesn't exist
- ❌ "Your PHC application is pending approval" → Status = PENDING
- ❌ "Your PHC account has been suspended" → Status = SUSPENDED
- ❌ "Your PHC account is inactive" → Status = INACTIVE
- ❌ "PHC database schema not found" → Schema not created (rare)
- ❌ "Invalid credentials" → Wrong email/password

---

## 🧪 Testing Checklist

### Test Super Admin Login ✅
- [ ] Login with: `superadmin@phc-platform.com` / `SuperAdmin@123`
- [ ] Leave license field empty
- [ ] Should access Super Admin dashboard

### Test Demo PHC Login ✅
- [ ] Login with: `PHC-DEMO-001` / `admin@demo.phc.com` / `admin123`
- [ ] Should access PHC tenant dashboard

### Test Creating New PHC ✅
- [ ] Login as Super Admin
- [ ] Click "Create New PHC"
- [ ] Fill form and submit
- [ ] Should see new PHC in list

### Test New PHC Login ✅
- [ ] Logout
- [ ] Login with new PHC license + credentials
- [ ] Should access tenant dashboard

### Test Error Handling ✅
- [ ] Try logging in with non-existent license
- [ ] Should see clear error message (not "Internal server error")

---

## 🎯 Next Steps

1. **Try the Demo PHC First**
   ```
   License: PHC-DEMO-001
   Email: admin@demo.phc.com
   Password: admin123
   ```

2. **Test Creating a New PHC**
   - Login as Super Admin
   - Create a new PHC
   - Verify you can login to it

3. **Explore Features**
   - Register patients
   - Generate OPD tokens
   - Test doctor consultation
   - Process lab orders
   - Dispense medicines

---

## 📞 Need Help?

**Common Issues:**

**Q: I see "Invalid PHC License Number"**
A: The license number doesn't exist. Use `PHC-DEMO-001` or create a new PHC first.

**Q: I see "PHC database schema not found"**
A: The PHC exists but wasn't fully provisioned. Contact Super Admin to recreate it.

**Q: I see "Invalid credentials"**
A: Your email or password is wrong. Check spelling and case-sensitivity.

**Q: Where do I find my PHC license?**
A: Your PHC license is provided when the PHC is created by the Super Admin.

---

**Fixed and Ready to Use! 🎉**

The error handling is now improved. Try logging in with the Demo PHC credentials above!
