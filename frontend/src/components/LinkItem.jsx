import React, { useState } from "react";
import { Collapse, ListGroup, Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import ReactCountryFlag from "react-country-flag";

function LinkItem({ link }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggle = async () => {
    if (!data) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/link-data/${link}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching link data:", error);
      }
    }
    setOpen(!open);
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/delete-link/${link}`);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting link:", error);
      }
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // Reset confirmation after 3 seconds
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/link-data/${link}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error refreshing link data:", error);
    }
  };

  const formatDate = (visited) => {
    const date = new Date(visited);
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")} ${
      date.getUTCHours() < 12 ? "AM" : "PM"
    } (UTC)`;
  };

  return (
    <ListGroup.Item>
      <Row className="align-items-center">
        <Col onClick={handleToggle} style={{ cursor: "pointer" }}>
          {open ? "▼" : "▶"} {`http://localhost:5000/t/${link}`}
        </Col>
      </Row>
      <Collapse in={open}>
        <Card className="mt-2">
          <Card.Body>
            <Row className="text-center">
              <Col xs={4}>
                <h5 className="text-uppercase">Location</h5>
                <ReactCountryFlag
                  countryCode={data?.topLocations?.[0]?.[0]}
                  svg
                />{" "}
                Top Country: {data?.topLocations?.[0]?.[0]} (
                {data?.topLocations?.[0]?.[1]})<br />
                Top Region: {data?.topRegions?.[0]?.[0]} (
                {data?.topRegions?.[0]?.[1]})<br />
                Top City: {data?.topCities?.[0]?.[0]} (
                {data?.topCities?.[0]?.[1]})
              </Col>
              <Col xs={4}>
                <h5 className="text-uppercase">Visits</h5>
                Overall Visits: {data?.overallVisits}
                <br />
                Unique Visits: {data?.uniqueVisits}
              </Col>
              <Col xs={4}>
                <h5 className="text-uppercase">Other</h5>
                Top Devices:{" "}
                {data?.topDevices
                  ?.map(([device, count]) => `${device} (${count})`)
                  .join(", ")}
                <br />
                Top Browsers:{" "}
                {data?.topBrowsers
                  ?.map(([browser, count]) => `${browser} (${count})`)
                  .join(", ")}
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer>
            <Row className="align-items-center">
              <Col className="text-start">
                Last Visit:{" "}
                {data?.lastVisitedAt && (
                  <span>
                    {formatDate(data.lastVisitedAt)} from {data.lastVisitCity},{" "}
                    {data.lastVisitRegion}, {data.lastVisitCountry}
                  </span>
                )}
              </Col>
              <Col className="text-end">
                <Button
                  variant="dark"
                  href={`http://localhost:5000/t/${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="me-2 btn-sm"
                >
                  🔗
                </Button>
                <Button
                  variant="info"
                  onClick={handleRefresh}
                  className="me-2 btn-sm"
                >
                  🔄
                </Button>
                <Button
                  variant={confirmDelete ? "warning" : "danger"}
                  onClick={handleDelete}
                  className="btn-sm"
                >
                  {confirmDelete ? "Are you sure?" : "🗑️"}
                </Button>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
      </Collapse>
    </ListGroup.Item>
  );
}

export default LinkItem;
