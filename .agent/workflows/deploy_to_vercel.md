---
description: How to deploy the Gym-App-AI to Vercel
---
# Deploying GymFlow to Vercel

Follow these steps to deploy your application to the web for free using Vercel.

## 1. Create a Vercel Account
1. Go to [vercel.com](https://vercel.com/signup).
2. Sign up using **Continue with GitHub**. This is important because it automatically connects Vercel to your GitHub repositories.

## 2. Import Your Repository
1. Once logged in, you'll see your dashboard. Click the **"Add New..."** button and select **"Project"**.
2. You should see a list of your GitHub repositories. Find **`Gym-App-AI`** and click the **"Import"** button next to it.

## 3. Configure the Project
1. **Project Name**: You can leave this as is or change it (e.g., `gym-flow-app`).
2. **Framework Preset**: Vercel should automatically detect this as **Vite**. If not, select "Vite" from the dropdown.
3. **Root Directory**: Leave this as `./`.

## 4. Environment Variables (Crucial Step!)
Expand the **"Environment Variables"** section. You need to add the keys from your local `.env` file here so the live site can access OpenAI and Supabase.

Add the following (copy values from your local `.env` file):

| Name | Value |
|------|-------|
| `VITE_OPENAI_API_KEY` | Paste your actual OpenAI Key (starting with `sk-...`) |
| `VITE_SUPABASE_URL` | Paste your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Paste your Supabase Anon/Public Key |

*Note: Copy the **values** only, not the variable names, into the "Value" fields.*

## 5. Deploy
1. Click the **"Deploy"** button.
2. Vercel will now build your project. This usually takes about a minute.
3. Once finished, you will see a "Congratulations!" screen with a preview of your app.
4. Click on the preview image or the **"Visit"** button to see your live website!

## 6. Updating Your Site
Whenever you make changes to your code and verify them locally:
1. Run `git add .`, `git commit -m "update message"`, and `git push` in your terminal.
2. Vercel will detect the new push to GitHub and **automatically redeploy** your site with the changes.
