const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Link = require("./models/Link");
const LinkVisit = require("./models/LinkVisit");
const shortid = require("shortid");
const useragent = require("useragent");
const geoip = require("geoip-lite");

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/eventTracking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Route to create a link
app.post("/api/create-link", async (req, res) => {
  const { identifier } = req.body;

  let linkId = identifier || shortid.generate().substring(0, 6);

  try {
    const link = new Link({
      identifier: linkId,
      created_at: Date.now(),
      created_ip: req.ip,
    });
    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Route to log a visit and redirect
app.get("/t/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const link = await Link.findOne({ identifier });

    if (!link) {
      return res.status(404).send("Link not found");
    }

    // Parse the User-Agent string
    const agent = useragent.parse(req.headers["user-agent"]);
    console.log(agent);

    // Get geo-location from IP
    const geo = geoip.lookup(req.ip);

    // Create a new visit entry
    const visitData = {
      identifier,
      ip: req.ip,
      visited: Date.now(),
      browser: agent.toAgent(),
      device: agent.device.toString(),
    };

    if (geo) {
      visitData.location_country = geo.country;
      visitData.location_region = geo.region;
      visitData.location_city = geo.city;
    }

    const visit = new LinkVisit(visitData);
    await visit.save();

    res.redirect("https://portalys.io");
  } catch (error) {
    console.error("Error logging visit:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch all of the links
app.get("/api/links", async (req, res) => {
  try {
    const links = await Link.find({});
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch a certain link and its data
app.get("/api/link-data/:identifier", async (req, res) => {
  try {
    const visits = await LinkVisit.find({ identifier: req.params.identifier });

    let locationCountryCounts = {};
    let locationRegionCounts = {};
    let locationCityCounts = {};
    let deviceCounts = {};
    let browserCounts = {};

    visits.forEach((visit) => {
      locationCountryCounts[visit.location_country] =
        (locationCountryCounts[visit.location_country] || 0) + 1;
      locationRegionCounts[visit.location_region] =
        (locationRegionCounts[visit.location_region] || 0) + 1;
      locationCityCounts[visit.location_city] =
        (locationCityCounts[visit.location_city] || 0) + 1;
      deviceCounts[visit.device] = (deviceCounts[visit.device] || 0) + 1;
      browserCounts[visit.browser] = (browserCounts[visit.browser] || 0) + 1;
    });

    const topLocations = Object.entries(locationCountryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topRegions = Object.entries(locationRegionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topCities = Object.entries(locationCityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topDevices = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topBrowsers = Object.entries(browserCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const overallVisits = visits.length;
    const uniqueVisits = new Set(visits.map((visit) => visit.ip)).size;
    const lastVisit = visits[visits.length - 1];

    res.json({
      topLocations,
      topRegions,
      topCities,
      topDevices,
      topBrowsers,
      overallVisits,
      uniqueVisits,
      lastVisitedAt: lastVisit?.visited,
      lastVisitCountry: lastVisit?.location_country,
      lastVisitRegion: lastVisit?.location_region,
      lastVisitCity: lastVisit?.location_city,
    });
  } catch (error) {
    console.error("Error fetching link data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a link
app.delete("/api/delete-link/:identifier", async (req, res) => {
  const identifier = req.params.identifier;
  try {
    await Link.deleteOne({ identifier });
    await LinkVisit.deleteMany({ identifier });
    res.json({ message: "Link and its visits deleted successfully." });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
