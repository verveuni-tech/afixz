# AfixZ

AfixZ is a full-stack web application designed as a marketplace for premium local home services. It connects urban homeowners with verified professionals for a range of services, including gardening, mechanic work, home interior enhancements, and custom fabrication.

## Features

-   **Multi-faceted User Experience**: Separate, tailored dashboards for customers, administrators, and service providers.
-   **Dynamic Content**: Location-aware content and service availability (Delhi, Noida, Gurgaon).
-   **Service Catalog**: Browse services by category, view detailed service pages, and search across the catalog.
-   **Subscription Model**: Customers can subscribe to recurring services like the "Garden Care" plan.
-   **E-commerce Flow**:
    -   Add services to a persistent cart.
    -   Secure checkout process with address and scheduling management.
    -   Cash on Delivery (COD) payment model.
-   **Content Management**:
    -   A dedicated admin dashboard to manage services, categories, and blog articles.
    -   An interface to manage homepage content and location-specific overrides directly from the CMS.
    -   SEO management for blog posts, including meta titles, descriptions, and canonical URLs.
-   **Provider Job Board**: A dashboard for service providers to view, claim, and update the status of jobs.
-   **Role-Based Access Control (RBAC)**:
    -   Secure system with distinct roles: `user`, `provider`, and `admin`.
    -   An API endpoint (`/api/set-role`) for administrators to grant or revoke provider/admin roles.
-   **Automated Processes**:
    -   Vercel Cron Job (`/api/generate-visits`) to automatically create booking entries for active subscriptions.
    -   Transactional email notifications for new orders via Resend.

## Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router
-   **Backend**: Firebase (Authentication, Firestore), Vercel (Serverless Functions, Cron Jobs)
-   **Image Management**: Cloudinary for image uploads and storage.
-   **Email**: Resend for transactional email notifications.
-   **Deployment**: Vercel

## Local Development

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/verveuni-tech/afixz.git
    cd afixz
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env.local` file by copying the `.env.example` file.
    -   Fill in the required Firebase and Cloudinary credentials.

    ```bash
    # .env.local
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    # ... and so on
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the production-ready app and runs the prerendering script (`scripts/prerender.mjs`) for static pages and blogs to improve SEO.
-   `npm run seed:services`: Seeds the Firestore database with services and categories from a pre-configured Google Sheet. Requires Firebase Admin credentials.

## Backend & API

The backend logic is handled by Vercel Serverless Functions located in the `/api` directory.

-   **/api/set-role**: An admin-protected endpoint to grant or revoke `provider` and `admin` roles. It updates user custom claims in Firebase Auth and syncs the role in the Firestore `users` collection.
-   **/api/notify-order**: Triggered after a successful booking to send transactional emails to both the customer and the admin via Resend.
-   **/api/generate-visits**: A Vercel Cron Job that runs daily to generate scheduled `booking` documents for active subscription plans.

### Serverless Environment Variables

For the serverless functions to work correctly in production, the following environment variables must be set in the Vercel project dashboard:
-   `FIREBASE_SERVICE_ACCOUNT_KEY`: The full JSON of the Firebase Admin SDK service account.
-   `NOTIFY_API_SECRET`: A shared secret for securing certain API endpoints.
-   `RESEND_API_KEY`: API key from resend.com.
-   `ADMIN_NOTIFICATION_EMAIL`: The email address to receive new order notifications.
