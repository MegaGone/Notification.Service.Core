# Notification.Core

A robust and scalable notification service API built with Clean Architecture principles. This service provides email notification capabilities with dynamic template management.

## Features

- **Email Notifications**: Send personalized emails using dynamic templates
- **Template Management**: Create, update, disable, and manage HTML email templates
- **Clean Architecture**: Follows Domain-Driven Design (DDD) and Clean Architecture patterns
- **File Upload**: Support for HTML template file uploads via Cloudinary
- **Database Flexibility**: Supports both MongoDB and PostgreSQL
- **Authentication & Authorization**: JWT-based security with scope validation
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Logging**: Structured logging with Winston and SEQ integration
- **Testing**: Complete unit test coverage with Jest
- **Type Safety**: Full TypeScript implementation

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Databases**: MongoDB (Mongoose) / PostgreSQL (TypeORM)
- **Email Service**: Resend SMTP
- **File Storage**: Cloudinary
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Logging**: Winston + SEQ
- **Build Tool**: Webpack
- **Package Manager**: PNPM

## Prerequisites

- Node.js 20 or higher
- MongoDB or PostgreSQL database
- Resend API key for email sending
- Cloudinary account for file storage

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MegaGone/Notification.Core.git
   cd Notification.Core
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=3000
   API_VERSION=v1
   NODE_ENV=development

   # Database Configuration (MongoDB)
   DB_TYPE=MONGO
   MONGO_URL=mongodb://localhost:27017/notification_core

   # Database Configuration (PostgreSQL - Alternative)
   # DB_TYPE=SQL
   # SQL_HOST=localhost
   # SQL_PORT=5432
   # SQL_USER=your_username
   # SQL_PASSWORD=your_password
   # SQL_DATABASE=notification_core
   # SQL_LOGGING=false
   # SQL_CACHE=false

   # Email Service (Resend)
   RESEND_API_KEY=your_resend_api_key

   # File Storage (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_OUTPUT_DIRECTORY=notification_service_core
   CLOUDINARY_SECURE=true

   # Logging (Optional)
   SEQ_SERVER_URL=http://localhost:5341
   SEQ_API_KEY=your_seq_api_key
   ```

4. **Build the project**

   ```bash
   pnpm run build
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

## API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api/v1/docs
```

### Core Endpoints

#### Notifications

- `POST /api/v1/notification/sendEmail` - Send email notification using template

#### Template Management

- `POST /api/v1/template/store` - Upload and store new email template
- `GET /api/v1/template/paginated` - Get paginated list of templates
- `GET /api/v1/template/{id}` - Get specific template by ID
- `PUT /api/v1/template/update` - Update existing template
- `DELETE /api/v1/template/{id}` - Disable template

## Authentication

All endpoints require JWT Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/v1/notification/sendEmail
```

## Usage Examples

### Send Email Notification

```bash
curl -X POST http://localhost:3000/api/v1/notification/sendEmail \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateID": "template-uuid",
    "recipients": ["user@example.com"],
    "fields": {
      "username": "John Doe",
      "resetLink": "https://example.com/reset"
    }
  }'
```

### Upload Email Template

```bash
curl -X POST http://localhost:3000/api/v1/template/store \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "template=@template.html" \
  -F "sender=noreply@example.com" \
  -F "subject=Password Reset" \
  -F "description=Password reset email template" \
  -F "fields=[\"username\",\"resetLink\"]"
```

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── core/                   # Business logic
│   ├── notification/       # Notification domain
│   ├── template/           # Template domain
│   └── shared/             # Shared domain logic
├── framework/              # External frameworks & tools
│   ├── database/           # Database abstraction
│   ├── server/             # Express server setup
│   └── documentation/      # Swagger configuration
└── configuration/          # Environment configuration
```

### Layers:

- **Domain**: Business entities, rules, and interfaces
- **Application**: Use cases and orchestrators
- **Infrastructure**: External services implementation
- **Presentation**: Controllers and routing

## Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run tests for CI
pnpm run test:ci
```

## 📊 Monitoring & Logging

The service includes comprehensive logging with Winston and optional SEQ integration for centralized log management. All operations are logged with appropriate levels and structured data.

## 🔗 Links

- [Documentation](http://localhost:3000/api/v1/docs)
- [Resend Email Service](https://resend.com/)
- [Cloudinary](https://cloudinary.com/)

---
