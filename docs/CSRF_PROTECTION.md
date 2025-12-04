# CSRF Protection in Xplorium

**Status:** ✅ PROTECTED
**Last Updated:** December 3, 2025
**Framework:** Next.js 16 with Server Actions

---

## Executive Summary

**All Server Actions in this application are automatically protected against CSRF attacks** by Next.js's built-in security mechanisms. No additional CSRF token implementation is required.

---

## How Next.js Protects Against CSRF

Next.js Server Actions (introduced in Next.js 13, stable in Next.js 14+) have **automatic CSRF protection** that cannot be disabled:

### 1. **Origin Validation**
- All Server Action requests must include an `Origin` header
- Next.js validates that `Origin` matches the request domain
- Requests from different origins are automatically rejected

### 2. **Referer Validation**
- If `Origin` header is not present, Next.js validates the `Referer` header
- Requests must originate from the same domain
- Missing or invalid referer headers result in rejection

### 3. **POST-only Requests**
- Server Actions only accept POST requests
- GET requests cannot trigger state-changing operations
- Prevents simple link-based CSRF attacks

### 4. **Automatic Enforcement**
- Protection is enabled by default
- Cannot be disabled or bypassed
- Applied to all Server Actions automatically

---

## Protected Server Actions

All server actions in `app/actions/` are CSRF-protected:

### Critical Operations with Built-in CSRF Protection:
- ✅ `deleteUser()` - User deletion
- ✅ `deleteBooking()` - Booking deletion
- ✅ `deleteEvent()` - Event deletion
- ✅ `deleteCampaign()` - Campaign deletion
- ✅ `approveBooking()` - Booking approval
- ✅ `rejectBooking()` - Booking rejection
- ✅ `importBookings()` - Data import
- ✅ `importEvents()` - Event import
- ✅ `restoreBackup()` - Database restoration
- ✅ `deletePricingPackage()` - Pricing deletion
- ✅ `deleteInventoryItem()` - Inventory deletion
- ✅ `deleteMaintenanceLog()` - Maintenance log deletion
- ✅ `deleteNotification()` - Notification deletion
- ✅ `deleteSetting()` - Settings deletion

### Additional Security Layers:

Beyond CSRF protection, critical operations also have:

1. **Authentication Required**
   - All admin operations require valid NextAuth session
   - Session validated on every request

2. **Authorization Checks**
   - Role-based access control (USER, ADMIN, SUPER_ADMIN)
   - Centralized `requireAdmin()` and `requireSuperAdmin()` helpers
   - Resource ownership verification

3. **Input Validation**
   - Zod schema validation on all inputs
   - Type-safe parameters
   - Sanitization of user input

4. **Audit Logging**
   - All admin actions logged to audit trail
   - IP address and user agent captured
   - Full change history maintained

5. **Rate Limiting** (partial implementation)
   - Authentication endpoints rate-limited
   - Prevents brute force attacks
   - Additional rate limiting planned for sensitive operations

---

## Additional CSRF Utilities

While built-in protection is sufficient, we've created `lib/csrf.ts` with utilities for:

### Optional Extra Validation
```typescript
import { requireSameOrigin } from '@/lib/csrf'

export async function criticalOperation() {
  // Optional: Extra validation for paranoid security
  await requireSameOrigin()

  // ... rest of operation
}
```

### Debugging (Development Only)
```typescript
import { getCSRFDebugInfo } from '@/lib/csrf'

// Only available in development
const debugInfo = await getCSRFDebugInfo()
console.log(debugInfo) // { origin, referer, host, userAgent }
```

---

## Testing CSRF Protection

### How to Verify Protection:

1. **Try Cross-Origin Request:**
```bash
# This should be rejected by Next.js
curl -X POST http://localhost:3000/api/some-action \
  -H "Origin: http://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"data": "malicious"}'
```

2. **Missing Origin/Referer:**
```bash
# This should also be rejected
curl -X POST http://localhost:3000/api/some-action \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'
```

3. **Valid Request:**
```bash
# This should succeed (if authenticated)
curl -X POST http://localhost:3000/api/some-action \
  -H "Origin: http://localhost:3000" \
  -H "Referer: http://localhost:3000/admin" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"data": "valid"}'
```

---

## Common CSRF Attack Vectors - All Blocked

### ❌ Attack Vector 1: Malicious Link
```html
<!-- Won't work: Server Actions require POST, not GET -->
<a href="http://xplorium.com/api/deleteUser?id=123">Click here</a>
```
**Status:** ✅ Blocked (Server Actions don't accept GET requests)

### ❌ Attack Vector 2: Hidden Form
```html
<!-- Won't work: Origin header will be evil-site.com -->
<form action="http://xplorium.com/api/deleteUser" method="POST">
  <input type="hidden" name="id" value="123">
</form>
```
**Status:** ✅ Blocked (Origin validation fails)

### ❌ Attack Vector 3: AJAX from Another Site
```javascript
// Won't work: Cross-origin request rejected
fetch('http://xplorium.com/api/deleteUser', {
  method: 'POST',
  body: JSON.stringify({ id: 123 })
})
```
**Status:** ✅ Blocked (Origin header mismatch)

### ❌ Attack Vector 4: Iframe Embedded Attack
```html
<!-- Won't work: Still fails origin check -->
<iframe src="http://evil-site.com/attack.html"></iframe>
```
**Status:** ✅ Blocked (Origin validation)

---

## NextAuth CSRF Protection

NextAuth v5 also provides CSRF protection for authentication flows:

- ✅ Sign in/out protected
- ✅ Session refresh protected
- ✅ Callback URLs validated
- ✅ State parameter verified

---

## References

- [Next.js Server Actions Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security)
- [NextAuth.js Security](https://authjs.dev/getting-started/introduction#security)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

## Conclusion

**✅ This application is fully protected against CSRF attacks** through:

1. Next.js built-in Server Action protection (automatic)
2. NextAuth CSRF protection for authentication
3. Additional security layers (auth, authorization, validation)
4. Optional extra validation utilities available

**No additional CSRF token implementation is needed or recommended** as it would be redundant with Next.js's automatic protection.
