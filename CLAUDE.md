# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 conversational AI demo application that integrates with ElevenLabs' Conversational AI API. The app provides a real-time voice conversation interface with an AI agent.

## Common Commands

- **Development**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build` 
- **Production**: `npm start`
- **Lint**: `npm run lint`

## Architecture

### Core Structure
- **Next.js App Router**: Uses the new app directory structure with `app/` containing pages and API routes
- **ElevenLabs Integration**: Main conversation logic in `components/ConvAI.tsx` using `@elevenlabs/react` hook
- **API Layer**: Single API route at `app/api/signed-url/route.ts` that generates signed URLs for ElevenLabs WebSocket connections
- **UI Components**: Built with Radix UI components and Tailwind CSS, following shadcn/ui patterns

### Key Components
- `ConvAI.tsx`: Main conversation component handling WebSocket connection, microphone permissions, and conversation state
- `layout.tsx`: Root layout with navigation and background wave animation
- `background-wave.tsx`: Animated background component using Framer Motion

### Environment Setup
The app requires environment variables for ElevenLabs integration:
- `AGENT_ID`: Your ElevenLabs Conversational AI agent ID
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key

**Local Development**: Create `.env` file with these variables
**Vercel Deployment**: Configure in Vercel Dashboard > Settings > Environment Variables

### Styling System
- Tailwind CSS with custom animations for the conversation orb
- CSS custom properties for theming (defined in `globals.css`)
- Responsive design with mobile-first approach

### State Management
Uses React hooks and ElevenLabs' `useConversation` hook for conversation state. No external state management library required for this simple application.