# Contributing to Manga Mailer

Thank you for considering contributing to Manga Mailer! We welcome any contributions, from bug reports and feature suggestions to code contributions.

## Reporting Issues

If you find a bug or have a problem, please [open an issue](<LINK_TO_YOUR_ISSUES_PAGE_ON_GITHUB_ETC>) on our issue tracker.
Please include:

*   A clear and descriptive title.
*   Steps to reproduce the bug.
*   Expected behavior.
*   Actual behavior.
*   Screenshots or logs, if applicable.
*   Your environment details (e.g., Node.js version, OS, Vitest version).

## Suggesting Features

If you have an idea for a new feature or an improvement to an existing one, please [open an issue](<LINK_TO_YOUR_ISSUES_PAGE_ON_GITHUB_ETC>) to discuss it. This allows us to coordinate efforts and ensure the feature aligns with the project's goals.

## Development Setup

Please refer to the [README.md](../README.md#️-installation) for instructions on how to set up the development environment.
Unit tests are run using [Vitest](https://vitest.dev/).

## Making Changes (Pull Requests)

1.  **Fork the repository** to your own GitHub account.
2.  **Clone your fork** to your local machine.
3.  **Create a new branch** for your changes:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    # git checkout -b fix/your-bug-fix-name
    ```
4.  **Make your changes**. Ensure you follow the project's coding style (ESLint should help with this).
5.  **Test your changes** thoroughly:
    *   Run unit tests: `npm test` (or `yarn test`).
    *   Ensure good test coverage: `npm run test:coverage` (or `yarn test:coverage`).
    *   Add new tests if you are adding new functionality or fixing a bug that wasn't covered.
6.  **Commit your changes** with a clear and descriptive commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (scopes are defined in `.vscode/settings.json`).
    ```bash
    git commit -m "feat(bot): add new /settings command"
    # or
    # git commit -m "fix(database): resolve issue with manga chapter query"
    ```
7.  **Push your changes** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request (PR)** from your branch in your fork to the `main` (or `develop`) branch of the original Manga Mailer repository.
    *   Provide a clear title and description for your PR.
    *   Reference any related issues (e.g., "Closes #123").
    *   Ensure all automated checks (linting, tests) pass.

## Coding Guidelines

*   **Follow ESLint rules**: Run `npm run lint` (or `yarn lint`) to check your code.
*   **TypeScript**: Use TypeScript's features appropriately for type safety and clarity.
*   **Clarity & Maintainability**: Write clear, understandable, and maintainable code. Add comments where necessary to explain complex logic.
*   **Database Migrations**: If you make changes to the database schema (`lib/db/model/`), you **must** generate a new migration file using `npm run db:generate` (or `yarn db:generate`). Do not edit migration files manually unless you know what you are doing. Commit the generated migration file with your changes.
*   **Logging**: Utilize the provided Pino logger (`lib/log/`) for structured logging. Use appropriate log levels (`debug`, `info`, `warn`, `error`).

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. (You might want to add a `CODE_OF_CONDUCT.md` file, a common one is the Contributor Covenant).

Thank you for your contribution!
