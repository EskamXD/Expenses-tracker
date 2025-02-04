import { Skeleton } from "@/components/ui/skeleton";

interface LoadingChartProps {
    isLoading: boolean;
    chartComponent: JSX.Element;
    className?: string;
}

const LoadingChart: React.FC<LoadingChartProps> = ({
    isLoading,
    chartComponent,
    className = "w-full h-64",
}) => {
    return isLoading ? <Skeleton className={className} /> : chartComponent;
};

export default LoadingChart;

