# TYPINGTERMINAL

A retro terminal-themed typing practice platform with competitive multiplayer matches, built with Next.js and Convex. Features a curated collection of classic literature, real-time leaderboards, and head-to-head typing competitions with a nostalgic green-on-black aesthetic.

## Features

- **Practice Mode**: Type passages from classic books (Pride & Prejudice, 1984, The Great Gatsby, etc.) or generate random words
- **Multiplayer Matches**: Challenge friends to real-time typing races with invite codes
- **Global Leaderboards**: Compete for the top spot across multiple metrics (WPM, accuracy, composite score)
- **Time-Based Rankings**: View leaderboards for daily, weekly, monthly, and all-time periods
- **Book Library**: Upload and practice with your own books (PDF, EPUB, TXT support)
- **Progress Tracking**: Automatic session saving with detailed statistics (WPM, accuracy, errors)
- **User Profiles**: Track personal bests, averages, and total sessions
- **Guest Mode**: Try the platform without authentication (limited features)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Retro Terminal UI**: Authentic CRT monitor effects with scanlines and green phosphor glow

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom terminal theme
- **Database**: Convex (serverless backend)
- **Authentication**: Convex Auth with multiple providers:
  - Google OAuth
  - Twitter OAuth
  - Email/Password
  - Anonymous (Guest Mode)
- **Real-time**: Convex reactive queries for live leaderboards and match updates
- **File Processing**: PDF.js, EPUBjs for book uploads
- **API Integration**: Random Word API & DataMuse API for word generation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm package manager
- A Convex account (free tier available)
- OAuth credentials (optional, for Google/Twitter login)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/<your-username>/typingterminal.git
cd typingterminal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
# Convex
CONVEX_DEPLOYMENT=<your_convex_deployment>
NEXT_PUBLIC_CONVEX_URL=<your_convex_url>

