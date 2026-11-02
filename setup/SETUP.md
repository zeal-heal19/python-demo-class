# Connect the form to a private Google Sheet

1. Create a new sheet at https://sheets.new and name it "Demo Registrations".
2. Open **Extensions > Apps Script**, replace the sample code with the contents of `Code.gs`, and save.
3. Click **Deploy > New deployment**, then the gear icon, and choose **Web app**.
4. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then click **Deploy** and approve the access request.
5. Copy the URL ending in `/exec` and paste it into `REGISTRATION_URL` in `index.html`.

"Anyone" only lets people submit the form. The sheet itself stays private to your Google account.

If you change `Code.gs` later, use **Deploy > Manage deployments > Edit > New version** so the URL stays the same.

# Add session screenshots

1. Copy the images into the `screenshots` folder. Use short lowercase names such as `session-1.jpg`.
2. List each one in `SCREENSHOTS` in `index.html`.

Blur or crop student names, faces, emails and chat messages unless you have their permission to show them.
