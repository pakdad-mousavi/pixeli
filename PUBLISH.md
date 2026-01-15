# How To Publish Package

1. Update version and create new version tag:
```bash
npm version patch -m "chore: release v%s"
```

2. Push all tags to respective branch:
```bash
git push origin main --tags
```