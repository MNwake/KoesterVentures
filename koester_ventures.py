import logging
from pathlib import Path

from fastapi import HTTPException
from starlette.responses import FileResponse

from config.config import Config
from database import ServerMemory
from database.websites.email_contact import ContactRequest
from utility.email_manager import EmailManager
from webserver.routes import RiderRoutes, ParkRoutes, StatsRoute, ContestRoutes, ScorecardRoutes
from webserver.routes.analytics_route import AnalyticsRoutes
from webserver.website_base import Website


class KoesterVentures(Website):
    def __init__(self, memory: ServerMemory):
        super().__init__(
            name="koesterventures",
            domain="koesterventures.com",
            src_dir="webserver/websites/KoesterVentures/public",
            html_file="webserver/websites/KoesterVentures/public/index.html"
        )
        self.memory = memory
        self.email = 'theo@koesterventures.com'

        # Initialize EmailManager for Koester Ventures
        self.email_manager = EmailManager(
            email=self.email,
            password=Config.Mail.KOESTER_APP_PASSWORD,  # Add this to your config
            smtp_server="smtppro.zoho.com",
            port=465,
            account=self.domain,
        )

        self.rider_routes = RiderRoutes(memory=self.memory)
        self.parks_route = ParkRoutes(memory=self.memory)
        self.stats_route = StatsRoute(memory=self.memory)
        self.contest_route = ContestRoutes(memory=self.memory)
        self.scorecard_route = ScorecardRoutes(memory=self.memory)
        self.analytics_route = AnalyticsRoutes()
        self.setup_specific_routes()
        self.setup_routes()

    def setup_specific_routes(self):
        # Attach RiderRoutes to this website's router
        self.app.include_router(self.rider_routes.router, prefix="/api/riders")
        self.app.include_router(self.stats_route.router, prefix="/api/stats")
        self.app.include_router(self.scorecard_route.router, prefix="/api/scorecards")
        self.app.include_router(self.parks_route.router, prefix="/api/parks")
        self.app.include_router(self.contest_route.router, prefix="/api/contest")
        self.app.include_router(self.analytics_route.router, prefix='/api/analytics')

    def setup_routes(self):

        # Define homepage
        @self.app.get("/")
        async def homepage():
            return FileResponse(self.html_file)

        # Define favicon
        @self.app.get("/favicon.ico")
        async def favicon():
            return FileResponse(f"{self.src_dir}/images/favicon.ico")

            # FastAPI endpoint to handle "Contact Us" form submissions
        @self.app.post("/contact")
        async def contact_us(request: ContactRequest):
            """
            Endpoint to handle 'Contact Us' form submissions.

            :param request: The request body containing name, email, subject, and message.
            """
            try:
                # Save the email in MongoDB
                self.email_manager.save_email(
                    name=request.name,
                    email=request.email,
                    subject=request.subject,
                    body=request.message,
                )

                # Email notification to admin
                self.email_manager.send_email(
                    to_email=self.email,
                    subject=f"New Contact Us Message: {request.subject}",
                    body=f"Name: {request.name}\nEmail: {request.email}\nSubject: {request.subject}\nMessage:\n{request.message}",
                )

                # Confirmation email to user
                self.email_manager.send_email(
                    to_email=request.email,
                    subject=f"Thank You for Contacting Us - {request.subject}",
                    body=(
                        f"Hi {request.name},\n\n"
                        f"We have received your message with the subject '{request.subject}' and will respond shortly.\n\n"
                        f"Here is a copy of your message:\n{request.message}\n\n"
                        f"Regards,\nKoester Ventures Team"
                    ),
                )

                return {"success": True, "message": "Emails sent successfully"}
            except Exception as e:
                logging.error(f"Error in contact_us: {e}")
                raise HTTPException(status_code=500, detail="Failed to send emails")

        # Catch-all route for static files
        @self.app.get("/{path:path}")
        async def catch_all(path: str):
            file_path = Path(f"{self.src_dir}/{path}")
            if file_path.is_file():
                return FileResponse(str(file_path))
            raise HTTPException(status_code=404, detail="File not found")

        @self.app.get("/privacy_policy")
        async def privacy_policy():
            return FileResponse(f"{self.src_dir}/privacy_policy.html")

