# Contributing to Kontext

First off, thank you for considering contributing to Kontext! It's people like you that make Kontext a great tool for the community.

## 🚀 Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/kontext.git
    cd kontext
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Build the project**:
    ```bash
    npm run build
    ```

## 🛠️ Local Development

### Identity Setup
To keep your work and personal identities isolated, please set your name and email locally for this repository:
```bash
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```
Our `pre-commit` hook will block commits from known work identities to protect your privacy.

### Running the CLI
You can run the CLI directly from source using `ts-node`:
```bash
npx ts-node src/index.ts --help
```

## 📬 Submitting Changes

1.  **Create a branch** for your feature or bug fix:
    ```bash
    git checkout -b feat/your-feature-name
    ```
2.  **Commit your changes**. Ensure your commit messages follow a clear pattern (e.g., `feat: ...`, `fix: ...`).
3.  **Push to your fork**:
    ```bash
    git push origin feat/your-feature-name
    ```
4.  **Open a Pull Request** against the `main` branch of the original repository.

## ⚖️ Code of Conduct
By participating in this project, you agree to abide by the terms of our [Code of Conduct](./CODE_OF_CONDUCT.md).
