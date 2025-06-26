import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Radio from './Radio';

describe('Radio component', () => {
    const defaultProps = {
        id: 'radio-1',
        name: 'example',
        value: 'option1',
        label: 'Option 1',
        checked: false,
        onChange: jest.fn(),
        required: true,
    };

    test('renders correctly with label and props', () => {
        render(<Radio {...defaultProps} />);
        const input = screen.getByRole('radio');
        const label = screen.getByText('Option 1');

        expect(input).toBeInTheDocument();
        expect(label).toBeInTheDocument();
        expect(input).toHaveAttribute('id', 'radio-1');
        expect(input).toHaveAttribute('name', 'example');
        expect(input).toHaveAttribute('value', 'option1');
        expect(input).toBeRequired();
        expect(label).toHaveAttribute('for', 'radio-1');
    });

    test('calls onChange with correct value when clicked', () => {
        const handleChange = jest.fn();
        render(<Radio {...defaultProps} onChange={handleChange} />);

        const input = screen.getByRole('radio');
        fireEvent.click(input);

        expect(handleChange).toHaveBeenCalledWith('option1');
    });

    test('supports custom classNames', () => {
        render(
            <Radio
                {...defaultProps}
                className="custom-radio"
                labelClassName="custom-label"
            />
        );

        const input = screen.getByRole('radio');
        const label = screen.getByText('Option 1');

        expect(input).toHaveClass('form-check-input');
        expect(input).toHaveClass('custom-radio');
        expect(label).toHaveClass('form-check-label');
        expect(label).toHaveClass('custom-label');
    });

    test('applies inline class when inline=true', () => {
        const { container } = render(<Radio {...defaultProps} inline />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass('form-check-inline');
    });

    test('forwards ref properly', () => {
        const ref = React.createRef();
        render(<Radio {...defaultProps} ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current?.id).toBe('radio-1');
    });

    test('renders minimal radio without crashing', () => {
        render(<Radio id="min" name="min" value="val" />);
        const input = screen.getByRole('radio');
        expect(input).toBeInTheDocument();
        expect(input).not.toBeChecked();
        fireEvent.click(input);
    });

    test('renders with checked state', () => {
        render(<Radio {...defaultProps} checked />);
        const input = screen.getByRole('radio');
        expect(input).toBeChecked();
    });

});
