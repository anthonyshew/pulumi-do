import * as digitalocean from "@pulumi/digitalocean";
import * as pulumi from "@pulumi/pulumi";

const main = async () => {
  const stack = pulumi.getStack();
  const config = new pulumi.Config();
  const region = config.get("region") || "nyc1";
  const instanceSizeSlug = config.get("instanceSizeSlug") || "basic-xxs";
  const databaseSize = config.get("databaseSize") || "db-s-1vcpu-1gb";

  const cluster = new digitalocean.DatabaseCluster("cluster", {
    engine: "PG",
    version: "13",
    region,
    size: databaseSize,
    nodeCount: 1,
  });

  const db = new digitalocean.DatabaseDb("db", {
    name: "db",
    clusterId: cluster.id,
  });

  const app = new digitalocean.App("demo-example", {
    spec: {
      alerts: [
        // {
        // rule: "DEPLOYMENT_FAILED",
        // },
      ],
      name: "demo-example",
      domainNames: [
        // {
        //   name: "trovabaseball.com",
        // },
        // {
        //   name: "www.trovabaseball.com",
        // },
      ],
      region,
      services: [
        {
          alerts: [
            {
              operator: "GREATER_THAN",
              rule: "CPU_UTILIZATION",
              value: 75,
              window: "FIVE_MINUTES",
            },
          ],
          github: {
            branch: "main",
            deployOnPush: false,
            repo: "anthonyshew/pulumi-do",
          },
          httpPort: 8080,
          instanceSizeSlug,
          instanceCount: 1,
          name: "api",
          routes: [
            {
              path: "/another-api",
              // preservePathPrefix: true,
            },
          ],
          runCommand: "npm run start",
          sourceDir: "/api",
          envs: [
            {
              key: "DATABASE_URL",
              scope: "RUN_AND_BUILD_TIME",
              value: "${db.DATABASE_URL}",
            },
            {
              key: "CA_CERT",
              scope: "RUN_AND_BUILD_TIME",
              value: "${db.CA_CERT}",
            },
          ],
        },
        {
          alerts: [
            {
              operator: "GREATER_THAN",
              rule: "CPU_UTILIZATION",
              value: 75,
              window: "FIVE_MINUTES",
            },
          ],
          github: {
            branch: "main",
            deployOnPush: false,
            repo: "anthonyshew/pulumi-do",
          },
          httpPort: 8080,
          instanceSizeSlug,
          name: "nextjs",
          routes: [
            {
              path: "/",
            },
          ],
          buildCommand: "npm run build",
          runCommand: "npm run start",
          sourceDir: "/nextjs",
        },
      ],
      jobs: [
        {
          name: "migrate-db",
          kind: "POST_DEPLOY",
          runCommand: "prisma migrate deploy",
          sourceDir: ".",
          github: {
            branch: "main",
            deployOnPush: false,
            repo: "anthonyshew/pulumi-do",
          },
          envs: [
            {
              key: "DATABASE_URL",
              scope: "RUN_AND_BUILD_TIME",
              value: "${db.DATABASE_URL}",
            },
            {
              key: "CA_CERT",
              scope: "RUN_AND_BUILD_TIME",
              value: "${db.CA_CERT}",
            },
          ],
        },
      ],
      databases: [
        {
          name: db.name,
          production: false,
          engine: cluster.engine.apply((engine) => engine.toUpperCase()),
          clusterName: cluster.name,
        },
      ],
    },
  });

  // const existingProject = await digitalocean.getProject({
  //   name: "demo-project",
  // });

  // let project;

  // if (!existingProject) {
  //   project = new digitalocean.Project("demo-project", {
  //     name: "demo-project",
  //     description: "So described right now.",
  //     environment: "development",
  //     purpose: "To learn Pulumi.",
  //     resources: [app.urn, cluster.clusterUrn],
  //   });
  // }

  // if (existingProject) {
  //   return {
  //     appLiveUrl: app.liveUrl,
  //     message: `The app at ${app.liveUrl} was updated at ${app.updatedAt}. There was an existing DO project so we didnt create a new one.`,
  //   };
  // }

  return {
    stack,
    liveUrl: app.liveUrl,
  };
};

const mainPromise = main();
mainPromise.catch((err) => console.error(err));

export const stackDeployed = mainPromise.then((res) => res.stack);
export const liveUrl = mainPromise.then((res) => res.liveUrl);
