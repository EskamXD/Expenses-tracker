/**
 * @file SiteNavbar.jsx
 * @brief A React component for rendering the site navigation bar.
 *
 * This file defines the SiteNavbar component, which provides the main navigation bar
 * for the application. It includes links to different pages like Home, Expenses, Income, and Summary.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";

/**
 * @brief Renders the main navigation bar for the application.
 *
 * The SiteNavbar component uses React Bootstrap components to render a navigation bar.
 * It provides links to the main sections of the application, including the home page,
 * expenses, income, and summary pages. It uses the `Link` component from `react-router-dom`
 * for client-side navigation.
 *
 * @return {JSX.Element} A navigation bar component.
 */
const SiteNavbar = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark">
            {/**< Navbar with a dark theme. */}
            <Container>
                <Navbar.Brand as={Link} to="/">
                    {/**< Link to the home page with branding. */}
                    Navbar
                </Navbar.Brand>
                <Nav className="me-auto">
                    {/**< Navigation links aligned to the left. */}
                    <Link to="/" className="nav-link">
                        {/**< Link to the home page. */}
                        Strona główna
                    </Link>
                    <Link to="/expenses" className="nav-link">
                        {/**< Link to the expenses page. */}
                        Wydatki
                    </Link>
                    <Link to="/income" className="nav-link">
                        {/**< Link to the income page. */}
                        Przychody
                    </Link>
                    <Link to="/summary" className="nav-link">
                        {/**< Link to the summary page. */}
                        Podsumowanie
                    </Link>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default SiteNavbar;
