---
title: "Emergency Recovery & Rebuild Guide"
version: v2.1.0
created: 2024-12-24
updated: 2025-12-29
status: current
category: setup
tags: [recovery, emergency, rebuild, disaster-recovery]
---

# ?? Emergency Recovery & Rebuild Guide

**Version:** v2.1.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

---

## ?? **Table of Contents**

- [TL;DR - Quick Overview](#tldr---quick-overview)
- [Purpose](#-purpose)
- [What You'll Need](#-what-youll-need)
- [Complete Rebuild Steps](#-complete-rebuild-steps)
  - [Phase 1: Get New Hosting](#phase-1-get-new-hosting)
  - [Phase 2: Set Up Server Environment](#phase-2-set-up-server-environment)
  - [Phase 3: Deploy Application](#phase-3-deploy-application)
  - [Phase 4: Domain & DNS Setup](#phase-4-domain--dns-setup)
  - [Phase 5: Verification](#phase-5-verification)
- [Essential Files to Backup](#-essential-files-to-backup)
- [Alternative Hosting Options](#-alternative-hosting-options)
- [Emergency Procedures](#-emergency-procedures)
- [Cost Estimate](#-cost-estimate-for-fresh-start)
- [Quick Rebuild Checklist](#-quick-rebuild-checklist)
- [Important Files Reference](#-important-files-reference)
- [Prevention Tips](#-prevention-tips)
- [Help Resources](#-help-resources)

---

## ?? **TL;DR - Quick Overview**

**Purpose:** Completely rebuild RealFeygon.com from scratch if you lose hosting or need to migrate.

**What You Need:**
- Database dumps (EVE2 DDQ.sql, illusions DDQ.sql)
- GitHub repo access
- New hosting provider
- Domain access

**Basic Steps:**
1. Get new hosting ($5-15/month)
2. Install Node.js + MySQL
3. Clone GitHub repo
4. Import database dumps
5. Configure .env file
6. Start application
7. Point domain DNS
8. Set up SSL

**Time Estimate:** 2-4 hours (depending on experience)

**Cost:** $5-15/month for hosting

---

## ?? **Purpose**

**?? TL;DR:** This guide helps you completely rebuild your application from scratch if disaster strikes.

This guide will help you completely rebuild your RealFeygon.com application from scratch if you lose access to your current hosting or need to move to a new provider.

---

## ?? **What You'll Need**

**?? TL;DR:** Database dumps, GitHub access, and documented passwords are essential.

### **Essential Backups (Keep These Safe!):**

1. **Database Dumps:**
   ```sql
   -- EVE2 database
   EVE2 DDQ.sql (already in your repo)
   
   -- Illusion Spells database
   illusions DDQ.sql (already in your repo)
   ```

2. **Application Code:**
   - GitHub repository: https://github.com/feygon/EVE2-Project
   - Or local backup at: `D:\Repos\RealFeygon\`

3. **Critical Information to Document:**
   ```
   ?? Database passwords (write these down!)
   ?? Session secret (write this down!)
   ?? Domain registrar login
   ?? DNS settings
   ?? SSL certificate details (if custom)
   ```

---

## ?? **Complete Rebuild Steps**

**?? TL;DR:** Five phases - get hosting, set up server, deploy app, configure domain, verify everything works.

### **Phase 1: Get New Hosting**

**?? TL;DR:** Choose between shared hosting (easier), VPS (more control), or free hosting (temporary).

#### **Option A: Another DirectAdmin Hosting Provider**

**Recommended providers with DirectAdmin:**
- Hostinger (~$3-7/month)
- A2 Hosting (~$5-10/month)
- InMotion Hosting (~$7-15/month)
- HostGator (~$5-10/month)

**What to get:**
- Shared hosting with DirectAdmin panel
- Node.js support (v14.x or higher)
- MariaDB/MySQL database access
- SSH access (important!)
- At least 2GB storage, 1GB RAM

#### **Option B: VPS (More Control)**

**Providers:**
- DigitalOcean (~$6/month) - Droplet
- Linode (~$5/month) - Nanode
- Vultr (~$5/month) - Cloud Compute
- AWS Lightsail (~$3.50/month)

**What to get:**
- Ubuntu 20.04 or 22.04 LTS
- 1GB RAM minimum
- 25GB storage minimum
- Install your own stack (see below)

#### **Option C: Free Hosting (Temporary)**

**Free options for testing/temporary:**
- Render.com (free tier)
- Railway.app (free tier with limits)
- Heroku (limited free tier)
- Oracle Cloud (always free tier - 2 VMs)

---

### **Phase 2: Set Up Server Environment**

**?? TL;DR:** Install Node.js, MySQL, create databases, import data dumps.

#### **If DirectAdmin (Shared Hosting):**

1. **Log into DirectAdmin panel**
2. **Create MySQL databases:**
   ```
   Database 1:
   Name: eve2_project
   User: eve2_user
   Password: [NEW_PASSWORD_1]
   
   Database 2:
   Name: illusion_spells
   User: illusion_user
   Password: [NEW_PASSWORD_2]
   ```

3. **Import database dumps:**
   - Go to phpMyAdmin
   - Select database
   - Click "Import"
   - Upload `EVE2 DDQ.sql` to `eve2_project`
   - Upload `illusions DDQ.sql` to `illusion_spells`

4. **Set up Node.js:**
   - DirectAdmin ? Node.js Setup
   - Create new application
   - Choose Node.js version (14.x or higher)
   - Set application root: `/home/username/eve2`
   - Set startup file: `main.js`
   - Set port: 80 or 8080

5. **Enable SSH access:**
   - DirectAdmin ? SSH Keys
   - Generate new key or upload existing
   - Save private key locally

---

#### **If VPS (Full Control):**

**Connect via SSH:**
```bash
ssh root@your-server-ip
```

**1. Update System:**
```bash
apt update && apt upgrade -y
```

**2. Install Node.js:**
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

**3. Install MariaDB:**
```bash
apt install -y mariadb-server

# Secure installation
mysql_secure_installation
# Set root password when prompted
```

**4. Install PM2 (Process Manager):**
```bash
npm install -g pm2

# Set up PM2 to start on boot
pm2 startup
pm2 save
```

**5. Create Application User:**
```bash
adduser realfey
usermod -aG sudo realfey
su - realfey
```

**6. Set up Firewall:**
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**7. Install Nginx (Reverse Proxy):**
```bash
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/realfeygon
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name realfeygon.com www.realfeygon.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
ln -s /etc/nginx/sites-available/realfeygon /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

### **Phase 3: Deploy Application**

**?? TL;DR:** Clone from GitHub, install dependencies, configure .env, start application.

#### **1. Get Code from GitHub:**

```bash
cd /home/realfey
git clone https://github.com/feygon/EVE2-Project.git eve2
cd eve2
```

#### **2. Install Dependencies:**

```bash
npm install
```

#### **3. Create Production .env File:**

```bash
nano .env
```

**Add these variables (update with your new passwords):**
```bash
NODE_ENV=production

# EVE2 Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=eve2_user
DB_PASSWORD=[YOUR_NEW_PASSWORD_1]
DB_NAME=eve2_project

# Illusion Spells Database
DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=illusion_user
DB_ILLUSION_PASSWORD=[YOUR_NEW_PASSWORD_2]
DB_ILLUSION_NAME=illusion_spells

# Session Secret (generate a new one!)
SESSION_SECRET=[GENERATE_NEW_RANDOM_STRING]

# Server Port
PORT=3000
```

**Save:** Ctrl+X, Y, Enter

**Set permissions:**
```bash
chmod 600 .env
```

#### **4. Create Databases and Import Data:**

```bash
# Connect to MySQL
mysql -u root -p

# Create databases
CREATE DATABASE eve2_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE illusion_spells CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create users
CREATE USER 'eve2_user'@'localhost' IDENTIFIED BY 'YOUR_NEW_PASSWORD_1';
CREATE USER 'illusion_user'@'localhost' IDENTIFIED BY 'YOUR_NEW_PASSWORD_2';

# Grant privileges
GRANT ALL PRIVILEGES ON eve2_project.* TO 'eve2_user'@'localhost';
GRANT ALL PRIVILEGES ON illusion_spells.* TO 'illusion_user'@'localhost';

FLUSH PRIVILEGES;
EXIT;

# Import data
mysql -u eve2_user -p eve2_project < "EVE2 DDQ.sql"
mysql -u illusion_user -p illusion_spells < "illusions DDQ.sql"
```

#### **5. Start Application:**

**If using DirectAdmin:**
- Go to Node.js Setup
- Click "Start" on your application

**If using PM2:**
```bash
pm2 start main.js --name realfeygon
pm2 save
```

#### **6. Test Application:**

```bash
# Check if running
curl http://localhost:3000

# Should see HTML response
```

---

### **Phase 4: Domain & DNS Setup**

**?? TL;DR:** Point domain to new server IP, set up free SSL certificate with Let's Encrypt.

#### **1. Update DNS Records:**

**At your domain registrar (e.g., Namecheap, GoDaddy):**

```
A Record:
Name: @
Value: [YOUR_NEW_SERVER_IP]
TTL: Automatic

A Record:
Name: www
Value: [YOUR_NEW_SERVER_IP]
TTL: Automatic
```

**Wait 1-24 hours for DNS propagation**

#### **2. Set up SSL Certificate (Free):**

**If using VPS with Nginx:**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d realfeygon.com -d www.realfeygon.com

# Auto-renew
certbot renew --dry-run
```

**If using DirectAdmin:**
- DirectAdmin ? SSL Certificates
- Let's Encrypt ? Generate

---

### **Phase 5: Verification**

**?? TL;DR:** Test all routes, verify database connections, check SSL certificate.

**Test these URLs:**
```
? https://realfeygon.com/resume
? https://realfeygon.com/eve2
? https://realfeygon.com/illusion
```

**Verify:**
- [ ] All pages load
- [ ] Database connections work
- [ ] Spell categories display correctly
- [ ] No console errors
- [ ] SSL certificate valid

---

## ?? **Essential Files to Backup**

**?? TL;DR:** Database dumps (weekly), .env file (encrypted), GitHub repo (always), recovery info (secure).

### **Database Backups (Weekly):**

```bash
# On your server
mysqldump -u eve2_user -p eve2_project > backup_eve2_$(date +%Y%m%d).sql
mysqldump -u illusion_user -p illusion_spells > backup_illusion_$(date +%Y%m%d).sql

# Download backups
scp user@server:/path/to/backup_*.sql ~/Desktop/backups/
```

### **Application Files (Keep in Git):**

```bash
# Make sure everything is pushed
git add ."
git commit -m "Backup commit"
git push origin main
```

### **Critical Information Document:**

Create a file called `RECOVERY_INFO.txt` (keep offline, encrypted):

```
=== RealFeygon.com Recovery Information ===

GITHUB:
Repository: https://github.com/feygon/EVE2-Project
GitHub Username: [YOUR_USERNAME]
GitHub Email: [YOUR_EMAIL]

DOMAIN:
Domain: realfeygon.com
Registrar: [REGISTRAR_NAME]
Registrar Login: [USERNAME]

DATABASE PASSWORDS:
EVE2 Password: [PASSWORD]
Illusion Password: [PASSWORD]
Session Secret: [SECRET]

HOSTING (OLD):
Provider: GeniusMojo
SSH Host: server06.hostwhitelabel.com
SSH Port: 27493
SSH User: realfey

HOSTING (NEW):
Provider: [NEW_PROVIDER]
IP Address: [IP]
SSH Port: [PORT]
Control Panel: [URL]

NOTES:
- Database dumps location: ~/backups/
- Last backup date: [DATE]
- Node.js version: 18.x
```

**Store this securely!** Options:
- Encrypted USB drive
- Password manager (1Password, Bitwarden)
- Encrypted cloud storage (Cryptomator + Dropbox)

---

## ?? **Alternative Hosting Options**

**?? TL;DR:** Budget hosting ($3-10/mo), VPS ($5-20/mo), or free PaaS options available.

### **Budget Hosting (~$3-10/month):**

| Provider | Price | Node.js | DirectAdmin | SSH |
|----------|-------|---------|-------------|-----|
| Hostinger | $4/mo | ? | ? | ? |
| A2 Hosting | $7/mo | ? | ? | ? |
| InMotion | $7/mo | ? | ? | ? |

### **VPS (~$5-20/month):**

| Provider | Price | RAM | Storage | Notes |
|----------|-------|-----|---------|-------|
| DigitalOcean | $6/mo | 1GB | 25GB | Popular, good docs |
| Linode | $5/mo | 1GB | 25GB | Reliable, fast |
| Vultr | $5/mo | 1GB | 25GB | Many locations |
| Oracle Cloud | FREE | 1GB | 50GB | Always free tier |

### **Platform-as-a-Service (Easier):**

| Provider | Price | Notes |
|----------|-------|-------|
| Render | $0-7/mo | Easy deploy, free tier |
| Railway | $0-5/mo | Great for Node.js |
| Fly.io | $0-10/mo | Edge computing |

---

## ?? **Emergency Procedures**

**?? TL;DR:** If you lose database, use SQL dumps. If you lose GitHub, use local backup. If you lose domain, transfer it.

### **If You Lose Database Access:**

**You have these SQL dump files:**
```
EVE2 DDQ.sql - Complete EVE2 database
illusions DDQ.sql - Complete Illusion Spells database
```

**These files contain EVERYTHING:**
- All table structures
- All data
- All views, procedures, functions
- All you need to recreate databases from scratch

### **If You Lose GitHub Access:**

**Your local copy is at:**
```
D:\Repos\RealFeygon\
```

**Backup this entire folder to:**
- External hard drive
- USB drive  
- Cloud storage (Google Drive, Dropbox)
- Another Git hosting (GitLab, Bitbucket)

### **If You Lose Domain:**

**Steps to transfer domain:**
1. Get transfer authorization code from old registrar
2. Unlock domain
3. Transfer to new registrar (Namecheap, Google Domains, Cloudflare)
4. Update DNS to new server IP
5. Wait for propagation

---

## ?? **Cost Estimate for Fresh Start**

**?? TL;DR:** Minimum $8/mo, comfortable $15/mo, budget $5/mo, or free (with limitations).

### **Minimum Setup (~$8/month):**
```
Domain: $1/month (Namecheap)
Hosting: $5/month (Linode VPS)
Backup storage: $2/month (Backblaze B2)
Total: $8/month
```

### **Comfortable Setup (~$15/month):**
```
Domain: $1/month
VPS: $12/month (DigitalOcean 2GB)
Backup: $2/month
Total: $15/month
```

### **Budget Option (~$5/month):**
```
Domain: $1/month
Shared hosting: $4/month (Hostinger)
Free backups on GitHub
Total: $5/month
```

### **Free Option (Temporary):**
```
Domain: Use free subdomain (render.app, fly.dev)
Hosting: Free tier (Render, Railway)
Backup: GitHub
Total: $0/month (limitations apply)
```

---

## ? **Quick Rebuild Checklist**

**?? TL;DR:** Infrastructure ? Database ? Application ? Domain ? Verify. 5 phases, 30 steps total.

```
Phase 1: Infrastructure
[ ] Get new hosting
[ ] Set up SSH access
[ ] Install Node.js
[ ] Install MariaDB/MySQL
[ ] Install PM2 (if VPS)
[ ] Configure firewall

Phase 2: Database
[ ] Create databases
[ ] Create database users
[ ] Import EVE2 DDQ.sql
[ ] Import illusions DDQ.sql
[ ] Test database connections

Phase 3: Application
[ ] Clone from GitHub
[ ] npm install
[ ] Create .env file
[ ] Update database credentials
[ ] Start application
[ ] Test all routes

Phase 4: Domain
[ ] Update DNS A records
[ ] Wait for propagation
[ ] Set up SSL certificate
[ ] Test HTTPS

Phase 5: Verify
[ ] Test /resume
[ ] Test /eve2
[ ] Test /illusion
[ ] Check database queries
[ ] Verify SSL certificate
[ ] Set up backups
```

---

## ?? **Important Files Reference**

**?? TL;DR:** All critical files are in GitHub repo. Keep .env and recovery info separate and secure.

**In Your GitHub Repo:**
```
? EVE2 DDQ.sql - EVE2 database dump
? illusions DDQ.sql - Illusion Spells database dump
? package.json - All dependencies listed
? main.js - Application entry point
? dbcon.js - Database config (uses env vars)
? dbcon_illusion.js - Second database config
? All views/ - Templates
? All scripts/ - Application logic
? All documentation
```

**Create Regular Backups Of:**
```
?? .env - Production credentials (don't commit to git!)
?? Current database dumps (weekly)
?? RECOVERY_INFO.txt - All access details
?? SSL certificates (if custom)
```

---

## ??? **Prevention Tips**

**?? TL;DR:** Automate backups, keep multiple copies, document everything, test recovery procedure.

1. **Set up automatic database backups:**
   ```bash
   # Add to crontab (weekly backup)
   0 2 * * 0 mysqldump -u user -p'password' database > ~/backups/backup_$(date +\%Y\%m\%d).sql
   ```

2. **Keep multiple copies:**
   - Local machine
   - GitHub
   - External drive
   - Cloud storage

3. **Document everything:**
   - Keep RECOVERY_INFO.txt updated
   - Screenshot important settings
   - Save email confirmations

4. **Test recovery procedure:**
   - Try rebuilding on local machine
   - Verify database imports work
   - Practice deployment process

---

## ?? **Help Resources**

- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials
- **Node.js Deployment:** https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Documentation:** https://nginx.org/en/docs/

---

## ?? **You're Prepared!**

With this guide and your backups, you can rebuild your entire application from scratch on any hosting provider!

**Remember to:**
- Keep database dumps updated
- Push code to GitHub regularly
- Store recovery info securely
- Test backups periodically

**You've got this!** ??
