# MyFuel

MyFuel is a full-stack fuel tracker project with React, Tailwind, Node, Express, MySQL, JWT auth, Gmail OTP, bike management, fuel entries, mileage history, and dashboard charts.

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create the MySQL database:

```bash
mysql -u root -p < backend/database/schema.sql
```

3. Edit `backend/.env`:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=myfuel
JWT_SECRET=make_this_long_and_private
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Use a Gmail app password, not your normal Gmail password.

4. Start both apps:

```bash
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5000

## Live Deployment

Use [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway + Vercel deployment steps.

## Main Features

- Signup with email OTP
- OTP verification and password setup
- Login with JWT
- Forgot password with OTP reset
- Add, edit, and unlink bikes
- Add fuel entries with odometer, liters, amount, and fill date
- Auto mileage calculation after the first entry
- Dashboard totals, monthly chart, bike summaries, and recent activity
