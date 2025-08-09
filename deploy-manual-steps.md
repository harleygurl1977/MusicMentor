# Manual GitHub Deployment Steps

If the scripts aren't working, here are the exact manual steps:

## Step 1: Configure Git
```bash
git config --global user.name "harleygurl1977"
git config --global user.email "your-email@example.com"
```

## Step 2: Initialize Repository
```bash
git init
```

## Step 3: Add Files
```bash
git add .
```

## Step 4: Create Commit
```bash
git commit -m "Deploy validated Garden App with OpenAI integration"
```

## Step 5: Add Remote
```bash
git remote add origin https://github.com/harleygurl1977/MusicMentor.git
```

## Step 6: Pull Existing Changes
```bash
git pull origin main --allow-unrelated-histories
```

## Step 7: Push to GitHub
```bash
git push -u origin main
```

When prompted for credentials:
- **Username**: harleygurl1977
- **Password**: Lenore77!!

## Alternative: Use GitHub Personal Access Token

Instead of using your password, you can create a Personal Access Token:

1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with "repo" permissions
3. Use the token as your password instead of "Lenore77!!"

This is more secure and reliable for authentication.