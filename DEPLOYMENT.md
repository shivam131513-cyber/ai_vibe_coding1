# Deployment Guide - CivicGuard Hub

This guide covers deploying CivicGuard Hub to various hosting platforms.

---

## 🚀 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All features tested locally
- ✅ Supabase database set up and configured
- ✅ Environment variables documented
- ✅ Production build works: `npm run build`
- ✅ No console errors in production build
- ✅ All images and assets optimized

---

## 🌐 Vercel Deployment (Recommended)

Vercel offers the best experience for Vite/React apps with zero configuration.

### Step 1: Prepare Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure `.gitignore` includes:
   ```
   node_modules
   dist
   .env
   .env.local
   ```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your repository
4. Vercel auto-detects Vite configuration

### Step 3: Configure Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2 minutes)
3. Your app is live! 🎉

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

### Continuous Deployment

- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Rollback to previous deployments anytime

---

## 🔷 Netlify Deployment

### Step 1: Prepare Repository

Same as Vercel - push code to Git provider.

### Step 2: Create New Site

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider
4. Select your repository

### Step 3: Build Settings

Netlify should auto-detect, but verify:

```
Build command: npm run build
Publish directory: dist
```

### Step 4: Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for build (~2 minutes)
3. Site is live!

### Custom Domain

1. Go to **Domain settings**
2. Add custom domain
3. Configure DNS
4. SSL auto-enabled

---

## ☁️ AWS Amplify

### Step 1: Connect Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Connect Git provider
4. Select repository and branch

### Step 2: Build Settings

Amplify auto-detects Vite. Verify `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Step 3: Environment Variables

1. Go to **App settings** → **Environment variables**
2. Add Supabase credentials

### Step 4: Deploy

1. Click **"Save and deploy"**
2. Monitor build logs
3. Access via Amplify URL

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Build and Run

```bash
# Build image
docker build -t civicguard-hub .

# Run container
docker run -d -p 80:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  civicguard-hub
```

---

## 📦 Static Hosting (GitHub Pages, etc.)

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/civicguard-hub",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### Other Static Hosts

Upload `dist/` folder to:
- **Surge**: `surge dist/`
- **Firebase**: `firebase deploy`
- **Cloudflare Pages**: Connect Git repo

---

## 🔧 Post-Deployment Configuration

### Supabase Settings

1. **Add Production URL to Allowed URLs**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add your production domain to **Site URL** and **Redirect URLs**

2. **Update CORS Settings**
   - If using custom domain
   - Add domain to allowed origins

### Performance Optimization

1. **Enable CDN** (most platforms do this automatically)
2. **Configure caching headers**
3. **Enable compression** (gzip/brotli)
4. **Optimize images** before deployment

### Monitoring

Set up monitoring:
- **Vercel Analytics** (built-in)
- **Google Analytics**
- **Sentry** for error tracking
- **Supabase logs** for backend monitoring

---

## 🔒 Security Checklist

Before going live:

- ✅ Environment variables not in code
- ✅ `.env` files in `.gitignore`
- ✅ HTTPS enabled (auto on most platforms)
- ✅ Supabase RLS policies active
- ✅ No sensitive data in client code
- ✅ Content Security Policy configured
- ✅ Rate limiting on Supabase

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: `Module not found` errors
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue**: Variables undefined in production
**Solution**: 
- Ensure variables start with `VITE_`
- Rebuild after adding variables
- Check platform-specific variable syntax

### 404 on Refresh

**Issue**: Page not found when refreshing on routes
**Solution**: Configure redirects/rewrites

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Create `_redirects` in `public/`:
```
/*    /index.html   200
```

### Slow Load Times

**Solutions**:
- Enable code splitting
- Lazy load routes
- Optimize images
- Use CDN
- Enable caching

---

## 📊 Performance Targets

Aim for:
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## ✅ Final Checklist

Before announcing your deployment:

- [ ] All features working in production
- [ ] Database properly configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics set up
- [ ] Error monitoring active
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Social media preview images
- [ ] Backup strategy in place

---

## 🎉 You're Live!

Congratulations on deploying CivicGuard Hub! 

**Next steps:**
1. Test all features in production
2. Monitor error logs
3. Gather user feedback
4. Iterate and improve

**Need help?** Check the main README or open an issue.

---

*Happy deploying! 🚀*
