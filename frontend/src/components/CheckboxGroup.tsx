import Form from "react-bootstrap/Form";

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
            ? selectedCategories.filter((category) => category !== value) // Remove the category if it's already selected
            : [...selectedCategories, value]; // Add the new category

        handleChange(newSelectedCategories); // Update the parent with the new selection
    };

    return (
        <div className="mb-3" style={{ width: "fit-content" }}>
            {options.map((type) => (
                <Form.Check
                    type="checkbox"
                    key={type.value}
                    id={type.value} // Uncomment to provide unique IDs
                    label={type.label}
                    name="checkboxgroup"
                    onChange={() => handleCheckboxChange(type.value)}
                    checked={selectedCategories.includes(type.value)} // Check if the category is selected
                />
            ))}
        </div>
    );
};

export default CheckboxGroup;
