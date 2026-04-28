# MyFuel Live Deployment

Recommended setup:

- Backend API: Railway
- MySQL database: Railway MySQL
- Frontend: Vercel

## 1. Push Project To GitHub

Do not push `.env` files. This project already ignores `.env`.

```bash
git init
git add .
git commit -m "Initial MyFuel project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/myfuel.git
git push -u origin main
```

## 2. Create MySQL On Railway

1. Open Railway.
2. Create a new project.
3. Add a MySQL database.
4. Open the MySQL service variables.
5. Railway provides these variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

The backend supports these Railway variable names directly.

## 3. Import Database Schema

Open Railway MySQL data/query console and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  dob DATE NOT NULL,
  is_verified TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('signup', 'reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_otps_email_purpose (email, purpose),
  INDEX idx_otps_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS bikes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  number VARCHAR(50) NOT NULL,
  fuel_type ENUM('Petrol', 'Diesel', 'CNG', 'Electric', 'Other') NOT NULL DEFAULT 'Petrol',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bikes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_bike_number (user_id, number)
);

CREATE TABLE IF NOT EXISTS fuel_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bike_id INT NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  odometer INT NOT NULL,
  mileage DECIMAL(10,2) NULL,
  filled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fuel_entries_bike FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
  INDEX idx_fuel_entries_bike_date (bike_id, filled_at),
  INDEX idx_fuel_entries_bike_odometer (bike_id, odometer)
);
```

## 4. Deploy Backend On Railway

1. Add a new Railway service from your GitHub repo.
2. Set Root Directory to:

```text
/backend
```

3. Set Start Command:

```bash
npm start
```

4. Add variables to the backend service:

```env
NODE_ENV=production
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-frontend-url.vercel.app
```

5. Reference or copy Railway MySQL variables into the backend service:

```env
MYSQLHOST=...
MYSQLPORT=...
MYSQLUSER=...
MYSQLPASSWORD=...
MYSQLDATABASE=...
```

6. After deployment, test:

```text
https://your-backend-url.up.railway.app/api/health
```

## 5. Deploy Frontend On Vercel

1. Import the same GitHub repo in Vercel.
2. Set Root Directory to:

```text
frontend
```

3. Use these settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

4. Add environment variable:

```env
VITE_API_URL=https://your-backend-url.up.railway.app/api
```

5. Deploy.

## 6. Final CORS Update

After Vercel gives the final frontend URL, go back to Railway backend variables and set:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

Redeploy backend once.

