# Semi-Final Examination — Web Development Project

A personal home page with a working account registration and login system.
Plain HTML, CSS and JavaScript, so it runs on any free static host (GitHub Pages, Netlify, Vercel).

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Personal home page: profile, basic info, skills, hobbies, education |
| `register.html` | Registration for **User** and **Admin** accounts (an admin account needs an existing admin's username and password to authorize it) |
| `login.html` | Login: checks the username and password, then sends admins to the Admin Panel and users to the User Dashboard |
| `dashboard.html` | User Dashboard: users only |
| `admin.html` | Admin Panel: admins only. Shows account stats, lists and deletes accounts, registers new accounts |

## Default administrator

- **Username:** `admin`
- **Password:** `123`

This account is created automatically and cannot be deleted.

## Personalize

Edit **`js/profile.js`** with your name, program, section, school, info, skills and so on.
To add a photo, put it in an `img/` folder and set `photo: "img/me.jpg"`.

## Host on GitHub Pages (free)

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the branch with this code, and choose folder `/ (root)`. Then click **Save**.
3. After about a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Notes on data storage

Accounts are saved in the browser's `localStorage`. Passwords are stored as SHA-256 hashes, not plain text.
Because of this, accounts are kept per browser: an account you register on one device will not exist on another.
The default `admin / 123` account works on every device.
