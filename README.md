# AIUC Spearehead - Data Analytics Dashboard

A Next.js application that displays data analytics use cases in an Airtable-like interface with column filtering, styled with Pure Storage's dark theme and orange accents.

## Features

- Server-side API calls with basic authentication
- MUI Data Grid with column-wise filtering
- Dark theme UI with Pure Storage orange theme (#fe5000)
- CSV values displayed as chips/tags for better readability
- Responsive and aesthetic UI matching Pure Storage design
- Pure Storage and Spearhead logo support

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Add logo images to the `public/assets/` folder:
   - `purestorage-logo.png` (or `.svg`) - Pure Storage logo for header
   - `spearhead-logo.png` (or `.svg`) - Spearhead logo for footer
   
   Note: If images are not provided, the app will show fallback text.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The API uses basic authentication with a 10-digit static token (`1234567890`). The token is configured in the server-side API route at `app/api/use-cases/route.ts`.

## UI Features

- **Dark Theme**: Modern dark interface with orange accents
- **Chip Display**: CSV values in fields like "AI Algorithms & Frameworks", "Datasets", etc. are displayed as chips/tags
- **Column Filtering**: All columns support filtering
- **Server-side Pagination**: Efficient data loading with pagination
- **Responsive Design**: Works on all screen sizes

