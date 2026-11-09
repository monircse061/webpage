# Updating the complete Monir academic website dashboard

This package expands the dashboard so it can manage the existing website content as well as new entries. It includes the original records imported from the uploaded website, not only blank forms.

## What is now manageable from the dashboard

| Dashboard section | Existing records imported |
|---|---:|
| Homepage profile & research interests | 1 profile |
| Education | 4 |
| Experience | 6 |
| Homepage timeline / milestones | 15 |
| Standardized test scores | 2 |
| Research papers | 13 |
| Research projects | 6 |
| Academic projects | 13 |
| Teaching courses | 24 |
| Certificates and online courses | 22 |
| Leadership and voluntary roles | 4 |
| Awards and scholarships | 9 |
| Web and design showcase | 5 |

The 13 research papers are all editable, including the 2 records that were missing from the earlier dashboard data. The previously missing research project, Cyberbullying Detection on Social Platforms, has also been imported.

Every listed section supports adding, editing and deleting entries. The sortable sections have **Newest first** and **Oldest first** controls. The public website defaults to newest first. Research papers retain their original display sequence using an editable `Display order` field; newly added papers receive the next highest order and therefore appear first. For records without a year/date, the original order is preserved until they are edited or given a date. When an undated record is edited, its updated timestamp moves it to the top.

## Important: your current Cloudflare account is already configured

You have already created the Worker, KV namespace, GitHub OAuth app and repository-only GitHub token. **Do not create them again. Do not delete or replace the existing secrets.** The updated Worker uses the same Worker name, URL, KV binding and secret names:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REPO_TOKEN`

Your existing Cloudflare secrets and KV namespace remain in place when you deploy the updated Worker code.

## Update 1 — Replace the website files in GitHub

The public website must receive the new and expanded JSON files, the updated content loader, and the updated page files.

### Recommended method: GitHub Desktop

1. Download and extract this package.
2. Open GitHub Desktop and sign in to `monircse061`.
3. Clone the repository `monircse061/webpage` if it is not already cloned on this computer.
4. Open the extracted package's `webpage-main` folder.
5. Copy **all contents inside `webpage-main`** into the local cloned repository folder. Do not copy the outer `webpage-main` folder as a nested folder. Allow files to be overwritten when Windows asks.
6. In GitHub Desktop, review the changed files. Confirm that the `data` directory contains the complete JSON files listed below.
7. Enter a commit message such as `Import complete website content and dashboard updates`.
8. Click **Commit to main**, then **Push origin**.

You can instead use Git from a terminal if you already use Git. You do not need Node.js for this GitHub file update.

### Data files included

- `data/home-profile.json`
- `data/education.json`
- `data/experience.json`
- `data/milestones.json`
- `data/test-scores.json`
- `data/publications.json`
- `data/research-projects.json`
- `data/academic-projects.json`
- `data/teaching-courses.json`
- `data/certifications.json`
- `data/leadership.json`
- `data/achievements.json`
- `data/showcases.json`

The updated public-site loader is `js/content-loader.js`. The pages `index.html`, `Research-Works.html`, `Research-Projects.html`, `Projects.html`, `Teaching.html`, and `Co-curricular.html`, plus their corresponding CSS files, have been updated to display dashboard-managed content while retaining the existing site theme.

## Update 2 — Deploy the expanded dashboard Worker

The updated dashboard contains additional categories and API routes. The existing live Worker needs one redeployment so its code can manage those new JSON files.

Use the computer where Node.js and Wrangler were already installed (your original development PC is fine). You do not need to install Node.js on every computer from which you use the dashboard.

1. Open the extracted package's `webpage-main\admin-worker` folder.
2. Open PowerShell in that folder (File Explorer address bar → type `powershell` → Enter).
3. Run:

   ```powershell
   npm.cmd install
   npx.cmd wrangler deploy
   ```

4. Wrangler should deploy the Worker `monir-website-admin` to the same `workers.dev` URL.

**Do not run `wrangler secret put` again.** The existing secrets and KV namespace are already stored in Cloudflare. A normal Worker redeployment preserves them.

If Wrangler asks to authorize Cloudflare again, run `npx.cmd wrangler login` and complete the browser authorization, then repeat `npx.cmd wrangler deploy`.

## Test after updating

1. Wait for GitHub Pages to publish the repository commit.
2. Open the public website: <https://monircse061.github.io/webpage/>.
3. Open the private admin dashboard: <https://monir-website-admin.monircse061.workers.dev/>.
4. Sign in with the authorized GitHub account `monircse061`.
5. Check the counts on the dashboard Overview. Expected totals are the numbers in the first table above.
6. Open Research papers and confirm that all 13 records are listed. Open Research projects and confirm all 6. Check Education, Experience, Standardized tests, Teaching courses, Certificates and courses, Leadership, Awards and scholarships, and Academic projects.
7. Edit one existing entry and save it. The dashboard should commit the JSON change to GitHub. Check the public website after GitHub Pages has finished publishing.

## How sorting works

- Dashboard lists default to **Newest first** and can be toggled to **Oldest first** for review.
- The public pages display records newest first based on their date/year fields.
- Research papers use `Display order (higher appears first)` so the 13 existing papers keep the original sequence. New papers are assigned a higher display order automatically.
- For an old record without a date, add the correct year/date in its Edit form when known. Undated records retain their imported order; an edited undated record moves up by its updated timestamp.
- For projects, fill in the `Year / period` field when known. New items without a year still appear first by creation time.

## Security and maintenance

- Keep `GITHUB_CLIENT_SECRET` and `GITHUB_REPO_TOKEN` private. Never put them in GitHub files or send them in screenshots.
- The fine-grained repository token should remain restricted to repository `webpage` with `Contents: Read and write` and `Metadata: Read-only`.
- The dashboard login is restricted to the GitHub username `monircse061`.
- Normal content updates are done in the browser. No terminal or Node.js is needed to add/edit website content from another PC.
- Node.js/Wrangler is only needed when updating or redeploying the dashboard's Worker code.
