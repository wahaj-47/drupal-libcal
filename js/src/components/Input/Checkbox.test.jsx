import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './Checkbox';

describe('Checkbox component', () => {
    const defaultProps = {
        id: 'test-checkbox',
        label: 'Checkbox',
        value: 'checkbox',
        checked: false,
        onChange: jest.fn(),
        required: true,
    };

    test('renders checkbox with label and props', () => {
        render(<Checkbox {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');
        const label = screen.getByText('Checkbox');

        expect(checkbox).toBeInTheDocument();
        expect(label).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('id', 'test-checkbox');
        expect(checkbox).toHaveAttribute('value', 'checkbox');
        expect(checkbox).toBeRequired();
        expect(checkbox).not.toBeChecked();
        expect(label).toHaveAttribute('for', 'test-checkbox');
    });

    test('calls onChange with correct value when toggled', () => {
        const handleChange = jest.fn();
        render(<Checkbox {...defaultProps} onChange={handleChange} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(handleChange).toHaveBeenCalledWith('checkbox');
    });

    test('renders as checked when checked=true', () => {
        render(<Checkbox {...defaultProps} checked />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    test('applies custom className and labelClassName', () => {
        render(
            <Checkbox
                {...defaultProps}
                className="custom-check"
                labelClassName="custom-label"
            />
        );
        const checkbox = screen.getByRole('checkbox');
        const label = screen.getByText('Checkbox');

        expect(checkbox).toHaveClass('form-check-input');
        expect(checkbox).toHaveClass('custom-check');
        expect(label).toHaveClass('form-check-label');
        expect(label).toHaveClass('custom-label');
    });

    test('adds form-check-inline class when inline=true', () => {
        const { container } = render(<Checkbox {...defaultProps} inline />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('form-check');
        expect(wrapper).toHaveClass('form-check-inline');
    });

    test('forwards ref properly', () => {
        const ref = React.createRef();
        render(<Checkbox {...defaultProps} ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current?.id).toBe('test-checkbox');
    });

    test('renders without label', () => {
        render(<Checkbox id="no-label" value="1" onChange={() => { }} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(screen.queryByText(/.+/)).toBeNull();
    });

    test('renders with minimal props', () => {
        render(<Checkbox id="minimal" value="1" />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
        fireEvent.click(checkbox);
    });
});
