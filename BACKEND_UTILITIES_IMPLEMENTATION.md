# Backend Implementation: Utilities/Outlet Endpoint

## Overview
The frontend requires a REST API endpoint to fetch a list of utilities (useful resources) that will be displayed on the home board page. Each utility represents a resource with an icon/picture, name, and link.

## Endpoint Specification

### Endpoint Details
- **URL**: `/utilities/outlet`
- **Method**: `GET`
- **Authentication**: Required (Bearer token via Authorization header)
- **Content-Type**: `application/json`

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Response Format

#### Success Response (200 OK)
Returns a JSON array of utility objects:

```json
[
  {
    "id": 1,
    "name": "Documentation",
    "link": "https://example.com/docs",
    "icon": "📚",
    "picture": "https://example.com/icon.png",
    "image": "https://example.com/image.png",
    "description": "Access our comprehensive documentation"
  },
  {
    "id": 2,
    "name": "Support Center",
    "link": "https://example.com/support",
    "icon": "💬",
    "description": "Get help from our support team"
  }
]
```

#### Error Responses
- **401 Unauthorized**: When authentication token is missing or invalid
- **500 Internal Server Error**: When server encounters an error

### Data Model

Each utility object should contain the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Optional | Unique identifier for the utility |
| `name` | string | **Required** | Display name of the utility |
| `link` | string | **Required** | URL to the resource (should be a valid URL) |
| `icon` | string | Optional | Emoji or icon character to display |
| `picture` | string | Optional | URL to an image/icon for the utility |
| `image` | string | Optional | Alternative field for image URL (frontend checks both `picture` and `image`) |
| `description` | string | Optional | Brief description of the utility |

### Field Priority for Display
The frontend will use images in the following priority order:
1. `picture` (if present and valid)
2. `image` (if present and valid)
3. `icon` (if present, treated as emoji/character)
4. Default fallback icon (🔗) if none of the above are available

### Implementation Notes

1. **Authentication**: The endpoint should verify the Bearer token and ensure the user is authenticated. Use the same authentication mechanism as other protected endpoints in the application.

2. **Authorization**: Consider if all authenticated users should see all utilities, or if there should be role-based or user-specific filtering.

3. **Data Source**: Utilities can be:
   - Stored in a database table
   - Configured via environment variables or config files
   - Dynamically generated based on user permissions/roles
   - A combination of the above

4. **Caching**: Consider implementing caching if utilities don't change frequently, as this endpoint may be called on every home board page load.

5. **Ordering**: If order matters, include an `order` or `sortOrder` field, or return utilities in the desired display order.

6. **Validation**: 
   - Ensure `link` is a valid URL format
   - Validate that required fields are present
   - Sanitize any user-generated content if utilities can be created/edited

### Example Database Schema (if using a database)

```sql
CREATE TABLE utilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  link TEXT NOT NULL,
  icon VARCHAR(10),
  picture TEXT,
  image TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Example Implementation (Node.js/Express)

```typescript
// Example route handler
app.get('/utilities/outlet', authenticateToken, async (req, res) => {
  try {
    // Fetch utilities from database or config
    const utilities = await getUtilities();
    
    // Filter active utilities if needed
    const activeUtilities = utilities.filter(u => u.isActive);
    
    // Return utilities array
    res.json(activeUtilities);
  } catch (error) {
    console.error('Error fetching utilities:', error);
    res.status(500).json({ error: 'Failed to fetch utilities' });
  }
});
```

### Testing Checklist

- [ ] Endpoint returns 200 OK with valid authentication
- [ ] Endpoint returns 401 Unauthorized without authentication
- [ ] Response is a valid JSON array
- [ ] Each utility object contains required fields (`name`, `link`)
- [ ] Optional fields are handled gracefully
- [ ] Links are valid URLs
- [ ] Empty array is returned if no utilities exist
- [ ] Error handling works correctly

### Additional Considerations

1. **Admin Interface**: Consider creating an admin interface to manage utilities (CRUD operations) if utilities need to be dynamically managed.

2. **Localization**: If the application supports multiple languages, consider adding localized name/description fields.

3. **Analytics**: Track which utilities are clicked most frequently for insights.

4. **Rate Limiting**: Apply appropriate rate limiting to prevent abuse.

---

## Questions for Backend Team

1. Should utilities be user-specific, role-based, or global for all users?
2. Do utilities need CRUD operations, or are they static/config-based?
3. Should there be any filtering based on user permissions or subscription tier?
4. What is the expected data source (database, config file, external service)?
5. Are there any specific security requirements for the links (e.g., URL validation, allowed domains)?

