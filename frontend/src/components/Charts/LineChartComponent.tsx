// LineCharts.tsx
import { LineChart } from "@mui/x-charts";
import { cheerfulFiestaPaletteDark } from "@mui/x-charts/colorPalettes";

interface LineChartsProps {
    lineSumsParams: {
        series: {
            label: string;
            data: number[];
            showMark: boolean;
        }[];
    };
    dateValues: string[];
}

const currencyFormatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
}).format;

const LineChartComponent: React.FC<LineChartsProps> = ({
    lineSumsParams,
    dateValues,
}) => {
    const series = lineSumsParams.series.map((series: any) => ({
        ...series,
        valueFormatter: (v: any) => (v === null ? "" : currencyFormatter(v)),
    }));
    return (
        <LineChart
            xAxis={[
                {
                    scaleType: "point",
                    data: dateValues,
                },
            ]}
            series={series}
            height={500}
            // width={1000}
            grid={{
                vertical: true,
                horizontal: true,
            }}
            colors={cheerfulFiestaPaletteDark}
        />
    );
};

export default LineChartComponent;
