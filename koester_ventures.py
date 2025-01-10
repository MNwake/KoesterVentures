from database import ServerMemory
from webserver.routes import RiderRoutes, ParkRoutes, StatsRoute, ContestRoutes, ScorecardRoutes
from webserver.website_base import Website

class KoesterVentures(Website):
    def __init__(self, memory: ServerMemory):
        super().__init__(
            name="koesterventures",
            domain="koesterventures.com",
            static_dir="webserver/websites/KoesterVentures/static",
            html_file="webserver/websites/KoesterVentures/index.html"
        )
        self.memory = memory
        self.rider_routes = RiderRoutes(memory=self.memory)
        self.parks_route = ParkRoutes()
        self.stats_route = StatsRoute()
        self.contest_route = ContestRoutes()
        self.scorecard_route = ScorecardRoutes()
        self.setup_specific_routes()

    def setup_specific_routes(self):
        # Attach RiderRoutes to this website's router
        self.router.include_router(self.rider_routes.router, prefix="/riders")
        self.router.include_router(self.stats_route.router, prefix="/stats")
        self.router.include_router(self.scorecard_route.router, prefix="/scorecards")
        self.router.include_router(self.parks_route.router, prefix="/parks")
        self.router.include_router(self.contest_route.router, prefix="/contest")

    def define_root_routes(self, app: FastAPI):
        """Define routes that are directly attached to the FastAPI app (before /api)."""
        @app.get("/ping", tags=["Koester Ventures"])
        async def ping():
            return {"message": "Pong!"}
