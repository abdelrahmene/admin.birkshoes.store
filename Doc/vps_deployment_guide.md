# Guide Déploiement BirkShoes Admin Dashboard - VPS Hostinger

## 🎯 Objectif Accompli
Déploiement réussi du dashboard Next.js sur VPS Hostinger avec HTTPS sécurisé.

## 📋 Prérequis Utilisés
- VPS Hostinger Ubuntu 24.04 LTS (IP: 148.230.125.251)
- Domaine: admin.birkshoes.store
- Code source: Repository GitHub

## 🛠️ Étapes Réalisées

### 1. Préparation Serveur
```bash
ssh root@148.230.125.251
apt update && apt upgrade -y
```

### 2. Installation Stack Technique
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Outils essentiels
npm install -g pm2
apt install -y git nginx
```

### 3. Déploiement Code
```bash
cd /var/www
git clone https://github.com/abdelrahmene/admin.birkshoes.store.git
cd admin.birkshoes.store
npm install
```

### 4. Configuration Production
```bash
# Fichier .env.production
DATABASE_URL="mysql://u291647692_birkshoes_admi:Abdoufares141055@193.203.168.212:3306/u291647692_birkshoes_stor"
NEXTAUTH_SECRET=votre-secret-super-securise-birkshoes-2024
NEXTAUTH_URL=https://admin.birkshoes.store
NODE_ENV=production

# Build et démarrage
npm run build
pm2 start npm --name "birkshoes-admin" -- start
```

### 5. Configuration Nginx
```nginx
# /etc/nginx/sites-available/admin.birkshoes.store
server {
    listen 80;
    server_name admin.birkshoes.store;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. Configuration DNS Hostinger
```
Type: A
Name: admin
Content: 148.230.125.251
TTL: 1800
```
**Important:** Suppression des enregistrements AAAA (IPv6) pour éviter les conflits SSL.

### 7. Certificat SSL Let's Encrypt
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d admin.birkshoes.store
```

### 8. Sécurisation Firewall
```bash
ufw enable
ufw allow ssh
ufw allow 'Nginx Full'
```

### 9. Auto-renouvellement SSL
```bash
crontab -e
# Ajouter: 0 2 * * * /usr/bin/certbot renew --quiet
```

## ✅ Résultat Final
- **URL:** https://admin.birkshoes.store
- **SSL:** Actif jusqu'au 11 novembre 2025
- **Application:** Active via PM2
- **Sécurité:** Firewall configuré

## 🔄 Workflow Mises à Jour

### Sur PC Local
```bash
git add .
git commit -m "description des changements"
git push origin main
```

### Sur Serveur VPS
```bash
cd /var/www/admin.birkshoes.store
git pull origin main
npm run build
pm2 restart birkshoes-admin
```

## 📊 Monitoring
```bash
# Vérifier l'application
pm2 status
pm2 logs birkshoes-admin

# Vérifier Nginx
systemctl status nginx

# Vérifier SSL
certbot certificates
```

## 🔧 Architecture Technique
- **Frontend:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Base de données:** MySQL (Hostinger)
- **ORM:** Prisma
- **Serveur web:** Nginx (reverse proxy)
- **Process manager:** PM2
- **SSL:** Let's Encrypt
- **OS:** Ubuntu 24.04 LTS