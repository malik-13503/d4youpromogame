# Railway Deployment Guide

## Quick Railway Deployment

### 1. Connect to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `d4youpromogame` repository

### 2. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service"
3. Select "PostgreSQL"
4. Railway will automatically create a database

### 3. Configure Environment Variables
In your Railway project settings, add these variables:
- `DATABASE_URL` - (automatically provided by Railway PostgreSQL)
- `RESEND_API_KEY` - Get from [resend.com](https://resend.com)
- `NODE_ENV` - Set to `production`

### 4. Deploy
Railway will automatically:
- Install dependencies
- Build the project
- Start the application
- Provide a public URL

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection (auto-generated) | Yes |
| `RESEND_API_KEY` | Email service API key | Yes |
| `NODE_ENV` | Set to `production` | No |

## Post-Deployment

### 1. Initialize Database
After deployment, run database setup:
```bash
npm run db:push
```

### 2. Default Admin Access
- Email: admin@doneforyoupros.com
- Password: password@security

### 3. Change Admin Credentials
1. Login to admin dashboard
2. Go to Overview tab
3. Update credentials in the form

## Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Create API key
4. Add to Railway environment variables

## Troubleshooting

### Common Issues
- **Database Connection**: Check DATABASE_URL is set correctly
- **Email Not Sending**: Verify RESEND_API_KEY is valid
- **Build Errors**: Check Railway logs for detailed error messages

### View Logs
In Railway dashboard:
1. Go to your service
2. Click "Logs" tab
3. Monitor for errors

## Support
Contact Railway support or check their documentation for deployment issues.