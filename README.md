# 🇵🇹 Portugal Places

Your personal Portugal places library and trip planner. Mobile-first, works offline, shareable itineraries.

---

## Deploy in 4 steps (~20 minutes)

### Step 1 — Run the database schema in Supabase

1. Go to supabase.com/dashboard → open your project
2. Click **SQL Editor** in the left sidebar
3. Paste the contents of `supabase-schema.sql` and click **Run**
4. You should see "Success" for each table

### Step 2 — Get your Supabase credentials

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xyzxyz.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### Step 3 — Push to GitHub

```bash
cd portugal-places
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/portugal-places.git
git push -u origin main
```

### Step 4 — Deploy to Vercel

1. Go to vercel.com/new
2. Import your `portugal-places` GitHub repo
3. Under **Environment Variables**, add:
   - `REACT_APP_SUPABASE_URL` = your Project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**

---

## Features

### Places library
- **Add a place**: tap the orange + button → paste Google Maps link → fill in details → Save
- **Import from CSV**: Places tab → Import button → drop your CSV
- **CSV format**: `name, google_maps_url, notes` (optional: `category, city, tags`)
- **Filter**: by category chips, city, visited/unvisited
- **List/Grid toggle**: top-right of Places tab

### Map view
- Shows all places that have latitude + longitude set
- Pins colour-coded by category; tap for popup

### Itinerary planner
- Create a trip, add days, drag-and-drop places within days
- Set time-of-day tags per place (morning/afternoon/evening/night)

### Shareable links
- Toggle Public in the itinerary editor → copy the link
- Public URL: `https://your-app.vercel.app/i/TOKEN`
- Read-only, no login required

---

## CSV import format for your iPhone Notes

```
name,google_maps_url,notes,category,city
Cervejaria Ramiro,https://maps.app.goo.gl/XXXX,Best seafood - book ahead,restaurant,Lisbon
```

Categories: restaurant | bar | cafe | activity | attraction | accommodation | other
