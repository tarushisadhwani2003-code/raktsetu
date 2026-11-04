# Run locally with MongoDB Community and deploy to Vercel

The project is prepared for a single Vercel deployment: Vercel serves the React build from `client/dist`, and `/api/*` runs the Express app through `api/index.js`. The website and API share one domain, so login cookies work without cross-domain configuration. MongoDB runs separately.

MongoDB Community Server on your Windows PC works for local development. A Vercel function cannot connect to your PC using `localhost` or `127.0.0.1`: those addresses refer to the machine running the function. You cannot install a persistent MongoDB server inside this Vercel deployment. For the online site, use an always-on, secured Community Server on a VPS, or optionally use MongoDB Atlas.

## 1. Run the project on Windows

Install [Node.js](https://nodejs.org/en/download) version **22.12 or later in the 22.x line, or 24.x**. Install [MongoDB Community Server for Windows](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/) and select **Install MongoD as a Service**. MongoDB Compass is an optional database viewer; Compass alone is not the database server. Install `mongosh` separately if you want to use MongoDB's command-line shell.

Open PowerShell in the `raktsetu` folder containing the root `package.json` and `vercel.json`:

```powershell
Set-Location 'C:\Users\oment\OneDrive\Desktop\coding class\PROJECT\helphub2\raktsetu'
node --version
npm ci
Copy-Item server\.env.example server\.env
```

Copy the settings file only on first setup; keep your existing `server/.env` if you already have one. If PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm`.

Open `server/.env` in your editor and use these local settings:

```dotenv
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/raktsetu
CLIENT_URL=http://localhost:5173
DEMO_MODE=false
SEED_DEMO_DATA=false
```

Generate your own login secret, then paste the output into `JWT_SECRET` in that file:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Check the MongoDB service:

```powershell
Get-Service MongoDB
```

Its status should be `Running`. If it is stopped, open PowerShell as Administrator and run `Start-Service MongoDB`. If the service is missing, return to the Community Server installer and configure the service. Local MongoDB uses the loopback interface by default; keep this local database private. [MongoDB Windows installation](https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-windows/)

Create your admin account and start the app:

```powershell
npm run create-admin
npm run dev
```

The admin command asks for a name, email, mobile number and password. Open [the local website](http://localhost:5173). The API is on port 5000; [its health endpoint](http://localhost:5000/api/health) should report `database: "connected"`. The `raktsetu` database appears in Compass after the first record is saved.

For optional sample accounts, use a disposable local database and run `npm run seed`. **This command replaces the database's existing app data.** Set `DEMO_MODE=true` only for that local demo. Do not run it against your live database.

## 2. Choose the database for the online site

### MongoDB Community Server on a VPS

This keeps Community Server as the database for both local and deployed use. You need an always-on server with a hostname reachable by Vercel. Install a supported Community Server release there, create an application user with `readWrite` access to only the application database, enable authentication, configure TLS with a trusted certificate, and restrict network access with a firewall. Configure backups and test restoration before storing real data. Follow MongoDB's [self-managed security checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/) and [TLS setup](https://www.mongodb.com/docs/manual/core/tls/configure-server-tls-tutorial/).

An example connection-string shape for a standalone server is:

```text
mongodb://APP_USER:URL_ENCODED_PASSWORD@db.example.com:27017/raktsetu?authSource=raktsetu&tls=true&retryWrites=false
```

Replace the placeholders. `authSource` must match the database where you created the user. URL-encode special characters in the username and password. Keep certificate verification enabled. The firewall rules must permit the outbound networking used by your Vercel project; plan this with your hosting provider. Do not expose an unauthenticated database port or forward your PC's local MongoDB port to the internet.

### Optional: MongoDB Atlas

If you prefer a managed database, create a cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create an application database user, configure network access for your deployment, and copy its Node.js driver URI. Set the database name to `raktsetu`. Atlas uses the same application code; only `MONGODB_URI` changes. Choose the current plan and networking options that fit your needs.

Use a **separate database and credentials for Vercel Preview deployments**. Preview code should not operate on the production database.

## 3. Put the code on GitHub

Create an empty GitHub repository, then run the following in the project root if it is not already a Git repository:

```powershell
git init
git add .
git status
git commit -m "Prepare RaktSetu for Vercel"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/raktsetu.git
git push -u origin main
```

Replace `YOUR-NAME` with your GitHub username. Inspect `git status` before committing: `.env`, `node_modules`, `.vercel`, and build output should not be staged. Commit the lockfile and `.env.example`; keep actual credentials out of Git. If the project already has a repository and remote, use those instead of reinitializing or replacing them.

## 4. Import the project into Vercel

In [Vercel](https://vercel.com), choose **Add New → Project**, connect GitHub, and import the repository. Set the **Root Directory to the folder containing this `vercel.json`**: `.` if only the contents of `raktsetu` were uploaded, or `raktsetu` if the parent folder was uploaded. Do not select `client` or `server`. [Vercel Git deployment guide](https://vercel.com/docs/git)

The committed configuration supplies these settings:

| Setting          | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| Framework preset | Vite                                                            |
| Install command  | `npm ci --include=dev`                                          |
| Build command    | `npm run build`                                                 |
| Output directory | `client/dist`                                                   |
| Node.js version  | 24.x, or a supported 22.x release meeting the requirement above |

Do not set a start command. Vercel invokes `api/index.js` for API requests; `npm start` is for a traditional Node server. The configuration also supports refreshing routes such as `/login` and `/dashboard`. See [Vercel's Node.js functions](https://vercel.com/docs/functions/runtimes/node-js) and [Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

## 5. Add environment variables and deploy

Add the following in Vercel's **Project Settings → Environment Variables**, with the correct scope for Production or Preview. Enter plain values without surrounding quotes. The local `server/.env` is not uploaded. Environment changes apply to new deployments, so redeploy after changing them. [Vercel environment variables](https://vercel.com/docs/environment-variables)

| Variable         | Value for Production                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`       | `production`                                                           |
| `MONGODB_URI`    | Your secured remote Community Server URI or Atlas URI                  |
| `JWT_SECRET`     | A newly generated random secret of at least 32 characters              |
| `CLIENT_URL`     | Your full HTTPS website URL, such as `https://your-project.vercel.app` |
| `DEMO_MODE`      | `false`                                                                |
| `SEED_DEMO_DATA` | `false`; automatic seeding is rejected on Vercel                       |
| `SERVE_CLIENT`   | `false`; Vercel serves the static files                                |
| `ADMIN_NAME`     | Your admin's display name                                              |
| `ADMIN_EMAIL`    | A real email address for the first admin                               |
| `ADMIN_PHONE`    | The admin's mobile number                                              |
| `ADMIN_PASSWORD` | A strong, unique password; use 8+ characters with letters and numbers  |

`CLIENT_URL` is required in production and must be an HTTPS origin, such as `https://your-project.vercel.app`, with no path, query string, or fragment. Do not append `/api` or `/login`. Choose the project name to determine its URL. If Vercel assigns a different URL, update `CLIENT_URL` to the assigned HTTPS origin and redeploy. Do not put database credentials in a variable beginning with `VITE_`: those variables can be bundled into browser code. **Leave `VITE_API_URL` and `CORS_ORIGINS` unset for this deployment.** Requests use `/api` on the same domain.

Click **Deploy**. Once the deployment succeeds, open `/api/health`, then log in with the admin email and password. The first API startup creates that account if the email does not exist. Existing users are not promoted by these variables. If that email is already registered under another role, use the `create-admin` command deliberately against the correct database.

After verifying the admin login, remove `ADMIN_PASSWORD` from Vercel and redeploy. The existing account remains in MongoDB. Changing `ADMIN_PASSWORD` later does not reset an existing account; use the profile password form or admin command.

For password-reset delivery, also add `SMTP_HOST`, `SMTP_PORT` (usually `587` or `465`), `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` from your email provider. Without SMTP, password-reset emails are not delivered; production logs do not expose reset links.

## 6. Verify the deployed app

1. Visit `/api/health` and confirm the database is connected.
2. Register an account, log out, and log back in; refresh a dashboard page directly.
3. Log in as admin and verify a test facility. Confirm that pending facilities stay out of public search.
4. Exercise a sample blood request and stock update using test records, then remove those records.
5. If SMTP is configured, request a password-reset email and check that the link uses your live HTTPS domain.

Deployment preparation does not mean the site has already been published. Your remote database, Vercel account, and environment values are needed to complete these steps.

## Troubleshooting and operational limits

| Symptom                           | What to check                                                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Local database connection fails   | MongoDB service is running; URI is `mongodb://127.0.0.1:27017/raktsetu`                                           |
| Deployed API returns 503          | Remote database hostname, credentials, TLS certificate, and firewall/network access; inspect Vercel function logs |
| Build succeeds but API is missing | Root Directory must include `api`, `server`, `shared`, and `vercel.json`                                          |
| Refreshing a page returns 404     | Deploy the root `vercel.json` with its SPA rewrite                                                                |
| Login does not persist            | Use HTTPS in production and the same-origin `/api` configuration                                                  |
| Reset email never arrives         | Configure SMTP and a correct `CLIENT_URL`; check provider delivery logs                                           |
| Tests reject a database URI       | `MONGODB_URI_TEST` must explicitly name a disposable database ending in `_test`                                   |

The app's in-memory rate limits apply per running instance. For effective limits across multiple Vercel instances, configure platform firewall rules or a shared rate-limit store. Inventory, audit, and request updates currently span multiple MongoDB writes; they are not one transaction. Real operational use needs additional concurrency/failure testing and transaction or recovery design. A standalone Community Server supports the current app; multi-document transactions would require a replica set.

## Other hosts

The included `render.yaml` and `Dockerfile` remain available for traditional hosting. Set the same production database, secret, HTTPS `CLIENT_URL`, and email values there. Keep `DEMO_MODE` and `SEED_DEMO_DATA` false. For a Node host, install with `npm ci --include=dev`, build with `npm run build`, and start with `npm start`. Serve it over HTTPS; secure production cookies require it.

For Docker, build with `docker build -t raktsetu .` and provide secrets through your host's environment settings. The container listens on port 5000 and still needs an external MongoDB database. Current hosting plans, limits, and pricing should be checked with the chosen provider.
