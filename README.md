# SIH Mine Safety & Vocational Training Platform

A technology-driven **Mine Safety Management and Vocational Training Platform** developed for a Smart India Hackathon (SIH) problem statement associated with Jharkhand.

The project aims to improve workplace safety, worker monitoring and vocational training through a combination of real-time monitoring, interactive safety visualization, Augmented Reality (AR) and Machine Learning.

> **Current Prototype:** An administrative dashboard for worker monitoring, multilingual accessibility and safety report generation. AR training and AI-powered hazard detection are part of the broader planned system.

## Overview

Mining and industrial environments involve significant occupational safety challenges. This platform aims to provide administrators and safety officers with a centralized system to monitor workers, visualize safety-related information and manage safety operations.

The broader vision combines a digital safety management dashboard with an AR-based vocational training simulator and intelligent hazard detection capabilities.

## Current Prototype Features

- **Administrative Dashboard:** Centralized interface for monitoring and managing safety-related information.
- **Real-Time Worker Monitoring:** WebSocket-based communication for receiving and updating worker location information.
- **Multilingual Support:** Language accessibility to make the platform usable by workers and administrators from different linguistic backgrounds.
- **Report Generation:** Generate safety-related reports for monitoring and administrative purposes.
- **Interactive Safety Visualization:** Foundation for visualizing workplace safety information and worker locations.

## Planned Features & Future Scope

- **AR-Based Vocational Training:** Immersive training simulations to help workers understand safety procedures and workplace scenarios.
- **AI-Based Hazard Detection:** YOLO and OpenCV-based computer vision for identifying potential hazards.
- **Digital Safety Map:** Interactive 2D representation of mine/factory layouts, safety zones, reported hazards and unresolved corrective actions.
- **Worker Safety Monitoring:** Periodic worker-location updates to identify whether workers are within designated safe or hazardous zones.
- **Training Scenarios:** Simulated workplace situations for practical safety training.
- **Safety Analytics:** Visual dashboards and insights for safety monitoring and decision-making.

## Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | React + TypeScript | Implemented |
| Styling | CSS | Implemented |
| 2D Safety Map | SVG | Planned / integration |
| Backend | Node.js + Express + TypeScript | Implemented |
| Database | PostgreSQL + Prisma | Implemented |
| Real-Time Updates | Socket.IO | Implemented |
| Authentication | JWT | Implemented |
| Computer Vision | YOLO + OpenCV | Planned |
| Augmented Reality | Existing AR training implementation | Integration planned |
| Charts & Analytics | Recharts / Chart.js | Planned / integration |
| File Storage | Image and document storage | Planned |
| Deployment | Docker | Planned / integration |

## System Architecture

The platform is designed around a modular architecture:

1. **Frontend Layer:** Provides the administrative interface, monitoring dashboard and multilingual user experience.
2. **Backend Layer:** Handles application APIs, authentication, business logic and communication between system components.
3. **Database Layer:** PostgreSQL stores application data, with Prisma managing database interactions.
4. **Real-Time Layer:** Socket.IO enables live communication and worker-location updates.
5. **Intelligence Layer (Future):** YOLO and OpenCV for computer vision and hazard detection.
6. **Training Layer (Future Integration):** AR-based vocational training simulations.

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/sih-mine-safety-platform.git

cd sih-mine-safety-platform
```

Install frontend and backend dependencies from their respective directories:

```bash
cd frontend
npm install
```

```bash
cd ../backend
npm install
```

### Environment Configuration

Configure the required environment variables using `.env.example` files.

Example:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```


### Database Setup

Configure your PostgreSQL database and run the Prisma migrations according to the backend setup.

### Running the Application

Refer to the frontend and backend package scripts for the development commands.

## Project Assets

Large ML models, datasets and demonstration videos are hosted separately due to repository size constraints.

**[Access Project Assets – Google Drive](YOUR_GOOGLE_DRIVE_LINK)**

## Screenshots & Demonstration

Screenshots of the administrative dashboard, worker monitoring interface and other implemented modules will be added here.

## Development Roadmap

- [x] Administrative dashboard prototype
- [x] Multilingual interface
- [x] Safety report generation
- [x] WebSocket-based live worker-location updates
- [ ] Digital safety map integration
- [ ] AR vocational training integration
- [ ] YOLO + OpenCV hazard detection
- [ ] Safety analytics and visualization
- [ ] Containerized deployment

## Project Context

Developed as part of the Smart India Hackathon initiative for a mine safety and vocational training problem statement associated with Jharkhand.

## License

License and redistribution permissions to be finalized.
