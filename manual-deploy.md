# Manual Deployment Steps

Let's fix the credential issue manually:

## Step 1: Clear existing Git credentials
```bash
git config --global --unset user.name
git config --global --unset user.email
```

## Step 2: Set your credentials
```bash
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"
```

## Step 3: Remove and re-add remote with token
```bash
git remote remove origin
git remote add origin https://harleygurl1977:YOUR_GITHUB_TOKEN_HERE@github.com/harleygurl1977/MusicMentor.git
```

## Step 4: Commit and push
```bash
git add .
git commit -m "Deploy validated Garden App"
git push -u origin main
```

## Alternative: Use Git Credential Manager
If that doesn't work, clear Windows credential store:
```bash
git config --global --unset credential.helper
```

Then when you push, it will prompt for credentials. Use:
- Username: `harleygurl1977`
- Password: `YOUR_GITHUB_TOKEN_HERE`