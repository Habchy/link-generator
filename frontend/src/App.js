import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Card,
} from "react-bootstrap";
import LinkItem from "./components/LinkItem";

function App() {
  const [identifier, setIdentifier] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/links");
      setGeneratedLinks(response.data.map((linkObj) => linkObj.identifier));
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-link",
        { identifier }
      );
      setGeneratedLinks((prevLinks) => [
        ...prevLinks,
        response.data.identifier,
      ]);
      setIdentifier("");
    } catch (error) {
      console.error("Error generating link:", error);
      alert("Failed to generate the link. Please try again.");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center mb-4">
            <Card.Header>
              <h2>Charbel's Link Generator</h2>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Make a link</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="text"
                        maxLength={6}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter custom identifier (optional)"
                      />
                    </Col>
                    <Col xs="auto">
                      <Button type="submit">Generate</Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mx-auto">
          <h4>Generated Links</h4>
          <ListGroup>
            {generatedLinks.map((link, index) => (
              <LinkItem key={index} link={link} onRefresh={fetchLinks} />
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
