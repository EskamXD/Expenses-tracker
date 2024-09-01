import React from "react";
import { Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavItem from "react-bootstrap/esm/NavItem";

const SiteNavbar = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    Navbar
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Link to="/" className="nav-link">
                        Strona główna
                    </Link>
                    <Link to="/expenses" className="nav-link">
                        Wydatki
                    </Link>
                    <Link to="/income" className="nav-link">
                        Przychody
                    </Link>
                    <Link to="/summary" className="nav-link">
                        Podsumowanie
                    </Link>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default SiteNavbar;
