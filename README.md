# StudySphere

A responsive, dark-themed student productivity website built with plain HTML, CSS and JavaScript. No build tools, paid APIs, database or login are required.

## Included features
- Overview dashboard and mobile navigation
- Focus timer with 25-minute focus, 5-minute short break and 15-minute long break
- Percentage calculator
- Grade average calculator (up to 12 subjects)
- Exam countdown
- Create, flip, navigate and delete flashcards
- Daily rotating general-knowledge quiz
- Local streak/session tracking
- Local browser storage for exam date, flashcards and progress

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. For the best local development experience, use VS Code with the Live Server extension, then choose **Open with Live Server**.

No installation or build command is needed.

## Publish free with GitHub Pages
1. Create/sign in to GitHub.
2. Create a new **public** repository named `studysphere`.
3. Upload `index.html`, `styles.css`, `app.js` and this README to the repository root.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`, then Save.
7. Wait for the deployment. Your site will be available at `https://YOUR-USERNAME.github.io/studysphere/`.

You can alternatively deploy the same folder through Cloudflare Pages by connecting the GitHub repository. Use no framework preset and leave the build command blank; set the output directory to `/`.

## Before public launch
- Replace the contact placeholder `hello@studysphere.example` in `index.html` with an address you control, or remove the link.
- Add a real Privacy Policy and About/Contact pages before applying to an advertising network.
- Test all features on phone and desktop.
- Do not click your own ads or ask anyone to click ads. Never place ads in a way that causes accidental clicks.
- Advertising approval and earnings are not guaranteed. Ad networks have eligibility and traffic-quality rules. Since the site owner is under 18, a parent or legal guardian must handle any AdSense account and payments under Google's current requirements.
- The site currently stores user-created flashcards and progress in that visitor's own browser only. Clearing browser data can erase it; data does not sync between devices.
- The quiz is a small built-in sample question bank, not a continuously updated question feed.

## Project files
- `index.html` — page structure and content
- `styles.css` — responsive dark theme
- `app.js` — all interactive features and local storage
