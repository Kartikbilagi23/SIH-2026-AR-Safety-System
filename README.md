# AR-Based Industrial Safety & Vocational Training Simulator

An AR-powered industrial safety and vocational training platform proposed for mining and manufacturing workers in Jharkhand, developed under the Smart India Hackathon (SIH).

The platform aims to transform conventional safety training into interactive, scenario-based learning experiences using Augmented Reality, 3D simulations and digital assessment.

> **Current Development Status:** Working administrative dashboard prototype with multilingual support, safety report generation and real-time worker-location monitoring. The Unity-based AR training simulator and intelligent hazard detection are part of the proposed system roadmap.

## Problem Statement

Traditional industrial safety training often relies on classroom lectures, videos, posters and theoretical demonstrations.

Workers may not get sufficient opportunities to practice responding to dangerous workplace situations.

This project proposes an interactive training environment where workers can experience simulated industrial hazards, practice safety procedures and receive measurable performance feedback.

## Proposed Solution

The platform consists of three major components:

1. **Android AR Application:** Interactive 3D and AR-based industrial safety training for workers.
2. **Backend Services:** Authentication, training modules, scenarios, assessments, progress and certificate management.
3. **Web Administration Portal:** Worker monitoring, training management, reports and analytics for administrators and trainers.

## Key Features

### Current Prototype

- Administrative dashboard for safety management.
- Multilingual interface.
- Safety report generation.
- Real-time worker-location updates using WebSockets.
- Backend API and database integration.

### Proposed System Capabilities

- AR-based industrial safety training using Unity and AR Foundation.
- Interactive 3D mining and manufacturing environments.
- Simulated fire, gas leakage, electrical and equipment hazards.
- PPE identification and emergency response training.
- Scenario-based assessments and automated scoring.
- Worker training progress tracking.
- Digital certificates with QR-based verification.
- Offline training and synchronization.
- YOLO and OpenCV-based hazard detection (planned).
- Training analytics for administrators and trainers.

## Example Training Workflow

**Gas Leakage Safety Scenario**

1. Enter a simulated mining environment.
2. Identify the gas leakage warning.
3. Select appropriate protective equipment.
4. Avoid contaminated zones.
5. Raise an emergency alarm.
6. Navigate towards a safe evacuation point.
7. Complete the assessment.
8. Receive a score and feedback.

## Proposed Training Modules

| Module | Training Scenario |
|---|---|
| Fire & Explosion Safety | Fire identification and emergency evacuation |
| Gas Leak / Confined Space | Hazard recognition and safe evacuation |
| PPE Safety | Identification and selection of protective equipment |
| Electrical Safety | Electrical hazard recognition |
| Machinery Safety | Safe equipment operation |
| First Aid | Emergency response procedures |

The initial MVP focuses on two polished training scenarios: Fire Safety and Gas Leak / Confined Space Safety.

## Technology Stack

### Mobile & AR
- Unity
- C#
- AR Foundation
- Google ARCore
- Blender for 3D assets

### Web Application
- React
- TypeScript
- CSS / Tailwind CSS
- SVG-based safety visualization
- Recharts / Chart.js

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Role-Based Access Control (RBAC)
- Socket.IO

### Database & Storage
- PostgreSQL
- Prisma ORM
- Redis (caching and temporary data)
- Image and document storage

### DevOps & Infrastructure
- Docker
- Nginx
- Git & GitHub

## System Architecture

```text
                 WORKER
                    |
                    v
          ANDROID AR APPLICATION
             Unity + ARCore
                    |
                    v
          Training & Assessment
                    |
                    v
              BACKEND API
          Node.js + Express
                    |
             +------+------+
             |             |
             v             v
        PostgreSQL       Redis
             |
             v
       Training Data
       Scores / Progress
       Certificates
             |
             v
       WEB ADMIN PORTAL
        React + TypeScript
             |
       +-----+------+
       |            |
       v            v
   Monitoring    Analytics
   & Reports     & Management
```

## Proposed MVP

- Android AR training application.
- Two interactive safety scenarios.
- Worker authentication.
- Scenario-based assessment.
- Automated scoring and feedback.
- Backend and PostgreSQL integration.
- Administrative dashboard.
- Training progress analytics.
- Certificate generation and verification.

## Project Roadmap

- [x] Administrative dashboard prototype.
- [x] Multilingual support.
- [x] Safety report generation.
- [x] WebSocket-based worker-location updates.
- [ ] Digital safety map integration.
- [ ] Unity-based AR training application.
- [ ] Fire safety training scenario.
- [ ] Gas leakage training scenario.
- [ ] Assessment and scoring engine.
- [ ] Worker progress and certificate management.
- [ ] Offline training synchronization.
- [ ] YOLO + OpenCV hazard detection.

## Project Assets

Large datasets, trained models and demonstration videos are hosted externally due to repository size constraints.

**[Access Project Assets on Google Drive](YOUR_GOOGLE_DRIVE_LINK)**

## Project Context

Developed as part of the Smart India Hackathon initiative for an industrial safety and vocational training problem associated with Jharkhand.

## License

To be determined based on project ownership and SIH publication permissions.
