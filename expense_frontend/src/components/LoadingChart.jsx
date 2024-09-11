import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingChart = ({ isLoading, chartComponent }) => {
    return isLoading ? (
        <Spinner animation="border" role="status">
            <span className="sr-only"></span>
        </Spinner>
    ) : (
        chartComponent
    );
};

export default LoadingChart;
