import Spinner from "react-bootstrap/Spinner";

interface LoadingChartProps {
    isLoading: boolean;
    chartComponent: JSX.Element;
    className?: string;
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
