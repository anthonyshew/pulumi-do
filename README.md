# The deployment flow is...

0. Code is brought from branches into develop. When ready... (write that app, baby)
1. Code is committed to stage. (manual)
2. Github action runs unit tests and lints. (GHA)
3. Run script for database migration. (GHA)
4. Pulumi provisions resources for stages. (GHA)
5. E2Es run. (GHA)
6. Code is pull requested to master. (GHA? If not, manual)
7. Manual verification of the stage. (manual)
8. IF BREAKING CHANGES IN DATABASE MIGRATION, turn on feature flag to bring down production application.
9. Code is merged to master. (manual)
10. Run script for database migration. (GHA)
11. New Github action provisions resources for production. (GHA)
12. Pulumi destroys stage resources. (GHA) (optional)
13. E2Es run? (GHA) (optional)
14. Manual verification of production. (manual)

## Setup Todos

- Give your Github Actions three secrets: `DIGITALOCEAN_TOKEN`, `PULUMI_ACCESS_TOKEN`, and `USER_GITHUB_TOKEN`. The last one is a Github user PAT.

Gotchas:

- If you are going to perform a database migration, your production database will be affected. This means that your previous deployment will be out of sync with your database until you put up your new deployment.

  - It is recommended to create a feature flag that will disable your application if you are to perform any breaking changes to your production database.

- Changing infrastructure will cause your application deployments to get out of sync with your main branch. You will need to push to `main` twice to get everything freshened up.
  - First, deploy your new infrastructure.
  - Then, deploy the new main branch application code.
  - Alternatively, you can choose to deploy the new infra from your command line with the Pulumi CLI.

Desired Improvements:

- I don't see any clear way for rolling back busted database migrations with Prisma. This needs to be investigated.
