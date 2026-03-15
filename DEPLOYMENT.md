# Deployment Improvements

I have chosen **Option B: Improve the Dockerfiles and docker-compose.yml to be more production-ready.**

Here are the changes made and the justification:

## Dockerfiles
- **Backend:** Switched from the heavy `node:18` image to the lightweight `node:18-alpine`. Set `ENV NODE_ENV=production` and modified the installation step to only install production dependencies using `npm ci --only=production`. Also added a non-root `USER node` for improved security.
- **Frontend:** Implemented a multi-stage Docker build. The build stage installs dependencies and builds the static React application (`npm run build`). The production stage uses `nginx:alpine` to serve those pre-built static files effectively, massively reducing the size of the container and eliminating the need for `npm start` in production.

## docker-compose.yml
- **Environment Variables:** Subbed hardcoded database credentials (`admin`, `admin123`) with environment variable fallbacks (`${POSTGRES_USER:-admin}`). This allows injecting secure secrets via `.env` in production environments while maintaining local plug-and-play capability.
- **Health Checks:** Added a `CMD-SHELL pg_isready` healthcheck for the database. Updated the `backend` service to depend on the `db` service completing its `service_healthy` condition rather than just starting up, ensuring there are no connection errors on spin-up.
- **Restart Policies:** Added `restart: unless-stopped` to all services so that if a container crashes or the host server restarts, the application comes right back up automatically.
- **Dedicated Networking:** Setup a dedicated `app-network` bridged network for the services to speak privately with one another.
- **Storage/Images:** Pinned the database to use the `alpine` variant to reduce the footprint.
- **Ports:** Mapped the frontend port `3000` to container port `80` since production NGINX serves on port 80 now.
