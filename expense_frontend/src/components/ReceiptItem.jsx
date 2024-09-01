// src/components/ReceiptItem.jsx
import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CloseButton from "react-bootstrap/CloseButton";
import OwnerRadio from "./OwnerRadio";

const ReceiptItem = ({ item, items, setItems, selectOptions, removeItem }) => {
    return (
        <div>
            <Row>
                <Col xs={3}>
                    <Form.Select
                        id={`category-${item.id}`}
                        className="mb-3"
                        value={item.category}
                        onChange={(e) =>
                            setItems(
                                items.map((el) =>
                                    el.id === item.id
                                        ? { ...el, category: e.target.value }
                                        : el
                                )
                            )
                        }>
                        {selectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={4}>
                    <Form.Control
                        type="number"
                        placeholder="Kwota"
                        value={item.value}
                        onChange={(e) =>
                            setItems(
                                items.map((el) =>
                                    el.id === item.id
                                        ? { ...el, value: e.target.value }
                                        : el
                                )
                            )
                        }
                    />
                </Col>
                <Col xs={4}>
                    <OwnerRadio item={item} items={items} setItems={setItems} />
                </Col>
                {item.id !== 1 ? (
                    <Col>
                        <CloseButton onClick={() => removeItem(item.id)} />
                    </Col>
                ) : null}
            </Row>
        </div>
    );
};

export default ReceiptItem;
