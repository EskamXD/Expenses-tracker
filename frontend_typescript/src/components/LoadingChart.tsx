import { Spinner } from "react-bootstrap";

interface LoadingChartProps {
    isLoading: boolean;
    chartComponent: JSX.Element;
}

const LoadingChart: React.FC<LoadingChartProps> = ({
    isLoading,
    chartComponent,
}) => {
    return isLoading ? (
        <Spinner animation="border" role="status">
            <span className="sr-only"></span>
        </Spinner>
    ) : (
        chartComponent
    );
};

export default LoadingChart;