# OAuth (Optional)
AUTH_GOOGLE_ID=<your_google_client_id>
AUTH_GOOGLE_SECRET=<your_google_client_secret>
AUTH_TWITTER_ID=<your_twitter_client_id>
AUTH_TWITTER_SECRET=<your_twitter_client_secret>
```

4. Set up Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (if needed)
- Deploy your backend functions
- Start watching for changes

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Main Features

1. **Home (/)**: View your stats, recent sessions, and access practice/match modes
2. **Practice (/practice)**: Choose from sample books or random words to improve your typing
3. **Leaderboard (/leaderboard)**: View global rankings and your personal rank
4. **Matches (/matches)**: View active matches and match history
5. **Create Match**: Generate an invite code and challenge friends
6. **Join Match**: Enter an invite code to join a friend's match

### Authentication

- **Sign Up/Login**: Use Google, Twitter, email/password, or continue as guest
- **Guest Mode**: Limited access (no matches, stats not saved to leaderboard)
- **Profile**: Automatic profile creation with stats tracking

## Project Structure

```
.
├── convex/                 # Convex backend
│   ├── auth.ts            # Authentication configuration
│   ├── auth.config.ts     # Auth provider settings
│   ├── books.ts           # Book upload and management
│   ├── sessions.ts        # Typing session tracking
│   ├── matches.ts         # Multiplayer match logic
│   ├── leaderboard.ts     # Global rankings and stats
│   ├── users.ts           # User profile management
│   ├── schema.ts          # Database schema
│   └── http.ts            # HTTP routes
├── src/
│   └── app/
│       ├── components/    # Reusable React components
│       │   ├── Auth/      # Authentication modals
│       │   ├── Books/     # Book management UI
│       │   ├── Match/     # Match creation/joining
│       │   └── ...
│       ├── hooks/         # Custom React hooks
│       │   ├── useAuth.ts
│       │   ├── useTypingSession.ts
│       │   └── ...
│       ├── utils/         # Utility functions
│       │   └── randomWords.ts
│       ├── data/          # Sample books data
│       ├── practice/      # Practice mode page
│       ├── leaderboard/   # Leaderboard page
│       ├── matches/       # Matches page
│       ├── page.tsx       # Home page
│       ├── layout.tsx     # Root layout
│       ├── globals.css    # Global styles
│       └── terminal.css   # Terminal theme styles
├── public/                # Static assets
├── scripts/               # Utility scripts
│   └── generateSampleBooks.ts
├── package.json
└── README.md
```

## Key Components & API Endpoints

### Frontend Components

- **HomePage**: Dashboard with stats, recent sessions, and top performers
- **PracticePage**: Typing practice interface with book/word selection
- **LeaderboardPage**: Global rankings with filtering and time ranges
- **MatchesPage**: Active matches and match history
- **CreateMatchModal**: Create and share invite codes
- **JoinMatchModal**: Join matches via invite code
- **AuthModal**: Multi-provider authentication

### Convex Backend Functions

#### Sessions
- `saveSession`: Records typing session results
- `getUserStats`: Fetches user statistics
- `getRecentSessions`: Retrieves recent typing sessions
- `getSessionsByBook`: Gets sessions for a specific book

#### Matches
- `createMatch`: Creates a new multiplayer match
- `joinMatch`: Joins a match via invite code
- `getMatch`: Fetches match details and results
- `submitMatchResult`: Submits typing results for a match
- `getMyMatches`: Gets user's active matches
- `getMatchHistory`: Retrieves completed matches
- `cancelMatch`: Cancels a waiting match
- `surrenderMatch`: Surrenders an in-progress match

#### Leaderboard
- `getLeaderboard`: Fetches global rankings (supports filtering by metric and time range)
- `getUserRank`: Gets current user's rank and percentile
- `getGlobalStats`: Returns platform-wide statistics
- `getTopPerformers`: Gets top 3 performers across categories

#### Books
- `saveBook`: Uploads and processes a new book
- `getUserBooks`: Gets user's uploaded books
- `getPublicBooks`: Fetches publicly shared books
- `getBookWithPassages`: Retrieves book with all passages
- `updateLastPosition`: Saves reading progress

#### Users
- `updateUserProfile`: Updates user name and profile info

## Scoring System

The platform uses a **composite score** that balances speed and accuracy:

```
Composite Score = WPM × (Accuracy% / 100)
```

**Example**: 100 WPM @ 95% accuracy = 95.0 score

This ensures that speed is only rewarded when accompanied by high precision.

## Development

- `npm run dev`: Starts the Next.js development server
- `npx convex dev`: Starts the Convex backend in development mode
- `npm run build`: Builds the application for production
- `npm run start`: Starts the production server
- `npm run lint`: Runs ESLint for code linting
- `npm run generate-books`: Generates sample books data from classic literature

## Code Style

The project uses:
- ESLint for code linting
- TypeScript strict mode
- Tailwind CSS for styling
- Convex best practices for backend functions

## Features in Detail

### Authentication System
- Multi-provider OAuth (Google, Twitter)
- Email/password authentication
- Anonymous guest mode
- Automatic profile creation
- Session management via Convex Auth

### Typing Session Tracking
- Real-time WPM calculation
- Live accuracy feedback
- Error counting
- Automatic session saving (authenticated users only)
- Historical session data

### Multiplayer Matches
- Invite code system (6-character codes)
- Real-time match status updates
- Automatic winner determination
- Match history with detailed results
- Surrender functionality

### Leaderboard System
- Multiple sorting metrics (composite, WPM, accuracy)
- Time-based filtering (daily, weekly, monthly, all-time)
- Personal rank display
- Percentile calculation
- Global platform statistics

### Book Management
- PDF, EPUB, and TXT file support
- Automatic passage extraction
- Progress tracking per book
- Public/private book sharing
- Sample books from classic literature

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Sample books sourced from Project Gutenberg
- Terminal aesthetic inspired by classic CRT monitors
- Random word generation powered by Random Word API and DataMuse API