import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';

const Disqualified = () => {
  const [checkedItems, setCheckedItems] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setCheckedItems((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected reasons:", checkedItems);
    // You can add further logic here (like submitting to an API)
  };

  return (
    <Card className="p-4 rounded-4 shadow-sm" style={{ maxWidth: '600px', margin: 'auto', marginTop: '50px' }}>
      <Form onSubmit={handleSubmit}>
        <Form.Check
          type="checkbox"
          label="1. Customer's Financial Background Indicates They Cannot Afford The Product."
          name="option1"
          checked={checkedItems.option1}
          onChange={handleChange}
          className="mb-3"
        />
        <Form.Check
          type="checkbox"
          label="2. Knowledge Seeker, Not A Buyer: Customer Is Engaging Only To Increase Their Knowledge, With No Intent To Buy."
          name="option2"
          checked={checkedItems.option2}
          onChange={handleChange}
          className="mb-3"
        />
        <Form.Check
          type="checkbox"
          label="3. Customer's Country Has A Weak Currency, Making The Purchase Unaffordable Or Unfeasible."
          name="option3"
          checked={checkedItems.option3}
          onChange={handleChange}
          className="mb-3"
        />
        <Form.Check
          type="checkbox"
          label="4. Frequent Inquiry With No Orders: Customer Regularly Posts Inquiries But Never Follows Through With An Order."
          name="option4"
          checked={checkedItems.option4}
          onChange={handleChange}
          className="mb-3"
        />
        <Form.Check
          type="checkbox"
          label="5. Asking For Unworkable Price: Customer Insists On Prices Far Below Mark"
          name="option5"
          checked={checkedItems.option5}
          onChange={handleChange}
          className="mb-4"
        />

        <div className="text-center">
          <Button variant="dark" type="submit" className="px-4 rounded-pill">
            Submit
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default Disqualified;
