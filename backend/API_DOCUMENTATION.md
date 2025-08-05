# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication Endpoints

### Register Individual User

```
POST /api/auth/register/individual
```

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "nationalId": "ABC123456",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "_id": "user_id",
  "email": "john.doe@example.com",
  "role": "individual",
  "accountType": "individual",
  "profile": {
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "nationalId": "ABC123456"
  },
  "token": "jwt_token"
}
```

### Register Corporate User

```
POST /api/auth/register/corporate
```

**Request Body (multipart/form-data):**

```
companyName: Acme Corporation
companyEmail: info@acme.com
companyPhone: +9876543210
registrationNumber: REG123456
taxId: TAX987654
website: https://acme.com
headquartersAddress[street]: 123 Main St
headquartersAddress[city]: Metropolis
headquartersAddress[state]: State
headquartersAddress[zipCode]: 12345
headquartersAddress[country]: Country
primaryContact[name]: Jane Smith
primaryContact[email]: jane.smith@acme.com
primaryContact[phone]: +1122334455
password: password123
businessLicense: [FILE]
taxDocument: [FILE]
```

**Response (201 Created):**

```json
{
  "_id": "user_id",
  "email": "info@acme.com",
  "role": "corporate",
  "accountType": "corporate",
  "profile": {
    "companyName": "Acme Corporation",
    "companyPhone": "+9876543210",
    "registrationNumber": "REG123456"
  },
  "token": "jwt_token"
}
```

### Login User

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "role": "individual|corporate",
  "accountType": "individual|corporate",
  "profile": {
    // Profile data based on account type
  },
  "token": "jwt_token"
}
```

### Get User Profile

```
GET /api/auth/profile
```

**Headers:**

```
Authorization: Bearer jwt_token
```

**Response (200 OK):**

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "role": "individual|corporate",
  "accountType": "individual|corporate",
  "profile": {
    // Profile data based on account type
  }
}
```

## User Management Endpoints

### Get All Users (Admin Only)

```
GET /api/users
```

**Headers:**

```
Authorization: Bearer jwt_token
```

**Response (200 OK):**

```json
[
  {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "individual|corporate|admin",
    "accountType": "individual|corporate"
  },
  // More users...
]
```

### Get User by ID (Admin Only)

```
GET /api/users/:id
```

**Headers:**

```
Authorization: Bearer jwt_token
```

**Response (200 OK):**

```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "role": "individual|corporate|admin",
  "accountType": "individual|corporate"
}
```

### Update User

```
PUT /api/users/:id
```

**Headers:**

```
Authorization: Bearer jwt_token
```

**Request Body (fields to update):**

```json
{
  "email": "new.email@example.com"
  // Other fields to update
}
```

**Response (200 OK):**

```json
{
  "_id": "user_id",
  "email": "new.email@example.com",
  // Updated user data
}
```

### Delete User (Admin Only)

```
DELETE /api/users/:id
```

**Headers:**

```
Authorization: Bearer jwt_token
```

**Response (200 OK):**

```json
{
  "message": "User removed"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Error message describing the issue"
}
```

### 401 Unauthorized

```json
{
  "message": "Not authorized, no token" 
}
```

or

```json
{
  "message": "Not authorized, token failed"
}
```

### 404 Not Found

```json
{
  "message": "User not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error message"
}
```