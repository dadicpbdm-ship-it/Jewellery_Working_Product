# Remaining API URL Updates

The following files still need to be updated to use the centralized API configuration.

## Instructions

In each file below, add this import at the top:
```javascript
import { API_URL } from '../config';
```

Then replace all instances of `'http://localhost:5000'` with `` `${API_URL}` ``

## Files to Update:

1. ✅ `client/src/context/AuthContext.jsx` - DONE
2. ⏳ `client/src/context/WishlistContext.jsx`
3. ⏳ `client/src/pages/AdminDashboard.jsx`
4. ⏳ `client/src/pages/Checkout.jsx`
5. ⏳ `client/src/pages/Contact.jsx`
6. ⏳ `client/src/pages/DeliveryAgentRegister.jsx`
7. ⏳ `client/src/pages/DeliveryDashboard.jsx`
8. ⏳ `client/src/pages/Home.jsx`
9. ⏳ `client/src/pages/ManageDeliveryAgents.jsx`
10. ⏳ `client/src/pages/MyOrders.jsx`
11. ⏳ `client/src/pages/OrderDetails.jsx`
12. ⏳ `client/src/pages/ProductDetails.jsx`
13. ⏳ `client/src/pages/Shop.jsx`
14. ⏳ `client/src/pages/UserDashboard.jsx`

## Quick Find & Replace

You can use VS Code's find and replace feature:
1. Press `Ctrl+Shift+H` (Find and Replace in Files)
2. Find: `'http://localhost:5000`
3. Replace with: `` `${API_URL}` ``
4. Scope: `client/src` folder
5. Click "Replace All"

Then manually add the import statement to each affected file:
```javascript
import { API_URL } from '../config';
```

Or for files in subdirectories like `pages/`:
```javascript
import { API_URL } from '../config';
```

## After Updating

1. Create `.env.local` file in `client/` directory with:
   ```
   VITE_API_URL=http://localhost:5000
   ```

2. Restart the development server

3. Test that all API calls still work
