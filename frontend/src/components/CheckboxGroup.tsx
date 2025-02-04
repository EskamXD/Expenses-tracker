import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxGroupProps {
    options: { value: string; label: string }[];
    selectedCategories: string[];
    handleChange: (value: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
    options,
    selectedCategories,
    handleChange,
}) => {
    const handleCheckboxChange = (value: string) => {
        const newSelectedCategories = selectedCategories.includes(value)
            ? selectedCategories.filter((category) => category !== value) // Remove if selected
            : [...selectedCategories, value]; // Add new category

        handleChange(newSelectedCategories); // Update parent state
    };

    return (
        <div className="space-y-2">
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={option.value}
                        checked={selectedCategories.includes(option.value)}
                        onCheckedChange={() =>
                            handleCheckboxChange(option.value)
                        }
                    />
                    <label
                        htmlFor={option.value}
                        className="text-sm font-medium leading-none cursor-pointer">
                        {option.label}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default CheckboxGroup;

