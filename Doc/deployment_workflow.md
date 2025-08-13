# 🚀 Workflow de Déploiement - BirkShoes Admin

## 📋 Processus de Mise à Jour (Exactement !)

### **Sur votre PC (développement) :**

```bash
# 1. Faire vos modifications dans le code
# 2. Tester en local
npm run dev

# 3. Commit et push vers GitHub
git add .
git commit -m "Description de vos changements"
git push origin main
```

### **Sur le serveur VPS :**

```bash
# 1. Aller dans le répertoire
cd /var/www/admin.birkshoes.store

# 2. Récupérer les dernières modifications
git pull origin main

# 3. Installer nouvelles dépendances (si nécessaire)
npm install

# 4. Rebuild l'application
npm run build

# 5. Redémarrer l'application
pm2 restart birkshoes-admin

# 6. Vérifier que tout fonctionne
pm2 status
pm2 logs birkshoes-admin --lines 20
```

---

## 🔧 Script de Déploiement Automatique

Créons un script pour automatiser :

```bash
# Sur le serveur, créer le script
nano /var/www/admin.birkshoes.store/deploy.sh
```

**Contenu du script :**

```bash
#!/bin/bash
echo "🚀 Déploiement BirkShoes Admin..."

# Aller dans le répertoire
cd /var/www/admin.birkshoes.store

# Pull des dernières modifications
echo "📥 Récupération du code..."
git pull origin main

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de l'application
echo "🏗️ Build de l'application..."
npm run build

# Redémarrage
echo "🔄 Redémarrage de l'application..."
pm2 restart birkshoes-admin

# Vérification
echo "✅ Vérification du statut..."
pm2 status

echo "🎉 Déploiement terminé !"
echo "🌐 Votre site : https://admin.birkshoes.store"
```

```bash
# Rendre le script exécutable
chmod +x /var/www/admin.birkshoes.store/deploy.sh
```

**Utilisation future :**
```bash
cd /var/www/admin.birkshoes.store
./deploy.sh
```

---

## 🛡️ Sécurité Complète

### **1. SSL/HTTPS (CRITIQUE)**
```bash
# Installation Certbot
apt install -y certbot python3-certbot-nginx

# Certificat SSL
certbot --nginx -d admin.birkshoes.store

# Auto-renouvellement
echo "0 2 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### **2. Firewall UFW**
```bash
ufw enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443
ufw status verbose
```

### **3. Sécurisation SSH**
```bash
# Éditer la config SSH
nano /etc/ssh/sshd_config

# Modifier ces lignes :
# Port 2222                    # Changer le port
# PermitRootLogin no          # Désactiver root (après création utilisateur)
# PasswordAuthentication no   # Utiliser uniquement les clés SSH

# Redémarrer SSH
systemctl restart sshd

# Autoriser le nouveau port
ufw allow 2222
```

### **4. Fail2Ban (Protection brute force)**
```bash
apt install -y fail2ban

# Configuration
nano /etc/fail2ban/jail.local
```

**Contenu jail.local :**
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3

[sshd]
enabled = true
port = 2222
```

```bash
systemctl enable fail2ban
systemctl start fail2ban
```

### **5. Surveillance et Monitoring**
```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 startup
pm2 save

# Logs système
journalctl -f -u nginx
tail -f /var/log/nginx/access.log
```

---

## 📊 Commandes de Maintenance Courantes

### **Monitoring de l'application :**
```bash
pm2 status                    # Statut des apps
pm2 logs birkshoes-admin     # Logs en temps réel  
pm2 monit                    # Interface monitoring
pm2 restart birkshoes-admin  # Redémarrer
```

### **Monitoring système :**
```bash
htop                         # CPU/RAM
df -h                        # Espace disque
free -h                      # Mémoire
systemctl status nginx       # Statut Nginx
```

### **Base de données :**
```bash
# Backup
mysqldump -u u291647692_birkshoes_admi -p u291647692_birkshoes_stor > backup_$(date +%Y%m%d).sql

# Vérifier la connexion
npx prisma studio --browser none
```

---

## 🚨 Dépannage Rapide

### **Site inaccessible :**
```bash
pm2 status                   # App en marche ?
systemctl status nginx      # Nginx OK ?
ufw status                   # Firewall correct ?
```

### **Erreurs de déploiement :**
```bash
pm2 logs birkshoes-admin --lines 50
npm run build                # Test du build
git status                   # Conflit Git ?
```

### **Problème SSL :**
```bash
certbot certificates        # Vérifier le certificat
nginx -t                     # Test config Nginx
systemctl reload nginx      # Recharger Nginx
```

---

## ✅ Checklist Post-Déploiement

- [ ] ✅ Site accessible via HTTP
- [ ] 🔄 SSL/HTTPS configuré 
- [ ] 🛡️ Firewall activé
- [ ] 🔐 SSH sécurisé
- [ ] 📊 Monitoring en place
- [ ] 🔄 Script de déploiement créé
- [ ] 💾 Backup automatique configuré

---

## 🎯 Prochaines Étapes Recommandées

1. **Finaliser les fonctionnalités** manquantes de votre dashboard
2. **Ajouter l'authentification** (NextAuth.js)
3. **Optimiser les performances** 
4. **Configurer les backups automatiques**
5. **Monitoring avancé** avec des alertes

**Votre dashboard est maintenant professionnel et sécurisé ! 🚀**